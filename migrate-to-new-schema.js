/**
 * Migration Script: Convert existing data to new schema structure
 * This script will:
 * 1. Drop existing tables
 * 2. Recreate tables with new schema
 * 3. Convert existing data to new format
 */

const { pool } = require("./config/database");

const migrateToNewSchema = async () => {
  try {
    console.log("🔄 Starting migration to new schema...");

    // Step 1: Backup existing data
    console.log("📦 Backing up existing data...");

    // Get existing data
    const [existingPayments] = await pool.execute("SELECT * FROM payments");
    const [existingPurchaseReceipts] = await pool.execute(
      "SELECT * FROM purchase_receipts"
    );
    const [existingPurchaseSuppliers] = await pool.execute(
      "SELECT * FROM purchase_suppliers"
    );
    const [existingPurchases] = await pool.execute("SELECT * FROM purchases");

    console.log(
      `📊 Found ${existingPayments.length} payments, ${existingPurchaseReceipts.length} receipts, ${existingPurchaseSuppliers.length} purchase suppliers, ${existingPurchases.length} purchases`
    );

    // Step 2: Drop existing tables (in reverse dependency order)
    console.log("🗑️ Dropping existing tables...");

    await pool.execute("DROP TABLE IF EXISTS payments");
    await pool.execute("DROP TABLE IF EXISTS purchase_receipts");
    await pool.execute("DROP TABLE IF EXISTS purchase_suppliers");
    await pool.execute("DROP TABLE IF EXISTS purchases");

    // Step 3: Recreate tables with new schema
    console.log("🏗️ Recreating tables with new schema...");

    // Recreate purchases table
    await pool.execute(`
      CREATE TABLE purchases (
        id VARCHAR(50) PRIMARY KEY,
        store_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        status ENUM('Paid', 'Pending', 'Partial', 'Overdue') DEFAULT 'Pending',
        total_grams_21k_equivalent DECIMAL(10,2) NOT NULL,
        total_base_fees DECIMAL(12,2) NOT NULL,
        total_discount_amount DECIMAL(12,2) NOT NULL,
        total_net_fees DECIMAL(12,2) NOT NULL,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recreate purchase_suppliers table
    await pool.execute(`
      CREATE TABLE purchase_suppliers (
        id VARCHAR(50) PRIMARY KEY,
        purchase_id VARCHAR(50) NOT NULL,
        supplier_id VARCHAR(50) NOT NULL,
        total_grams_18k DECIMAL(10,2) DEFAULT 0,
        total_grams_21k DECIMAL(10,2) DEFAULT 0,
        total_grams_21k_equivalent DECIMAL(10,2) NOT NULL,
        total_base_fees DECIMAL(12,2) NOT NULL,
        total_discount_amount DECIMAL(12,2) NOT NULL,
        total_net_fees DECIMAL(12,2) NOT NULL,
        receipt_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_purchase_supplier (purchase_id, supplier_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recreate purchase_receipts table
    await pool.execute(`
      CREATE TABLE purchase_receipts (
        id VARCHAR(50) PRIMARY KEY,
        purchase_id VARCHAR(50) NOT NULL,
        supplier_id VARCHAR(50) NOT NULL,
        receipt_number INT NOT NULL,
        grams_18k DECIMAL(10,2) DEFAULT 0,
        grams_21k DECIMAL(10,2) DEFAULT 0,
        total_grams_21k DECIMAL(10,2) NOT NULL,
        base_fees DECIMAL(12,2) NOT NULL,
        discount_rate DECIMAL(5,2) NOT NULL,
        discount_amount DECIMAL(12,2) NOT NULL,
        net_fees DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_purchase_supplier_receipt (purchase_id, supplier_id, receipt_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recreate payments table
    await pool.execute(`
      CREATE TABLE payments (
        id VARCHAR(50) PRIMARY KEY,
        purchase_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        grams_paid DECIMAL(10,2) NOT NULL,
        fees_paid DECIMAL(12,2) NOT NULL,
        karat_type ENUM('18', '21') NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Step 4: Migrate existing data
    console.log("🔄 Migrating existing data...");

    // Migrate purchases (no changes needed)
    for (const purchase of existingPurchases) {
      await pool.execute(
        `
        INSERT INTO purchases (id, store_id, date, status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          purchase.id,
          purchase.store_id,
          purchase.date,
          purchase.status,
          purchase.total_grams_21k_equivalent,
          purchase.total_base_fees,
          purchase.total_discount_amount,
          purchase.total_net_fees,
          purchase.due_date,
          purchase.created_at,
          purchase.updated_at,
        ]
      );
    }

    // Migrate purchase_suppliers (convert from old structure to new)
    // Group by purchase_id and supplier_id to aggregate data
    const supplierGroups = {};

    for (const ps of existingPurchaseSuppliers) {
      const key = `${ps.purchase_id}-${ps.supplier_id}`;
      if (!supplierGroups[key]) {
        supplierGroups[key] = {
          id: ps.id,
          purchase_id: ps.purchase_id,
          supplier_id: ps.supplier_id,
          total_grams_18k: 0,
          total_grams_21k: 0,
          total_grams_21k_equivalent: 0,
          total_base_fees: 0,
          total_discount_amount: 0,
          total_net_fees: 0,
          receipt_count: 0,
          created_at: ps.created_at,
          updated_at: ps.updated_at,
        };
      }

      // Aggregate data based on karat type
      if (ps.karat_type === "18") {
        supplierGroups[key].total_grams_18k += parseFloat(ps.grams);
        supplierGroups[key].total_grams_21k_equivalent +=
          parseFloat(ps.grams) * (18 / 21);
      } else if (ps.karat_type === "21") {
        supplierGroups[key].total_grams_21k += parseFloat(ps.grams);
        supplierGroups[key].total_grams_21k_equivalent += parseFloat(ps.grams);
      }

      supplierGroups[key].total_base_fees += parseFloat(ps.total_base_fee);
      supplierGroups[key].total_discount_amount += parseFloat(
        ps.total_discount_amount
      );
      supplierGroups[key].total_net_fees += parseFloat(ps.total_net_fee);
      supplierGroups[key].receipt_count += 1;
    }

    // Insert aggregated data
    for (const key in supplierGroups) {
      const ps = supplierGroups[key];
      await pool.execute(
        `
        INSERT INTO purchase_suppliers (id, purchase_id, supplier_id, total_grams_18k, total_grams_21k, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, receipt_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          ps.id,
          ps.purchase_id,
          ps.supplier_id,
          ps.total_grams_18k,
          ps.total_grams_21k,
          ps.total_grams_21k_equivalent,
          ps.total_base_fees,
          ps.total_discount_amount,
          ps.total_net_fees,
          ps.receipt_count,
          ps.created_at,
          ps.updated_at,
        ]
      );
    }

    // Migrate purchase_receipts (convert from old structure to new)
    for (const receipt of existingPurchaseReceipts) {
      // Convert old structure to new structure
      const grams18k = receipt.karat_type === "18" ? receipt.grams : 0;
      const grams21k = receipt.karat_type === "21" ? receipt.grams : 0;
      const totalGrams21k =
        receipt.karat_type === "18" ? receipt.grams * (18 / 21) : receipt.grams;
      const discountRate = receipt.discount_percentage; // Convert percentage to rate
      const discountAmount = totalGrams21k * discountRate;
      const netFees = receipt.total_base_fee - discountAmount;

      await pool.execute(
        `
        INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          receipt.id,
          receipt.purchase_id,
          receipt.supplier_id,
          1, // receipt_number - assuming 1 for each receipt
          grams18k,
          grams21k,
          totalGrams21k,
          receipt.total_base_fee,
          discountRate,
          discountAmount,
          netFees,
          receipt.created_at,
          receipt.updated_at,
        ]
      );
    }

    // Migrate payments (convert from old structure to new)
    for (const payment of existingPayments) {
      // Convert old structure to new structure
      // For now, we'll use reasonable defaults since the old structure doesn't have grams_paid and karat_type
      const gramsPaid = payment.amount / 5; // Assume 5 EGP per gram as default
      const karatType = "21"; // Default to 21k
      const feesPaid = payment.amount;

      await pool.execute(
        `
        INSERT INTO payments (id, purchase_id, date, grams_paid, fees_paid, karat_type, note, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          payment.id,
          payment.purchase_id,
          payment.payment_date,
          gramsPaid,
          feesPaid,
          karatType,
          payment.notes,
          payment.created_at,
          payment.updated_at,
        ]
      );
    }

    console.log("✅ Migration completed successfully!");
    console.log(
      `📊 Migrated ${existingPurchases.length} purchases, ${existingPurchaseSuppliers.length} purchase suppliers, ${existingPurchaseReceipts.length} receipts, ${existingPayments.length} payments`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToNewSchema()
    .then(() => {
      console.log("🎉 Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateToNewSchema };

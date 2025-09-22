/**
 * Update Supplier IDs Script
 * Changes supplier IDs from supplier-001 format to simple numeric format
 * Updates all references in related tables
 */

const { pool } = require("./config/database");

async function updateSupplierIds() {
  try {
    console.log("🔄 Starting supplier ID update...");

    // Temporarily disable foreign key checks
    await pool.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("🔓 Disabled foreign key checks");

    // Define the mapping of old IDs to new IDs
    const supplierIdMapping = {
      "supplier-001": "1",
      "supplier-002": "2", 
      "supplier-003": "3",
      "supplier-004": "4",
      "1758406738830": "5" // Keep the existing numeric ID as 5
    };

    // Step 1: Check for existing references
    console.log("📋 Checking for existing references...");
    
    for (const [oldId, newId] of Object.entries(supplierIdMapping)) {
      if (oldId === "1758406738830") continue; // Skip the already numeric one
      
      // Check discount_tiers table
      const [discountTiers] = await pool.execute(
        "SELECT COUNT(*) as count FROM discount_tiers WHERE supplier_id = ?",
        [oldId]
      );
      
      if (discountTiers[0].count > 0) {
        console.log(`  • Found ${discountTiers[0].count} discount tiers referencing supplier ${oldId}`);
      }

      // Check purchase_suppliers table
      const [purchaseSuppliers] = await pool.execute(
        "SELECT COUNT(*) as count FROM purchase_suppliers WHERE supplier_id = ?",
        [oldId]
      );
      
      if (purchaseSuppliers[0].count > 0) {
        console.log(`  • Found ${purchaseSuppliers[0].count} purchase suppliers referencing supplier ${oldId}`);
      }

      // Check purchase_receipts table
      const [purchaseReceipts] = await pool.execute(
        "SELECT COUNT(*) as count FROM purchase_receipts WHERE supplier_id = ?",
        [oldId]
      );
      
      if (purchaseReceipts[0].count > 0) {
        console.log(`  • Found ${purchaseReceipts[0].count} purchase receipts referencing supplier ${oldId}`);
      }
    }

    // Step 2: Update references in related tables
    console.log("🔄 Updating references in related tables...");
    
    for (const [oldId, newId] of Object.entries(supplierIdMapping)) {
      if (oldId === "1758406738830") continue; // Skip the already numeric one
      
      // Update discount_tiers
      const [discountResult] = await pool.execute(
        "UPDATE discount_tiers SET supplier_id = ? WHERE supplier_id = ?",
        [newId, oldId]
      );
      
      if (discountResult.affectedRows > 0) {
        console.log(`  ✅ Updated ${discountResult.affectedRows} discount tiers: ${oldId} → ${newId}`);
      }

      // Update purchase_suppliers
      const [purchaseSupplierResult] = await pool.execute(
        "UPDATE purchase_suppliers SET supplier_id = ? WHERE supplier_id = ?",
        [newId, oldId]
      );
      
      if (purchaseSupplierResult.affectedRows > 0) {
        console.log(`  ✅ Updated ${purchaseSupplierResult.affectedRows} purchase suppliers: ${oldId} → ${newId}`);
      }

      // Update purchase_receipts
      const [purchaseReceiptResult] = await pool.execute(
        "UPDATE purchase_receipts SET supplier_id = ? WHERE supplier_id = ?",
        [newId, oldId]
      );
      
      if (purchaseReceiptResult.affectedRows > 0) {
        console.log(`  ✅ Updated ${purchaseReceiptResult.affectedRows} purchase receipts: ${oldId} → ${newId}`);
      }
    }

    // Step 3: Update supplier IDs in suppliers table
    console.log("🔄 Updating supplier IDs in suppliers table...");
    
    for (const [oldId, newId] of Object.entries(supplierIdMapping)) {
      if (oldId === "1758406738830") continue; // Skip the already numeric one
      
      const [result] = await pool.execute(
        "UPDATE suppliers SET id = ? WHERE id = ?",
        [newId, oldId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`  ✅ Updated supplier: ${oldId} → ${newId}`);
      }
    }

    // Step 4: Verify the changes
    console.log("\n📊 Updated suppliers:");
    const [updatedSuppliers] = await pool.execute("SELECT id, name, code FROM suppliers ORDER BY id");
    updatedSuppliers.forEach(supplier => {
      console.log(`  • ID: ${supplier.id}, Name: ${supplier.name}, Code: ${supplier.code}`);
    });

    // Step 5: Check discount tiers with new supplier IDs
    console.log("\n📊 Discount tiers with updated supplier references:");
    const [discountTiers] = await pool.execute(`
      SELECT dt.id, dt.supplier_id, s.name as supplier_name 
      FROM discount_tiers dt 
      LEFT JOIN suppliers s ON dt.supplier_id = s.id 
      ORDER BY dt.id
    `);
    
    if (discountTiers.length > 0) {
      discountTiers.forEach(tier => {
        console.log(`  • Tier ${tier.id} → Supplier ${tier.supplier_id} (${tier.supplier_name})`);
      });
    } else {
      console.log("  • No discount tiers found");
    }

    // Re-enable foreign key checks
    await pool.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🔒 Re-enabled foreign key checks");

    console.log("\n🎉 Supplier ID update completed successfully!");
    
  } catch (error) {
    console.error("❌ Supplier ID update failed:", error.message);
    // Re-enable foreign key checks even if there's an error
    try {
      await pool.execute("SET FOREIGN_KEY_CHECKS = 1");
      console.log("🔒 Re-enabled foreign key checks");
    } catch (fkError) {
      console.error("❌ Failed to re-enable foreign key checks:", fkError.message);
    }
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  updateSupplierIds().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { updateSupplierIds };

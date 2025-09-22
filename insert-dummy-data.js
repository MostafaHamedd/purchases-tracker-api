const { pool } = require("./config/database");

// Dummy data for all tables
const dummyData = {
  stores: [
    {
      id: "store-001",
      name: "Downtown Gold Store",
      code: "DGS",
      is_active: true,
      progress_bar_config: { blue: 15, yellow: 8, orange: 5, red: 3 },
    },
    {
      id: "store-002",
      name: "Mall Jewelry Shop",
      code: "MJS",
      is_active: true,
      progress_bar_config: { blue: 12, yellow: 6, orange: 4, red: 2 },
    },
    {
      id: "store-003",
      name: "Plaza Gold Center",
      code: "PGC",
      is_active: true,
      progress_bar_config: { blue: 20, yellow: 10, orange: 7, red: 4 },
    },
  ],

  suppliers: [
    {
      id: "supplier-001",
      name: "Golden Source Ltd",
      code: "GSL",
      is_active: true,
    },
    {
      id: "supplier-002",
      name: "Premium Gold Co",
      code: "PGC",
      is_active: true,
    },
    {
      id: "supplier-003",
      name: "Elite Jewelry Supply",
      code: "EJS",
      is_active: true,
    },
    {
      id: "supplier-004",
      name: "Royal Gold Traders",
      code: "RGT",
      is_active: true,
    },
  ],

  discountTiers: [
    // Golden Source Ltd tiers
    {
      id: "tier-001",
      supplier_id: "supplier-001",
      karat_type: "18",
      name: "Basic 18k",
      threshold: 100.0,
      discount_percentage: 5.0,
      is_protected: false,
    },
    {
      id: "tier-002",
      supplier_id: "supplier-001",
      karat_type: "18",
      name: "Premium 18k",
      threshold: 500.0,
      discount_percentage: 10.0,
      is_protected: false,
    },
    {
      id: "tier-003",
      supplier_id: "supplier-001",
      karat_type: "21",
      name: "Basic 21k",
      threshold: 100.0,
      discount_percentage: 8.0,
      is_protected: false,
    },
    {
      id: "tier-004",
      supplier_id: "supplier-001",
      karat_type: "21",
      name: "Premium 21k",
      threshold: 500.0,
      discount_percentage: 15.0,
      is_protected: false,
    },
    // Premium Gold Co tiers
    {
      id: "tier-005",
      supplier_id: "supplier-002",
      karat_type: "18",
      name: "Standard 18k",
      threshold: 200.0,
      discount_percentage: 7.0,
      is_protected: false,
    },
    {
      id: "tier-006",
      supplier_id: "supplier-002",
      karat_type: "21",
      name: "Standard 21k",
      threshold: 200.0,
      discount_percentage: 12.0,
      is_protected: false,
    },
    // Elite Jewelry Supply tiers
    {
      id: "tier-007",
      supplier_id: "supplier-003",
      karat_type: "18",
      name: "Elite 18k",
      threshold: 300.0,
      discount_percentage: 9.0,
      is_protected: true,
    },
    {
      id: "tier-008",
      supplier_id: "supplier-003",
      karat_type: "21",
      name: "Elite 21k",
      threshold: 300.0,
      discount_percentage: 14.0,
      is_protected: true,
    },
  ],

  purchases: [
    {
      id: "purchase-001",
      store_id: "store-001",
      date: "2025-01-15",
      status: "Paid",
      total_grams_21k_equivalent: 250.5,
      total_base_fees: 1252.5,
      total_discount_amount: 125.25,
      total_net_fees: 1127.25,
      due_date: "2025-02-15",
    },
    {
      id: "purchase-002",
      store_id: "store-001",
      date: "2025-01-20",
      status: "Partial",
      total_grams_21k_equivalent: 180.75,
      total_base_fees: 903.75,
      total_discount_amount: 90.38,
      total_net_fees: 813.37,
      due_date: "2025-02-20",
    },
    {
      id: "purchase-003",
      store_id: "store-002",
      date: "2025-01-25",
      status: "Pending",
      total_grams_21k_equivalent: 320.25,
      total_base_fees: 1601.25,
      total_discount_amount: 160.13,
      total_net_fees: 1441.12,
      due_date: "2025-02-25",
    },
    {
      id: "purchase-004",
      store_id: "store-003",
      date: "2025-01-30",
      status: "Overdue",
      total_grams_21k_equivalent: 450.0,
      total_base_fees: 2250.0,
      total_discount_amount: 225.0,
      total_net_fees: 2025.0,
      due_date: "2025-01-25",
    },
  ],

  purchaseSuppliers: [
    // Purchase 001 - Golden Source Ltd
    {
      id: "ps-001",
      purchase_id: "purchase-001",
      supplier_id: "supplier-001",
      karat_type: "21",
      grams: 150.25,
      base_fee_per_gram: 5.0,
      discount_percentage: 10.0,
      net_fee_per_gram: 4.5,
      total_base_fee: 751.25,
      total_discount_amount: 75.13,
      total_net_fee: 676.12,
    },
    {
      id: "ps-002",
      purchase_id: "purchase-001",
      supplier_id: "supplier-001",
      karat_type: "18",
      grams: 100.25,
      base_fee_per_gram: 4.5,
      discount_percentage: 8.0,
      net_fee_per_gram: 4.14,
      total_base_fee: 451.13,
      total_discount_amount: 36.09,
      total_net_fee: 415.04,
    },
    // Purchase 002 - Premium Gold Co
    {
      id: "ps-003",
      purchase_id: "purchase-002",
      supplier_id: "supplier-002",
      karat_type: "21",
      grams: 120.5,
      base_fee_per_gram: 5.2,
      discount_percentage: 12.0,
      net_fee_per_gram: 4.58,
      total_base_fee: 626.6,
      total_discount_amount: 75.19,
      total_net_fee: 551.41,
    },
    {
      id: "ps-004",
      purchase_id: "purchase-002",
      supplier_id: "supplier-002",
      karat_type: "18",
      grams: 60.25,
      base_fee_per_gram: 4.6,
      discount_percentage: 10.0,
      net_fee_per_gram: 4.14,
      total_base_fee: 277.15,
      total_discount_amount: 27.72,
      total_net_fee: 249.43,
    },
    // Purchase 003 - Elite Jewelry Supply
    {
      id: "ps-005",
      purchase_id: "purchase-003",
      supplier_id: "supplier-003",
      karat_type: "21",
      grams: 200.0,
      base_fee_per_gram: 5.5,
      discount_percentage: 15.0,
      net_fee_per_gram: 4.68,
      total_base_fee: 1100.0,
      total_discount_amount: 165.0,
      total_net_fee: 935.0,
    },
    {
      id: "ps-006",
      purchase_id: "purchase-003",
      supplier_id: "supplier-003",
      karat_type: "18",
      grams: 120.25,
      base_fee_per_gram: 4.8,
      discount_percentage: 12.0,
      net_fee_per_gram: 4.22,
      total_base_fee: 577.2,
      total_discount_amount: 69.26,
      total_net_fee: 507.94,
    },
    // Purchase 004 - Royal Gold Traders
    {
      id: "ps-007",
      purchase_id: "purchase-004",
      supplier_id: "supplier-004",
      karat_type: "21",
      grams: 300.0,
      base_fee_per_gram: 5.25,
      discount_percentage: 8.0,
      net_fee_per_gram: 4.83,
      total_base_fee: 1575.0,
      total_discount_amount: 126.0,
      total_net_fee: 1449.0,
    },
    {
      id: "ps-008",
      purchase_id: "purchase-004",
      supplier_id: "supplier-004",
      karat_type: "18",
      grams: 150.0,
      base_fee_per_gram: 4.5,
      discount_percentage: 6.0,
      net_fee_per_gram: 4.23,
      total_base_fee: 675.0,
      total_discount_amount: 40.5,
      total_net_fee: 634.5,
    },
  ],

  purchaseReceipts: [
    // Receipts for Purchase 001
    {
      id: "receipt-001",
      purchase_id: "purchase-001",
      supplier_id: "supplier-001",
      receipt_number: "RCP-001-2025",
      receipt_date: "2025-01-15",
      karat_type: "21",
      grams: 150.25,
      base_fee_per_gram: 5.0,
      discount_percentage: 10.0,
      net_fee_per_gram: 4.5,
      total_base_fee: 751.25,
      total_discount_amount: 75.13,
      total_net_fee: 676.12,
      notes: "High quality 21k gold from Golden Source",
    },
    {
      id: "receipt-002",
      purchase_id: "purchase-001",
      supplier_id: "supplier-001",
      receipt_number: "RCP-002-2025",
      receipt_date: "2025-01-15",
      karat_type: "18",
      grams: 100.25,
      base_fee_per_gram: 4.5,
      discount_percentage: 8.0,
      net_fee_per_gram: 4.14,
      total_base_fee: 451.13,
      total_discount_amount: 36.09,
      total_net_fee: 415.04,
      notes: "Standard 18k gold batch",
    },
    // Receipts for Purchase 002
    {
      id: "receipt-003",
      purchase_id: "purchase-002",
      supplier_id: "supplier-002",
      receipt_number: "RCP-003-2025",
      receipt_date: "2025-01-20",
      karat_type: "21",
      grams: 120.5,
      base_fee_per_gram: 5.2,
      discount_percentage: 12.0,
      net_fee_per_gram: 4.58,
      total_base_fee: 626.6,
      total_discount_amount: 75.19,
      total_net_fee: 551.41,
      notes: "Premium 21k gold from Premium Gold Co",
    },
    {
      id: "receipt-004",
      purchase_id: "purchase-002",
      supplier_id: "supplier-002",
      receipt_number: "RCP-004-2025",
      receipt_date: "2025-01-20",
      karat_type: "18",
      grams: 60.25,
      base_fee_per_gram: 4.6,
      discount_percentage: 10.0,
      net_fee_per_gram: 4.14,
      total_base_fee: 277.15,
      total_discount_amount: 27.72,
      total_net_fee: 249.43,
      notes: "Small 18k gold order",
    },
    // Receipts for Purchase 003
    {
      id: "receipt-005",
      purchase_id: "purchase-003",
      supplier_id: "supplier-003",
      receipt_number: "RCP-005-2025",
      receipt_date: "2025-01-25",
      karat_type: "21",
      grams: 200.0,
      base_fee_per_gram: 5.5,
      discount_percentage: 15.0,
      net_fee_per_gram: 4.68,
      total_base_fee: 1100.0,
      total_discount_amount: 165.0,
      total_net_fee: 935.0,
      notes: "Elite quality 21k gold - large order",
    },
    {
      id: "receipt-006",
      purchase_id: "purchase-003",
      supplier_id: "supplier-003",
      receipt_number: "RCP-006-2025",
      receipt_date: "2025-01-25",
      karat_type: "18",
      grams: 120.25,
      base_fee_per_gram: 4.8,
      discount_percentage: 12.0,
      net_fee_per_gram: 4.22,
      total_base_fee: 577.2,
      total_discount_amount: 69.26,
      total_net_fee: 507.94,
      notes: "Elite 18k gold batch",
    },
    // Receipts for Purchase 004
    {
      id: "receipt-007",
      purchase_id: "purchase-004",
      supplier_id: "supplier-004",
      receipt_number: "RCP-007-2025",
      receipt_date: "2025-01-30",
      karat_type: "21",
      grams: 300.0,
      base_fee_per_gram: 5.25,
      discount_percentage: 8.0,
      net_fee_per_gram: 4.83,
      total_base_fee: 1575.0,
      total_discount_amount: 126.0,
      total_net_fee: 1449.0,
      notes: "Large 21k gold order from Royal Gold Traders",
    },
    {
      id: "receipt-008",
      purchase_id: "purchase-004",
      supplier_id: "supplier-004",
      receipt_number: "RCP-008-2025",
      receipt_date: "2025-01-30",
      karat_type: "18",
      grams: 150.0,
      base_fee_per_gram: 4.5,
      discount_percentage: 6.0,
      net_fee_per_gram: 4.23,
      total_base_fee: 675.0,
      total_discount_amount: 40.5,
      total_net_fee: 634.5,
      notes: "Standard 18k gold from Royal Gold Traders",
    },
  ],

  payments: [
    // Payments for Purchase 001 (Paid - $1127.25)
    {
      id: "payment-001",
      purchase_id: "purchase-001",
      amount: 500.0,
      payment_date: "2025-01-16",
      payment_method: "Cash",
      reference_number: "CASH-001",
      notes: "Initial cash payment",
    },
    {
      id: "payment-002",
      purchase_id: "purchase-001",
      amount: 627.25,
      payment_date: "2025-01-18",
      payment_method: "Bank Transfer",
      reference_number: "BT-001",
      notes: "Final payment via bank transfer",
    },
    // Payments for Purchase 002 (Partial - $813.37 total, $400 paid)
    {
      id: "payment-003",
      purchase_id: "purchase-002",
      amount: 400.0,
      payment_date: "2025-01-22",
      payment_method: "Check",
      reference_number: "CHK-001",
      notes: "Partial payment by check",
    },
    // Payments for Purchase 003 (Pending - $1441.12 total, $500 paid)
    {
      id: "payment-004",
      purchase_id: "purchase-003",
      amount: 500.0,
      payment_date: "2025-01-26",
      payment_method: "Credit Card",
      reference_number: "CC-001",
      notes: "Initial payment by credit card",
    },
    // Payments for Purchase 004 (Overdue - $2025.00 total, $1000 paid)
    {
      id: "payment-005",
      purchase_id: "purchase-004",
      amount: 1000.0,
      payment_date: "2025-01-31",
      payment_method: "Bank Transfer",
      reference_number: "BT-002",
      notes: "Partial payment for overdue purchase",
    },
  ],
};

// Function to insert data into a table
async function insertData(tableName, data) {
  try {
    console.log(`📝 Inserting ${data.length} records into ${tableName}...`);

    for (const record of data) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = columns.map(() => "?").join(", ");

      const query = `INSERT INTO ${tableName} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;
      await pool.execute(query, values);
    }

    console.log(
      `✅ Successfully inserted ${data.length} records into ${tableName}`
    );
  } catch (error) {
    console.error(`❌ Error inserting data into ${tableName}:`, error.message);
    throw error;
  }
}

// Function to clear all tables (in reverse order due to foreign keys)
async function clearTables() {
  console.log("🧹 Clearing existing data...");

  const tables = [
    "payments",
    "purchase_receipts",
    "purchase_suppliers",
    "purchases",
    "discount_tiers",
    "suppliers",
    "stores",
  ];

  for (const table of tables) {
    try {
      await pool.execute(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table}`);
    } catch (error) {
      console.error(`❌ Error clearing ${table}:`, error.message);
    }
  }
}

// Function to insert all dummy data
async function insertAllDummyData() {
  try {
    console.log("🚀 Starting dummy data insertion...\n");

    // Clear existing data first
    await clearTables();
    console.log("");

    // Insert data in order (respecting foreign key constraints)
    await insertData("stores", dummyData.stores);
    await insertData("suppliers", dummyData.suppliers);
    await insertData("discount_tiers", dummyData.discountTiers);
    await insertData("purchases", dummyData.purchases);
    await insertData("purchase_suppliers", dummyData.purchaseSuppliers);
    await insertData("purchase_receipts", dummyData.purchaseReceipts);
    await insertData("payments", dummyData.payments);

    console.log("\n🎉 All dummy data inserted successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${dummyData.stores.length} stores`);
    console.log(`   • ${dummyData.suppliers.length} suppliers`);
    console.log(`   • ${dummyData.discountTiers.length} discount tiers`);
    console.log(`   • ${dummyData.purchases.length} purchases`);
    console.log(
      `   • ${dummyData.purchaseSuppliers.length} purchase suppliers`
    );
    console.log(`   • ${dummyData.purchaseReceipts.length} purchase receipts`);
    console.log(`   • ${dummyData.payments.length} payments`);

    console.log("\n🔗 You can now test the API with this data!");
    console.log("   Example endpoints to try:");
    console.log("   • GET http://localhost:3000/api/stores");
    console.log("   • GET http://localhost:3000/api/purchases");
    console.log(
      "   • GET http://localhost:3000/api/payments/purchase/purchase-001"
    );
    console.log("   • GET http://localhost:3000/api/purchase-receipts");
  } catch (error) {
    console.error("❌ Failed to insert dummy data:", error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  insertAllDummyData();
}

module.exports = { insertAllDummyData, dummyData };



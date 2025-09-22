/**
 * Database Cleanup Script
 * Deletes all entries except stores and suppliers
 */

const { pool } = require("./config/database");

async function cleanupDatabase() {
  try {
    console.log("🧹 Starting database cleanup...");
    console.log("📋 Will keep: stores, suppliers, discount_tiers");
    console.log(
      "🗑️ Will delete: payments, purchase_receipts, purchase_suppliers, purchases\n"
    );

    // Tables to clear (in reverse order due to foreign key constraints)
    const tablesToClear = [
      "payments",
      "purchase_receipts",
      "purchase_suppliers",
      "purchases",
    ];

    // Clear each table
    for (const table of tablesToClear) {
      try {
        const [result] = await pool.execute(`DELETE FROM ${table}`);
        console.log(
          `✅ Cleared ${table} (${result.affectedRows} rows deleted)`
        );
      } catch (error) {
        console.error(`❌ Error clearing ${table}:`, error.message);
      }
    }

    // Show remaining data counts
    console.log("\n📊 Remaining data:");

    const [storesResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM stores"
    );
    const [suppliersResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM suppliers"
    );
    const [discountTiersResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM discount_tiers"
    );

    console.log(`   • Stores: ${storesResult[0].count} records`);
    console.log(`   • Suppliers: ${suppliersResult[0].count} records`);
    console.log(`   • Discount Tiers: ${discountTiersResult[0].count} records`);

    console.log("\n🎉 Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error.message);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  cleanupDatabase().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { cleanupDatabase };

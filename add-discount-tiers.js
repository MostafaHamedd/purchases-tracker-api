/**
 * Add Discount Tiers Script
 * Adds back the discount tiers data
 */

const { pool } = require("./config/database");
const { dummyData } = require("./insert-dummy-data");

async function addDiscountTiers() {
  try {
    console.log("🔄 Adding discount tiers data...");

    // Insert discount tiers data
    await insertData("discount_tiers", dummyData.discountTiers);

    // Show count
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM discount_tiers"
    );
    console.log(`✅ Added ${dummyData.discountTiers.length} discount tiers`);
    console.log(`📊 Total discount tiers in database: ${result[0].count}`);

    console.log("\n🎉 Discount tiers added successfully!");
  } catch (error) {
    console.error("❌ Failed to add discount tiers:", error.message);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Helper function to insert data
async function insertData(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⚠️ No data to insert for ${tableName}`);
    return;
  }

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

// Run the script
if (require.main === module) {
  addDiscountTiers().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { addDiscountTiers };

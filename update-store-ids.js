/**
 * Update Store IDs Script
 * Changes store IDs from store-001 format to simple numeric format
 * Updates all references in related tables
 */

const { pool } = require("./config/database");

async function updateStoreIds() {
  try {
    console.log("🔄 Starting store ID update...");

    // Define the mapping of old IDs to new IDs
    const storeIdMapping = {
      "store-001": "1",
      "store-002": "2", 
      "store-003": "3",
      "1758406458499": "4" // Keep the existing numeric ID as 4
    };

    // Step 1: Check for existing references
    console.log("📋 Checking for existing references...");
    
    for (const [oldId, newId] of Object.entries(storeIdMapping)) {
      if (oldId === "1758406458499") continue; // Skip the already numeric one
      
      // Check purchases table
      const [purchases] = await pool.execute(
        "SELECT COUNT(*) as count FROM purchases WHERE store_id = ?",
        [oldId]
      );
      
      if (purchases[0].count > 0) {
        console.log(`  • Found ${purchases[0].count} purchases referencing store ${oldId}`);
      }
    }

    // Step 2: Update references in purchases table
    console.log("🔄 Updating references in purchases table...");
    
    for (const [oldId, newId] of Object.entries(storeIdMapping)) {
      if (oldId === "1758406458499") continue; // Skip the already numeric one
      
      const [result] = await pool.execute(
        "UPDATE purchases SET store_id = ? WHERE store_id = ?",
        [newId, oldId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`  ✅ Updated ${result.affectedRows} purchases: ${oldId} → ${newId}`);
      }
    }

    // Step 3: Update store IDs in stores table
    console.log("🔄 Updating store IDs in stores table...");
    
    for (const [oldId, newId] of Object.entries(storeIdMapping)) {
      if (oldId === "1758406458499") continue; // Skip the already numeric one
      
      const [result] = await pool.execute(
        "UPDATE stores SET id = ? WHERE id = ?",
        [newId, oldId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`  ✅ Updated store: ${oldId} → ${newId}`);
      }
    }

    // Step 4: Verify the changes
    console.log("\n📊 Updated stores:");
    const [updatedStores] = await pool.execute("SELECT id, name, code FROM stores ORDER BY id");
    updatedStores.forEach(store => {
      console.log(`  • ID: ${store.id}, Name: ${store.name}, Code: ${store.code}`);
    });

    // Step 5: Check purchases with new store IDs
    console.log("\n📊 Purchases with updated store references:");
    const [purchases] = await pool.execute(`
      SELECT p.id, p.store_id, s.name as store_name 
      FROM purchases p 
      LEFT JOIN stores s ON p.store_id = s.id 
      ORDER BY p.id
    `);
    
    if (purchases.length > 0) {
      purchases.forEach(purchase => {
        console.log(`  • Purchase ${purchase.id} → Store ${purchase.store_id} (${purchase.store_name})`);
      });
    } else {
      console.log("  • No purchases found");
    }

    console.log("\n🎉 Store ID update completed successfully!");
    
  } catch (error) {
    console.error("❌ Store ID update failed:", error.message);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  updateStoreIds().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { updateStoreIds };

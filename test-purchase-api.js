#!/usr/bin/env node

/**
 * Test script to test the purchase creation API with automatic discount calculation
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

async function testPurchaseCreationAPI() {
  try {
    console.log("Testing Purchase Creation API with Automatic Discounts...\n");

    // Test data
    const testPurchase = {
      id: `test-purchase-${Date.now()}`,
      store_id: "store-1", // Make sure this exists in your database
      supplier_id: "supplier-1", // Make sure this exists in your database
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      receipts: [
        {
          supplier_id: "supplier-1",
          receipt_number: 1,
          receipt_date: new Date().toISOString().split("T")[0],
          karat_type: "21",
          grams: 100,
          base_fee_per_gram: 5,
          notes: "Test receipt 1",
        },
        {
          supplier_id: "supplier-1",
          receipt_number: 2,
          receipt_date: new Date().toISOString().split("T")[0],
          karat_type: "18",
          grams: 50,
          base_fee_per_gram: 5,
          notes: "Test receipt 2",
        },
      ],
    };

    console.log("Creating purchase with automatic discount calculation...");
    console.log(`Purchase ID: ${testPurchase.id}`);
    console.log(`Receipts: ${testPurchase.receipts.length}`);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/purchases`,
        testPurchase
      );

      if (response.data.success) {
        console.log("✅ Purchase created successfully!");
        console.log("\nPurchase details:");
        console.log(JSON.stringify(response.data.data, null, 2));

        // Check if discounts were applied
        const purchase = response.data.data;
        if (purchase.total_discount_amount > 0) {
          console.log(
            `\n🎉 Discounts applied! Total discount: ${purchase.total_discount_amount} EGP`
          );
          console.log(
            `Discount percentage: ${(
              (purchase.total_discount_amount / purchase.total_base_fees) *
              100
            ).toFixed(1)}%`
          );
        } else {
          console.log(
            "\n⚠️ No discounts applied (this might be expected for low monthly totals)"
          );
        }

        // Check receipt details
        if (purchase.receipts && purchase.receipts.length > 0) {
          console.log("\nReceipt details:");
          purchase.receipts.forEach((receipt, index) => {
            console.log(`\nReceipt ${index + 1}:`);
            console.log(`  Grams: ${receipt.grams}g (${receipt.karat_type}k)`);
            console.log(`  Base fee: ${receipt.total_base_fee} EGP`);
            console.log(
              `  Discount: ${receipt.total_discount_amount} EGP (${(
                receipt.discount_percentage * 100
              ).toFixed(1)}%)`
            );
            console.log(`  Net fee: ${receipt.total_net_fee} EGP`);
            if (receipt.discount_tier) {
              console.log(`  Discount tier: ${receipt.discount_tier}`);
            }
            if (receipt.monthly_total !== undefined) {
              console.log(`  Monthly total: ${receipt.monthly_total}g`);
            }
          });
        }
      } else {
        console.log("❌ Purchase creation failed:");
        console.log(response.data);
      }
    } catch (error) {
      if (error.response) {
        console.log("❌ API Error:");
        console.log(`Status: ${error.response.status}`);
        console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log("❌ Network Error:");
        console.log(error.message);
        console.log(
          "\nMake sure the API server is running on http://localhost:3000"
        );
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Check if axios is available
try {
  require.resolve("axios");
  testPurchaseCreationAPI();
} catch (error) {
  console.log("❌ axios is not installed. Installing...");
  console.log("Please run: npm install axios");
  console.log("Then run this script again.");
}

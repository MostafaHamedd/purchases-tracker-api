const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Test various API endpoints with the dummy data
async function testDummyDataEndpoints() {
  console.log("🧪 Testing API endpoints with dummy data...\n");

  try {
    // Test 1: Health Check
    console.log("1. 🏥 Health Check");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Server is running:", health.data.status);
    console.log("");

    // Test 2: Get all stores
    console.log("2. 🏪 All Stores");
    const stores = await axios.get(`${BASE_URL}/stores`);
    console.log(`✅ Found ${stores.data.count} stores:`);
    stores.data.data.forEach((store) => {
      console.log(
        `   • ${store.name} (${store.code}) - Active: ${
          store.is_active ? "Yes" : "No"
        }`
      );
    });
    console.log("");

    // Test 3: Get all suppliers
    console.log("3. 🏭 All Suppliers");
    const suppliers = await axios.get(`${BASE_URL}/suppliers`);
    console.log(`✅ Found ${suppliers.data.count} suppliers:`);
    suppliers.data.data.forEach((supplier) => {
      console.log(
        `   • ${supplier.name} (${supplier.code}) - Active: ${
          supplier.is_active ? "Yes" : "No"
        }`
      );
    });
    console.log("");

    // Test 4: Get all purchases with store info
    console.log("4. 🛒 All Purchases");
    const purchases = await axios.get(`${BASE_URL}/purchases`);
    console.log(`✅ Found ${purchases.data.count} purchases:`);
    purchases.data.data.forEach((purchase) => {
      console.log(
        `   • ${purchase.id} - ${purchase.store_name} - Status: ${purchase.status} - Total: $${purchase.total_net_fees}`
      );
    });
    console.log("");

    // Test 5: Get payments for a specific purchase
    console.log("5. 💳 Payments for Purchase-001");
    const payments = await axios.get(
      `${BASE_URL}/payments/purchase/purchase-001`
    );
    console.log(`✅ Found ${payments.data.count} payments for purchase-001:`);
    console.log(`   • Purchase Total: $${payments.data.summary.purchaseTotal}`);
    console.log(`   • Total Paid: $${payments.data.summary.totalPaid}`);
    console.log(`   • Remaining: $${payments.data.summary.remainingBalance}`);
    console.log(
      `   • Fully Paid: ${payments.data.summary.isFullyPaid ? "Yes" : "No"}`
    );
    payments.data.data.forEach((payment) => {
      console.log(
        `   • ${payment.payment_method}: $${payment.amount} (${payment.payment_date})`
      );
    });
    console.log("");

    // Test 6: Get purchase receipts for a specific purchase
    console.log("6. 🧾 Purchase Receipts for Purchase-001");
    const receipts = await axios.get(
      `${BASE_URL}/purchase-receipts/purchase/purchase-001`
    );
    console.log(`✅ Found ${receipts.data.count} receipts for purchase-001:`);
    receipts.data.data.forEach((receipt) => {
      console.log(
        `   • ${receipt.receipt_number} - ${receipt.karat_type}k - ${receipt.grams}g - $${receipt.total_net_fee}`
      );
    });
    console.log("");

    // Test 7: Get discount tiers for a supplier
    console.log("7. 💰 Discount Tiers for Golden Source Ltd");
    const tiers = await axios.get(
      `${BASE_URL}/discount-tiers?supplier=supplier-001`
    );
    console.log(`✅ Found ${tiers.data.count} discount tiers:`);
    tiers.data.data.forEach((tier) => {
      console.log(
        `   • ${tier.karat_type}k - ${tier.name} - Threshold: $${tier.threshold} - Discount: ${tier.discount_percentage}%`
      );
    });
    console.log("");

    // Test 8: Get payments by method
    console.log("8. 💳 Payments by Method (Cash)");
    const cashPayments = await axios.get(`${BASE_URL}/payments/method/Cash`);
    console.log(`✅ Found ${cashPayments.data.count} cash payments:`);
    cashPayments.data.data.forEach((payment) => {
      console.log(
        `   • $${payment.amount} - ${payment.store_name} - ${payment.payment_date}`
      );
    });
    console.log("");

    // Test 9: Get purchase receipts by supplier
    console.log("9. 🏭 Purchase Receipts by Supplier (Golden Source Ltd)");
    const supplierReceipts = await axios.get(
      `${BASE_URL}/purchase-receipts/supplier/supplier-001`
    );
    console.log(
      `✅ Found ${supplierReceipts.data.count} receipts from Golden Source Ltd:`
    );
    supplierReceipts.data.data.forEach((receipt) => {
      console.log(
        `   • ${receipt.receipt_number} - ${receipt.karat_type}k - ${receipt.grams}g - $${receipt.total_net_fee}`
      );
    });
    console.log("");

    // Test 10: Search functionality
    console.log("10. 🔍 Search Purchase Receipts (search: 'gold')");
    const searchResults = await axios.get(
      `${BASE_URL}/purchase-receipts?search=gold`
    );
    console.log(
      `✅ Found ${searchResults.data.count} receipts containing 'gold':`
    );
    searchResults.data.data.forEach((receipt) => {
      console.log(
        `   • ${receipt.receipt_number} - ${receipt.supplier_name} - ${receipt.notes}`
      );
    });
    console.log("");

    console.log("🎉 All API tests completed successfully!");
    console.log("\n📊 Summary of Dummy Data:");
    console.log("   • 3 stores with different configurations");
    console.log("   • 4 suppliers with various discount tiers");
    console.log(
      "   • 4 purchases with different statuses (Paid, Partial, Pending, Overdue)"
    );
    console.log(
      "   • 8 purchase receipts with different karat types and suppliers"
    );
    console.log("   • 5 payments with different methods and amounts");
    console.log(
      "   • 8 discount tiers with different thresholds and percentages"
    );
  } catch (error) {
    console.error(
      "❌ Error testing API:",
      error.response?.data || error.message
    );
  }
}

// Run the tests
if (require.main === module) {
  testDummyDataEndpoints();
}

module.exports = { testDummyDataEndpoints };



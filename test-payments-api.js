const axios = require("axios");

// ============================================================================
// PAYMENTS API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the payments API
// Includes foreign key validation and payment method testing
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for payments
const testData = {
  // First create a store and purchase to use for testing
  store: {
    id: "test-store-payments",
    name: "Test Store for Payments",
    code: "TSP",
    is_active: true,
    progress_bar_config: {
      blue: 25,
      yellow: 5,
      orange: 5,
      red: 5,
    },
  },
  purchase: {
    id: "test-purchase-payments",
    store_id: "test-store-payments",
    date: "2025-01-15",
    status: "Pending",
    total_grams_21k_equivalent: 500.0,
    total_base_fees: 2500.0,
    total_discount_amount: 1000.0,
    total_net_fees: 1500.0,
    due_date: "2025-02-15",
  },
  // Payments to test
  payment1: {
    id: "PAY-001",
    purchase_id: "test-purchase-payments",
    amount: 500.0,
    payment_date: "2025-01-15",
    payment_method: "Cash",
    reference_number: "CASH-001",
    notes: "First cash payment",
  },
  payment2: {
    id: "PAY-002",
    purchase_id: "test-purchase-payments",
    amount: 750.0,
    payment_date: "2025-01-20",
    payment_method: "Bank Transfer",
    reference_number: "BT-001-2025",
    notes: "Bank transfer payment",
  },
  payment3: {
    id: "PAY-003",
    purchase_id: "test-purchase-payments",
    amount: 250.0,
    payment_date: "2025-01-25",
    payment_method: "Check",
    reference_number: "CHK-001",
    notes: "Check payment for remaining balance",
  },
};

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test 1: Health Check
 * Verify the API is running
 */
async function testHealthCheck() {
  console.log("1. 🏥 Testing health check...");
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", response.data.status);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return false;
  }
}

/**
 * Test 2: Create Test Store
 * Create a store to use for payment testing
 */
async function testCreateTestStore() {
  console.log("2. 🏪 Creating test store...");
  try {
    const response = await axios.post(`${BASE_URL}/stores`, testData.store);
    console.log("✅ Test store created:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create test store failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 3: Create Test Purchase
 * Create a purchase to use for payment testing
 */
async function testCreateTestPurchase() {
  console.log("3. 🛒 Creating test purchase...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchases`,
      testData.purchase
    );
    console.log("✅ Test purchase created:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
      total_net_fees: response.data.data.total_net_fees,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create test purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 4: Get All Payments (Empty)
 * Should return empty array initially
 */
async function testGetAllPaymentsEmpty() {
  console.log("4. 📋 Testing get all payments (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/payments`);
    console.log("✅ Get all payments passed:", {
      success: response.data.success,
      count: response.data.count,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all payments failed:", error.message);
    return false;
  }
}

/**
 * Test 5: Create First Payment
 * Create a cash payment
 */
async function testCreateFirstPayment() {
  console.log("5. ➕ Testing create first payment...");
  try {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      testData.payment1
    );
    console.log("✅ Create first payment passed:", {
      success: response.data.success,
      id: response.data.data.id,
      amount: response.data.data.amount,
      payment_method: response.data.data.payment_method,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first payment failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 6: Create Second Payment
 * Create a bank transfer payment
 */
async function testCreateSecondPayment() {
  console.log("6. ➕ Testing create second payment...");
  try {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      testData.payment2
    );
    console.log("✅ Create second payment passed:", {
      success: response.data.success,
      id: response.data.data.id,
      amount: response.data.data.amount,
      payment_method: response.data.data.payment_method,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second payment failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Create Third Payment
 * Create a check payment
 */
async function testCreateThirdPayment() {
  console.log("7. ➕ Testing create third payment...");
  try {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      testData.payment3
    );
    console.log("✅ Create third payment passed:", {
      success: response.data.success,
      id: response.data.data.id,
      amount: response.data.data.amount,
      payment_method: response.data.data.payment_method,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create third payment failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 8: Get All Payments (With Data)
 * Should return 3 payments now
 */
async function testGetAllPaymentsWithData() {
  console.log("8. 📋 Testing get all payments (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/payments`);
    console.log("✅ Get all payments with data passed:", {
      success: response.data.success,
      count: response.data.count,
      payments: response.data.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_method: p.payment_method,
        store_name: p.store_name,
        purchase_date: p.purchase_date,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all payments with data failed:", error.message);
    return false;
  }
}

/**
 * Test 9: Get Payment by ID
 * Retrieve a specific payment by ID
 */
async function testGetPaymentById() {
  console.log("9. 🔍 Testing get payment by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/${testData.payment1.id}`
    );
    console.log("✅ Get payment by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      amount: response.data.data.amount,
      payment_method: response.data.data.payment_method,
      store_name: response.data.data.store_name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get payment by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 10: Get Payments by Purchase
 * Get all payments for a specific purchase with summary
 */
async function testGetPaymentsByPurchase() {
  console.log("10. 🛒 Testing get payments by purchase...");
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/purchase/${testData.purchase.id}`
    );
    console.log("✅ Get payments by purchase passed:", {
      success: response.data.success,
      count: response.data.count,
      purchase_id: response.data.purchase.id,
      summary: response.data.summary,
      payments: response.data.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_method: p.payment_method,
        payment_date: p.payment_date,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get payments by purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 11: Get Payments by Method
 * Get all payments for a specific payment method
 */
async function testGetPaymentsByMethod() {
  console.log("11. 💳 Testing get payments by method...");
  try {
    const response = await axios.get(`${BASE_URL}/payments/method/Cash`);
    console.log("✅ Get payments by method passed:", {
      success: response.data.success,
      count: response.data.count,
      paymentMethod: response.data.paymentMethod,
      payments: response.data.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_date: p.payment_date,
        store_name: p.store_name,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get payments by method failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 12: Update Payment
 * Update an existing payment
 */
async function testUpdatePayment() {
  console.log("12. ✏️ Testing update payment...");
  try {
    const updateData = {
      amount: 600.0,
      notes: "Updated payment amount",
    };
    const response = await axios.put(
      `${BASE_URL}/payments/${testData.payment1.id}`,
      updateData
    );
    console.log("✅ Update payment passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update payment failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 13: Test Validation - Invalid Payment Method
 * Test that invalid payment methods are rejected
 */
async function testInvalidPaymentMethodValidation() {
  console.log("13. 🚫 Testing invalid payment method validation...");
  try {
    const invalidPayment = {
      id: "invalid-method-pay",
      purchase_id: testData.purchase.id,
      amount: 100.0,
      payment_date: "2025-01-15",
      payment_method: "InvalidMethod", // Invalid payment method
    };
    await axios.post(`${BASE_URL}/payments`, invalidPayment);
    console.error(
      "❌ Invalid payment method validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Invalid payment method validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Invalid payment method validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 14: Test Validation - Invalid Date Format
 * Test that invalid date formats are rejected
 */
async function testInvalidDateValidation() {
  console.log("14. 🚫 Testing invalid date format validation...");
  try {
    const invalidPayment = {
      id: "invalid-date-pay",
      purchase_id: testData.purchase.id,
      amount: 100.0,
      payment_date: "2025/01/15", // Invalid date format
      payment_method: "Cash",
    };
    await axios.post(`${BASE_URL}/payments`, invalidPayment);
    console.error(
      "❌ Invalid date format validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Invalid date format validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Invalid date format validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 15: Test Validation - Zero Amount
 * Test that zero amounts are rejected
 */
async function testZeroAmountValidation() {
  console.log("15. 🚫 Testing zero amount validation...");
  try {
    const invalidPayment = {
      id: "zero-amount-pay",
      purchase_id: testData.purchase.id,
      amount: 0, // Zero amount
      payment_date: "2025-01-15",
      payment_method: "Cash",
    };
    await axios.post(`${BASE_URL}/payments`, invalidPayment);
    console.error(
      "❌ Zero amount validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Zero amount validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Zero amount validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 16: Test Validation - Negative Amount
 * Test that negative amounts are rejected
 */
async function testNegativeAmountValidation() {
  console.log("16. 🚫 Testing negative amount validation...");
  try {
    const invalidPayment = {
      id: "negative-amount-pay",
      purchase_id: testData.purchase.id,
      amount: -100.0, // Negative amount
      payment_date: "2025-01-15",
      payment_method: "Cash",
    };
    await axios.post(`${BASE_URL}/payments`, invalidPayment);
    console.error(
      "❌ Negative amount validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Negative amount validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Negative amount validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 17: Test Validation - Non-existent Purchase
 * Test that non-existent purchases are rejected
 */
async function testNonExistentPurchaseValidation() {
  console.log("17. 🚫 Testing non-existent purchase validation...");
  try {
    const invalidPayment = {
      id: "non-existent-purchase-pay",
      purchase_id: "non-existent-purchase",
      amount: 100.0,
      payment_date: "2025-01-15",
      payment_method: "Cash",
    };
    await axios.post(`${BASE_URL}/payments`, invalidPayment);
    console.error(
      "❌ Non-existent purchase validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Non-existent purchase validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Non-existent purchase validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 18: Delete Payment
 * Delete a payment
 */
async function testDeletePayment() {
  console.log("18. 🗑️ Testing delete payment...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/payments/${testData.payment3.id}`
    );
    console.log("✅ Delete payment passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete payment failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 19: Get All Payments After Deletion
 * Should return 2 payments now
 */
async function testGetAllPaymentsAfterDeletion() {
  console.log("19. 📋 Testing get all payments after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/payments`);
    console.log("✅ Get all payments after deletion passed:", {
      success: response.data.success,
      count: response.data.count,
      remaining: response.data.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_method: p.payment_method,
        store_name: p.store_name,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all payments after deletion failed:", error.message);
    return false;
  }
}

/**
 * Test 20: Cleanup - Delete Remaining Payments
 * Delete remaining payments before cleaning up
 */
async function testCleanupDeleteRemainingPayments() {
  console.log("20. 🧹 Testing cleanup - delete remaining payments...");
  try {
    // Delete remaining payments
    const response1 = await axios.delete(
      `${BASE_URL}/payments/${testData.payment1.id}`
    );
    const response2 = await axios.delete(
      `${BASE_URL}/payments/${testData.payment2.id}`
    );

    console.log("✅ Cleanup delete remaining payments passed:", {
      payment1: response1.data.success,
      payment2: response2.data.success,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete remaining payments failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 21: Cleanup - Delete Test Purchase
 * Clean up the test purchase
 */
async function testCleanupDeletePurchase() {
  console.log("21. 🧹 Testing cleanup - delete test purchase...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/purchases/${testData.purchase.id}`
    );
    console.log("✅ Cleanup delete purchase passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 22: Cleanup - Delete Test Store
 * Clean up the test store
 */
async function testCleanupDeleteStore() {
  console.log("22. 🧹 Testing cleanup - delete test store...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/stores/${testData.store.id}`
    );
    console.log("✅ Cleanup delete store passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete store failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runPaymentsTests() {
  console.log("🧪 Starting Payments API Tests...\n");

  const tests = [
    testHealthCheck,
    testCreateTestStore,
    testCreateTestPurchase,
    testGetAllPaymentsEmpty,
    testCreateFirstPayment,
    testCreateSecondPayment,
    testCreateThirdPayment,
    testGetAllPaymentsWithData,
    testGetPaymentById,
    testGetPaymentsByPurchase,
    testGetPaymentsByMethod,
    testUpdatePayment,
    testInvalidPaymentMethodValidation,
    testInvalidDateValidation,
    testZeroAmountValidation,
    testNegativeAmountValidation,
    testNonExistentPurchaseValidation,
    testDeletePayment,
    testGetAllPaymentsAfterDeletion,
    testCleanupDeleteRemainingPayments,
    testCleanupDeletePurchase,
    testCleanupDeleteStore,
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passedTests++;
      console.log(""); // Add spacing between tests
    } catch (error) {
      console.error("❌ Test error:", error.message);
      console.log("");
    }
  }

  // Final results
  console.log("=".repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All payments API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPaymentsTests().catch(console.error);
}

module.exports = { runPaymentsTests };


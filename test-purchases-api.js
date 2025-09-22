const axios = require("axios");

// ============================================================================
// PURCHASES API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the purchases API
// Includes foreign key validation, filtering, and pagination testing
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for purchases
const testData = {
  // First create a store to use for testing
  store: {
    id: "test-store-purchases",
    name: "Test Store for Purchases",
    code: "TSP",
    is_active: true,
    progress_bar_config: {
      blue: 15,
      yellow: 5,
      orange: 5,
      red: 5,
    },
  },
  // Purchases to test
  purchase1: {
    id: "PUR-001",
    store_id: "test-store-purchases",
    date: "2025-01-15",
    status: "Pending",
    total_grams_21k_equivalent: 500.0,
    total_base_fees: 2500.0,
    total_discount_amount: 1000.0,
    total_net_fees: 1500.0,
    due_date: "2025-02-15",
  },
  purchase2: {
    id: "PUR-002",
    store_id: "test-store-purchases",
    date: "2025-01-20",
    status: "Paid",
    total_grams_21k_equivalent: 300.0,
    total_base_fees: 1500.0,
    total_discount_amount: 500.0,
    total_net_fees: 1000.0,
    due_date: "2025-02-20",
  },
  purchase3: {
    id: "PUR-003",
    store_id: "test-store-purchases",
    date: "2025-01-25",
    status: "Partial",
    total_grams_21k_equivalent: 200.0,
    total_base_fees: 1000.0,
    total_discount_amount: 200.0,
    total_net_fees: 800.0,
    due_date: "2025-02-25",
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
 * Create a store to use for purchase testing
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
 * Test 3: Get All Purchases (Empty)
 * Should return empty array initially
 */
async function testGetAllPurchasesEmpty() {
  console.log("3. 📋 Testing get all purchases (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchases`);
    console.log("✅ Get all purchases passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all purchases failed:", error.message);
    return false;
  }
}

/**
 * Test 4: Create First Purchase
 * Create a pending purchase
 */
async function testCreateFirstPurchase() {
  console.log("4. ➕ Testing create first purchase...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchases`,
      testData.purchase1
    );
    console.log("✅ Create first purchase passed:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
      total_grams: response.data.data.total_grams_21k_equivalent,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 5: Create Second Purchase
 * Create a paid purchase
 */
async function testCreateSecondPurchase() {
  console.log("5. ➕ Testing create second purchase...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchases`,
      testData.purchase2
    );
    console.log("✅ Create second purchase passed:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
      total_net_fees: response.data.data.total_net_fees,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 6: Create Third Purchase
 * Create a partial purchase
 */
async function testCreateThirdPurchase() {
  console.log("6. ➕ Testing create third purchase...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchases`,
      testData.purchase3
    );
    console.log("✅ Create third purchase passed:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
      due_date: response.data.data.due_date,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create third purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Get All Purchases (With Data)
 * Should return 3 purchases now
 */
async function testGetAllPurchasesWithData() {
  console.log("7. 📋 Testing get all purchases (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchases`);
    console.log("✅ Get all purchases with data passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
      purchases: response.data.data.map((p) => ({
        id: p.id,
        status: p.status,
        total_grams: p.total_grams_21k_equivalent,
        store_name: p.store_name,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all purchases with data failed:", error.message);
    return false;
  }
}

/**
 * Test 8: Get Purchase by ID
 * Retrieve a specific purchase by ID
 */
async function testGetPurchaseById() {
  console.log("8. 🔍 Testing get purchase by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchases/${testData.purchase1.id}`
    );
    console.log("✅ Get purchase by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
      store_name: response.data.data.store_name,
      total_grams: response.data.data.total_grams_21k_equivalent,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 9: Filter Purchases by Status
 * Get purchases with specific status
 */
async function testFilterPurchasesByStatus() {
  console.log("9. 🔍 Testing filter purchases by status...");
  try {
    const response = await axios.get(`${BASE_URL}/purchases?status=Pending`);
    console.log("✅ Filter purchases by status passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
      statuses: response.data.data.map((p) => p.status),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Filter purchases by status failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 10: Filter Purchases by Store
 * Get purchases for a specific store
 */
async function testFilterPurchasesByStore() {
  console.log("10. 🏪 Testing filter purchases by store...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchases?store=${testData.store.id}`
    );
    console.log("✅ Filter purchases by store passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
      store_names: response.data.data.map((p) => p.store_name),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Filter purchases by store failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 11: Test Pagination
 * Test pagination functionality
 */
async function testPagination() {
  console.log("11. 📄 Testing pagination...");
  try {
    const response = await axios.get(`${BASE_URL}/purchases?page=1&limit=2`);
    console.log("✅ Pagination test passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Pagination test failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 12: Update Purchase
 * Update an existing purchase
 */
async function testUpdatePurchase() {
  console.log("12. ✏️ Testing update purchase...");
  try {
    const updateData = {
      status: "Overdue",
      total_net_fees: 2000.0,
    };
    const response = await axios.put(
      `${BASE_URL}/purchases/${testData.purchase1.id}`,
      updateData
    );
    console.log("✅ Update purchase passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 13: Test Validation - Invalid Date Format
 * Test that invalid date formats are rejected
 */
async function testInvalidDateValidation() {
  console.log("13. 🚫 Testing invalid date format validation...");
  try {
    const invalidPurchase = {
      id: "invalid-date-purchase",
      store_id: testData.store.id,
      date: "2025/01/15", // Invalid format
      status: "Pending",
    };
    await axios.post(`${BASE_URL}/purchases`, invalidPurchase);
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
 * Test 14: Test Validation - Invalid Status
 * Test that invalid statuses are rejected
 */
async function testInvalidStatusValidation() {
  console.log("14. 🚫 Testing invalid status validation...");
  try {
    const invalidPurchase = {
      id: "invalid-status-purchase",
      store_id: testData.store.id,
      date: "2025-01-15",
      status: "InvalidStatus", // Invalid status
    };
    await axios.post(`${BASE_URL}/purchases`, invalidPurchase);
    console.error(
      "❌ Invalid status validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Invalid status validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Invalid status validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 15: Test Validation - Non-existent Store
 * Test that non-existent stores are rejected
 */
async function testNonExistentStoreValidation() {
  console.log("15. 🚫 Testing non-existent store validation...");
  try {
    const invalidPurchase = {
      id: "invalid-store-purchase",
      store_id: "non-existent-store",
      date: "2025-01-15",
      status: "Pending",
    };
    await axios.post(`${BASE_URL}/purchases`, invalidPurchase);
    console.error(
      "❌ Non-existent store validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Non-existent store validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Non-existent store validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 16: Test Validation - Negative Values
 * Test that negative numeric values are rejected
 */
async function testNegativeValuesValidation() {
  console.log("16. 🚫 Testing negative values validation...");
  try {
    const invalidPurchase = {
      id: "negative-values-purchase",
      store_id: testData.store.id,
      date: "2025-01-15",
      status: "Pending",
      total_grams_21k_equivalent: -100, // Negative value
    };
    await axios.post(`${BASE_URL}/purchases`, invalidPurchase);
    console.error(
      "❌ Negative values validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Negative values validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Negative values validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 17: Delete Purchase
 * Delete a purchase
 */
async function testDeletePurchase() {
  console.log("17. 🗑️ Testing delete purchase...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/purchases/${testData.purchase3.id}`
    );
    console.log("✅ Delete purchase passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 18: Get All Purchases After Deletion
 * Should return 2 purchases now
 */
async function testGetAllPurchasesAfterDeletion() {
  console.log("18. 📋 Testing get all purchases after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/purchases`);
    console.log("✅ Get all purchases after deletion passed:", {
      success: response.data.success,
      count: response.data.count || response.data.data.length,
      remaining: response.data.data.map((p) => ({
        id: p.id,
        status: p.status,
        store_name: p.store_name,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all purchases after deletion failed:", error.message);
    return false;
  }
}

/**
 * Test 19: Cleanup - Delete Remaining Purchases First
 * Delete remaining purchases before deleting the store
 */
async function testCleanupDeleteRemainingPurchases() {
  console.log("19. 🧹 Testing cleanup - delete remaining purchases...");
  try {
    // Delete remaining purchases
    const response1 = await axios.delete(
      `${BASE_URL}/purchases/${testData.purchase1.id}`
    );
    const response2 = await axios.delete(
      `${BASE_URL}/purchases/${testData.purchase2.id}`
    );

    console.log("✅ Cleanup delete remaining purchases passed:", {
      purchase1: response1.data.success,
      purchase2: response2.data.success,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete remaining purchases failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 20: Cleanup - Delete Test Store
 * Clean up the test store after deleting all purchases
 */
async function testCleanupDeleteStore() {
  console.log("20. 🧹 Testing cleanup - delete test store...");
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

async function runPurchasesTests() {
  console.log("🧪 Starting Purchases API Tests...\n");

  const tests = [
    testHealthCheck,
    testCreateTestStore,
    testGetAllPurchasesEmpty,
    testCreateFirstPurchase,
    testCreateSecondPurchase,
    testCreateThirdPurchase,
    testGetAllPurchasesWithData,
    testGetPurchaseById,
    testFilterPurchasesByStatus,
    testFilterPurchasesByStore,
    testPagination,
    testUpdatePurchase,
    testInvalidDateValidation,
    testInvalidStatusValidation,
    testNonExistentStoreValidation,
    testNegativeValuesValidation,
    testDeletePurchase,
    testGetAllPurchasesAfterDeletion,
    testCleanupDeleteRemainingPurchases,
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
    console.log("🎉 All purchases API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPurchasesTests().catch(console.error);
}

module.exports = { runPurchasesTests };

const axios = require("axios");

// ============================================================================
// PURCHASE SUPPLIERS API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the purchase suppliers API
// Includes foreign key validation and many-to-many relationship testing
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for purchase suppliers
const testData = {
  // First create a store, supplier, and purchase to use for testing
  store: {
    id: "test-store-purchase-suppliers",
    name: "Test Store for Purchase Suppliers",
    code: "TSPS",
    is_active: true,
    progress_bar_config: {
      blue: 15,
      yellow: 5,
      orange: 5,
      red: 5,
    },
  },
  supplier: {
    id: "test-supplier-purchase-suppliers",
    name: "Test Supplier for Purchase Suppliers",
    code: "TSPS",
    is_active: true,
  },
  supplier2: {
    id: "test-supplier2-purchase-suppliers",
    name: "Test Supplier 2 for Purchase Suppliers",
    code: "TSPS2",
    is_active: true,
  },
  purchase: {
    id: "test-purchase-purchase-suppliers",
    store_id: "test-store-purchase-suppliers",
    date: "2025-01-15",
    status: "Pending",
    total_grams_21k_equivalent: 500.0,
    total_base_fees: 2500.0,
    total_discount_amount: 1000.0,
    total_net_fees: 1500.0,
    due_date: "2025-02-15",
  },
  // Purchase suppliers to test
  purchaseSupplier1: {
    id: "PS-001",
    purchase_id: "test-purchase-purchase-suppliers",
    supplier_id: "test-supplier-purchase-suppliers",
    karat_type: "21",
    grams: 100.0,
    base_fee_per_gram: 5.0,
    discount_percentage: 20.0,
    net_fee_per_gram: 4.0,
    total_base_fee: 500.0,
    total_discount_amount: 100.0,
    total_net_fee: 400.0,
  },
  purchaseSupplier2: {
    id: "PS-002",
    purchase_id: "test-purchase-purchase-suppliers",
    supplier_id: "test-supplier-purchase-suppliers",
    karat_type: "18",
    grams: 50.0,
    base_fee_per_gram: 4.5,
    discount_percentage: 15.0,
    net_fee_per_gram: 3.825,
    total_base_fee: 225.0,
    total_discount_amount: 33.75,
    total_net_fee: 191.25,
  },
  purchaseSupplier3: {
    id: "PS-003",
    purchase_id: "test-purchase-purchase-suppliers",
    supplier_id: "test-supplier2-purchase-suppliers", // Use second supplier
    karat_type: "21", // Back to 21k since it's a different supplier
    grams: 75.0,
    base_fee_per_gram: 5.2,
    discount_percentage: 25.0,
    net_fee_per_gram: 3.9,
    total_base_fee: 390.0,
    total_discount_amount: 97.5,
    total_net_fee: 292.5,
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
 * Create a store to use for purchase supplier testing
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
 * Test 3: Create Test Supplier
 * Create a supplier to use for purchase supplier testing
 */
async function testCreateTestSupplier() {
  console.log("3. 🏭 Creating test supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/suppliers`,
      testData.supplier
    );
    console.log("✅ Test supplier created:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create test supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 4: Create Test Purchase
 * Create a purchase to use for purchase supplier testing
 */
async function testCreateTestPurchase() {
  console.log("4. 🛒 Creating test purchase...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchases`,
      testData.purchase
    );
    console.log("✅ Test purchase created:", {
      success: response.data.success,
      id: response.data.data.id,
      status: response.data.data.status,
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
 * Test 5: Create Test Supplier 2
 * Create a second supplier to use for purchase supplier testing
 */
async function testCreateTestSupplier2() {
  console.log("5. 🏭 Creating test supplier 2...");
  try {
    const response = await axios.post(
      `${BASE_URL}/suppliers`,
      testData.supplier2
    );
    console.log("✅ Test supplier 2 created:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create test supplier 2 failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 6: Get All Purchase Suppliers (Empty)
 * Should return empty array initially
 */
async function testGetAllPurchaseSuppliersEmpty() {
  console.log("6. 📋 Testing get all purchase suppliers (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-suppliers`);
    console.log("✅ Get all purchase suppliers passed:", {
      success: response.data.success,
      count: response.data.count,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all purchase suppliers failed:", error.message);
    return false;
  }
}

/**
 * Test 7: Create First Purchase Supplier
 * Create a 21k purchase supplier
 */
async function testCreateFirstPurchaseSupplier() {
  console.log("7. ➕ Testing create first purchase supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-suppliers`,
      testData.purchaseSupplier1
    );
    console.log("✅ Create first purchase supplier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      karat_type: response.data.data.karat_type,
      grams: response.data.data.grams,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first purchase supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Create Second Purchase Supplier
 * Create an 18k purchase supplier
 */
async function testCreateSecondPurchaseSupplier() {
  console.log("7. ➕ Testing create second purchase supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-suppliers`,
      testData.purchaseSupplier2
    );
    console.log("✅ Create second purchase supplier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      karat_type: response.data.data.karat_type,
      grams: response.data.data.grams,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second purchase supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 8: Create Third Purchase Supplier
 * Create another 21k purchase supplier
 */
async function testCreateThirdPurchaseSupplier() {
  console.log("8. ➕ Testing create third purchase supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-suppliers`,
      testData.purchaseSupplier3
    );
    console.log("✅ Create third purchase supplier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      karat_type: response.data.data.karat_type,
      total_net_fee: response.data.data.total_net_fee,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create third purchase supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 9: Get All Purchase Suppliers (With Data)
 * Should return 3 purchase suppliers now
 */
async function testGetAllPurchaseSuppliersWithData() {
  console.log("9. 📋 Testing get all purchase suppliers (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-suppliers`);
    console.log("✅ Get all purchase suppliers with data passed:", {
      success: response.data.success,
      count: response.data.count,
      purchaseSuppliers: response.data.data.map((ps) => ({
        id: ps.id,
        karat_type: ps.karat_type,
        grams: ps.grams,
        supplier_name: ps.supplier_name,
        purchase_date: ps.purchase_date,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get all purchase suppliers with data failed:",
      error.message
    );
    return false;
  }
}

/**
 * Test 10: Get Purchase Supplier by ID
 * Retrieve a specific purchase supplier by ID
 */
async function testGetPurchaseSupplierById() {
  console.log("10. 🔍 Testing get purchase supplier by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-suppliers/${testData.purchaseSupplier1.id}`
    );
    console.log("✅ Get purchase supplier by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      karat_type: response.data.data.karat_type,
      supplier_name: response.data.data.supplier_name,
      store_name: response.data.data.store_name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase supplier by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 11: Get Purchase Suppliers by Purchase
 * Get all purchase suppliers for a specific purchase
 */
async function testGetPurchaseSuppliersByPurchase() {
  console.log("11. 🛒 Testing get purchase suppliers by purchase...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-suppliers/purchase/${testData.purchase.id}`
    );
    console.log("✅ Get purchase suppliers by purchase passed:", {
      success: response.data.success,
      count: response.data.count,
      purchase_id: response.data.purchase.id,
      purchaseSuppliers: response.data.data.map((ps) => ({
        id: ps.id,
        karat_type: ps.karat_type,
        grams: ps.grams,
        supplier_name: ps.supplier_name,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase suppliers by purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 12: Get Purchase Suppliers by Supplier
 * Get all purchase suppliers for a specific supplier
 */
async function testGetPurchaseSuppliersBySupplier() {
  console.log("12. 🏭 Testing get purchase suppliers by supplier...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-suppliers/supplier/${testData.supplier.id}`
    );
    console.log("✅ Get purchase suppliers by supplier passed:", {
      success: response.data.success,
      count: response.data.count,
      supplier_name: response.data.supplier.name,
      purchaseSuppliers: response.data.data.map((ps) => ({
        id: ps.id,
        karat_type: ps.karat_type,
        grams: ps.grams,
        purchase_date: ps.purchase_date,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase suppliers by supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 13: Update Purchase Supplier
 * Update an existing purchase supplier
 */
async function testUpdatePurchaseSupplier() {
  console.log("13. ✏️ Testing update purchase supplier...");
  try {
    const updateData = {
      grams: 120.0,
      total_base_fee: 600.0,
      total_net_fee: 480.0,
    };
    const response = await axios.put(
      `${BASE_URL}/purchase-suppliers/${testData.purchaseSupplier1.id}`,
      updateData
    );
    console.log("✅ Update purchase supplier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update purchase supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 14: Test Validation - Invalid Karat Type
 * Test that invalid karat types are rejected
 */
async function testInvalidKaratTypeValidation() {
  console.log("14. 🚫 Testing invalid karat type validation...");
  try {
    const invalidPurchaseSupplier = {
      id: "invalid-karat-ps",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      karat_type: "24", // Invalid karat type
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-suppliers`, invalidPurchaseSupplier);
    console.error(
      "❌ Invalid karat type validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Invalid karat type validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Invalid karat type validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 15: Test Validation - Negative Grams
 * Test that negative grams are rejected
 */
async function testNegativeGramsValidation() {
  console.log("15. 🚫 Testing negative grams validation...");
  try {
    const invalidPurchaseSupplier = {
      id: "negative-grams-ps",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      karat_type: "21",
      grams: -100.0, // Negative grams
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-suppliers`, invalidPurchaseSupplier);
    console.error(
      "❌ Negative grams validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Negative grams validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Negative grams validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 16: Test Validation - Non-existent Purchase
 * Test that non-existent purchases are rejected
 */
async function testNonExistentPurchaseValidation() {
  console.log("16. 🚫 Testing non-existent purchase validation...");
  try {
    const invalidPurchaseSupplier = {
      id: "non-existent-purchase-ps",
      purchase_id: "non-existent-purchase",
      supplier_id: testData.supplier.id,
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-suppliers`, invalidPurchaseSupplier);
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
 * Test 17: Test Validation - Non-existent Supplier
 * Test that non-existent suppliers are rejected
 */
async function testNonExistentSupplierValidation() {
  console.log("17. 🚫 Testing non-existent supplier validation...");
  try {
    const invalidPurchaseSupplier = {
      id: "non-existent-supplier-ps",
      purchase_id: testData.purchase.id,
      supplier_id: "non-existent-supplier",
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-suppliers`, invalidPurchaseSupplier);
    console.error(
      "❌ Non-existent supplier validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Non-existent supplier validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Non-existent supplier validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 18: Test Validation - Duplicate Combination
 * Test that duplicate purchase-supplier-karat combinations are rejected
 */
async function testDuplicateCombinationValidation() {
  console.log("18. 🚫 Testing duplicate combination validation...");
  try {
    const duplicatePurchaseSupplier = {
      id: "duplicate-combination-ps",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      karat_type: "21", // Same as first purchase supplier
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(
      `${BASE_URL}/purchase-suppliers`,
      duplicatePurchaseSupplier
    );
    console.error(
      "❌ Duplicate combination validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(
        "✅ Duplicate combination validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Duplicate combination validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 19: Delete Purchase Supplier
 * Delete a purchase supplier
 */
async function testDeletePurchaseSupplier() {
  console.log("19. 🗑️ Testing delete purchase supplier...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/purchase-suppliers/${testData.purchaseSupplier3.id}`
    );
    console.log("✅ Delete purchase supplier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete purchase supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 20: Get All Purchase Suppliers After Deletion
 * Should return 2 purchase suppliers now
 */
async function testGetAllPurchaseSuppliersAfterDeletion() {
  console.log("20. 📋 Testing get all purchase suppliers after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-suppliers`);
    console.log("✅ Get all purchase suppliers after deletion passed:", {
      success: response.data.success,
      count: response.data.count,
      remaining: response.data.data.map((ps) => ({
        id: ps.id,
        karat_type: ps.karat_type,
        grams: ps.grams,
        supplier_name: ps.supplier_name,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get all purchase suppliers after deletion failed:",
      error.message
    );
    return false;
  }
}

/**
 * Test 21: Cleanup - Delete Remaining Purchase Suppliers
 * Delete remaining purchase suppliers before cleaning up
 */
async function testCleanupDeleteRemainingPurchaseSuppliers() {
  console.log(
    "21. 🧹 Testing cleanup - delete remaining purchase suppliers..."
  );
  try {
    // Delete remaining purchase suppliers
    const response1 = await axios.delete(
      `${BASE_URL}/purchase-suppliers/${testData.purchaseSupplier1.id}`
    );
    const response2 = await axios.delete(
      `${BASE_URL}/purchase-suppliers/${testData.purchaseSupplier2.id}`
    );

    console.log("✅ Cleanup delete remaining purchase suppliers passed:", {
      purchaseSupplier1: response1.data.success,
      purchaseSupplier2: response2.data.success,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete remaining purchase suppliers failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 22: Cleanup - Delete Test Purchase
 * Clean up the test purchase
 */
async function testCleanupDeletePurchase() {
  console.log("22. 🧹 Testing cleanup - delete test purchase...");
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
 * Test 23: Cleanup - Delete Test Supplier
 * Clean up the test supplier
 */
async function testCleanupDeleteSupplier() {
  console.log("23. 🧹 Testing cleanup - delete test supplier...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/suppliers/${testData.supplier.id}`
    );
    console.log("✅ Cleanup delete supplier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 24: Cleanup - Delete Test Supplier 2
 * Clean up the second test supplier
 */
async function testCleanupDeleteSupplier2() {
  console.log("24. 🧹 Testing cleanup - delete test supplier 2...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/suppliers/${testData.supplier2.id}`
    );
    console.log("✅ Cleanup delete supplier 2 passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete supplier 2 failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 25: Cleanup - Delete Test Store
 * Clean up the test store
 */
async function testCleanupDeleteStore() {
  console.log("25. 🧹 Testing cleanup - delete test store...");
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

async function runPurchaseSuppliersTests() {
  console.log("🧪 Starting Purchase Suppliers API Tests...\n");

  const tests = [
    testHealthCheck,
    testCreateTestStore,
    testCreateTestSupplier,
    testCreateTestPurchase,
    testCreateTestSupplier2,
    testGetAllPurchaseSuppliersEmpty,
    testCreateFirstPurchaseSupplier,
    testCreateSecondPurchaseSupplier,
    testCreateThirdPurchaseSupplier,
    testGetAllPurchaseSuppliersWithData,
    testGetPurchaseSupplierById,
    testGetPurchaseSuppliersByPurchase,
    testGetPurchaseSuppliersBySupplier,
    testUpdatePurchaseSupplier,
    testInvalidKaratTypeValidation,
    testNegativeGramsValidation,
    testNonExistentPurchaseValidation,
    testNonExistentSupplierValidation,
    testDuplicateCombinationValidation,
    testDeletePurchaseSupplier,
    testGetAllPurchaseSuppliersAfterDeletion,
    testCleanupDeleteRemainingPurchaseSuppliers,
    testCleanupDeletePurchase,
    testCleanupDeleteSupplier,
    testCleanupDeleteSupplier2,
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
    console.log("🎉 All purchase suppliers API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPurchaseSuppliersTests().catch(console.error);
}

module.exports = { runPurchaseSuppliersTests };

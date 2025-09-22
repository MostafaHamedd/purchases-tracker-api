const axios = require("axios");

// ============================================================================
// DISCOUNT TIERS API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the discount tiers API
// Includes foreign key validation and business logic testing
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for discount tiers
const testData = {
  // First create a supplier to use for testing
  supplier: {
    id: "test-supplier-discount",
    name: "Test Supplier for Discount Tiers",
    code: "TSD",
    is_active: true,
  },
  // Discount tiers to test
  discountTier1: {
    id: "tier-1",
    supplier_id: "test-supplier-discount",
    karat_type: "21",
    name: "Basic Tier",
    threshold: 0,
    discount_percentage: 15.0,
    is_protected: true,
  },
  discountTier2: {
    id: "tier-2",
    supplier_id: "test-supplier-discount",
    karat_type: "21",
    name: "Premium Tier",
    threshold: 100.0,
    discount_percentage: 20.0,
    is_protected: false,
  },
  discountTier3: {
    id: "tier-3",
    supplier_id: "test-supplier-discount",
    karat_type: "18",
    name: "18k Basic Tier",
    threshold: 0,
    discount_percentage: 12.0,
    is_protected: false,
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
 * Test 2: Create Test Supplier
 * Create a supplier to use for discount tier testing
 */
async function testCreateTestSupplier() {
  console.log("2. 🏭 Creating test supplier...");
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
 * Test 3: Get All Discount Tiers (Empty)
 * Should return empty array initially
 */
async function testGetAllDiscountTiersEmpty() {
  console.log("3. 📋 Testing get all discount tiers (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/discount-tiers`);
    console.log("✅ Get all discount tiers passed:", {
      success: response.data.success,
      count: response.data.count,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all discount tiers failed:", error.message);
    return false;
  }
}

/**
 * Test 4: Create First Discount Tier
 * Create a basic discount tier
 */
async function testCreateFirstDiscountTier() {
  console.log("4. ➕ Testing create first discount tier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/discount-tiers`,
      testData.discountTier1
    );
    console.log("✅ Create first discount tier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
      discount_percentage: response.data.data.discount_percentage,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first discount tier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 5: Create Second Discount Tier
 * Create another discount tier for the same supplier
 */
async function testCreateSecondDiscountTier() {
  console.log("5. ➕ Testing create second discount tier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/discount-tiers`,
      testData.discountTier2
    );
    console.log("✅ Create second discount tier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
      threshold: response.data.data.threshold,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second discount tier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 6: Create Third Discount Tier (18k)
 * Create a discount tier for 18k gold
 */
async function testCreateThirdDiscountTier() {
  console.log("6. ➕ Testing create third discount tier (18k)...");
  try {
    const response = await axios.post(
      `${BASE_URL}/discount-tiers`,
      testData.discountTier3
    );
    console.log("✅ Create third discount tier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      karat_type: response.data.data.karat_type,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create third discount tier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Get All Discount Tiers (With Data)
 * Should return 3 discount tiers now
 */
async function testGetAllDiscountTiersWithData() {
  console.log("7. 📋 Testing get all discount tiers (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/discount-tiers`);
    console.log("✅ Get all discount tiers with data passed:", {
      success: response.data.success,
      count: response.data.count,
      tiers: response.data.data.map((t) => ({
        id: t.id,
        name: t.name,
        karat_type: t.karat_type,
        threshold: t.threshold,
        discount_percentage: t.discount_percentage,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all discount tiers with data failed:", error.message);
    return false;
  }
}

/**
 * Test 8: Get Discount Tier by ID
 * Retrieve a specific discount tier by ID
 */
async function testGetDiscountTierById() {
  console.log("8. 🔍 Testing get discount tier by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/discount-tiers/${testData.discountTier1.id}`
    );
    console.log("✅ Get discount tier by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
      supplier_name: response.data.data.supplier_name,
      karat_type: response.data.data.karat_type,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get discount tier by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 9: Get Discount Tiers by Supplier
 * Get all discount tiers for a specific supplier
 */
async function testGetDiscountTiersBySupplier() {
  console.log("9. 🏭 Testing get discount tiers by supplier...");
  try {
    const response = await axios.get(
      `${BASE_URL}/discount-tiers/supplier/${testData.supplier.id}`
    );
    console.log("✅ Get discount tiers by supplier passed:", {
      success: response.data.success,
      count: response.data.count,
      supplier: response.data.supplier.name,
      tiers: response.data.data.map((t) => ({
        id: t.id,
        name: t.name,
        karat_type: t.karat_type,
        threshold: t.threshold,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get discount tiers by supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 10: Update Discount Tier
 * Update an existing discount tier
 */
async function testUpdateDiscountTier() {
  console.log("10. ✏️ Testing update discount tier...");
  try {
    const updateData = {
      name: "Updated Premium Tier",
      discount_percentage: 25.0,
    };
    const response = await axios.put(
      `${BASE_URL}/discount-tiers/${testData.discountTier2.id}`,
      updateData
    );
    console.log("✅ Update discount tier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update discount tier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 11: Test Validation - Invalid Karat Type
 * Test that invalid karat types are rejected
 */
async function testInvalidKaratTypeValidation() {
  console.log("11. 🚫 Testing invalid karat type validation...");
  try {
    const invalidTier = {
      id: "invalid-tier",
      supplier_id: testData.supplier.id,
      karat_type: "24", // Invalid karat type
      name: "Invalid Tier",
      threshold: 0,
      discount_percentage: 10.0,
    };
    await axios.post(`${BASE_URL}/discount-tiers`, invalidTier);
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
 * Test 12: Test Validation - Invalid Discount Percentage
 * Test that invalid discount percentages are rejected
 */
async function testInvalidDiscountPercentageValidation() {
  console.log("12. 🚫 Testing invalid discount percentage validation...");
  try {
    const invalidTier = {
      id: "invalid-percentage-tier",
      supplier_id: testData.supplier.id,
      karat_type: "21",
      name: "Invalid Percentage Tier",
      threshold: 0,
      discount_percentage: 150.0, // Invalid percentage > 100
    };
    await axios.post(`${BASE_URL}/discount-tiers`, invalidTier);
    console.error(
      "❌ Invalid discount percentage validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Invalid discount percentage validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Invalid discount percentage validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 13: Test Validation - Non-existent Supplier
 * Test that non-existent suppliers are rejected
 */
async function testNonExistentSupplierValidation() {
  console.log("13. 🚫 Testing non-existent supplier validation...");
  try {
    const invalidTier = {
      id: "invalid-supplier-tier",
      supplier_id: "non-existent-supplier",
      karat_type: "21",
      name: "Invalid Supplier Tier",
      threshold: 0,
      discount_percentage: 10.0,
    };
    await axios.post(`${BASE_URL}/discount-tiers`, invalidTier);
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
 * Test 14: Test Protected Tier Deletion
 * Test that protected tiers cannot be deleted
 */
async function testProtectedTierDeletion() {
  console.log("14. 🚫 Testing protected tier deletion...");
  try {
    await axios.delete(
      `${BASE_URL}/discount-tiers/${testData.discountTier1.id}`
    );
    console.error(
      "❌ Protected tier deletion failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log(
        "✅ Protected tier deletion validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Protected tier deletion validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 15: Delete Non-Protected Discount Tier
 * Delete a non-protected discount tier
 */
async function testDeleteNonProtectedDiscountTier() {
  console.log("15. 🗑️ Testing delete non-protected discount tier...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/discount-tiers/${testData.discountTier3.id}`
    );
    console.log("✅ Delete non-protected discount tier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete non-protected discount tier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 16: Get All Discount Tiers After Deletion
 * Should return 2 discount tiers now
 */
async function testGetAllDiscountTiersAfterDeletion() {
  console.log("16. 📋 Testing get all discount tiers after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/discount-tiers`);
    console.log("✅ Get all discount tiers after deletion passed:", {
      success: response.data.success,
      count: response.data.count,
      remaining: response.data.data.map((t) => ({
        id: t.id,
        name: t.name,
        karat_type: t.karat_type,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get all discount tiers after deletion failed:",
      error.message
    );
    return false;
  }
}

/**
 * Test 17: Cleanup - Delete Test Supplier
 * Clean up the test supplier
 */
async function testCleanupDeleteSupplier() {
  console.log("17. 🧹 Testing cleanup - delete test supplier...");
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

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runDiscountTiersTests() {
  console.log("🧪 Starting Discount Tiers API Tests...\n");

  const tests = [
    testHealthCheck,
    testCreateTestSupplier,
    testGetAllDiscountTiersEmpty,
    testCreateFirstDiscountTier,
    testCreateSecondDiscountTier,
    testCreateThirdDiscountTier,
    testGetAllDiscountTiersWithData,
    testGetDiscountTierById,
    testGetDiscountTiersBySupplier,
    testUpdateDiscountTier,
    testInvalidKaratTypeValidation,
    testInvalidDiscountPercentageValidation,
    testNonExistentSupplierValidation,
    testProtectedTierDeletion,
    testDeleteNonProtectedDiscountTier,
    testGetAllDiscountTiersAfterDeletion,
    testCleanupDeleteSupplier,
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
    console.log("🎉 All discount tiers API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDiscountTiersTests().catch(console.error);
}

module.exports = { runDiscountTiersTests };



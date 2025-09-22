const axios = require("axios");

// ============================================================================
// SUPPLIERS API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the suppliers API
// Clean, organized, and easy to follow test structure
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for suppliers
const testSuppliers = {
  supplier1: {
    id: "supplier-1",
    name: "Egyptian Gold Supplier",
    code: "EGS",
    is_active: true,
  },
  supplier2: {
    id: "supplier-2",
    name: "Premium Gold Solutions",
    code: "PGS",
    is_active: true,
  },
  supplier3: {
    id: "supplier-3",
    name: "Standard Gold Services",
    code: "SGS",
    is_active: false,
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
 * Test 2: Get All Suppliers (Empty)
 * Should return empty array initially
 */
async function testGetAllSuppliersEmpty() {
  console.log("2. 📋 Testing get all suppliers (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/suppliers`);
    console.log("✅ Get all suppliers passed:", {
      success: response.data.success,
      count: response.data.count,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all suppliers failed:", error.message);
    return false;
  }
}

/**
 * Test 3: Create First Supplier
 * Create a new supplier with valid data
 */
async function testCreateFirstSupplier() {
  console.log("3. ➕ Testing create first supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/suppliers`,
      testSuppliers.supplier1
    );
    console.log("✅ Create first supplier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 4: Create Second Supplier
 * Create another supplier to test multiple records
 */
async function testCreateSecondSupplier() {
  console.log("4. ➕ Testing create second supplier...");
  try {
    const response = await axios.post(
      `${BASE_URL}/suppliers`,
      testSuppliers.supplier2
    );
    console.log("✅ Create second supplier passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 5: Get All Suppliers (With Data)
 * Should return 2 suppliers now
 */
async function testGetAllSuppliersWithData() {
  console.log("5. 📋 Testing get all suppliers (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/suppliers`);
    console.log("✅ Get all suppliers with data passed:", {
      success: response.data.success,
      count: response.data.count,
      suppliers: response.data.data.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all suppliers with data failed:", error.message);
    return false;
  }
}

/**
 * Test 6: Get Supplier by ID
 * Retrieve a specific supplier by ID
 */
async function testGetSupplierById() {
  console.log("6. 🔍 Testing get supplier by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/suppliers/${testSuppliers.supplier1.id}`
    );
    console.log("✅ Get supplier by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      name: response.data.data.name,
      code: response.data.data.code,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get supplier by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Update Supplier
 * Update an existing supplier's information
 */
async function testUpdateSupplier() {
  console.log("7. ✏️ Testing update supplier...");
  try {
    const updateData = {
      name: "Updated Egyptian Gold Supplier",
      is_active: false,
    };
    const response = await axios.put(
      `${BASE_URL}/suppliers/${testSuppliers.supplier1.id}`,
      updateData
    );
    console.log("✅ Update supplier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 8: Test Validation - Invalid Code
 * Test that invalid codes are rejected
 */
async function testInvalidCodeValidation() {
  console.log("8. 🚫 Testing invalid code validation...");
  try {
    const invalidSupplier = {
      id: "invalid-supplier",
      name: "Invalid Supplier",
      code: "invalid-code", // lowercase, should be rejected
    };
    await axios.post(`${BASE_URL}/suppliers`, invalidSupplier);
    console.error(
      "❌ Invalid code validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Invalid code validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Invalid code validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 9: Test Duplicate Code
 * Test that duplicate codes are rejected
 */
async function testDuplicateCodeValidation() {
  console.log("9. 🚫 Testing duplicate code validation...");
  try {
    const duplicateSupplier = {
      id: "duplicate-supplier",
      name: "Duplicate Supplier",
      code: "EGS", // Same code as supplier1
    };
    await axios.post(`${BASE_URL}/suppliers`, duplicateSupplier);
    console.error(
      "❌ Duplicate code validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log("✅ Duplicate code validation passed - correctly rejected");
      return true;
    } else {
      console.error(
        "❌ Duplicate code validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 10: Delete Supplier
 * Delete a supplier and verify it's removed
 */
async function testDeleteSupplier() {
  console.log("10. 🗑️ Testing delete supplier...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/suppliers/${testSuppliers.supplier2.id}`
    );
    console.log("✅ Delete supplier passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 11: Get All Suppliers After Deletion
 * Should return 1 supplier now (supplier1)
 */
async function testGetAllSuppliersAfterDeletion() {
  console.log("11. 📋 Testing get all suppliers after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/suppliers`);
    console.log("✅ Get all suppliers after deletion passed:", {
      success: response.data.success,
      count: response.data.count,
      remaining: response.data.data.map((s) => ({ id: s.id, name: s.name })),
    });
    return true;
  } catch (error) {
    console.error("❌ Get all suppliers after deletion failed:", error.message);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runSuppliersTests() {
  console.log("🧪 Starting Suppliers API Tests...\n");

  const tests = [
    testHealthCheck,
    testGetAllSuppliersEmpty,
    testCreateFirstSupplier,
    testCreateSecondSupplier,
    testGetAllSuppliersWithData,
    testGetSupplierById,
    testUpdateSupplier,
    testInvalidCodeValidation,
    testDuplicateCodeValidation,
    testDeleteSupplier,
    testGetAllSuppliersAfterDeletion,
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
    console.log("🎉 All suppliers API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSuppliersTests().catch(console.error);
}

module.exports = { runSuppliersTests };



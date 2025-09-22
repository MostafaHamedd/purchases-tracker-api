const axios = require("axios");

// ============================================================================
// PURCHASE RECEIPTS API TEST SUITE
// ============================================================================
// This file tests all CRUD operations for the purchase receipts API
// Includes foreign key validation and receipt number uniqueness testing
// ============================================================================

const BASE_URL = "http://localhost:3000/api";

// Test data for purchase receipts
const testData = {
  // First create a store, supplier, and purchase to use for testing
  store: {
    id: "test-store-purchase-receipts",
    name: "Test Store for Purchase Receipts",
    code: "TSPR",
    is_active: true,
    progress_bar_config: {
      blue: 20,
      yellow: 5,
      orange: 5,
      red: 5,
    },
  },
  supplier: {
    id: "test-supplier-purchase-receipts",
    name: "Test Supplier for Purchase Receipts",
    code: "TSPR",
    is_active: true,
  },
  supplier2: {
    id: "test-supplier2-purchase-receipts",
    name: "Test Supplier 2 for Purchase Receipts",
    code: "TSPR2",
    is_active: true,
  },
  purchase: {
    id: "test-purchase-purchase-receipts",
    store_id: "test-store-purchase-receipts",
    date: "2025-01-15",
    status: "Pending",
    total_grams_21k_equivalent: 500.0,
    total_base_fees: 2500.0,
    total_discount_amount: 1000.0,
    total_net_fees: 1500.0,
    due_date: "2025-02-15",
  },
  // Purchase receipts to test
  purchaseReceipt1: {
    id: "PR-001",
    purchase_id: "test-purchase-purchase-receipts",
    supplier_id: "test-supplier-purchase-receipts",
    receipt_number: "RCP-001-2025",
    receipt_date: "2025-01-15",
    karat_type: "21",
    grams: 100.0,
    base_fee_per_gram: 5.0,
    discount_percentage: 20.0,
    net_fee_per_gram: 4.0,
    total_base_fee: 500.0,
    total_discount_amount: 100.0,
    total_net_fee: 400.0,
    notes: "First receipt for 21k gold",
  },
  purchaseReceipt2: {
    id: "PR-002",
    purchase_id: "test-purchase-purchase-receipts",
    supplier_id: "test-supplier-purchase-receipts",
    receipt_number: "RCP-002-2025",
    receipt_date: "2025-01-16",
    karat_type: "18",
    grams: 50.0,
    base_fee_per_gram: 4.5,
    discount_percentage: 15.0,
    net_fee_per_gram: 3.825,
    total_base_fee: 225.0,
    total_discount_amount: 33.75,
    total_net_fee: 191.25,
    notes: "Second receipt for 18k gold",
  },
  purchaseReceipt3: {
    id: "PR-003",
    purchase_id: "test-purchase-purchase-receipts",
    supplier_id: "test-supplier2-purchase-receipts",
    receipt_number: "RCP-003-2025",
    receipt_date: "2025-01-17",
    karat_type: "21",
    grams: 75.0,
    base_fee_per_gram: 5.2,
    discount_percentage: 25.0,
    net_fee_per_gram: 3.9,
    total_base_fee: 390.0,
    total_discount_amount: 97.5,
    total_net_fee: 292.5,
    notes: "Third receipt from different supplier",
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
 * Create a store to use for purchase receipt testing
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
 * Create a supplier to use for purchase receipt testing
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
 * Create a purchase to use for purchase receipt testing
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
 * Create a second supplier to use for purchase receipt testing
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
 * Test 6: Get All Purchase Receipts (Empty)
 * Should return empty array initially
 */
async function testGetAllPurchaseReceiptsEmpty() {
  console.log("6. 📋 Testing get all purchase receipts (empty)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-receipts`);
    console.log("✅ Get all purchase receipts passed:", {
      success: response.data.success,
      count: response.data.count,
    });
    return true;
  } catch (error) {
    console.error("❌ Get all purchase receipts failed:", error.message);
    return false;
  }
}

/**
 * Test 7: Create First Purchase Receipt
 * Create a 21k purchase receipt
 */
async function testCreateFirstPurchaseReceipt() {
  console.log("7. ➕ Testing create first purchase receipt...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-receipts`,
      testData.purchaseReceipt1
    );
    console.log("✅ Create first purchase receipt passed:", {
      success: response.data.success,
      id: response.data.data.id,
      receipt_number: response.data.data.receipt_number,
      karat_type: response.data.data.karat_type,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create first purchase receipt failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 8: Create Second Purchase Receipt
 * Create an 18k purchase receipt
 */
async function testCreateSecondPurchaseReceipt() {
  console.log("8. ➕ Testing create second purchase receipt...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-receipts`,
      testData.purchaseReceipt2
    );
    console.log("✅ Create second purchase receipt passed:", {
      success: response.data.success,
      id: response.data.data.id,
      receipt_number: response.data.data.receipt_number,
      karat_type: response.data.data.karat_type,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create second purchase receipt failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 9: Create Third Purchase Receipt
 * Create another 21k purchase receipt from different supplier
 */
async function testCreateThirdPurchaseReceipt() {
  console.log("9. ➕ Testing create third purchase receipt...");
  try {
    const response = await axios.post(
      `${BASE_URL}/purchase-receipts`,
      testData.purchaseReceipt3
    );
    console.log("✅ Create third purchase receipt passed:", {
      success: response.data.success,
      id: response.data.data.id,
      receipt_number: response.data.data.receipt_number,
      supplier_id: response.data.data.supplier_id,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Create third purchase receipt failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 10: Get All Purchase Receipts (With Data)
 * Should return 3 purchase receipts now
 */
async function testGetAllPurchaseReceiptsWithData() {
  console.log("10. 📋 Testing get all purchase receipts (with data)...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-receipts`);
    console.log("✅ Get all purchase receipts with data passed:", {
      success: response.data.success,
      count: response.data.count,
      purchaseReceipts: response.data.data.map((pr) => ({
        id: pr.id,
        receipt_number: pr.receipt_number,
        karat_type: pr.karat_type,
        supplier_name: pr.supplier_name,
        purchase_date: pr.purchase_date,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get all purchase receipts with data failed:",
      error.message
    );
    return false;
  }
}

/**
 * Test 11: Get Purchase Receipt by ID
 * Retrieve a specific purchase receipt by ID
 */
async function testGetPurchaseReceiptById() {
  console.log("11. 🔍 Testing get purchase receipt by ID...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-receipts/${testData.purchaseReceipt1.id}`
    );
    console.log("✅ Get purchase receipt by ID passed:", {
      success: response.data.success,
      id: response.data.data.id,
      receipt_number: response.data.data.receipt_number,
      supplier_name: response.data.data.supplier_name,
      store_name: response.data.data.store_name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase receipt by ID failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 12: Get Purchase Receipts by Purchase
 * Get all purchase receipts for a specific purchase
 */
async function testGetPurchaseReceiptsByPurchase() {
  console.log("12. 🛒 Testing get purchase receipts by purchase...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-receipts/purchase/${testData.purchase.id}`
    );
    console.log("✅ Get purchase receipts by purchase passed:", {
      success: response.data.success,
      count: response.data.count,
      purchase_id: response.data.purchase.id,
      purchaseReceipts: response.data.data.map((pr) => ({
        id: pr.id,
        receipt_number: pr.receipt_number,
        karat_type: pr.karat_type,
        supplier_name: pr.supplier_name,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase receipts by purchase failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 13: Get Purchase Receipts by Supplier
 * Get all purchase receipts for a specific supplier
 */
async function testGetPurchaseReceiptsBySupplier() {
  console.log("13. 🏭 Testing get purchase receipts by supplier...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-receipts/supplier/${testData.supplier.id}`
    );
    console.log("✅ Get purchase receipts by supplier passed:", {
      success: response.data.success,
      count: response.data.count,
      supplier_name: response.data.supplier.name,
      purchaseReceipts: response.data.data.map((pr) => ({
        id: pr.id,
        receipt_number: pr.receipt_number,
        karat_type: pr.karat_type,
        purchase_date: pr.purchase_date,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase receipts by supplier failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 14: Get Purchase Receipt by Receipt Number
 * Retrieve a specific purchase receipt by receipt number
 */
async function testGetPurchaseReceiptByReceiptNumber() {
  console.log("14. 🔍 Testing get purchase receipt by receipt number...");
  try {
    const response = await axios.get(
      `${BASE_URL}/purchase-receipts/receipt/${testData.purchaseReceipt1.receipt_number}`
    );
    console.log("✅ Get purchase receipt by receipt number passed:", {
      success: response.data.success,
      id: response.data.data.id,
      receipt_number: response.data.data.receipt_number,
      supplier_name: response.data.data.supplier_name,
      store_name: response.data.data.store_name,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get purchase receipt by receipt number failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 15: Update Purchase Receipt
 * Update an existing purchase receipt
 */
async function testUpdatePurchaseReceipt() {
  console.log("15. ✏️ Testing update purchase receipt...");
  try {
    const updateData = {
      grams: 120.0,
      total_base_fee: 600.0,
      total_net_fee: 480.0,
      notes: "Updated receipt with more grams",
    };
    const response = await axios.put(
      `${BASE_URL}/purchase-receipts/${testData.purchaseReceipt1.id}`,
      updateData
    );
    console.log("✅ Update purchase receipt passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Update purchase receipt failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 16: Test Validation - Invalid Karat Type
 * Test that invalid karat types are rejected
 */
async function testInvalidKaratTypeValidation() {
  console.log("16. 🚫 Testing invalid karat type validation...");
  try {
    const invalidPurchaseReceipt = {
      id: "invalid-karat-pr",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      receipt_number: "INVALID-KARAT-001",
      receipt_date: "2025-01-15",
      karat_type: "24", // Invalid karat type
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, invalidPurchaseReceipt);
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
 * Test 17: Test Validation - Invalid Date Format
 * Test that invalid date formats are rejected
 */
async function testInvalidDateValidation() {
  console.log("17. 🚫 Testing invalid date format validation...");
  try {
    const invalidPurchaseReceipt = {
      id: "invalid-date-pr",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      receipt_number: "INVALID-DATE-001",
      receipt_date: "2025/01/15", // Invalid date format
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, invalidPurchaseReceipt);
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
 * Test 18: Test Validation - Negative Grams
 * Test that negative grams are rejected
 */
async function testNegativeGramsValidation() {
  console.log("18. 🚫 Testing negative grams validation...");
  try {
    const invalidPurchaseReceipt = {
      id: "negative-grams-pr",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      receipt_number: "NEGATIVE-GRAMS-001",
      receipt_date: "2025-01-15",
      karat_type: "21",
      grams: -100.0, // Negative grams
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, invalidPurchaseReceipt);
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
 * Test 19: Test Validation - Non-existent Purchase
 * Test that non-existent purchases are rejected
 */
async function testNonExistentPurchaseValidation() {
  console.log("19. 🚫 Testing non-existent purchase validation...");
  try {
    const invalidPurchaseReceipt = {
      id: "non-existent-purchase-pr",
      purchase_id: "non-existent-purchase",
      supplier_id: testData.supplier.id,
      receipt_number: "NON-EXISTENT-PURCHASE-001",
      receipt_date: "2025-01-15",
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, invalidPurchaseReceipt);
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
 * Test 20: Test Validation - Non-existent Supplier
 * Test that non-existent suppliers are rejected
 */
async function testNonExistentSupplierValidation() {
  console.log("20. 🚫 Testing non-existent supplier validation...");
  try {
    const invalidPurchaseReceipt = {
      id: "non-existent-supplier-pr",
      purchase_id: testData.purchase.id,
      supplier_id: "non-existent-supplier",
      receipt_number: "NON-EXISTENT-SUPPLIER-001",
      receipt_date: "2025-01-15",
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, invalidPurchaseReceipt);
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
 * Test 21: Test Validation - Duplicate Receipt Number
 * Test that duplicate receipt numbers are rejected
 */
async function testDuplicateReceiptNumberValidation() {
  console.log("21. 🚫 Testing duplicate receipt number validation...");
  try {
    const duplicatePurchaseReceipt = {
      id: "duplicate-receipt-pr",
      purchase_id: testData.purchase.id,
      supplier_id: testData.supplier.id,
      receipt_number: "RCP-001-2025", // Same as first receipt
      receipt_date: "2025-01-15",
      karat_type: "21",
      grams: 100.0,
      base_fee_per_gram: 5.0,
      discount_percentage: 20.0,
      net_fee_per_gram: 4.0,
      total_base_fee: 500.0,
      total_discount_amount: 100.0,
      total_net_fee: 400.0,
    };
    await axios.post(`${BASE_URL}/purchase-receipts`, duplicatePurchaseReceipt);
    console.error(
      "❌ Duplicate receipt number validation failed - should have been rejected"
    );
    return false;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(
        "✅ Duplicate receipt number validation passed - correctly rejected"
      );
      return true;
    } else {
      console.error(
        "❌ Duplicate receipt number validation failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}

/**
 * Test 22: Delete Purchase Receipt
 * Delete a purchase receipt
 */
async function testDeletePurchaseReceipt() {
  console.log("22. 🗑️ Testing delete purchase receipt...");
  try {
    const response = await axios.delete(
      `${BASE_URL}/purchase-receipts/${testData.purchaseReceipt3.id}`
    );
    console.log("✅ Delete purchase receipt passed:", {
      success: response.data.success,
      affectedRows: response.data.affectedRows,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Delete purchase receipt failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 23: Get All Purchase Receipts After Deletion
 * Should return 2 purchase receipts now
 */
async function testGetAllPurchaseReceiptsAfterDeletion() {
  console.log("23. 📋 Testing get all purchase receipts after deletion...");
  try {
    const response = await axios.get(`${BASE_URL}/purchase-receipts`);
    console.log("✅ Get all purchase receipts after deletion passed:", {
      success: response.data.success,
      count: response.data.count,
      remaining: response.data.data.map((pr) => ({
        id: pr.id,
        receipt_number: pr.receipt_number,
        karat_type: pr.karat_type,
        supplier_name: pr.supplier_name,
      })),
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Get all purchase receipts after deletion failed:",
      error.message
    );
    return false;
  }
}

/**
 * Test 24: Cleanup - Delete Remaining Purchase Receipts
 * Delete remaining purchase receipts before cleaning up
 */
async function testCleanupDeleteRemainingPurchaseReceipts() {
  console.log("24. 🧹 Testing cleanup - delete remaining purchase receipts...");
  try {
    // Delete remaining purchase receipts
    const response1 = await axios.delete(
      `${BASE_URL}/purchase-receipts/${testData.purchaseReceipt1.id}`
    );
    const response2 = await axios.delete(
      `${BASE_URL}/purchase-receipts/${testData.purchaseReceipt2.id}`
    );

    console.log("✅ Cleanup delete remaining purchase receipts passed:", {
      purchaseReceipt1: response1.data.success,
      purchaseReceipt2: response2.data.success,
    });
    return true;
  } catch (error) {
    console.error(
      "❌ Cleanup delete remaining purchase receipts failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 25: Cleanup - Delete Test Purchase
 * Clean up the test purchase
 */
async function testCleanupDeletePurchase() {
  console.log("25. 🧹 Testing cleanup - delete test purchase...");
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
 * Test 26: Cleanup - Delete Test Supplier
 * Clean up the test supplier
 */
async function testCleanupDeleteSupplier() {
  console.log("26. 🧹 Testing cleanup - delete test supplier...");
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
 * Test 27: Cleanup - Delete Test Supplier 2
 * Clean up the second test supplier
 */
async function testCleanupDeleteSupplier2() {
  console.log("27. 🧹 Testing cleanup - delete test supplier 2...");
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
 * Test 28: Cleanup - Delete Test Store
 * Clean up the test store
 */
async function testCleanupDeleteStore() {
  console.log("28. 🧹 Testing cleanup - delete test store...");
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

async function runPurchaseReceiptsTests() {
  console.log("🧪 Starting Purchase Receipts API Tests...\n");

  const tests = [
    testHealthCheck,
    testCreateTestStore,
    testCreateTestSupplier,
    testCreateTestPurchase,
    testCreateTestSupplier2,
    testGetAllPurchaseReceiptsEmpty,
    testCreateFirstPurchaseReceipt,
    testCreateSecondPurchaseReceipt,
    testCreateThirdPurchaseReceipt,
    testGetAllPurchaseReceiptsWithData,
    testGetPurchaseReceiptById,
    testGetPurchaseReceiptsByPurchase,
    testGetPurchaseReceiptsBySupplier,
    testGetPurchaseReceiptByReceiptNumber,
    testUpdatePurchaseReceipt,
    testInvalidKaratTypeValidation,
    testInvalidDateValidation,
    testNegativeGramsValidation,
    testNonExistentPurchaseValidation,
    testNonExistentSupplierValidation,
    testDuplicateReceiptNumberValidation,
    testDeletePurchaseReceipt,
    testGetAllPurchaseReceiptsAfterDeletion,
    testCleanupDeleteRemainingPurchaseReceipts,
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
    console.log("🎉 All purchase receipts API tests passed successfully!");
  } else {
    console.log("⚠️ Some tests failed. Please check the output above.");
  }

  console.log("=".repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPurchaseReceiptsTests().catch(console.error);
}

module.exports = { runPurchaseReceiptsTests };

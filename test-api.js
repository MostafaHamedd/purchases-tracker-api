const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Test data
const testStore = {
  id: "test-store-1",
  name: "Test Store - Downtown",
  code: "TSD",
  is_active: true,
  progress_bar_config: {
    blue: 15,
    yellow: 5,
    orange: 5,
    red: 5,
  },
};

async function testAPI() {
  console.log("🧪 Starting API tests...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", healthResponse.data);
    console.log("");

    // Test 2: Get all stores (should be empty initially)
    console.log("2. Testing get all stores...");
    const getAllResponse = await axios.get(`${BASE_URL}/stores`);
    console.log("✅ Get all stores passed:", getAllResponse.data);
    console.log("");

    // Test 3: Create a store
    console.log("3. Testing create store...");
    const createResponse = await axios.post(`${BASE_URL}/stores`, testStore);
    console.log("✅ Create store passed:", createResponse.data);
    console.log("");

    // Test 4: Get store by ID
    console.log("4. Testing get store by ID...");
    const getByIdResponse = await axios.get(
      `${BASE_URL}/stores/${testStore.id}`
    );
    console.log("✅ Get store by ID passed:", getByIdResponse.data);
    console.log("");

    // Test 5: Update store
    console.log("5. Testing update store...");
    const updateData = { name: "Updated Test Store - Downtown" };
    const updateResponse = await axios.put(
      `${BASE_URL}/stores/${testStore.id}`,
      updateData
    );
    console.log("✅ Update store passed:", updateResponse.data);
    console.log("");

    // Test 6: Get all stores again (should have one store)
    console.log("6. Testing get all stores after creation...");
    const getAllAfterResponse = await axios.get(`${BASE_URL}/stores`);
    console.log(
      "✅ Get all stores after creation passed:",
      getAllAfterResponse.data
    );
    console.log("");

    // Test 7: Delete store
    console.log("7. Testing delete store...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/stores/${testStore.id}`
    );
    console.log("✅ Delete store passed:", deleteResponse.data);
    console.log("");

    // Test 8: Get all stores after deletion (should be empty again)
    console.log("8. Testing get all stores after deletion...");
    const getAllAfterDeleteResponse = await axios.get(`${BASE_URL}/stores`);
    console.log(
      "✅ Get all stores after deletion passed:",
      getAllAfterDeleteResponse.data
    );
    console.log("");

    console.log("🎉 All tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;



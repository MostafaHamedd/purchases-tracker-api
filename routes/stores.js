const express = require("express");
const router = express.Router();
const {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} = require("../controllers/storesController");

// ============================================================================
// STORES ROUTES
// ============================================================================
// All routes are prefixed with /api/stores
// ============================================================================

/**
 * GET /api/stores
 * Get all stores with optional filtering and pagination
 */
router.get("/", getAllStores);

/**
 * GET /api/stores/:id
 * Get single store by ID
 */
router.get("/:id", getStoreById);

/**
 * POST /api/stores
 * Create new store
 */
router.post("/", createStore);

/**
 * PUT /api/stores/:id
 * Update store by ID
 */
router.put("/:id", updateStore);

/**
 * DELETE /api/stores/:id
 * Delete store by ID
 */
router.delete("/:id", deleteStore);

module.exports = router;

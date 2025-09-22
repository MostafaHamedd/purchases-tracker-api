const express = require("express");
const router = express.Router();
const purchaseSuppliersController = require("../controllers/purchaseSuppliersController");

// GET /api/purchase-suppliers - Get all purchase suppliers
router.get("/", purchaseSuppliersController.getAllPurchaseSuppliers);

// GET /api/purchase-suppliers/:id - Get single purchase supplier by ID
router.get("/:id", purchaseSuppliersController.getPurchaseSupplierById);

// GET /api/purchase-suppliers/purchase/:purchaseId - Get purchase suppliers for a specific purchase
router.get(
  "/purchase/:purchaseId",
  purchaseSuppliersController.getPurchaseSuppliersByPurchase
);

// GET /api/purchase-suppliers/supplier/:supplierId - Get purchase suppliers for a specific supplier
router.get(
  "/supplier/:supplierId",
  purchaseSuppliersController.getPurchaseSuppliersBySupplier
);

// POST /api/purchase-suppliers - Create new purchase supplier
router.post("/", purchaseSuppliersController.createPurchaseSupplier);

// PUT /api/purchase-suppliers/:id - Update purchase supplier
router.put("/:id", purchaseSuppliersController.updatePurchaseSupplier);

// DELETE /api/purchase-suppliers/:id - Delete purchase supplier
router.delete("/:id", purchaseSuppliersController.deletePurchaseSupplier);

module.exports = router;



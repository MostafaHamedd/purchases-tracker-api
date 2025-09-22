const express = require("express");
const router = express.Router();
const purchasesController = require("../controllers/purchasesController");

// GET /api/purchases - Get all purchases with filters
router.get("/", purchasesController.getAllPurchases);

// GET /api/purchases/:id - Get single purchase by ID
router.get("/:id", purchasesController.getPurchaseById);

// GET /api/purchases/:purchaseId/receipts - Get all receipts for a purchase
// router.get("/:purchaseId/receipts", purchasesController.getPurchaseReceipts);

// GET /api/purchases/:purchaseId/suppliers/:supplierId/receipts - Get receipts for a specific supplier in a purchase
// router.get("/:purchaseId/suppliers/:supplierId/receipts", purchasesController.getSupplierReceipts);

// GET /api/purchases/:purchaseId/payments - Get payments for a purchase
// router.get("/:purchaseId/payments", purchasesController.getPurchasePayments);

// POST /api/purchases - Create new purchase
router.post("/", purchasesController.createPurchase);

// POST /api/purchases/:purchaseId/suppliers/:supplierId/receipts - Add new receipt to a supplier
// router.post("/:purchaseId/suppliers/:supplierId/receipts", purchasesController.addReceiptToSupplier);

// POST /api/purchases/:purchaseId/payments - Add payment to purchase
// router.post("/:purchaseId/payments", purchasesController.addPaymentToPurchase);

// PUT /api/purchases/:id - Update purchase
router.put("/:id", purchasesController.updatePurchase);

// DELETE /api/purchases/:id - Delete purchase
router.delete("/:id", purchasesController.deletePurchase);

module.exports = router;

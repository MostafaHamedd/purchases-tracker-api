const express = require("express");
const router = express.Router();
const purchaseReceiptsController = require("../controllers/purchaseReceiptsController");

// GET /api/purchase-receipts - Get all purchase receipts
router.get("/", purchaseReceiptsController.getAllPurchaseReceipts);

// GET /api/purchase-receipts/:id - Get single purchase receipt by ID
router.get("/:id", purchaseReceiptsController.getPurchaseReceiptById);

// GET /api/purchase-receipts/purchase/:purchaseId - Get purchase receipts for a specific purchase
router.get(
  "/purchase/:purchaseId",
  purchaseReceiptsController.getPurchaseReceiptsByPurchase
);

// GET /api/purchase-receipts/supplier/:supplierId - Get purchase receipts for a specific supplier
router.get(
  "/supplier/:supplierId",
  purchaseReceiptsController.getPurchaseReceiptsBySupplier
);

// GET /api/purchase-receipts/receipt/:receiptNumber - Get purchase receipt by receipt number
router.get(
  "/receipt/:receiptNumber",
  purchaseReceiptsController.getPurchaseReceiptByReceiptNumber
);

// POST /api/purchase-receipts - Create new purchase receipt
router.post("/", purchaseReceiptsController.createPurchaseReceipt);

// PUT /api/purchase-receipts/:id - Update purchase receipt
router.put("/:id", purchaseReceiptsController.updatePurchaseReceipt);

// DELETE /api/purchase-receipts/:id - Delete purchase receipt
router.delete("/:id", purchaseReceiptsController.deletePurchaseReceipt);

// Individual receipt operations (for documentation compliance)
// PUT /api/receipts/:receiptId - Update receipt
router.put("/:receiptId", purchaseReceiptsController.updatePurchaseReceipt);

// DELETE /api/receipts/:receiptId - Delete receipt
router.delete("/:receiptId", purchaseReceiptsController.deletePurchaseReceipt);

module.exports = router;

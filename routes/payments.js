const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");

// GET /api/payments - Get all payments
router.get("/", paymentsController.getAllPayments);

// GET /api/payments/:id - Get single payment by ID
router.get("/:id", paymentsController.getPaymentById);

// GET /api/payments/purchase/:purchaseId - Get payments for a specific purchase
router.get("/purchase/:purchaseId", paymentsController.getPaymentsByPurchase);

// GET /api/payments/karat/:karatType - Get payments by karat type
router.get("/karat/:karatType", paymentsController.getPaymentsByKaratType);

// POST /api/payments - Create new payment
router.post("/", paymentsController.createPayment);

// PUT /api/payments/:id - Update payment
router.put("/:id", paymentsController.updatePayment);

// DELETE /api/payments/:id - Delete payment
router.delete("/:id", paymentsController.deletePayment);

// Individual payment operations (for documentation compliance)
// PUT /api/payments/:paymentId - Update payment
router.put("/:paymentId", paymentsController.updatePayment);

// DELETE /api/payments/:paymentId - Delete payment
router.delete("/:paymentId", paymentsController.deletePayment);

module.exports = router;

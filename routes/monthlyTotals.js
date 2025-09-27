const express = require("express");
const router = express.Router();
const MonthlyTotalsController = require("../controllers/monthlyTotalsController");

// Get current month's total grams
router.get("/current", MonthlyTotalsController.getCurrentMonthTotal);

// Get monthly totals for the last 12 months
router.get("/history", MonthlyTotalsController.getMonthlyTotals);

// Calculate discount for a specific receipt
router.post(
  "/calculate-discount",
  MonthlyTotalsController.calculateReceiptDiscount
);

module.exports = router;

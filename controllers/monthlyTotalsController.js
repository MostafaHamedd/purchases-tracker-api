const { pool } = require("../config/database");

class MonthlyTotalsController {
  // Get current month's total grams (21k equivalent)
  static async getCurrentMonthTotal(req, res) {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(pr.total_grams_21k), 0) as total_grams_21k_equivalent,
          COUNT(DISTINCT p.id) as total_purchases,
          COUNT(pr.id) as total_receipts
        FROM purchases p
        JOIN purchase_receipts pr ON p.id = pr.purchase_id
        WHERE DATE_FORMAT(p.date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      `;

      const [results] = await pool.execute(query);

      res.json({
        success: true,
        data: results[0],
      });
    } catch (error) {
      console.error("Error fetching current month total:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch current month total",
      });
    }
  }

  // Get monthly totals for the last 12 months
  static async getMonthlyTotals(req, res) {
    try {
      const query = `
        SELECT 
          DATE_FORMAT(p.date, '%Y-%m') as month_year,
          SUM(
            CASE 
              WHEN pr.karat_type = '18' THEN pr.grams_18k * 0.857
              WHEN pr.karat_type = '21' THEN pr.grams_21k
              ELSE 0
            END
          ) as total_grams_21k_equivalent,
          COUNT(DISTINCT p.id) as total_purchases,
          COUNT(pr.id) as total_receipts
        FROM purchases p
        JOIN purchase_receipts pr ON p.id = pr.purchase_id
        WHERE p.date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(p.date, '%Y-%m')
        ORDER BY month_year DESC
      `;

      const [results] = await pool.execute(query);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching monthly totals:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch monthly totals",
      });
    }
  }

  // Calculate discount for a specific receipt
  static async calculateReceiptDiscount(req, res) {
    try {
      const { purchaseId, supplierId, grams, karatType, baseFee } = req.body;

      if (!purchaseId || !supplierId || !grams || !karatType) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required parameters: purchaseId, supplierId, grams, karatType",
        });
      }

      // Use the new DiscountCalculationService
      const DiscountCalculationService = require("../services/discountCalculationService");
      const result = await DiscountCalculationService.calculateReceiptDiscount(
        supplierId,
        parseFloat(grams),
        karatType,
        purchaseId,
        baseFee ? parseFloat(baseFee) : null
      );

      res.json({
        success: true,
        data: {
          discountRate: result.discountRate,
          discountAmount: result.discountAmount,
          tier: result.tier,
          monthlyTotal: result.monthlyTotal,
          baseFee: result.baseFee,
          grams21kEquivalent: result.grams21kEquivalent,
        },
      });
    } catch (error) {
      console.error("Error calculating receipt discount:", error);
      res.status(500).json({
        success: false,
        error: "Failed to calculate receipt discount",
        message: error.message,
      });
    }
  }
}

module.exports = MonthlyTotalsController;

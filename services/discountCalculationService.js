const { pool } = require("../config/database");
const { PURCHASE_CONSTANTS } = require("../constants");

/**
 * Service for calculating discounts based on monthly totals and supplier tiers
 */
class DiscountCalculationService {
  /**
   * Calculate discount for a receipt based on current monthly totals and supplier tiers
   * @param {string} supplierId - Supplier ID
   * @param {number} grams - Grams of gold
   * @param {string} karatType - Karat type ('18' or '21')
   * @param {string} purchaseId - Purchase ID (to exclude from monthly totals)
   * @returns {Promise<Object>} Discount calculation result
   */
  static async calculateReceiptDiscount(
    supplierId,
    grams,
    karatType,
    purchaseId = null,
    baseFee = null
  ) {
    try {
      // Calculate 21k equivalent grams
      const grams21kEquivalent = karatType === "18" ? grams * 0.857 : grams;

      // Get current month total (21k equivalent) across all suppliers
      const monthlyTotal = await this.getCurrentMonthTotal(purchaseId);

      // Get supplier's discount configuration
      const supplierConfig = await this.getSupplierDiscountConfig(supplierId);

      if (!supplierConfig) {
        return {
          discountRate: 0,
          discountAmount: 0,
          tier: "low",
          monthlyTotal: monthlyTotal,
          baseFee:
            baseFee ||
            grams21kEquivalent * PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM,
        };
      }

      // Determine tier based on monthly total and supplier thresholds
      const tier = this.determineTier(monthlyTotal, supplierConfig.thresholds);

      // Get discount rate for the tier
      const discountRate = supplierConfig.rates[tier] || 0;

      // Use provided base fee or calculate default
      const actualBaseFee =
        baseFee || grams21kEquivalent * PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM;

      // Calculate discount amount based on the actual base fee
      const discountAmount = actualBaseFee * discountRate;

      return {
        discountRate,
        discountAmount,
        tier,
        monthlyTotal,
        baseFee: actualBaseFee,
        grams21kEquivalent,
      };
    } catch (error) {
      console.error("Error calculating receipt discount:", error);
      return {
        discountRate: 0,
        discountAmount: 0,
        tier: "low",
        monthlyTotal: 0,
        baseFee: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get current month's total grams (21k equivalent) across all suppliers
   * @param {string} excludePurchaseId - Purchase ID to exclude from calculation
   * @returns {Promise<number>} Monthly total in grams
   */
  static async getCurrentMonthTotal(excludePurchaseId = null) {
    try {
      let query = `
        SELECT COALESCE(SUM(
          pr.grams_18k * 0.857 + pr.grams_21k
        ), 0) as monthly_total
        FROM purchases p
        JOIN purchase_receipts pr ON p.id = pr.purchase_id
        WHERE DATE_FORMAT(p.date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      `;

      const params = [];
      if (excludePurchaseId) {
        query += " AND p.id != ?";
        params.push(excludePurchaseId);
      }

      const [rows] = await pool.execute(query, params);
      return parseFloat(rows[0].monthly_total || 0);
    } catch (error) {
      console.error("Error getting monthly total:", error);
      return 0;
    }
  }

  /**
   * Get supplier's discount configuration
   * @param {string} supplierId - Supplier ID
   * @returns {Promise<Object|null>} Supplier discount configuration
   */
  static async getSupplierDiscountConfig(supplierId) {
    try {
      // Get discount tiers for this supplier (21k only)
      const [tiers] = await pool.execute(
        "SELECT name, threshold, discount_percentage FROM discount_tiers WHERE supplier_id = ? AND karat_type = '21' ORDER BY threshold ASC",
        [supplierId]
      );

      if (tiers.length === 0) {
        return null;
      }

      // Convert tiers to the expected format
      const thresholds = {};
      const rates = {};

      // Map tiers to low/medium/high based on threshold values
      // Sort tiers by threshold to determine low/medium/high
      const sortedTiers = tiers.sort((a, b) => a.threshold - b.threshold);

      if (sortedTiers.length >= 1) {
        thresholds.low = sortedTiers[0].threshold;
        rates.low = sortedTiers[0].discount_percentage;
      }

      if (sortedTiers.length >= 2) {
        thresholds.medium = sortedTiers[1].threshold;
        rates.medium = sortedTiers[1].discount_percentage;
      }

      if (sortedTiers.length >= 3) {
        thresholds.high = sortedTiers[2].threshold;
        rates.high = sortedTiers[2].discount_percentage;
      }

      return {
        thresholds,
        rates,
      };
    } catch (error) {
      console.error("Error getting supplier discount config:", error);
      return null;
    }
  }

  /**
   * Determine discount tier based on monthly total and supplier thresholds
   * @param {number} monthlyTotal - Current monthly total
   * @param {Object} thresholds - Supplier thresholds
   * @returns {string} Tier name ('low', 'medium', 'high')
   */
  static determineTier(monthlyTotal, thresholds) {
    if (monthlyTotal >= thresholds.high) {
      return "high";
    } else if (monthlyTotal >= thresholds.medium) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Calculate receipt totals with discount applied
   * @param {Object} receiptData - Receipt data
   * @returns {Promise<Object>} Calculated receipt totals
   */
  static async calculateReceiptTotals(receiptData) {
    const { supplier_id, grams, karat_type, base_fee_per_gram, purchase_id } =
      receiptData;

    // Calculate base fee
    const baseFee = grams * base_fee_per_gram;

    // Calculate discount
    const discountResult = await this.calculateReceiptDiscount(
      supplier_id,
      grams,
      karat_type,
      purchase_id
    );

    // Calculate net fee
    const netFee = baseFee - discountResult.discountAmount;

    return {
      baseFee,
      discountRate: discountResult.discountRate,
      discountAmount: discountResult.discountAmount,
      netFee,
      tier: discountResult.tier,
      monthlyTotal: discountResult.monthlyTotal,
    };
  }

  /**
   * Calculate purchase totals from all receipts
   * @param {Array} receipts - Array of receipt data
   * @returns {Object} Purchase totals
   */
  static calculatePurchaseTotals(receipts) {
    let totalGrams21kEquivalent = 0;
    let totalBaseFees = 0;
    let totalDiscountAmount = 0;
    let totalNetFees = 0;

    receipts.forEach((receipt) => {
      // Handle different property names from createdReceipts array and database receipts
      totalGrams21kEquivalent += parseFloat(
        receipt.grams21kEquivalent ||
          receipt.total_grams_21k ||
          receipt.total_grams_21k ||
          0
      );
      totalBaseFees += parseFloat(
        receipt.baseFee || receipt.total_base_fee || receipt.base_fees || 0
      );
      totalDiscountAmount += parseFloat(
        receipt.discountAmount ||
          receipt.total_discount_amount ||
          receipt.discount_amount ||
          0
      );
      totalNetFees += parseFloat(
        receipt.netFee || receipt.total_net_fee || receipt.net_fees || 0
      );
    });

    return {
      totalGrams21kEquivalent,
      totalBaseFees,
      totalDiscountAmount,
      totalNetFees,
    };
  }
}

module.exports = DiscountCalculationService;

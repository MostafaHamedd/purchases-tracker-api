/**
 * Business Logic Utilities for Receipt Tracker
 * Implements calculations as specified in the documentation
 */

/**
 * Calculate 21k equivalent from 18k and 21k grams
 * Formula: grams_21k + (grams_18k * 18/21)
 * @param {number} grams18k - Grams of 18k gold
 * @param {number} grams21k - Grams of 21k gold
 * @returns {number} Total grams in 21k equivalent
 */
const calculate21kEquivalent = (grams18k = 0, grams21k = 0) => {
  const grams18kAs21k = grams18k * (18 / 21);
  return parseFloat((grams21k + grams18kAs21k).toFixed(2));
};

/**
 * Calculate discount amount
 * Formula: total_grams_21k * discount_rate
 * @param {number} totalGrams21k - Total grams in 21k equivalent
 * @param {number} discountRate - Discount rate per gram
 * @returns {number} Total discount amount
 */
const calculateDiscountAmount = (totalGrams21k, discountRate) => {
  return parseFloat((totalGrams21k * discountRate).toFixed(2));
};

/**
 * Calculate net fees
 * Formula: base_fees - discount_amount
 * @param {number} baseFees - Base fees amount
 * @param {number} discountAmount - Discount amount
 * @returns {number} Net fees amount
 */
const calculateNetFees = (baseFees, discountAmount) => {
  return parseFloat((baseFees - discountAmount).toFixed(2));
};

/**
 * Calculate monthly totals for a supplier
 * @param {string} supplierId - Supplier ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Object>} Monthly totals
 */
const calculateMonthlyTotals = async (supplierId, year, month) => {
  const { pool } = require("../config/database");

  const query = `
    SELECT
      SUM(ps.total_grams_21k_equivalent) as total_grams,
      SUM(ps.total_net_fees) as total_net_fees
    FROM purchase_suppliers ps
    JOIN purchases p ON ps.purchase_id = p.id
    WHERE ps.supplier_id = ? 
      AND YEAR(p.date) = ? 
      AND MONTH(p.date) = ?
  `;

  const [rows] = await pool.execute(query, [supplierId, year, month]);

  return {
    totalGrams: parseFloat(rows[0].total_grams || 0),
    totalNetFees: parseFloat(rows[0].total_net_fees || 0),
  };
};

/**
 * Determine discount rate based on supplier tiers and monthly totals
 * @param {string} supplierId - Supplier ID
 * @param {number} totalGrams - Total grams for the month
 * @param {string} karatType - Karat type ('18' or '21')
 * @returns {Promise<number>} Discount rate per gram
 */
const determineDiscountRate = async (supplierId, totalGrams, karatType) => {
  const { pool } = require("../config/database");

  // Get discount tiers for the supplier and karat type, ordered by threshold
  const query = `
    SELECT threshold, discount_percentage
    FROM discount_tiers
    WHERE supplier_id = ? AND karat_type = ?
    ORDER BY threshold DESC
  `;

  const [rows] = await pool.execute(query, [supplierId, karatType]);

  // Find the appropriate tier based on total grams
  for (const tier of rows) {
    if (totalGrams >= tier.threshold) {
      return parseFloat(tier.discount_percentage);
    }
  }

  // Default to 0 if no tier matches
  return 0;
};

/**
 * Calculate purchase status based on payments and due date
 * @param {number} totalNetFees - Total net fees for the purchase
 * @param {number} totalPaid - Total amount paid
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @returns {string} Purchase status
 */
const calculatePurchaseStatus = (totalNetFees, totalPaid, dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < today;

  if (totalPaid >= totalNetFees) {
    return "Paid";
  } else if (totalPaid > 0) {
    return isOverdue ? "Overdue" : "Partial";
  } else {
    return isOverdue ? "Overdue" : "Pending";
  }
};

/**
 * Aggregate receipt data for a supplier in a purchase
 * @param {Array} receipts - Array of receipt objects
 * @returns {Object} Aggregated data
 */
const aggregateReceiptData = (receipts) => {
  const aggregated = {
    total_grams_18k: 0,
    total_grams_21k: 0,
    total_grams_21k_equivalent: 0,
    total_base_fees: 0,
    total_discount_amount: 0,
    total_net_fees: 0,
    receipt_count: receipts.length,
  };

  receipts.forEach((receipt) => {
    aggregated.total_grams_18k += parseFloat(receipt.grams_18k || 0);
    aggregated.total_grams_21k += parseFloat(receipt.grams_21k || 0);
    aggregated.total_grams_21k_equivalent += parseFloat(
      receipt.total_grams_21k || 0
    );
    aggregated.total_base_fees += parseFloat(receipt.base_fees || 0);
    aggregated.total_discount_amount += parseFloat(
      receipt.discount_amount || 0
    );
    aggregated.total_net_fees += parseFloat(receipt.net_fees || 0);
  });

  // Round to 2 decimal places
  Object.keys(aggregated).forEach((key) => {
    if (typeof aggregated[key] === "number") {
      aggregated[key] = parseFloat(aggregated[key].toFixed(2));
    }
  });

  return aggregated;
};

/**
 * Aggregate supplier data for a purchase
 * @param {Array} suppliers - Array of supplier objects with receipt data
 * @returns {Object} Aggregated purchase data
 */
const aggregatePurchaseData = (suppliers) => {
  const aggregated = {
    total_grams_21k_equivalent: 0,
    total_base_fees: 0,
    total_discount_amount: 0,
    total_net_fees: 0,
  };

  suppliers.forEach((supplier) => {
    aggregated.total_grams_21k_equivalent += parseFloat(
      supplier.total_grams_21k_equivalent || 0
    );
    aggregated.total_base_fees += parseFloat(supplier.total_base_fees || 0);
    aggregated.total_discount_amount += parseFloat(
      supplier.total_discount_amount || 0
    );
    aggregated.total_net_fees += parseFloat(supplier.total_net_fees || 0);
  });

  // Round to 2 decimal places
  Object.keys(aggregated).forEach((key) => {
    aggregated[key] = parseFloat(aggregated[key].toFixed(2));
  });

  return aggregated;
};

module.exports = {
  calculate21kEquivalent,
  calculateDiscountAmount,
  calculateNetFees,
  calculateMonthlyTotals,
  determineDiscountRate,
  calculatePurchaseStatus,
  aggregateReceiptData,
  aggregatePurchaseData,
};



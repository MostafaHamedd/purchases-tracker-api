const { pool } = require("../config/database");
const DiscountCalculationService = require("./discountCalculationService");
const { PURCHASE_CONSTANTS } = require("../constants");

/**
 * Service for recalculating discounts when monthly totals change
 * This ensures all receipts have correct discounts based on current monthly totals
 */
class RecalculationService {
  /**
   * Recalculate discounts for all receipts of a specific supplier in a specific month
   * @param {string} supplierId - Supplier ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object>} Recalculation results
   */
  static async recalculateSupplierDiscounts(supplierId, month) {
    try {
      console.log(
        `🔄 Recalculating discounts for supplier ${supplierId} in ${month}`
      );

      // Get all receipts for this supplier in this month
      const [receipts] = await pool.execute(
        `
        SELECT 
          pr.id,
          pr.purchase_id,
          pr.supplier_id,
          pr.grams_18k,
          pr.grams_21k,
          pr.total_grams_21k,
          pr.base_fees,
          pr.discount_rate,
          pr.discount_amount,
          pr.net_fees,
          pr.created_at,
          p.store_id
        FROM purchase_receipts pr
        JOIN purchases p ON pr.purchase_id = p.id
        WHERE pr.supplier_id = ? 
        AND DATE_FORMAT(pr.created_at, '%Y-%m') = ?
        ORDER BY pr.created_at ASC
      `,
        [supplierId, month]
      );

      if (receipts.length === 0) {
        console.log(`No receipts found for supplier ${supplierId} in ${month}`);
        return { success: true, updated: 0, message: "No receipts to update" };
      }

      let updatedCount = 0;
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        for (const receipt of receipts) {
          // Calculate new discount using current monthly totals
          const discountResult =
            await DiscountCalculationService.calculateReceiptDiscount(
              receipt.supplier_id,
              receipt.total_grams_21k,
              "21", // Default to 21k for recalculation
              receipt.purchase_id,
              receipt.base_fees
            );

          // Update the receipt with new discount information
          await connection.execute(
            `
            UPDATE purchase_receipts 
            SET 
              discount_rate = ?,
              discount_amount = ?,
              net_fees = ?
            WHERE id = ?
          `,
            [
              discountResult.discountRate,
              discountResult.discountAmount,
              receipt.base_fees - discountResult.discountAmount,
              receipt.id,
            ]
          );

          updatedCount++;
        }

        // Recalculate purchase totals for all affected purchases
        await this.recalculatePurchaseTotals(connection, supplierId, month);

        await connection.commit();
        console.log(
          `✅ Updated ${updatedCount} receipts for supplier ${supplierId} in ${month}`
        );

        return {
          success: true,
          updated: updatedCount,
          message: `Updated ${updatedCount} receipts`,
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error recalculating supplier discounts:", error);
      return {
        success: false,
        error: error.message,
        updated: 0,
      };
    }
  }

  /**
   * Recalculate discounts for all receipts in a specific month
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object>} Recalculation results
   */
  static async recalculateMonthDiscounts(month) {
    try {
      console.log(`🔄 Recalculating discounts for entire month ${month}`);

      // Get all unique suppliers with receipts in this month
      const [suppliers] = await pool.execute(
        `
        SELECT DISTINCT pr.supplier_id
        FROM purchase_receipts pr
        WHERE DATE_FORMAT(pr.created_at, '%Y-%m') = ?
      `,
        [month]
      );

      let totalUpdated = 0;
      const results = [];

      for (const supplier of suppliers) {
        const result = await this.recalculateSupplierDiscounts(
          supplier.supplier_id,
          month
        );
        results.push({
          supplierId: supplier.supplier_id,
          ...result,
        });
        totalUpdated += result.updated || 0;
      }

      console.log(
        `✅ Recalculated discounts for ${suppliers.length} suppliers in ${month}`
      );

      return {
        success: true,
        totalUpdated,
        suppliers: results,
        message: `Updated ${totalUpdated} receipts across ${suppliers.length} suppliers`,
      };
    } catch (error) {
      console.error("Error recalculating month discounts:", error);
      return {
        success: false,
        error: error.message,
        totalUpdated: 0,
      };
    }
  }

  /**
   * Recalculate purchase totals after receipt discounts are updated
   * @param {Object} connection - Database connection
   * @param {string} supplierId - Supplier ID
   * @param {string} month - Month in YYYY-MM format
   */
  static async recalculatePurchaseTotals(connection, supplierId, month) {
    try {
      // Get all purchases for this supplier in this month
      const [purchases] = await connection.execute(
        `
        SELECT DISTINCT p.id
        FROM purchases p
        JOIN purchase_receipts pr ON p.id = pr.purchase_id
        WHERE pr.supplier_id = ? 
        AND DATE_FORMAT(pr.created_at, '%Y-%m') = ?
      `,
        [supplierId, month]
      );

      for (const purchase of purchases) {
        // Get all receipts for this purchase
        const [receipts] = await connection.execute(
          `
          SELECT 
            total_grams_21k,
            base_fees,
            discount_amount,
            net_fees
          FROM purchase_receipts 
          WHERE purchase_id = ?
        `,
          [purchase.id]
        );

        if (receipts.length > 0) {
          // Calculate totals from receipts
          const totals = receipts.reduce(
            (acc, receipt) => ({
              totalGrams21kEquivalent:
                acc.totalGrams21kEquivalent + (receipt.total_grams_21k || 0),
              totalBaseFees: acc.totalBaseFees + (receipt.base_fees || 0),
              totalDiscountAmount:
                acc.totalDiscountAmount + (receipt.discount_amount || 0),
              totalNetFees: acc.totalNetFees + (receipt.net_fees || 0),
            }),
            {
              totalGrams21kEquivalent: 0,
              totalBaseFees: 0,
              totalDiscountAmount: 0,
              totalNetFees: 0,
            }
          );

          // Update purchase totals
          await connection.execute(
            `
            UPDATE purchases 
            SET 
              total_grams_21k_equivalent = ?,
              total_base_fees = ?,
              total_discount_amount = ?,
              total_net_fees = ?
            WHERE id = ?
          `,
            [
              totals.totalGrams21kEquivalent,
              totals.totalBaseFees,
              totals.totalDiscountAmount,
              totals.totalNetFees,
              purchase.id,
            ]
          );

          // Update purchase_supplier totals
          await connection.execute(
            `
            UPDATE purchase_suppliers 
            SET 
              total_grams_21k_equivalent = ?,
              total_base_fees = ?,
              total_discount_amount = ?,
              total_net_fees = ?,
              receipt_count = ?
            WHERE purchase_id = ? AND supplier_id = ?
          `,
            [
              totals.totalGrams21kEquivalent,
              totals.totalBaseFees,
              totals.totalDiscountAmount,
              totals.totalNetFees,
              receipts.length,
              purchase.id,
              supplierId,
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error recalculating purchase totals:", error);
      throw error;
    }
  }

  /**
   * Recalculate discounts for all receipts affected by a specific purchase
   * @param {string} purchaseId - Purchase ID
   * @returns {Promise<Object>} Recalculation results
   */
  static async recalculatePurchaseDiscounts(purchaseId) {
    try {
      console.log(`🔄 Recalculating discounts for purchase ${purchaseId}`);

      // Get purchase details
      const [purchases] = await pool.execute(
        `
        SELECT 
          p.id,
          p.supplier_id,
          DATE_FORMAT(p.created_at, '%Y-%m') as month
        FROM purchases p
        WHERE p.id = ?
      `,
        [purchaseId]
      );

      if (purchases.length === 0) {
        return { success: false, error: "Purchase not found" };
      }

      const purchase = purchases[0];

      // Recalculate for the supplier in that month
      const result = await this.recalculateSupplierDiscounts(
        purchase.supplier_id,
        purchase.month
      );

      return result;
    } catch (error) {
      console.error("Error recalculating purchase discounts:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current month in YYYY-MM format
   * @returns {string} Current month
   */
  static getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }
}

module.exports = RecalculationService;

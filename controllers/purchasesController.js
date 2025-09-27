const { pool } = require("../config/database");
const {
  PURCHASE_CONSTANTS,
  STATUS_VALUES,
  KARAT_TYPES,
} = require("../constants");
const DiscountCalculationService = require("../services/discountCalculationService");
const RecalculationService = require("../services/recalculationService");

// ============================================================================
// PURCHASES CONTROLLER
// ============================================================================
// This controller handles all CRUD operations for the purchases table
// Includes foreign key validation with stores table and status management
// ============================================================================

/**
 * Get all purchases with store information and optional filters
 * GET /api/purchases?store=STORE_ID&status=STATUS&search=QUERY&page=1&limit=20
 */
const getAllPurchases = async (req, res) => {
  try {
    // Check if we should verify discounts
    const verifyDiscounts = req.query.verify_discounts === "true";
    let recalculatedCount = 0;

    if (verifyDiscounts) {
      console.log(
        "🔄 Verifying and recalculating discounts for all purchases..."
      );

      // Get all suppliers from current month purchases
      const [suppliers] = await pool.execute(`
        SELECT DISTINCT pr.supplier_id
        FROM purchases p
        JOIN purchase_receipts pr ON p.id = pr.purchase_id
        WHERE DATE_FORMAT(p.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      `);

      // Recalculate discounts for each supplier in the current month
      const suppliersToRecalculate = new Set();
      suppliers.forEach((supplier) => {
        suppliersToRecalculate.add(supplier.supplier_id);
      });

      for (const supplierId of suppliersToRecalculate) {
        const currentMonth = RecalculationService.getCurrentMonth();
        const result = await RecalculationService.recalculateSupplierDiscounts(
          supplierId,
          currentMonth
        );
        if (result.success) {
          recalculatedCount += result.updated || 0;
          console.log(
            `✅ Recalculated ${result.updated} receipts for supplier ${supplierId}`
          );
        }
      }

      console.log(`🔄 Total receipts recalculated: ${recalculatedCount}`);
    }

    // Simple query first to test
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        s.name as store_name,
        s.code as store_code
      FROM purchases p
      JOIN stores s ON p.store_id = s.id
      ORDER BY p.created_at DESC
    `);

    const response = {
      success: true,
      data: rows,
      count: rows.length,
      ...(verifyDiscounts && { recalculated: recalculatedCount }),
    };

    console.log(
      "📤 GET /api/purchases Response:",
      JSON.stringify(response, null, 2)
    );
    res.json(response);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    const errorResponse = {
      success: false,
      error: "Failed to fetch purchases",
      message: error.message,
    };
    console.log(
      "📤 GET /api/purchases Error Response:",
      JSON.stringify(errorResponse, null, 2)
    );
    res.status(500).json(errorResponse);
  }
};

/**
 * Get single purchase by ID with store information
 * GET /api/purchases/:id
 */
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        p.*,
        s.name as store_name,
        s.code as store_code
      FROM purchases p
      JOIN stores s ON p.store_id = s.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      const notFoundResponse = {
        success: false,
        error: "Purchase not found",
      };
      console.log(
        "📤 GET /api/purchases/:id Not Found Response:",
        JSON.stringify(notFoundResponse, null, 2)
      );
      return res.status(404).json(notFoundResponse);
    }

    const response = {
      success: true,
      data: rows[0],
    };
    console.log(
      "📤 GET /api/purchases/:id Response:",
      JSON.stringify(response, null, 2)
    );
    res.json(response);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase",
      message: error.message,
    });
  }
};

/**
 * Create new purchase
 * POST /api/purchases
 * Required fields: id, store_id, supplier_id, date
 * Optional fields: status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date
 * Automatically creates corresponding records in:
 * - purchase_suppliers table
 * - purchase_receipts table (receipt #1)
 */
const createPurchase = async (req, res) => {
  try {
    const {
      id,
      store_id,
      supplier_id,
      date,
      status = STATUS_VALUES.PENDING,
      total_grams_21k_equivalent = 0,
      total_base_fees = 0,
      total_discount_amount = 0,
      total_net_fees = 0,
      due_date,
      receipts = [], // New field for individual receipts
    } = req.body;

    // Validation
    if (!id || !store_id || !supplier_id || !date) {
      const validationResponse = {
        success: false,
        error: "Missing required fields",
        required: ["id", "store_id", "supplier_id", "date"],
      };
      console.log(
        "📤 POST /api/purchases Validation Error Response:",
        JSON.stringify(validationResponse, null, 2)
      );
      return res.status(400).json(validationResponse);
    }

    // Validate status
    if (!["Paid", "Pending", "Partial", "Overdue"].includes(status)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid status. Must be one of: Paid, Pending, Partial, Overdue",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Validate due_date format if provided
    if (due_date && !dateRegex.test(due_date)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due_date format. Use YYYY-MM-DD",
      });
    }

    // Validate numeric fields
    if (total_grams_21k_equivalent < 0) {
      return res.status(400).json({
        success: false,
        error: "total_grams_21k_equivalent cannot be negative",
      });
    }

    // Check if store exists
    const [storeCheck] = await pool.execute(
      "SELECT id, name FROM stores WHERE id = ?",
      [store_id]
    );

    if (storeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Store not found",
      });
    }

    // Check if supplier exists
    const [supplierCheck] = await pool.execute(
      "SELECT id, name FROM suppliers WHERE id = ?",
      [supplier_id]
    );

    if (supplierCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Supplier not found",
      });
    }

    // Start transaction to ensure both purchase and purchase_supplier are created
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create the purchase
      await connection.execute(
        `INSERT INTO purchases (id, store_id, date, status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          store_id,
          date,
          status,
          total_grams_21k_equivalent,
          total_base_fees,
          total_discount_amount,
          total_net_fees,
          due_date || null,
        ]
      );

      // Create the purchase_supplier record
      const purchaseSupplierId = `ps-${id}-${supplier_id}`;
      await connection.execute(
        `INSERT INTO purchase_suppliers (id, purchase_id, supplier_id, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, receipt_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseSupplierId,
          id,
          supplier_id,
          total_grams_21k_equivalent,
          total_base_fees,
          total_discount_amount,
          total_net_fees,
          0, // receipt_count starts at 0
        ]
      );

      // Create individual receipts if provided
      let createdReceipts = [];
      if (receipts && receipts.length > 0) {
        for (let i = 0; i < receipts.length; i++) {
          const receipt = receipts[i];
          const receiptId = `pr-${id}-${receipt.supplier_id}-${receipt.receipt_number}`;

          // Calculate grams based on karat type
          const grams18k =
            receipt.karat_type === KARAT_TYPES.EIGHTEEN ? receipt.grams : 0;
          const grams21k =
            receipt.karat_type === KARAT_TYPES.TWENTY_ONE ? receipt.grams : 0;
          const totalGrams21k =
            receipt.karat_type === KARAT_TYPES.EIGHTEEN
              ? receipt.grams * PURCHASE_CONSTANTS.KARAT_CONVERSION_RATE
              : receipt.grams;

          // Calculate base fee if not provided
          const baseFee =
            receipt.total_base_fee ||
            receipt.grams *
              (receipt.base_fee_per_gram ||
                PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM);

          // Calculate discount automatically using the actual base fee
          const discountResult =
            await DiscountCalculationService.calculateReceiptDiscount(
              receipt.supplier_id,
              receipt.grams,
              receipt.karat_type,
              id,
              baseFee
            );

          // Calculate net fee
          const netFee = baseFee - discountResult.discountAmount;

          await connection.execute(
            `INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              receiptId,
              id,
              receipt.supplier_id,
              receipt.receipt_number,
              grams18k,
              grams21k,
              totalGrams21k,
              baseFee,
              discountResult.discountRate,
              discountResult.discountAmount,
              netFee,
            ]
          );

          createdReceipts.push({
            id: receiptId,
            purchase_id: id,
            supplier_id: receipt.supplier_id,
            receipt_number: receipt.receipt_number,
            receipt_date: receipt.receipt_date,
            karat_type: receipt.karat_type,
            grams: receipt.grams,
            base_fee_per_gram:
              receipt.base_fee_per_gram || PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM,
            discount_percentage: discountResult.discountRate,
            net_fee_per_gram: netFee / receipt.grams,
            total_base_fee: baseFee,
            total_discount_amount: discountResult.discountAmount,
            total_net_fee: netFee,
            notes: receipt.notes,
            discount_tier: discountResult.tier,
            monthly_total: discountResult.monthlyTotal,
          });
        }
      } else {
        // Create a default receipt if no receipts provided (backward compatibility)
        const purchaseReceiptId = `pr-${id}-${supplier_id}-1`;
        const receiptNumber = 1;
        const receiptDate = date;

        // Use calculated values or provided values
        const baseFee =
          total_base_fees ||
          total_grams_21k_equivalent * PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM;

        // Calculate discount automatically for default receipt using the actual base fee
        const discountResult =
          await DiscountCalculationService.calculateReceiptDiscount(
            supplier_id,
            total_grams_21k_equivalent,
            "21", // Default to 21k
            id,
            baseFee
          );
        const discountAmount = discountResult.discountAmount;
        const netFee = baseFee - discountAmount;

        await connection.execute(
          `INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            purchaseReceiptId,
            id,
            supplier_id,
            receiptNumber,
            0, // grams_18k - default to 0
            total_grams_21k_equivalent, // grams_21k - use the total grams as 21k equivalent
            total_grams_21k_equivalent, // total_grams_21k
            baseFee,
            discountResult.discountRate,
            discountAmount,
            netFee,
          ]
        );

        createdReceipts.push({
          id: purchaseReceiptId,
          purchase_id: id,
          supplier_id: supplier_id,
          receipt_number: receiptNumber,
          receipt_date: receiptDate,
          karat_type: "21",
          grams: total_grams_21k_equivalent,
          base_fee_per_gram: PURCHASE_CONSTANTS.BASE_FEE_PER_GRAM,
          discount_percentage: discountResult.discountRate,
          net_fee_per_gram: netFee / total_grams_21k_equivalent,
          total_base_fee: baseFee,
          total_discount_amount: discountAmount,
          total_net_fee: netFee,
          discount_tier: discountResult.tier,
          monthly_total: discountResult.monthlyTotal,
        });
      }

      // Recalculate purchase totals from all created receipts
      const recalculatedTotals =
        DiscountCalculationService.calculatePurchaseTotals(createdReceipts);

      // Update purchase with recalculated totals
      await connection.execute(
        `UPDATE purchases SET 
         total_grams_21k_equivalent = ?, 
         total_base_fees = ?, 
         total_discount_amount = ?, 
         total_net_fees = ? 
         WHERE id = ?`,
        [
          recalculatedTotals.totalGrams21kEquivalent,
          recalculatedTotals.totalBaseFees,
          recalculatedTotals.totalDiscountAmount,
          recalculatedTotals.totalNetFees,
          id,
        ]
      );

      // Update purchase_supplier with recalculated totals
      await connection.execute(
        `UPDATE purchase_suppliers SET 
         total_grams_21k_equivalent = ?, 
         total_base_fees = ?, 
         total_discount_amount = ?, 
         total_net_fees = ?,
         receipt_count = ?
         WHERE purchase_id = ? AND supplier_id = ?`,
        [
          recalculatedTotals.totalGrams21kEquivalent,
          recalculatedTotals.totalBaseFees,
          recalculatedTotals.totalDiscountAmount,
          recalculatedTotals.totalNetFees,
          createdReceipts.length,
          id,
          supplier_id,
        ]
      );

      // Commit the transaction
      await connection.commit();

      // Trigger recalculation for all receipts of this supplier in the current month
      // This ensures discounts are updated for all receipts when monthly totals change
      const currentMonth = RecalculationService.getCurrentMonth();
      console.log(
        `🔄 Triggering recalculation for supplier ${supplier_id} in ${currentMonth}`
      );

      // Run recalculation in background (don't wait for it to complete)
      RecalculationService.recalculateSupplierDiscounts(
        supplier_id,
        currentMonth
      )
        .then((result) => {
          if (result.success) {
            console.log(`✅ Recalculation completed: ${result.message}`);
          } else {
            console.error(`❌ Recalculation failed: ${result.error}`);
          }
        })
        .catch((error) => {
          console.error("❌ Recalculation error:", error);
        });

      const response = {
        success: true,
        message:
          "Purchase, purchase supplier, and purchase receipts created successfully",
        data: {
          id,
          store_id,
          supplier_id,
          date,
          status,
          total_grams_21k_equivalent,
          total_base_fees,
          total_discount_amount,
          total_net_fees,
          due_date,
          store_name: storeCheck[0].name,
          supplier_name: supplierCheck[0].name,
          purchase_supplier_id: purchaseSupplierId,
          created_receipts: createdReceipts,
          receipts_count: createdReceipts.length,
        },
      };
      console.log(
        "📤 POST /api/purchases Response:",
        JSON.stringify(response, null, 2)
      );
      res.status(201).json(response);
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating purchase:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Purchase with this ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create purchase",
      message: error.message,
    });
  }
};

/**
 * Update purchase
 * PUT /api/purchases/:id
 * Optional fields: store_id, date, status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date
 */
const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      store_id,
      date,
      status,
      total_grams_21k_equivalent,
      total_base_fees,
      total_discount_amount,
      total_net_fees,
      due_date,
    } = req.body;

    // Check if purchase exists
    const [existingPurchase] = await pool.execute(
      "SELECT * FROM purchases WHERE id = ?",
      [id]
    );

    if (existingPurchase.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (store_id !== undefined) {
      // Check if new store exists
      const [storeCheck] = await pool.execute(
        "SELECT id FROM stores WHERE id = ?",
        [store_id]
      );

      if (storeCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Store not found",
        });
      }
      updateFields.push("store_id = ?");
      updateValues.push(store_id);
    }

    if (date !== undefined) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD",
        });
      }
      updateFields.push("date = ?");
      updateValues.push(date);
    }

    if (status !== undefined) {
      if (!["Paid", "Pending", "Partial", "Overdue"].includes(status)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid status. Must be one of: Paid, Pending, Partial, Overdue",
        });
      }
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    if (total_grams_21k_equivalent !== undefined) {
      if (total_grams_21k_equivalent < 0) {
        return res.status(400).json({
          success: false,
          error: "total_grams_21k_equivalent cannot be negative",
        });
      }
      updateFields.push("total_grams_21k_equivalent = ?");
      updateValues.push(total_grams_21k_equivalent);
    }

    if (total_base_fees !== undefined) {
      updateFields.push("total_base_fees = ?");
      updateValues.push(total_base_fees);
    }

    if (total_discount_amount !== undefined) {
      updateFields.push("total_discount_amount = ?");
      updateValues.push(total_discount_amount);
    }

    if (total_net_fees !== undefined) {
      updateFields.push("total_net_fees = ?");
      updateValues.push(total_net_fees);
    }

    if (due_date !== undefined) {
      if (due_date !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(due_date)) {
          return res.status(400).json({
            success: false,
            error: "Invalid due_date format. Use YYYY-MM-DD",
          });
        }
      }
      updateFields.push("due_date = ?");
      updateValues.push(due_date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE purchases SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Purchase updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Purchase with this ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update purchase",
      message: error.message,
    });
  }
};

/**
 * Delete purchase
 * DELETE /api/purchases/:id
 */
const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if purchase exists
    const [existingPurchase] = await pool.execute(
      "SELECT * FROM purchases WHERE id = ?",
      [id]
    );

    if (existingPurchase.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Start transaction to ensure both purchase and purchase_suppliers are deleted
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete purchase_receipts records first (due to foreign key constraints)
      const [purchaseReceiptsResult] = await connection.execute(
        "DELETE FROM purchase_receipts WHERE purchase_id = ?",
        [id]
      );

      // Delete purchase_suppliers records (due to foreign key constraints)
      const [purchaseSuppliersResult] = await connection.execute(
        "DELETE FROM purchase_suppliers WHERE purchase_id = ?",
        [id]
      );

      // Delete the purchase
      const [purchaseResult] = await connection.execute(
        "DELETE FROM purchases WHERE id = ?",
        [id]
      );

      // Commit the transaction
      await connection.commit();

      // Trigger recalculation for all receipts of this supplier in the current month
      // This ensures discounts are updated when monthly totals change due to deletion
      const currentMonth = RecalculationService.getCurrentMonth();
      console.log(
        `🔄 Triggering recalculation after purchase deletion for supplier in ${currentMonth}`
      );

      // Run recalculation in background (don't wait for it to complete)
      RecalculationService.recalculateMonthDiscounts(currentMonth)
        .then((result) => {
          if (result.success) {
            console.log(
              `✅ Recalculation completed after deletion: ${result.message}`
            );
          } else {
            console.error(
              `❌ Recalculation failed after deletion: ${result.error}`
            );
          }
        })
        .catch((error) => {
          console.error("❌ Recalculation error after deletion:", error);
        });

      const response = {
        success: true,
        message: "Purchase and related records deleted successfully",
        data: {
          purchase_affected_rows: purchaseResult.affectedRows,
          purchase_suppliers_affected_rows:
            purchaseSuppliersResult.affectedRows,
          purchase_receipts_affected_rows: purchaseReceiptsResult.affectedRows,
        },
      };
      console.log(
        "📤 DELETE /api/purchases Response:",
        JSON.stringify(response, null, 2)
      );
      res.json(response);
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete purchase",
      message: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
};

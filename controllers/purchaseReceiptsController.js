const { pool } = require("../config/database");
const { PURCHASE_CONSTANTS, KARAT_TYPES } = require("../constants");

// ============================================================================
// PURCHASE RECEIPTS CONTROLLER
// ============================================================================
// This controller handles all CRUD operations for the purchase_receipts table
// Includes foreign key validation with purchases and suppliers tables
// ============================================================================

/**
 * Get all purchase receipts with purchase and supplier information
 * GET /api/purchase-receipts
 */
const getAllPurchaseReceipts = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        pr.*,
        p.date as purchase_date,
        p.status as purchase_status,
        s.name as supplier_name,
        s.code as supplier_code,
        st.name as store_name,
        st.code as store_code
      FROM purchase_receipts pr
      JOIN purchases p ON pr.purchase_id = p.id
      JOIN suppliers s ON pr.supplier_id = s.id
      JOIN stores st ON p.store_id = st.id
      ORDER BY pr.created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching purchase receipts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase receipts",
      message: error.message,
    });
  }
};

/**
 * Get single purchase receipt by ID with purchase and supplier information
 * GET /api/purchase-receipts/:id
 */
const getPurchaseReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        pr.*,
        p.date as purchase_date,
        p.status as purchase_status,
        s.name as supplier_name,
        s.code as supplier_code,
        st.name as store_name,
        st.code as store_code
      FROM purchase_receipts pr
      JOIN purchases p ON pr.purchase_id = p.id
      JOIN suppliers s ON pr.supplier_id = s.id
      JOIN stores st ON p.store_id = st.id
      WHERE pr.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase receipt not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching purchase receipt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase receipt",
      message: error.message,
    });
  }
};

/**
 * Get purchase receipts for a specific purchase
 * GET /api/purchase-receipts/purchase/:purchaseId
 */
const getPurchaseReceiptsByPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    // First check if purchase exists
    const [purchaseCheck] = await pool.execute(
      "SELECT id, date, status FROM purchases WHERE id = ?",
      [purchaseId]
    );

    if (purchaseCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        pr.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM purchase_receipts pr
      JOIN suppliers s ON pr.supplier_id = s.id
      WHERE pr.purchase_id = ?
      ORDER BY pr.receipt_number
    `,
      [purchaseId]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      purchase: purchaseCheck[0],
    });
  } catch (error) {
    console.error("Error fetching purchase receipts by purchase:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase receipts for purchase",
      message: error.message,
    });
  }
};

/**
 * Get purchase receipts for a specific supplier
 * GET /api/purchase-receipts/supplier/:supplierId
 */
const getPurchaseReceiptsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    // First check if supplier exists
    const [supplierCheck] = await pool.execute(
      "SELECT id, name, code FROM suppliers WHERE id = ?",
      [supplierId]
    );

    if (supplierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        pr.*,
        p.date as purchase_date,
        p.status as purchase_status,
        st.name as store_name,
        st.code as store_code
      FROM purchase_receipts pr
      JOIN purchases p ON pr.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
      WHERE pr.supplier_id = ?
      ORDER BY pr.receipt_date DESC, pr.created_at DESC
    `,
      [supplierId]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      supplier: supplierCheck[0],
    });
  } catch (error) {
    console.error("Error fetching purchase receipts by supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase receipts for supplier",
      message: error.message,
    });
  }
};

/**
 * Get purchase receipt by receipt number
 * GET /api/purchase-receipts/receipt/:receiptNumber
 */
const getPurchaseReceiptByReceiptNumber = async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        pr.*,
        p.date as purchase_date,
        p.status as purchase_status,
        s.name as supplier_name,
        s.code as supplier_code,
        st.name as store_name,
        st.code as store_code
      FROM purchase_receipts pr
      JOIN purchases p ON pr.purchase_id = p.id
      JOIN suppliers s ON pr.supplier_id = s.id
      JOIN stores st ON p.store_id = st.id
      WHERE pr.receipt_number = ?
    `,
      [receiptNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase receipt not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching purchase receipt by receipt number:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase receipt by receipt number",
      message: error.message,
    });
  }
};

/**
 * Create multiple purchase receipts in bulk
 * POST /api/purchase-receipts/bulk
 * Body: { purchase_id, receipts: [{ supplier_id, receipt_number, receipt_date, karat_type, grams, base_fee_per_gram, net_fee_per_gram, total_base_fee, total_net_fee, discount_percentage?, total_discount_amount?, notes? }] }
 */
const createBulkPurchaseReceipts = async (req, res) => {
  try {
    const { purchase_id, receipts } = req.body;

    // Validation
    if (
      !purchase_id ||
      !receipts ||
      !Array.isArray(receipts) ||
      receipts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["purchase_id", "receipts"],
      });
    }

    // Check if purchase exists
    const [purchaseCheck] = await pool.execute(
      "SELECT id FROM purchases WHERE id = ?",
      [purchase_id]
    );

    if (purchaseCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Validate each receipt
    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i];
      if (
        !receipt.supplier_id ||
        !receipt.receipt_number ||
        !receipt.receipt_date ||
        !receipt.karat_type ||
        receipt.grams === undefined ||
        receipt.base_fee_per_gram === undefined ||
        receipt.net_fee_per_gram === undefined ||
        receipt.total_base_fee === undefined ||
        receipt.total_net_fee === undefined
      ) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields in receipt ${i + 1}`,
          required: [
            "supplier_id",
            "receipt_number",
            "receipt_date",
            "karat_type",
            "grams",
            "base_fee_per_gram",
            "net_fee_per_gram",
            "total_base_fee",
            "total_net_fee",
          ],
        });
      }

      // Validate karat_type
      if (!["18", "21"].includes(receipt.karat_type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid karat_type in receipt ${i + 1}. Must be '18' or '21'`,
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt.receipt_date)) {
        return res.status(400).json({
          success: false,
          error: `Invalid receipt_date format in receipt ${
            i + 1
          }. Use YYYY-MM-DD`,
        });
      }

      // Validate numeric fields
      if (
        receipt.grams <= 0 ||
        receipt.base_fee_per_gram < 0 ||
        receipt.net_fee_per_gram < 0 ||
        receipt.total_base_fee < 0 ||
        receipt.total_net_fee < 0 ||
        (receipt.discount_percentage &&
          (receipt.discount_percentage < 0 ||
            receipt.discount_percentage > 100)) ||
        (receipt.total_discount_amount && receipt.total_discount_amount < 0)
      ) {
        return res.status(400).json({
          success: false,
          error: `Invalid numeric values in receipt ${i + 1}`,
        });
      }
    }

    // Check if all suppliers exist
    const supplierIds = [...new Set(receipts.map((r) => r.supplier_id))];
    const [supplierCheck] = await pool.execute(
      `SELECT id FROM suppliers WHERE id IN (${supplierIds
        .map(() => "?")
        .join(",")})`,
      supplierIds
    );

    if (supplierCheck.length !== supplierIds.length) {
      return res.status(400).json({
        success: false,
        error: "One or more suppliers not found",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const createdReceipts = [];

      for (const receipt of receipts) {
        const receiptId = `pr-${purchase_id}-${receipt.supplier_id}-${receipt.receipt_number}`;

        // Calculate grams based on karat type
        const grams18k =
          receipt.karat_type === KARAT_TYPES.EIGHTEEN ? receipt.grams : 0;
        const grams21k =
          receipt.karat_type === KARAT_TYPES.TWENTY_ONE ? receipt.grams : 0;
        const totalGrams21k =
          receipt.karat_type === KARAT_TYPES.EIGHTEEN
            ? receipt.grams * PURCHASE_CONSTANTS.KARAT_CONVERSION_RATE
            : receipt.grams;

        await connection.execute(
          `INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            receiptId,
            purchase_id,
            receipt.supplier_id,
            receipt.receipt_number,
            grams18k,
            grams21k,
            totalGrams21k,
            receipt.total_base_fee,
            receipt.discount_percentage || 0,
            receipt.total_discount_amount || 0,
            receipt.total_net_fee,
          ]
        );

        createdReceipts.push({
          id: receiptId,
          purchase_id,
          supplier_id: receipt.supplier_id,
          receipt_number: receipt.receipt_number,
          receipt_date: receipt.receipt_date,
          karat_type: receipt.karat_type,
          grams: receipt.grams,
          base_fee_per_gram: receipt.base_fee_per_gram,
          discount_percentage: receipt.discount_percentage || 0,
          net_fee_per_gram: receipt.net_fee_per_gram,
          total_base_fee: receipt.total_base_fee,
          total_discount_amount: receipt.total_discount_amount || 0,
          total_net_fee: receipt.total_net_fee,
          notes: receipt.notes,
        });
      }

      // Commit transaction
      await connection.commit();

      res.status(201).json({
        success: true,
        message: `${createdReceipts.length} purchase receipts created successfully`,
        data: createdReceipts,
        count: createdReceipts.length,
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating bulk purchase receipts:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error:
          "One or more purchase receipts with this receipt number already exist",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create purchase receipts",
      message: error.message,
    });
  }
};

/**
 * Create new purchase receipt
 * POST /api/purchase-receipts
 * Required fields: id, purchase_id, supplier_id, receipt_number, receipt_date, karat_type, grams, base_fee_per_gram, net_fee_per_gram, total_base_fee, total_net_fee
 * Optional fields: discount_percentage, total_discount_amount, notes
 */
const createPurchaseReceipt = async (req, res) => {
  try {
    const {
      id,
      purchase_id,
      supplier_id,
      receipt_number,
      receipt_date,
      karat_type,
      grams,
      base_fee_per_gram,
      discount_percentage = 0,
      net_fee_per_gram,
      total_base_fee,
      total_discount_amount = 0,
      total_net_fee,
      notes,
    } = req.body;

    // Validation
    if (
      !id ||
      !purchase_id ||
      !supplier_id ||
      !receipt_number ||
      !receipt_date ||
      !karat_type ||
      grams === undefined ||
      base_fee_per_gram === undefined ||
      net_fee_per_gram === undefined ||
      total_base_fee === undefined ||
      total_net_fee === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "id",
          "purchase_id",
          "supplier_id",
          "receipt_number",
          "receipt_date",
          "karat_type",
          "grams",
          "base_fee_per_gram",
          "net_fee_per_gram",
          "total_base_fee",
          "total_net_fee",
        ],
      });
    }

    // Validate karat_type
    if (!["18", "21"].includes(karat_type)) {
      return res.status(400).json({
        success: false,
        error: "karat_type must be either '18' or '21'",
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt_date)) {
      return res.status(400).json({
        success: false,
        error: "Invalid receipt_date format",
        message: "Receipt date must be in YYYY-MM-DD format.",
      });
    }

    // Validate numeric fields
    if (
      grams <= 0 ||
      base_fee_per_gram < 0 ||
      net_fee_per_gram < 0 ||
      total_base_fee < 0 ||
      total_net_fee < 0 ||
      discount_percentage < 0 ||
      discount_percentage > 100 ||
      total_discount_amount < 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid numeric values. Grams must be > 0, fees must be >= 0, discount percentage must be 0-100",
      });
    }

    // Check if purchase exists
    const [purchaseCheck] = await pool.execute(
      "SELECT id FROM purchases WHERE id = ?",
      [purchase_id]
    );

    if (purchaseCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Check if supplier exists
    const [supplierCheck] = await pool.execute(
      "SELECT id FROM suppliers WHERE id = ?",
      [supplier_id]
    );

    if (supplierCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Supplier not found",
      });
    }

    // Calculate grams based on karat type
    const grams18k = karat_type === "18" ? grams : 0;
    const grams21k = karat_type === "21" ? grams : 0;
    const totalGrams21k = karat_type === "18" ? grams * 0.857 : grams; // Convert 18k to 21k equivalent

    const [result] = await pool.execute(
      `INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        purchase_id,
        supplier_id,
        receipt_number,
        grams18k,
        grams21k,
        totalGrams21k,
        total_base_fee,
        discount_percentage,
        total_discount_amount,
        total_net_fee,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Purchase receipt created successfully",
      data: {
        id,
        purchase_id,
        supplier_id,
        receipt_number,
        receipt_date,
        karat_type,
        grams,
        base_fee_per_gram,
        discount_percentage,
        net_fee_per_gram,
        total_base_fee,
        total_discount_amount,
        total_net_fee,
        notes,
      },
    });
  } catch (error) {
    console.error("Error creating purchase receipt:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Purchase receipt with this receipt number already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create purchase receipt",
      message: error.message,
    });
  }
};

/**
 * Update purchase receipt
 * PUT /api/purchase-receipts/:id
 * Optional fields: purchase_id, supplier_id, receipt_number, receipt_date, karat_type, grams, base_fee_per_gram, discount_percentage, net_fee_per_gram, total_base_fee, total_discount_amount, total_net_fee, notes
 */
const updatePurchaseReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      purchase_id,
      supplier_id,
      receipt_number,
      receipt_date,
      karat_type,
      grams,
      base_fee_per_gram,
      discount_percentage,
      net_fee_per_gram,
      total_base_fee,
      total_discount_amount,
      total_net_fee,
      notes,
    } = req.body;

    // Check if purchase receipt exists
    const [existingRecord] = await pool.execute(
      "SELECT * FROM purchase_receipts WHERE id = ?",
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase receipt not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (purchase_id !== undefined) {
      // Check if new purchase exists
      const [purchaseCheck] = await pool.execute(
        "SELECT id FROM purchases WHERE id = ?",
        [purchase_id]
      );

      if (purchaseCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Purchase not found",
        });
      }
      updateFields.push("purchase_id = ?");
      updateValues.push(purchase_id);
    }

    if (supplier_id !== undefined) {
      // Check if new supplier exists
      const [supplierCheck] = await pool.execute(
        "SELECT id FROM suppliers WHERE id = ?",
        [supplier_id]
      );

      if (supplierCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Supplier not found",
        });
      }
      updateFields.push("supplier_id = ?");
      updateValues.push(supplier_id);
    }

    if (receipt_number !== undefined) {
      updateFields.push("receipt_number = ?");
      updateValues.push(receipt_number);
    }

    if (receipt_date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt_date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid receipt_date format",
          message: "Receipt date must be in YYYY-MM-DD format.",
        });
      }
      updateFields.push("receipt_date = ?");
      updateValues.push(receipt_date);
    }

    if (karat_type !== undefined) {
      if (!["18", "21"].includes(karat_type)) {
        return res.status(400).json({
          success: false,
          error: "karat_type must be either '18' or '21'",
        });
      }
      updateFields.push("karat_type = ?");
      updateValues.push(karat_type);
    }

    if (grams !== undefined) {
      if (grams <= 0) {
        return res.status(400).json({
          success: false,
          error: "grams must be > 0",
        });
      }
      updateFields.push("grams = ?");
      updateValues.push(grams);
    }

    if (base_fee_per_gram !== undefined) {
      if (base_fee_per_gram < 0) {
        return res.status(400).json({
          success: false,
          error: "base_fee_per_gram must be >= 0",
        });
      }
      updateFields.push("base_fee_per_gram = ?");
      updateValues.push(base_fee_per_gram);
    }

    if (discount_percentage !== undefined) {
      if (discount_percentage < 0 || discount_percentage > 100) {
        return res.status(400).json({
          success: false,
          error: "discount_percentage must be between 0 and 100",
        });
      }
      updateFields.push("discount_percentage = ?");
      updateValues.push(discount_percentage);
    }

    if (net_fee_per_gram !== undefined) {
      if (net_fee_per_gram < 0) {
        return res.status(400).json({
          success: false,
          error: "net_fee_per_gram must be >= 0",
        });
      }
      updateFields.push("net_fee_per_gram = ?");
      updateValues.push(net_fee_per_gram);
    }

    if (total_base_fee !== undefined) {
      if (total_base_fee < 0) {
        return res.status(400).json({
          success: false,
          error: "total_base_fee must be >= 0",
        });
      }
      updateFields.push("total_base_fee = ?");
      updateValues.push(total_base_fee);
    }

    if (total_discount_amount !== undefined) {
      if (total_discount_amount < 0) {
        return res.status(400).json({
          success: false,
          error: "total_discount_amount must be >= 0",
        });
      }
      updateFields.push("total_discount_amount = ?");
      updateValues.push(total_discount_amount);
    }

    if (total_net_fee !== undefined) {
      if (total_net_fee < 0) {
        return res.status(400).json({
          success: false,
          error: "total_net_fee must be >= 0",
        });
      }
      updateFields.push("total_net_fee = ?");
      updateValues.push(total_net_fee);
    }

    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(notes || null); // Convert undefined to null
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE purchase_receipts SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Purchase receipt updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating purchase receipt:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Purchase receipt with this receipt number already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update purchase receipt",
      message: error.message,
    });
  }
};

/**
 * Delete purchase receipt
 * DELETE /api/purchase-receipts/:id
 */
const deletePurchaseReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if purchase receipt exists
    const [existingRecord] = await pool.execute(
      "SELECT * FROM purchase_receipts WHERE id = ?",
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase receipt not found",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM purchase_receipts WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Purchase receipt deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting purchase receipt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete purchase receipt",
      message: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  getAllPurchaseReceipts,
  getPurchaseReceiptById,
  getPurchaseReceiptsByPurchase,
  getPurchaseReceiptsBySupplier,
  getPurchaseReceiptByReceiptNumber,
  createBulkPurchaseReceipts,
  createPurchaseReceipt,
  updatePurchaseReceipt,
  deletePurchaseReceipt,
};

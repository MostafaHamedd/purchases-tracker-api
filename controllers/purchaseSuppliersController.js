const { pool } = require("../config/database");
const RecalculationService = require("../services/recalculationService");

// ============================================================================
// PURCHASE SUPPLIERS CONTROLLER
// ============================================================================
// This controller handles all CRUD operations for the purchase_suppliers table
// Includes foreign key validation with purchases and suppliers tables
// ============================================================================

/**
 * Get all purchase suppliers with purchase and supplier information
 * GET /api/purchase-suppliers
 * Supports query parameters: purchase_id, supplier_id
 */
const getAllPurchaseSuppliers = async (req, res) => {
  try {
    const { purchase_id, supplier_id } = req.query;

    let query = `
      SELECT 
        ps.*,
        p.date as purchase_date,
        p.status as purchase_status,
        s.name as supplier_name,
        s.code as supplier_code,
        st.name as store_name,
        st.code as store_code
      FROM purchase_suppliers ps
      JOIN purchases p ON ps.purchase_id = p.id
      JOIN suppliers s ON ps.supplier_id = s.id
      JOIN stores st ON p.store_id = st.id
    `;

    const conditions = [];
    const params = [];

    // Add purchase_id filter if provided
    if (purchase_id) {
      conditions.push("ps.purchase_id = ?");
      params.push(purchase_id);
    }

    // Add supplier_id filter if provided
    if (supplier_id) {
      conditions.push("ps.supplier_id = ?");
      params.push(supplier_id);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY ps.created_at DESC";

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching purchase suppliers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase suppliers",
      message: error.message,
    });
  }
};

/**
 * Get single purchase supplier by ID with purchase and supplier information
 * GET /api/purchase-suppliers/:id
 */
const getPurchaseSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        ps.*,
        p.date as purchase_date,
        p.status as purchase_status,
        s.name as supplier_name,
        s.code as supplier_code,
        st.name as store_name,
        st.code as store_code
      FROM purchase_suppliers ps
      JOIN purchases p ON ps.purchase_id = p.id
      JOIN suppliers s ON ps.supplier_id = s.id
      JOIN stores st ON p.store_id = st.id
      WHERE ps.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase supplier not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching purchase supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase supplier",
      message: error.message,
    });
  }
};

/**
 * Get purchase suppliers for a specific purchase
 * GET /api/purchase-suppliers/purchase/:purchaseId
 */
const getPurchaseSuppliersByPurchase = async (req, res) => {
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
        ps.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM purchase_suppliers ps
      JOIN suppliers s ON ps.supplier_id = s.id
      WHERE ps.purchase_id = ?
      ORDER BY ps.karat_type, ps.supplier_id
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
    console.error("Error fetching purchase suppliers by purchase:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase suppliers for purchase",
      message: error.message,
    });
  }
};

/**
 * Get purchase suppliers for a specific supplier
 * GET /api/purchase-suppliers/supplier/:supplierId
 */
const getPurchaseSuppliersBySupplier = async (req, res) => {
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
        ps.*,
        p.date as purchase_date,
        p.status as purchase_status,
        st.name as store_name,
        st.code as store_code
      FROM purchase_suppliers ps
      JOIN purchases p ON ps.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
      WHERE ps.supplier_id = ?
      ORDER BY ps.created_at DESC
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
    console.error("Error fetching purchase suppliers by supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase suppliers for supplier",
      message: error.message,
    });
  }
};

/**
 * Create new purchase supplier
 * POST /api/purchase-suppliers
 * Required fields: id, purchase_id, supplier_id, total_grams_21k_equivalent, total_base_fees, total_net_fees
 * Optional fields: total_grams_18k, total_grams_21k, total_discount_amount, receipt_count
 */
const createPurchaseSupplier = async (req, res) => {
  try {
    const {
      id,
      purchase_id,
      supplier_id,
      total_grams_18k = 0,
      total_grams_21k = 0,
      total_grams_21k_equivalent,
      total_base_fees,
      total_discount_amount = 0,
      total_net_fees,
      receipt_count = 0,
    } = req.body;

    // Validation
    if (
      !id ||
      !purchase_id ||
      !supplier_id ||
      total_grams_21k_equivalent === undefined ||
      total_base_fees === undefined ||
      total_net_fees === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "id",
          "purchase_id",
          "supplier_id",
          "total_grams_21k_equivalent",
          "total_base_fees",
          "total_net_fees",
        ],
      });
    }

    // Validate numeric fields
    if (
      total_grams_21k_equivalent < 0 ||
      total_base_fees < 0 ||
      total_net_fees < 0 ||
      total_discount_amount < 0 ||
      receipt_count < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid numeric values. All amounts must be >= 0",
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

    const [result] = await pool.execute(
      `INSERT INTO purchase_suppliers (id, purchase_id, supplier_id, total_grams_18k, total_grams_21k, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, receipt_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        purchase_id,
        supplier_id,
        total_grams_18k,
        total_grams_21k,
        total_grams_21k_equivalent,
        total_base_fees,
        total_discount_amount,
        total_net_fees,
        receipt_count,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Purchase supplier created successfully",
      data: {
        id,
        purchase_id,
        supplier_id,
        total_grams_18k,
        total_grams_21k,
        total_grams_21k_equivalent,
        total_base_fees,
        total_discount_amount,
        total_net_fees,
        receipt_count,
      },
    });
  } catch (error) {
    console.error("Error creating purchase supplier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error:
          "Purchase supplier with this combination of purchase, supplier, and karat type already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create purchase supplier",
      message: error.message,
    });
  }
};

/**
 * Update purchase supplier
 * PUT /api/purchase-suppliers/:id
 * Optional fields: purchase_id, supplier_id, karat_type, grams, base_fee_per_gram, discount_percentage, net_fee_per_gram, total_base_fee, total_discount_amount, total_net_fee
 */
const updatePurchaseSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      purchase_id,
      supplier_id,
      karat_type,
      grams,
      base_fee_per_gram,
      discount_percentage,
      net_fee_per_gram,
      total_base_fee,
      total_discount_amount,
      total_net_fee,
    } = req.body;

    // Check if purchase supplier exists
    const [existingRecord] = await pool.execute(
      "SELECT * FROM purchase_suppliers WHERE id = ?",
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase supplier not found",
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

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE purchase_suppliers SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Purchase supplier updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating purchase supplier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error:
          "Purchase supplier with this combination of purchase, supplier, and karat type already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update purchase supplier",
      message: error.message,
    });
  }
};

/**
 * Delete purchase supplier
 * DELETE /api/purchase-suppliers/:id
 */
const deletePurchaseSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if purchase supplier exists
    const [existingRecord] = await pool.execute(
      "SELECT * FROM purchase_suppliers WHERE id = ?",
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase supplier not found",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM purchase_suppliers WHERE id = ?",
      [id]
    );

    // Trigger recalculation for all receipts of this supplier in the current month
    // This ensures discounts are updated when monthly totals change due to deletion
    const currentMonth = RecalculationService.getCurrentMonth();
    console.log(
      `🔄 Triggering recalculation after purchase supplier deletion for supplier in ${currentMonth}`
    );

    // Run recalculation in background (don't wait for it to complete)
    RecalculationService.recalculateMonthDiscounts(currentMonth)
      .then((result) => {
        if (result.success) {
          console.log(
            `✅ Recalculation completed after purchase supplier deletion: ${result.message}`
          );
        } else {
          console.error(
            `❌ Recalculation failed after purchase supplier deletion: ${result.error}`
          );
        }
      })
      .catch((error) => {
        console.error("❌ Recalculation error after purchase supplier deletion:", error);
      });

    res.json({
      success: true,
      message: "Purchase supplier deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting purchase supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete purchase supplier",
      message: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  getAllPurchaseSuppliers,
  getPurchaseSupplierById,
  getPurchaseSuppliersByPurchase,
  getPurchaseSuppliersBySupplier,
  createPurchaseSupplier,
  updatePurchaseSupplier,
  deletePurchaseSupplier,
};

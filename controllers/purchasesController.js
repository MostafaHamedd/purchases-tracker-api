const { pool } = require("../config/database");

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
 * Required fields: id, store_id, date
 * Optional fields: status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date
 */
const createPurchase = async (req, res) => {
  try {
    const {
      id,
      store_id,
      date,
      status = "Pending",
      total_grams_21k_equivalent = 0,
      total_base_fees = 0,
      total_discount_amount = 0,
      total_net_fees = 0,
      due_date,
    } = req.body;

    // Validation
    if (!id || !store_id || !date) {
      const validationResponse = {
        success: false,
        error: "Missing required fields",
        required: ["id", "store_id", "date"],
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

    const [result] = await pool.execute(
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

    const response = {
      success: true,
      message: "Purchase created successfully",
      data: {
        id,
        store_id,
        date,
        status,
        total_grams_21k_equivalent,
        total_base_fees,
        total_discount_amount,
        total_net_fees,
        due_date,
        store_name: storeCheck[0].name,
      },
    };
    console.log(
      "📤 POST /api/purchases Response:",
      JSON.stringify(response, null, 2)
    );
    res.status(201).json(response);
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

    const [result] = await pool.execute("DELETE FROM purchases WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "Purchase deleted successfully",
      affectedRows: result.affectedRows,
    });
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

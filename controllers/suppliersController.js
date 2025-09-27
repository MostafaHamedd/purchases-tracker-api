const { pool } = require("../config/database");
const { logResponse, logRequest } = require("../utils/responseLogger");

// ============================================================================
// SUPPLIERS CONTROLLER
// ============================================================================
// This controller handles all CRUD operations for the suppliers table
// Following the same pattern as storesController for consistency
// ============================================================================

/**
 * Get all suppliers
 * GET /api/suppliers
 */
const getAllSuppliers = async (req, res) => {
  try {
    logRequest("GET", "/api/suppliers", req.query);

    const [rows] = await pool.execute(
      "SELECT * FROM suppliers ORDER BY created_at DESC"
    );

    const response = {
      success: true,
      data: rows,
      count: rows.length,
    };

    logResponse("GET", "/api/suppliers", 200, response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    const errorResponse = {
      success: false,
      error: "Failed to fetch suppliers",
      message: error.message,
    };
    logResponse("GET", "/api/suppliers", 500, errorResponse, true);
    res.status(500).json(errorResponse);
  }
};

/**
 * Get single supplier by ID
 * GET /api/suppliers/:id
 */
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute("SELECT * FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch supplier",
      message: error.message,
    });
  }
};

/**
 * Create new supplier
 * POST /api/suppliers
 * Required fields: id, name, code
 * Optional fields: is_active (defaults to true)
 */
const createSupplier = async (req, res) => {
  try {
    logRequest("POST", "/api/suppliers", req.body);

    const {
      id,
      name,
      code,
      supplier_karat_type = "21",
      is_active = true,
    } = req.body;

    // Validation
    if (!id || !name || !code) {
      const validationResponse = {
        success: false,
        error: "Missing required fields",
        required: ["id", "name", "code"],
      };
      logResponse("POST", "/api/suppliers", 400, validationResponse, true);
      return res.status(400).json(validationResponse);
    }

    // Validate supplier_karat_type
    if (!["18", "21"].includes(supplier_karat_type)) {
      return res.status(400).json({
        success: false,
        error: "supplier_karat_type must be either '18' or '21'",
      });
    }

    // Validate code format (should be uppercase, 3-10 characters)
    if (!/^[A-Z0-9]{3,10}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: "Code must be 3-10 uppercase letters/numbers only",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO suppliers (id, name, code, supplier_karat_type, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, code, supplier_karat_type, is_active]
    );

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: {
        id,
        name,
        code,
        supplier_karat_type,
        is_active,
      },
    });
  } catch (error) {
    console.error("Error creating supplier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Supplier with this ID or code already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create supplier",
      message: error.message,
    });
  }
};

/**
 * Update supplier
 * PUT /api/suppliers/:id
 * Optional fields: name, code, supplier_karat_type, is_active
 */
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, supplier_karat_type, is_active } = req.body;

    // Check if supplier exists
    const [existingSupplier] = await pool.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [id]
    );

    if (existingSupplier.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (code !== undefined) {
      // Validate code format if provided
      if (!/^[A-Z0-9]{3,10}$/.test(code)) {
        return res.status(400).json({
          success: false,
          error: "Code must be 3-10 uppercase letters/numbers only",
        });
      }
      updateFields.push("code = ?");
      updateValues.push(code);
    }

    if (supplier_karat_type !== undefined) {
      if (!["18", "21"].includes(supplier_karat_type)) {
        return res.status(400).json({
          success: false,
          error: "supplier_karat_type must be either '18' or '21'",
        });
      }
      updateFields.push("supplier_karat_type = ?");
      updateValues.push(supplier_karat_type);
    }

    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE suppliers SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Supplier updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Supplier with this code already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update supplier",
      message: error.message,
    });
  }
};

/**
 * Delete supplier
 * DELETE /api/suppliers/:id
 */
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const [existingSupplier] = await pool.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [id]
    );

    if (existingSupplier.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    const [result] = await pool.execute("DELETE FROM suppliers WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "Supplier deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete supplier",
      message: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};

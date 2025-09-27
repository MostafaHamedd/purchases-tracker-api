const { pool } = require("../config/database");

// ============================================================================
// DISCOUNT TIERS CONTROLLER
// ============================================================================
// This controller handles all CRUD operations for the discount_tiers table
// Includes foreign key validation with suppliers table
// ============================================================================

/**
 * Get all discount tiers with supplier information
 * GET /api/discount-tiers
 */
const getAllDiscountTiers = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        dt.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM discount_tiers dt
      JOIN suppliers s ON dt.supplier_id = s.id
      ORDER BY dt.supplier_id, dt.karat_type, dt.threshold ASC
    `);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching discount tiers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discount tiers",
      message: error.message,
    });
  }
};

/**
 * Get single discount tier by ID with supplier information
 * GET /api/discount-tiers/:id
 */
const getDiscountTierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        dt.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM discount_tiers dt
      JOIN suppliers s ON dt.supplier_id = s.id
      WHERE dt.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Discount tier not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching discount tier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discount tier",
      message: error.message,
    });
  }
};

/**
 * Get discount tiers for a specific supplier
 * GET /api/discount-tiers/supplier/:supplierId
 */
const getDiscountTiersBySupplier = async (req, res) => {
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
        dt.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM discount_tiers dt
      JOIN suppliers s ON dt.supplier_id = s.id
      WHERE dt.supplier_id = ?
      ORDER BY dt.karat_type, dt.threshold ASC
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
    console.error("Error fetching discount tiers by supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discount tiers for supplier",
      message: error.message,
    });
  }
};

/**
 * Create new discount tier
 * POST /api/discount-tiers
 * Required fields: id, supplier_id, karat_type, name, threshold, discount_percentage
 * Optional fields: is_protected (defaults to false)
 */
const createDiscountTier = async (req, res) => {
  try {
    const {
      id,
      supplier_id,
      karat_type,
      name,
      threshold,
      discount_percentage,
      is_protected = false,
    } = req.body;

    // Validation
    if (
      !id ||
      !supplier_id ||
      !karat_type ||
      !name ||
      threshold === undefined ||
      discount_percentage === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "id",
          "supplier_id",
          "karat_type",
          "name",
          "threshold",
          "discount_percentage",
        ],
      });
    }

    // Validate karat_type (only 21k supported now)
    if (karat_type !== "21") {
      return res.status(400).json({
        success: false,
        error: "karat_type must be '21' (18k support removed)",
      });
    }

    // Validate threshold (must be >= 0)
    if (threshold < 0) {
      return res.status(400).json({
        success: false,
        error: "threshold must be >= 0",
      });
    }

    // Validate discount_percentage (must be between 0 and 1 for decimal percentages)
    if (discount_percentage < 0 || discount_percentage > 1) {
      return res.status(400).json({
        success: false,
        error:
          "discount_percentage must be between 0 and 1 (decimal percentage, e.g., 0.05 for 5%)",
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
      `INSERT INTO discount_tiers (id, supplier_id, karat_type, name, threshold, discount_percentage, is_protected) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        supplier_id,
        karat_type,
        name,
        threshold,
        discount_percentage,
        is_protected,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Discount tier created successfully",
      data: {
        id,
        supplier_id,
        karat_type,
        name,
        threshold,
        discount_percentage,
        is_protected,
      },
    });
  } catch (error) {
    console.error("Error creating discount tier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error:
          "Discount tier with this combination of supplier, karat type, and threshold already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create discount tier",
      message: error.message,
    });
  }
};

/**
 * Update discount tier
 * PUT /api/discount-tiers/:id
 * Optional fields: supplier_id, karat_type, name, threshold, discount_percentage, is_protected
 */
const updateDiscountTier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_id,
      karat_type,
      name,
      threshold,
      discount_percentage,
      is_protected,
    } = req.body;

    // Check if discount tier exists
    const [existingTier] = await pool.execute(
      "SELECT * FROM discount_tiers WHERE id = ?",
      [id]
    );

    if (existingTier.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Discount tier not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

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
      if (karat_type !== "21") {
        return res.status(400).json({
          success: false,
          error: "karat_type must be '21' (18k support removed)",
        });
      }
      updateFields.push("karat_type = ?");
      updateValues.push(karat_type);
    }

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (threshold !== undefined) {
      if (threshold < 0) {
        return res.status(400).json({
          success: false,
          error: "threshold must be >= 0",
        });
      }
      updateFields.push("threshold = ?");
      updateValues.push(threshold);
    }

    if (discount_percentage !== undefined) {
      if (discount_percentage < 0 || discount_percentage > 1) {
        return res.status(400).json({
          success: false,
          error:
            "discount_percentage must be between 0 and 1 (decimal percentage, e.g., 0.05 for 5%)",
        });
      }
      updateFields.push("discount_percentage = ?");
      updateValues.push(discount_percentage);
    }

    if (is_protected !== undefined) {
      updateFields.push("is_protected = ?");
      updateValues.push(is_protected);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE discount_tiers SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Discount tier updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating discount tier:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error:
          "Discount tier with this combination of supplier, karat type, and threshold already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update discount tier",
      message: error.message,
    });
  }
};

/**
 * Delete discount tier
 * DELETE /api/discount-tiers/:id
 */
const deleteDiscountTier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if discount tier exists
    const [existingTier] = await pool.execute(
      "SELECT * FROM discount_tiers WHERE id = ?",
      [id]
    );

    if (existingTier.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Discount tier not found",
      });
    }

    // Check if it's a protected tier
    if (existingTier[0].is_protected) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete protected discount tier",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM discount_tiers WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Discount tier deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting discount tier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete discount tier",
      message: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  getAllDiscountTiers,
  getDiscountTierById,
  getDiscountTiersBySupplier,
  createDiscountTier,
  updateDiscountTier,
  deleteDiscountTier,
};

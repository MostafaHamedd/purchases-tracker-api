const { pool } = require("../config/database");

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM stores ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stores",
      message: error.message,
    });
  }
};

// Get single store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute("SELECT * FROM stores WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch store",
      message: error.message,
    });
  }
};

// Create new store
const createStore = async (req, res) => {
  try {
    const { id, name, code, is_active = true, progress_bar_config } = req.body;

    // Validation
    if (!id || !name || !code || !progress_bar_config) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["id", "name", "code", "progress_bar_config"],
      });
    }

    // Validate progress_bar_config is an object
    if (typeof progress_bar_config !== "object") {
      return res.status(400).json({
        success: false,
        error: "progress_bar_config must be an object",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO stores (id, name, code, is_active, progress_bar_config) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, code, is_active, JSON.stringify(progress_bar_config)]
    );

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: {
        id,
        name,
        code,
        is_active,
        progress_bar_config,
      },
    });
  } catch (error) {
    console.error("Error creating store:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Store with this ID or code already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create store",
      message: error.message,
    });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, is_active, progress_bar_config } = req.body;

    // Check if store exists
    const [existingStore] = await pool.execute(
      "SELECT * FROM stores WHERE id = ?",
      [id]
    );

    if (existingStore.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
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
      updateFields.push("code = ?");
      updateValues.push(code);
    }

    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(is_active);
    }

    if (progress_bar_config !== undefined) {
      if (typeof progress_bar_config !== "object") {
        return res.status(400).json({
          success: false,
          error: "progress_bar_config must be an object",
        });
      }
      updateFields.push("progress_bar_config = ?");
      updateValues.push(JSON.stringify(progress_bar_config));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE stores SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Store updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating store:", error);

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Store with this code already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update store",
      message: error.message,
    });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const [existingStore] = await pool.execute(
      "SELECT * FROM stores WHERE id = ?",
      [id]
    );

    if (existingStore.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    const [result] = await pool.execute("DELETE FROM stores WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "Store deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete store",
      message: error.message,
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};



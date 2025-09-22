const { pool } = require("../config/database");
const { calculatePurchaseStatus } = require("../utils/businessLogic");

/**
 * Get all payments with purchase and store information
 * GET /api/payments
 */
const getAllPayments = async (req, res) => {
  try {
    const {
      purchase,
      karat_type,
      search,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    // Log the incoming request for debugging
    console.log("🔍 Get all payments request:", {
      query: req.query,
      timestamp: new Date().toISOString(),
    });

    let query = `
      SELECT
        pay.*,
        p.date as purchase_date,
        p.status as purchase_status,
        p.total_net_fees as purchase_total_net_fees,
        st.name as store_name,
        st.code as store_code
      FROM payments pay
      JOIN purchases p ON pay.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM payments pay
      JOIN purchases p ON pay.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
    `;

    const queryParams = [];
    const whereConditions = [];

    // Add filters
    if (purchase) {
      whereConditions.push("pay.purchase_id = ?");
      queryParams.push(purchase);
    }

    if (karat_type) {
      whereConditions.push("pay.karat_type = ?");
      queryParams.push(karat_type);
    }

    if (search) {
      whereConditions.push("(pay.note LIKE ? OR st.name LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      const whereClause = `WHERE ${whereConditions.join(" AND ")}`;
      query += ` ${whereClause}`;
      countQuery += ` ${whereClause}`;
    }

    // Validate sort parameters
    const allowedSortFields = [
      "id",
      "date",
      "grams_paid",
      "fees_paid",
      "karat_type",
      "created_at",
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Add ORDER BY
    query += ` ORDER BY pay.${sortField} ${sortDirection}`;

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);

    // Add LIMIT and OFFSET
    query += ` LIMIT ${parseInt(limitValue)} OFFSET ${parseInt(offset)}`;

    // Get total count first
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Execute main query with all parameters
    const [rows] = await pool.execute(query, queryParams);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: limitValue,
        total,
        totalPages: Math.ceil(total / limitValue),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching payments:", {
      error: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      query: req.query,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments",
      message: error.message,
    });
  }
};

/**
 * Get single payment by ID with purchase and store information
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        pay.*,
        p.date as purchase_date,
        p.status as purchase_status,
        p.total_net_fees as purchase_total_net_fees,
        st.name as store_name,
        st.code as store_code
      FROM payments pay
      JOIN purchases p ON pay.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
      WHERE pay.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment",
      message: error.message,
    });
  }
};

/**
 * Get payments by purchase ID with summary
 * GET /api/payments/purchase/:purchaseId
 */
const getPaymentsByPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    // Check if purchase exists
    const [purchaseRows] = await pool.execute(
      "SELECT id, total_net_fees FROM purchases WHERE id = ?",
      [purchaseId]
    );
    if (purchaseRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    const [payments] = await pool.execute(
      `
      SELECT
        pay.*
      FROM payments pay
      WHERE pay.purchase_id = ?
      ORDER BY pay.date DESC, pay.created_at DESC
    `,
      [purchaseId]
    );

    const totalPaid = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.fees_paid),
      0
    );
    const purchaseTotal = parseFloat(purchaseRows[0].total_net_fees);
    const remainingBalance = purchaseTotal - totalPaid;
    const isFullyPaid = remainingBalance <= 0;

    res.json({
      success: true,
      data: payments,
      count: payments.length,
      purchase_id: purchaseId,
      summary: {
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        purchaseTotal: parseFloat(purchaseTotal.toFixed(2)),
        remainingBalance: parseFloat(remainingBalance.toFixed(2)),
        isFullyPaid,
      },
    });
  } catch (error) {
    console.error("Error fetching payments by purchase:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments by purchase",
      message: error.message,
    });
  }
};

/**
 * Get payments by karat type
 * GET /api/payments/karat/:karatType
 */
const getPaymentsByKaratType = async (req, res) => {
  try {
    const { karatType } = req.params;

    const allowedKaratTypes = ["18", "21"];
    if (!allowedKaratTypes.includes(karatType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid karat type",
        message: `Karat type must be one of: ${allowedKaratTypes.join(", ")}.`,
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        pay.*,
        p.date as purchase_date,
        p.status as purchase_status,
        st.name as store_name,
        st.code as store_code
      FROM payments pay
      JOIN purchases p ON pay.purchase_id = p.id
      JOIN stores st ON p.store_id = st.id
      WHERE pay.karat_type = ?
      ORDER BY pay.date DESC, pay.created_at DESC
    `,
      [karatType]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      karatType: karatType,
    });
  } catch (error) {
    console.error("Error fetching payments by karat type:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments by karat type",
      message: error.message,
    });
  }
};

/**
 * Create new payment
 * POST /api/payments
 */
const createPayment = async (req, res) => {
  try {
    const { id, purchase_id, date, grams_paid, fees_paid, karat_type, note } =
      req.body;

    // Log the incoming request for debugging
    console.log("🔍 Payment creation request:", {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString(),
    });

    // Validation
    if (
      !id ||
      !purchase_id ||
      !date ||
      grams_paid === undefined ||
      fees_paid === undefined ||
      !karat_type
    ) {
      const missingFields = [];
      if (!id) missingFields.push("id");
      if (!purchase_id) missingFields.push("purchase_id");
      if (!date) missingFields.push("date");
      if (grams_paid === undefined) missingFields.push("grams_paid");
      if (fees_paid === undefined) missingFields.push("fees_paid");
      if (!karat_type) missingFields.push("karat_type");

      console.log(
        "❌ Payment validation failed - missing fields:",
        missingFields
      );
      console.log("📝 Received data:", req.body);

      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missingFields: missingFields,
        receivedData: req.body,
        required: [
          "id",
          "purchase_id",
          "date",
          "grams_paid",
          "fees_paid",
          "karat_type",
        ],
      });
    }

    // Validate amounts - at least one must be positive, neither can be negative
    if (grams_paid < 0 || fees_paid < 0) {
      console.log("❌ Payment validation failed - negative amounts:", {
        grams_paid,
        fees_paid,
        receivedData: req.body,
      });
      return res.status(400).json({
        success: false,
        error: "Invalid amounts",
        message: "Grams paid and fees paid cannot be negative.",
        receivedData: { grams_paid, fees_paid },
      });
    }

    if (grams_paid === 0 && fees_paid === 0) {
      console.log("❌ Payment validation failed - both amounts zero:", {
        grams_paid,
        fees_paid,
        receivedData: req.body,
      });
      return res.status(400).json({
        success: false,
        error: "Invalid amounts",
        message:
          "At least one of grams_paid or fees_paid must be greater than 0.",
        receivedData: { grams_paid, fees_paid },
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log("❌ Payment validation failed - invalid date format:", {
        date,
        receivedData: req.body,
      });
      return res.status(400).json({
        success: false,
        error: "Invalid date format",
        message: "Date must be in YYYY-MM-DD format.",
        receivedData: { date },
      });
    }

    // Validate karat_type enum
    const allowedKaratTypes = ["18", "21"];
    if (!allowedKaratTypes.includes(karat_type)) {
      console.log("❌ Payment validation failed - invalid karat type:", {
        karat_type,
        allowedTypes: allowedKaratTypes,
        receivedData: req.body,
      });
      return res.status(400).json({
        success: false,
        error: "Invalid karat type",
        message: `Karat type must be one of: ${allowedKaratTypes.join(", ")}.`,
        receivedData: { karat_type },
      });
    }

    // Check if purchase exists
    const [purchaseRows] = await pool.execute(
      "SELECT id FROM purchases WHERE id = ?",
      [purchase_id]
    );
    if (purchaseRows.length === 0) {
      console.log("❌ Payment validation failed - purchase not found:", {
        purchase_id,
        receivedData: req.body,
      });
      return res.status(400).json({
        success: false,
        error: "Purchase not found",
        message: `Purchase with ID '${purchase_id}' does not exist.`,
        receivedData: { purchase_id },
      });
    }

    console.log("✅ Payment validation passed, inserting into database:", {
      id,
      purchase_id,
      date,
      grams_paid,
      fees_paid,
      karat_type,
      note,
    });

    const [result] = await pool.execute(
      `INSERT INTO payments (id, purchase_id, date, grams_paid, fees_paid, karat_type, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, purchase_id, date, grams_paid, fees_paid, karat_type, note || null]
    );

    console.log("✅ Payment created successfully:", {
      id,
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: {
        id,
        purchase_id,
        date,
        grams_paid,
        fees_paid,
        karat_type,
        note,
      },
    });
  } catch (error) {
    console.error("❌ Error creating payment:", {
      error: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      receivedData: req.body,
      stack: error.stack,
    });

    // Handle duplicate key error
    if (error.code === "ER_DUP_ENTRY") {
      console.log("❌ Duplicate payment ID error:", {
        id: req.body.id,
        error: error.message,
      });
      return res.status(409).json({
        success: false,
        error: "Payment with this ID already exists",
        receivedData: { id: req.body.id },
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create payment",
      message: error.message,
      receivedData: req.body,
    });
  }
};

/**
 * Update payment
 * PUT /api/payments/:id
 */
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchase_id, date, grams_paid, fees_paid, karat_type, note } =
      req.body;

    // Check if payment exists
    const [existingPayment] = await pool.execute(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (existingPayment.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (purchase_id !== undefined) {
      // Check if new purchase_id exists
      const [purchaseRows] = await pool.execute(
        "SELECT id FROM purchases WHERE id = ?",
        [purchase_id]
      );
      if (purchaseRows.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Purchase not found",
          message: `Purchase with ID '${purchase_id}' does not exist.`,
        });
      }
      updateFields.push("purchase_id = ?");
      updateValues.push(purchase_id);
    }

    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format",
          message: "Date must be in YYYY-MM-DD format.",
        });
      }
      updateFields.push("date = ?");
      updateValues.push(date);
    }

    if (grams_paid !== undefined) {
      if (grams_paid <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid grams paid",
          message: "Grams paid must be a positive number.",
        });
      }
      updateFields.push("grams_paid = ?");
      updateValues.push(grams_paid);
    }

    if (fees_paid !== undefined) {
      if (fees_paid <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid fees paid",
          message: "Fees paid must be a positive number.",
        });
      }
      updateFields.push("fees_paid = ?");
      updateValues.push(fees_paid);
    }

    if (karat_type !== undefined) {
      const allowedKaratTypes = ["18", "21"];
      if (!allowedKaratTypes.includes(karat_type)) {
        return res.status(400).json({
          success: false,
          error: "Invalid karat type",
          message: `Karat type must be one of: ${allowedKaratTypes.join(
            ", "
          )}.`,
        });
      }
      updateFields.push("karat_type = ?");
      updateValues.push(karat_type);
    }

    if (note !== undefined) {
      updateFields.push("note = ?");
      updateValues.push(note || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(id);

    const [result] = await pool.execute(
      `UPDATE payments SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: "Payment updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating payment:", error);

    // Handle duplicate key error if updating a unique field (though 'id' is primary key)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        error: "Payment with this ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update payment",
      message: error.message,
    });
  }
};

/**
 * Delete payment
 * DELETE /api/payments/:id
 */
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const [existingPayment] = await pool.execute(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (existingPayment.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    const [result] = await pool.execute("DELETE FROM payments WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "Payment deleted successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete payment",
      message: error.message,
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByPurchase,
  getPaymentsByKaratType,
  createPayment,
  updatePayment,
  deletePayment,
};

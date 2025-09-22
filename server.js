const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const responseLogger = require("./middleware/responseLogger");
const requestLogger = require("./middleware/requestLogger");

const { initializeDatabase } = require("./config/database");
const suppliersRoutes = require("./routes/suppliers");
const discountTiersRoutes = require("./routes/discountTiers");
const purchasesRoutes = require("./routes/purchases");
const purchaseSuppliersRoutes = require("./routes/purchaseSuppliers");
const purchaseReceiptsRoutes = require("./routes/purchaseReceipts");
const paymentsRoutes = require("./routes/payments");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - logs all incoming requests
app.use(requestLogger);

// Response logging middleware - logs all API responses
app.use(responseLogger);

// Routes
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/discount-tiers", discountTiersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/purchase-suppliers", purchaseSuppliersRoutes);
app.use("/api/purchase-receipts", purchaseReceiptsRoutes);
app.use("/api/payments", paymentsRoutes);

// Individual receipt and payment routes (for documentation compliance)
app.use("/api/receipts", purchaseReceiptsRoutes);
app.use("/api/payments", paymentsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Receipt Tracker API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏭 Suppliers API: http://localhost:${PORT}/api/suppliers`);
      console.log(
        `💰 Discount Tiers API: http://localhost:${PORT}/api/discount-tiers`
      );
      console.log(`🛒 Purchases API: http://localhost:${PORT}/api/purchases`);
      console.log(
        `🔗 Purchase Suppliers API: http://localhost:${PORT}/api/purchase-suppliers`
      );
      console.log(
        `🧾 Purchase Receipts API: http://localhost:${PORT}/api/purchase-receipts`
      );
      console.log(`💳 Payments API: http://localhost:${PORT}/api/payments`);
      console.log(`\n🌐 Server accessible from:`);
      console.log(`   • http://localhost:${PORT}`);
      console.log(`   • http://127.0.0.1:${PORT}`);
      console.log(`   • http://[your-ip]:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;

/**
 * Request Logging Middleware
 * Logs all incoming API requests
 */

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  console.log(`📥 ${method} ${url} Request:`);

  // Log query parameters if any
  if (Object.keys(req.query).length > 0) {
    console.log("🔍 Query:", JSON.stringify(req.query, null, 2));
  }

  // Log request body for POST/PUT/PATCH requests
  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  }

  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log("─".repeat(80));

  next();
};

module.exports = requestLogger;

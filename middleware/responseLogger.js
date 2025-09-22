/**
 * Response Logging Middleware
 * Logs all API responses being sent to the frontend
 */

const responseLogger = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;

  // Override the json method to log responses
  res.json = function (data) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;

    // Determine if it's an error response
    const isError = statusCode >= 400 || (data && data.success === false);
    const logPrefix = isError ? "📤❌" : "📤✅";

    console.log(`${logPrefix} ${method} ${url} [${statusCode}] Response:`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log("─".repeat(80));

    // Call the original json method
    return originalJson.call(this, data);
  };

  next();
};

module.exports = responseLogger;

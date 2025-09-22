/**
 * Response Logger Utility
 * Logs all API responses being sent to the frontend
 */

const logResponse = (
  method,
  endpoint,
  statusCode,
  response,
  isError = false
) => {
  const timestamp = new Date().toISOString();
  const logPrefix = isError ? "📤❌" : "📤✅";

  console.log(
    `${logPrefix} ${method} ${endpoint} [${statusCode}] Response:`,
    JSON.stringify(response, null, 2)
  );
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log("─".repeat(80));
};

const logRequest = (method, endpoint, body = null) => {
  const timestamp = new Date().toISOString();

  console.log(`📥 ${method} ${endpoint} Request:`);
  if (body) {
    console.log("📦 Body:", JSON.stringify(body, null, 2));
  }
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log("─".repeat(80));
};

module.exports = {
  logResponse,
  logRequest,
};

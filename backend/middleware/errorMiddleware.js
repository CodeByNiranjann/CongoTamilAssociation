// backend/middleware/errorMiddleware.js

// Handles any request to a route that does not exist
export function notFound(req, res, next) {
  const error = new Error("Route not found: " + req.method + " " + req.originalUrl);
  error.statusCode = 404;
  next(error);
}

// Central error handler. Always send errors through next(error).
// Safe responses only: no stack traces or internal details in production.
export function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose validation error (for example a missing required field)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(function (item) {
        return item.message;
      })
      .join(", ");
  }

  // Invalid MongoDB id (for example /events/not-a-real-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  }

  // Duplicate value on a unique field (for example the same email twice)
  if (err.code === 11000) {
    statusCode = 409;
    message = "That value already exists";
  }

  // Bad or expired login token
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // File too large or wrong upload field (from Multer)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "The file is too large.";
    } else {
      message = "File upload error.";
    }
  }

  // Request body is not valid JSON
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in the request.";
  }

  // Hide details of unexpected server errors in production
  if (statusCode === 500 && isProduction) {
    message = "Something went wrong. Please try again later.";
  }

  // Log the real error on the server only
  if (statusCode === 500) {
    console.error(err);
  }

  const body = {
    success: false,
    message: message,
  };

  if (isProduction === false && statusCode === 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
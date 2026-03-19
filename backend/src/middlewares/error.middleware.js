const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error for development
  console.error("Error 💥:", err);

  // Specific DB Errors
  if (err.code === "23505") {
    // Duplicate key
    err.statusCode = 400;
    err.message = "Duplicate field value entered";
  }

  if (err.code === "22P02") {
    // Invalid syntax (like invalid UUID/ID)
    err.statusCode = 400;
    err.message = "Invalid input format";
  }

  // Errores de validación de Zod
  if (err.name === "ZodError") {
    err.statusCode = 400;
    err.status = "fail";
    const issues = err.errors || err.issues || [];
    err.message = issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

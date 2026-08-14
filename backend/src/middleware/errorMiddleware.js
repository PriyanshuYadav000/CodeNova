const AppError = require("../utils/AppError");

const prismaError = (error) => {
  if (error.code === "P2002") {
    return new AppError("A record with that value already exists.", 409, "DUPLICATE_RECORD");
  }

  if (error.code === "P2025") {
    return new AppError("The requested record was not found.", 404, "NOT_FOUND");
  }

  return null;
};

const errorMiddleware = (error, req, res, next) => {
  const mappedPrismaError = prismaError(error);
  const appError = mappedPrismaError || error;
  const isOperational = appError instanceof AppError || appError.isOperational;
  const statusCode = isOperational ? appError.statusCode || 500 : 500;
  const message = isOperational ? appError.message : "Internal server error";
  const code = isOperational ? appError.code || "INTERNAL_ERROR" : "INTERNAL_ERROR";

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  } else if (!isOperational) {
    console.error("Unhandled application error", { name: error.name, code: error.code });
  }

  const errorResponse = {
    success: false,
    message,
    error: { code },
  };

  if (isOperational && Array.isArray(appError.details)) {
    errorResponse.error.details = appError.details;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorMiddleware;

const AppError = require("../utils/AppError");

const requestBodyError = (error) => {
  if (error.type === "entity.too.large") {
    return new AppError(
      "Request body is too large.",
      413,
      "PAYLOAD_TOO_LARGE"
    );
  }

  return null;
};
const prismaError = (error) => {
  if (error.code === "P2002") {
    return new AppError(
      "A record with that value already exists.",
      409,
      "DUPLICATE_RECORD"
    );
  }

  if (error.code === "P2025") {
    return new AppError(
      "The requested record was not found.",
      404,
      "NOT_FOUND"
    );
  }

  return null;
};

const errorMiddleware = (error, req, res, next) => {
  const mappedPrismaError = prismaError(error);
  const mappedRequestBodyError = requestBodyError(error); 
  const appError = mappedPrismaError || mappedRequestBodyError || error; 

  const isOperational =
    appError instanceof AppError || appError.isOperational === true;

  const isProduction = process.env.NODE_ENV === "production";

  const statusCode = isOperational
    ? appError.statusCode || 500
    : 500;

  const message = isOperational
    ? appError.message
    : "Internal server error";

  const code = isOperational
    ? appError.code || "INTERNAL_ERROR"
    : "INTERNAL_ERROR";

  // Development: useful debugging information
  if (!isProduction) { 
    console.error("Application error:", { 
      name: error.name, 
      message: error.message, 
      code: error.code, 
    });

    if (error.stack) { 
      console.error(error.stack); 
    }
  }

  // Production: do not expose internal error details
  if (isProduction && !isOperational) { 
    console.error("Unhandled application error:", { 
      name: error.name,
      code: error.code,
    });
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
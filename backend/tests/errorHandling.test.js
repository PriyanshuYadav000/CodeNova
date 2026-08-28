const errorMiddleware = require("../src/middleware/errorMiddleware");

describe("Error Handling", () => {
  test("returns safe 500 response for unexpected errors", () => {
    const error = new Error("Database password leaked");

    const req = {};
    const next = jest.fn();

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  });
});

test("converts Prisma P2002 error into a safe 409 response", () => {
  const error = {
    code: "P2002",
  };

  const req = {};
  const next = jest.fn();

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  errorMiddleware(error, req, res, next);

  expect(res.status).toHaveBeenCalledWith(409);

  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "A record with that value already exists.",
    error: {
      code: "DUPLICATE_RECORD",
    },
  });
});

test("converts Prisma P2025 error into a safe 404 response", () => {
  const error = {
    code: "P2025",
  };

  const req = {};
  const next = jest.fn();

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  errorMiddleware(error, req, res, next);

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "The requested record was not found.",
    error: {
      code: "NOT_FOUND",
    },
  });
});
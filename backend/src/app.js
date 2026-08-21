const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const AppError = require("./utils/AppError");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Request body limits
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeNova API is healthy",
  });
});

// Routes
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);

// 404 handler
app.all("/{*path}", (req, res, next) => {
  next(new AppError("Route not found.", 404, "NOT_FOUND"));
});

// Centralized error middleware
app.use(errorMiddleware);

module.exports = app;
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables FIRST
dotenv.config();

const app = express();

// Database
const main = require("./config/db");

// Redis
const redisClient = require("./config/redis");

// Routes
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
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

// Initialize database + Redis
const initializeConnection = async () => {
  try {
    console.log("Connecting to PostgreSQL...");
    await main();
    console.log("PostgreSQL connected successfully ✅");

    console.log("Connecting to Redis...");
    await redisClient.connect();
    console.log("Redis connected successfully ✅");

    app.listen(process.env.PORT, () => {
      console.log(
        `CodeNova server listening at port ${process.env.PORT} 🚀`
      );
    });
  } catch (error) {
    console.error("Startup error:", error);

    // Close Redis connection if startup fails
    if (redisClient.isOpen) {
      await redisClient.quit().catch(() => {});
    }

    process.exit(1);
  }
};

initializeConnection();
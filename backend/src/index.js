const dotenv = require("dotenv");

// Load environment variables first
dotenv.config();

const validateEnvironment = require("./config/env");
validateEnvironment();

const app = require("./app");

// Database
const main = require("./config/db");

// Redis
const redisClient = require("./config/redis");

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

    if (redisClient.isOpen) {
      await redisClient.quit().catch(() => {});
    }

    process.exit(1);
  }
};

initializeConnection();
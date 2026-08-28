const { createClient } = require("redis");

const requiredRedisConfig = [
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_USER",
  "REDIS_PASS",
];

const missingRedisConfig = requiredRedisConfig.filter(
  (key) => !process.env[key]
);

if (missingRedisConfig.length > 0) {
  throw new Error(
    `Missing Redis configuration: ${missingRedisConfig.join(", ")}`
  );
}

const redisClient = createClient({
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000,
    reconnectStrategy: (retries, cause) => {
      if (/WRONGPASS|NOAUTH/i.test(cause.message)) {
        return new Error(
          "Redis authentication failed. Check REDIS_USER and REDIS_PASS."
        );
      }

      return Math.min(50 * 2 ** retries, 3000);
    },
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

module.exports = redisClient;

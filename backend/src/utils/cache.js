const redisClient = require("../config/redis");
const redisKey = require("./redisKey");

const cacheTtlSeconds = Number(
  process.env.PROBLEM_CACHE_TTL_SECONDS || 300
);

const getCache = async (key) => {
  try {
    const cachedValue = await redisClient.get(key);

    if (!cachedValue) {
      console.log(`Cache MISS: ${key}`);
      return null;
    }

    console.log(`Cache HIT: ${key}`);

    return JSON.parse(cachedValue);
  } catch (error) {
    console.error("Cache GET failed:", {
      key,
      message: error.message,
    });

    return null;
  }
};

const setCache = async (key, value, ttlSeconds = cacheTtlSeconds) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });

    console.log(`Cache SET: ${key}`);
  } catch (error) {
    console.error("Cache SET failed:", {
      key,
      message: error.message,
    });
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);

    console.log(`Cache DELETE: ${key}`);
  } catch (error) {
    console.error("Cache DELETE failed:", {
      key,
      message: error.message,
    });
  }
};

const deleteCaches = async (keys) => {
  await Promise.all(keys.map((key) => deleteCache(key)));
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCaches,
};
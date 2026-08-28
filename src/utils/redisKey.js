const prefix = process.env.REDIS_KEY_PREFIX || "";

const redisKey = (key) => {
  if (!prefix) {
    return key;
  }

  return `${prefix}:${key}`;
};

module.exports = redisKey;

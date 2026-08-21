const redisClient = require("../src/config/redis");
const redisKey = require("../src/utils/redisKey");

describe("Test Redis isolation", () => {
  test("uses the test Redis key prefix", () => {
    expect(redisKey("problems:all")).toBe(
      "test:codenova:problems:all"
    );
  });

  test("Redis client is connected for tests", () => {
    expect(redisClient.isOpen).toBe(true);
    expect(redisClient.isReady).toBe(true);
  });
});
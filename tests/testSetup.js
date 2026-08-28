const prisma = require("../src/config/prisma");
const redisClient = require("../src/config/redis");

beforeAll(async () => {
  await prisma.$connect();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
});

beforeEach(async () => {
  const testKeys = await redisClient.keys(
    "test:codenova:*"
  );

  if (testKeys.length > 0) {
    await redisClient.del(testKeys);
  }
});

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  await prisma.$disconnect();
});
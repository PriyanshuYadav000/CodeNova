const prisma = require("../src/config/prisma");
const redisClient = require("../src/config/redis");

beforeAll(async () => {
  await prisma.$connect();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
});

beforeEach(async () => {
  const rateLimitPattern =
    "test:codenova:codenova:ratelimit:*";

  const keys = await redisClient.keys(rateLimitPattern);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
});

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  await prisma.$disconnect();
});


jest.mock("../src/utils/judge0Validator", () => ({
  validateReferenceSolutions: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const redisClient = require("../src/config/redis");
const redisKey = require("../src/utils/redisKey");

describe("Problem cache API", () => {
  test("caches getAllProblem response after first request and uses cache on second request", async () => {
    const emailId = `cache-user-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await require("bcrypt").hash(
      password,
      10
    );

    await prisma.user.create({
      data: {
        firstName: "Cache",
        lastName: "User",
        emailId,
        age: 22,
        password: hashedPassword,
        role: "user",
      },
    });

    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/user/login")
      .send({
        emailId,
        password,
      });

    expect(loginResponse.statusCode).toBe(200);

    /*
     * Remove every test cache key that could represent
     * the all-problems cache.
     *
     * This also protects us if a key was accidentally
     * prefixed more than once during the namespace setup.
     */
    const cacheKeys = await redisClient.keys(
      "test:codenova:*problems:all*"
    );

    if (cacheKeys.length > 0) {
      await redisClient.del(cacheKeys);
    }

    const cacheKey = redisKey("problems:all");

    expect(
      await redisClient.exists(cacheKey)
    ).toBe(0);

    const findManySpy = jest.spyOn(
      prisma.problem,
      "findMany"
    );

    // First request → expected cache MISS.
    const firstResponse = await agent
      .get("/problem/getAllProblem");

    expect(firstResponse.statusCode).toBe(200);
    expect(Array.isArray(firstResponse.body)).toBe(true);

    expect(findManySpy).toHaveBeenCalledTimes(1);

    // Cache should now exist.
    const cachedValue =
      await redisClient.get(cacheKey);

    expect(cachedValue).not.toBeNull();

    // Second request → expected cache HIT.
    const secondResponse = await agent
      .get("/problem/getAllProblem");

    expect(secondResponse.statusCode).toBe(200);

    expect(secondResponse.body).toEqual(
      firstResponse.body
    );

    // PostgreSQL should not be queried again.
    expect(findManySpy).toHaveBeenCalledTimes(1);

    findManySpy.mockRestore();
  });
});

test("invalidates problem caches after updating a problem", async () => {
  const emailId = `cache-update-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await require("bcrypt").hash(
    password,
    10
  );

  await prisma.user.create({
    data: {
      firstName: "Cache",
      lastName: "Admin",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(problem).not.toBeNull();

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const problemCacheKey = redisKey(
    `problems:id:${problem.id}`
  );

  const allProblemsCacheKey = redisKey(
    "problems:all"
  );

  // Populate the individual problem cache.
  const firstGetResponse = await agent.get(
    `/problem/problemById/${problem.id}`
  );

  expect(firstGetResponse.statusCode).toBe(200);

  // Populate the all-problems cache.
  const allProblemsResponse = await agent.get(
    "/problem/getAllProblem"
  );

  expect(allProblemsResponse.statusCode).toBe(200);

  expect(
    await redisClient.exists(problemCacheKey)
  ).toBe(1);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(1);

  const updatedTitle = `Cache Updated ${Date.now()}`;

  const updateResponse = await agent
    .put(`/problem/update/${problem.id}`)
    .send({
      title: updatedTitle,
      description: "Updated cache invalidation test problem.",
      difficulty: "medium",
      tags: ["array"],
      visibleTestCases: [
        {
          input: "1",
          output: "1",
          explanation: "Updated test case",
        },
      ],
      hiddenTestCases: [
        {
          input: "2",
          output: "2",
        },
      ],
      startCode: [
        {
          language: "javascript",
          initialCode: "// Updated starter code",
        },
      ],
      referenceSolution: [
        {
          language: "javascript",
          completeCode: "console.log(1);",
        },
      ],
    });

  expect(updateResponse.statusCode).toBe(200);

  // Update should invalidate both caches.
  expect(
    await redisClient.exists(problemCacheKey)
  ).toBe(0);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(0);

  // Next GET should fetch fresh data and recreate the cache.
  const updatedGetResponse = await agent.get(
    `/problem/problemById/${problem.id}`
  );

  expect(updatedGetResponse.statusCode).toBe(200);
  expect(updatedGetResponse.body.title).toBe(updatedTitle);

  expect(
    await redisClient.exists(problemCacheKey)
  ).toBe(1);
});


test("invalidates problem caches after deleting a problem", async () => {
  const emailId = `cache-delete-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      firstName: "Cache",
      lastName: "Delete",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(problem).not.toBeNull();

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body.data.role).toBe("admin");

  const problemCacheKey = redisKey(
    `problems:id:${problem.id}`
  );

  const allProblemsCacheKey = redisKey(
    "problems:all"
  );

  // Populate both caches.
  const problemResponse = await agent.get(
    `/problem/problemById/${problem.id}`
  );

  expect(problemResponse.statusCode).toBe(200);

  const allProblemsResponse = await agent.get(
    "/problem/getAllProblem"
  );

  expect(allProblemsResponse.statusCode).toBe(200);

  expect(
    await redisClient.exists(problemCacheKey)
  ).toBe(1);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(1);

  // Delete the problem.
  const deleteResponse = await agent.delete(
    `/problem/delete/${problem.id}`
  );

  expect(deleteResponse.statusCode).toBe(200);

  expect(deleteResponse.text).toBe(
    "Successfully Deleted"
  );

  // Both caches should be invalidated.
  expect(
    await redisClient.exists(problemCacheKey)
  ).toBe(0);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(0);

  // The problem should no longer be available.
  const getDeletedResponse = await agent.get(
    `/problem/problemById/${problem.id}`
  );

  expect(getDeletedResponse.statusCode).toBe(404);

  expect(getDeletedResponse.body).toEqual({
    success: false,
    message: "Problem not found.",
    error: {
      code: "NOT_FOUND",
    },
  });
});

test("invalidates all-problems cache after creating a problem", async () => {
  const emailId = `cache-create-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Cache",
      lastName: "Create",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
    },
  });

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body.data.role).toBe("admin");

  const allProblemsCacheKey = redisKey("problems:all");

  // First GET → populate the all-problems cache.
  const firstResponse = await agent
    .get("/problem/getAllProblem");

  expect(firstResponse.statusCode).toBe(200);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(1);

  // Create a new problem.
  const createResponse = await agent
    .post("/problem/create")
    .send({
      title: `Cache Create Test ${Date.now()}`,
      description:
        "Problem created to test all-problems cache invalidation.",
      difficulty: "easy",
      tags: ["array"],
      visibleTestCases: [
        {
          input: "1",
          output: "1",
          explanation: "Test case",
        },
      ],
      hiddenTestCases: [
        {
          input: "2",
          output: "2",
        },
      ],
      startCode: [
        {
          language: "javascript",
          initialCode: "// Write your solution here",
        },
      ],
      referenceSolution: [
        {
          language: "javascript",
          completeCode: "console.log(1);",
        },
      ],
    });

  expect(createResponse.statusCode).toBe(201);

  // Creating a problem should invalidate the all-problems cache.
  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(0);

  // Next GET should fetch fresh data and recreate the cache.
  const secondResponse = await agent
    .get("/problem/getAllProblem");

  expect(secondResponse.statusCode).toBe(200);

  expect(
    await redisClient.exists(allProblemsCacheKey)
  ).toBe(1);
});
jest.mock("../src/utils/judge0Validator", () => ({
  validateReferenceSolutions: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Authorization", () => {
  test("normal user cannot access admin problem creation", async () => {
    const emailId = `authz-user-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const agent = request.agent(app);

    const registerResponse = await agent
      .post("/user/register")
      .send({
        firstName: "Normal",
        lastName: "User",
        emailId,
        age: 22,
        password,
      });

    expect(registerResponse.statusCode).toBe(201);

    const response = await agent
      .post("/problem/create")
      .send({
        title: `Unauthorized Problem ${Date.now()}`,
        description: "Should not be created by a normal user.",
        difficulty: "easy",
        tags: ["array"],
        visibleTestCases: [],
        hiddenTestCases: [],
        startCode: [],
        referenceSolution: [],
      });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Administrator access is required.",
      error: {
        code: "AUTHORIZATION_ERROR",
      },
    });
  });

  test("admin can access admin problem creation", async () => {
    const emailId = `authz-admin-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Admin",
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

    const response = await agent
      .post("/problem/create")
      .send({
        title: `Authorization Admin Test ${Date.now()}`,
        description:
          "Valid problem created during authorization testing.",
        difficulty: "easy",
        tags: ["array", "hashmap"],
        visibleTestCases: [
          {
            input: "2\n1 2\n3",
            output: "0 1",
            explanation: "1 + 2 = 3",
          },
        ],
        hiddenTestCases: [
          {
            input: "2\n3 3\n6",
            output: "0 1",
          },
        ],
        startCode: [
          {
            language: "javascript",
            initialCode:
              "function twoSum(nums, target) {\n" +
              "    // Write your solution here\n" +
              "}",
          },
        ],
        referenceSolution: [
          {
            language: "javascript",
            completeCode:
              "const fs = require('fs');\n" +
              "const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n" +
              "const n = input[0];\n" +
              "const nums = input.slice(1, n + 1);\n" +
              "const target = input[n + 1];\n" +
              "\n" +
              "const map = new Map();\n" +
              "for (let i = 0; i < nums.length; i++) {\n" +
              "    const complement = target - nums[i];\n" +
              "    if (map.has(complement)) {\n" +
              "        console.log(map.get(complement) + ' ' + i);\n" +
              "        break;\n" +
              "    }\n" +
              "    map.set(nums[i], i);\n" +
              "}",
          },
        ],
      });

    expect(response.statusCode).toBe(201);

    expect(response.text).toBe(
      "Problem Saved Successfully"
    );
  });
});
const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Validation API", () => {
  test("rejects invalid login request", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({
        emailId: "invalid-email",
        password: "",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Validation failed.",
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
        }),
      })
    );
  });

  test("rejects invalid problem creation request", async () => {
    const emailId = `validation-admin-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Validation",
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

    const response = await agent
      .post("/problem/create")
      .send({
        title: "",
        description: "",
        difficulty: "extreme",
        tags: [],
        visibleTestCases: [],
        hiddenTestCases: [],
        startCode: [],
        referenceSolution: [],
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Validation failed.",
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
        }),
      })
    );
  });

  test("rejects invalid submission request", async () => {
    const emailId = `validation-user-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Validation",
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

    const response = await agent
      .post("/submission/run/c2cfd891-6fd2-436c-86b4-53a503c39f21")
      .send({
        code: "",
        language: "python",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Validation failed.",
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
        }),
      })
    );
  });
});


test("rejects invalid problem update request", async () => {
  const emailId = `validation-update-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Validation",
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

  const problemId =
    "c2cfd891-6fd2-436c-86b4-53a503c39f21";

  const response = await agent
    .put(`/problem/update/${problemId}`)
    .send({
      title: "",
      description: "",
      difficulty: "invalid",
      tags: [],
      visibleTestCases: [],
      hiddenTestCases: [],
      startCode: [],
      referenceSolution: [],
    });

  expect(response.statusCode).toBe(400);

  expect(response.body).toEqual(
    expect.objectContaining({
      success: false,
      message: "Validation failed.",
      error: expect.objectContaining({
        code: "VALIDATION_ERROR",
      }),
    })
  );
});
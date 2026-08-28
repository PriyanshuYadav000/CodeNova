const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Rate Limiting API", () => {
  test("login rate limiter eventually returns 429", async () => {
    const requests = [];

    for (let i = 0; i < 11; i++) {
      requests.push(
        request(app)
          .post("/user/login")
          .send({
            emailId: `rate-limit-${Date.now()}@codenova.test`,
            password: "Wrong@12345",
          })
      );
    }

    const responses = await Promise.all(requests);

    const rateLimitedResponse = responses.find(
      (response) => response.statusCode === 429
    );

    expect(rateLimitedResponse).toBeDefined();

    expect(rateLimitedResponse.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "RATE_LIMIT_EXCEEDED",
        }),
      })
    );

    expect(
      rateLimitedResponse.headers["retry-after"]
    ).toBeDefined();
  });
});

test("register rate limiter eventually returns 429", async () => {
  const responses = [];

  for (let i = 0; i < 6; i++) {
    responses.push(
      request(app)
        .post("/user/register")
        .send({
          firstName: "Rate",
          lastName: "Limit",
          emailId: `register-rate-limit-${Date.now()}-${i}@codenova.test`,
          age: 22,
          password: "Test@12345",
        })
    );
  }

  const results = await Promise.all(responses);

  const rateLimitedResponse = results.find(
    (response) => response.statusCode === 429
  );

  expect(rateLimitedResponse).toBeDefined();

  expect(rateLimitedResponse.body).toEqual(
    expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: "RATE_LIMIT_EXCEEDED",
      }),
    })
  );

  expect(
    rateLimitedResponse.headers["retry-after"]
  ).toBeDefined();
});

test("run-code rate limiter eventually returns 429", async () => {
  const emailId = `run-rate-limit-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const user = await prisma.user.create({
    data: {
      firstName: "Rate",
      lastName: "Run",
      emailId,
      age: 22,
      password: await require("bcrypt").hash(password, 10),
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

  const responses = [];

  for (let i = 0; i < 11; i++) {
    responses.push(
      agent
        .post(
          "/submission/run/c2cfd891-6fd2-436c-86b4-53a503c39f21"
        )
        .send({
          code: "console.log('test');",
          language: "javascript",
        })
    );
  }

  const results = await Promise.all(responses);

  const rateLimitedResponse = results.find(
    (response) => response.statusCode === 429
  );

  expect(rateLimitedResponse).toBeDefined();

  expect(rateLimitedResponse.body).toEqual(
    expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: "RATE_LIMIT_EXCEEDED",
      }),
    })
  );

  expect(
    rateLimitedResponse.headers["retry-after"]
  ).toBeDefined();
});

test("submit-code rate limiter eventually returns 429", async () => {
  const emailId = `submit-rate-limit-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Rate",
      lastName: "Submit",
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

  const responses = [];

  for (let i = 0; i < 6; i++) {
    responses.push(
      agent
        .post(
          "/submission/submit/c2cfd891-6fd2-436c-86b4-53a503c39f21"
        )
        .send({
          code: "console.log('test');",
          language: "javascript",
        })
    );
  }

  const results = await Promise.all(responses);

  const rateLimitedResponse = results.find(
    (response) => response.statusCode === 429
  );

  expect(rateLimitedResponse).toBeDefined();

  expect(rateLimitedResponse.body).toEqual(
    expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: "RATE_LIMIT_EXCEEDED",
      }),
    })
  );

  expect(
    rateLimitedResponse.headers["retry-after"]
  ).toBeDefined();
});
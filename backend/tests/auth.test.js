const request = require("supertest");
const app = require("../src/app");

describe("Authentication", () => {
  test("registers a new user successfully", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({
        firstName: "Test",
        lastName: "User",
        emailId: `test-${Date.now()}@codenova.test`,
        age: 22,
        password: "Test@12345",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "Registered successfully",
        data: expect.objectContaining({
          firstName: "Test",
          role: "user",
        }),
      })
    );

    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("rejects invalid registration data", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({
        firstName: "",
        emailId: "",
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

    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "firstName",
        }),
        expect.objectContaining({
          field: "emailId",
        }),
        expect.objectContaining({
          field: "password",
        }),
      ])
    );
  });

  test("rejects duplicate email", async () => {
    const emailId = `duplicate-${Date.now()}@codenova.test`;

    const firstResponse = await request(app)
      .post("/user/register")
      .send({
        firstName: "Duplicate",
        lastName: "Test",
        emailId,
        age: 22,
        password: "Test@12345",
      });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post("/user/register")
      .send({
        firstName: "Duplicate",
        lastName: "Test",
        emailId,
        age: 22,
        password: "Test@12345",
      });

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.body).toEqual({
      success: false,
      message: "A record with that value already exists.",
      error: {
        code: "DUPLICATE_RECORD",
      },
    });
  });
});

test("logs in successfully with valid credentials", async () => {
  const emailId = `login-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const registerResponse = await request(app)
    .post("/user/register")
    .send({
      firstName: "Login",
      lastName: "Test",
      emailId,
      age: 22,
      password,
    });

  expect(registerResponse.statusCode).toBe(201);

  const loginResponse = await request(app)
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  expect(loginResponse.body).toEqual(
    expect.objectContaining({
      success: true,
      message: "Logged in successfully",
      data: expect.objectContaining({
        firstName: "Login",
        emailId,
        role: "user",
      }),
    })
  );

  expect(loginResponse.headers["set-cookie"]).toBeDefined();
});

test("rejects wrong password", async () => {
  const emailId = `wrong-password-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const registerResponse = await request(app)
    .post("/user/register")
    .send({
      firstName: "Wrong",
      lastName: "Password",
      emailId,
      age: 22,
      password,
    });

  expect(registerResponse.statusCode).toBe(201);

  const response = await request(app)
    .post("/user/login")
    .send({
      emailId,
      password: "Wrong@12345",
    });

  expect(response.statusCode).toBe(401);

  expect(response.body).toEqual({
    success: false,
    message: "Invalid email or password.",
    error: {
      code: "AUTHENTICATION_ERROR",
    },
  });
});

test("rejects unknown email", async () => {
  const response = await request(app)
    .post("/user/login")
    .send({
      emailId: `unknown-${Date.now()}@codenova.test`,
      password: "Test@12345",
    });

  expect(response.statusCode).toBe(401);

  expect(response.body).toEqual({
    success: false,
    message: "Invalid email or password.",
    error: {
      code: "AUTHENTICATION_ERROR",
    },
  });
});
test("returns the authenticated user from /user/check", async () => {
  const emailId = `check-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const registerResponse = await request(app)
    .post("/user/register")
    .send({
      firstName: "Check",
      lastName: "User",
      emailId,
      age: 22,
      password,
    });

  expect(registerResponse.statusCode).toBe(201);

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const checkResponse = await agent
    .get("/user/check");

  expect(checkResponse.statusCode).toBe(200);

  expect(checkResponse.body).toEqual({
    success: true,
    message: "Valid User",
    data: {
      firstName: "Check",
      emailId,
      _id: expect.any(String),
      role: "user",
    },
  });
});

test("rejects unauthenticated /user/check request", async () => {
  const response = await request(app)
    .get("/user/check");

  expect(response.statusCode).toBe(401);

  expect(response.body).toEqual({
    success: false,
    message: "Authentication required.",
    error: {
      code: "AUTHENTICATION_ERROR",
    },
  });
});

test("logs out successfully and blocks the JWT", async () => {
  const emailId = `logout-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  await request(app)
    .post("/user/register")
    .send({
      firstName: "Logout",
      lastName: "Test",
      emailId,
      age: 22,
      password,
    });

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const checkBeforeLogout = await agent
    .get("/user/check");

  expect(checkBeforeLogout.statusCode).toBe(200);

  const logoutResponse = await agent
    .post("/user/logout");

  expect(logoutResponse.statusCode).toBe(200);

  expect(logoutResponse.body).toEqual({
    success: true,
    message: "Logged out successfully",
    data: null,
  });

  const checkAfterLogout = await agent
    .get("/user/check");

  expect(checkAfterLogout.statusCode).toBe(401);

  expect(checkAfterLogout.body).toEqual({
    success: false,
    message: "Authentication required.",
    error: {
      code: "AUTHENTICATION_ERROR",
    },
  });
});
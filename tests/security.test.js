const request = require("supertest");
const app = require("../src/app");

describe("Security", () => {
  test("includes security headers", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.statusCode).toBe(200);

    expect(response.headers["x-content-type-options"]).toBe(
      "nosniff"
    );

    expect(response.headers["x-frame-options"]).toBeDefined();

    expect(response.headers["strict-transport-security"]).toBeDefined();
  });
});

test("does not allow an unauthorized CORS origin", async () => {
  const maliciousOrigin = "http://malicious.example.com";

  const response = await request(app)
    .get("/health")
    .set("Origin", maliciousOrigin);

  expect(response.statusCode).toBe(200);

  expect(
    response.headers["access-control-allow-origin"]
  ).not.toBe(maliciousOrigin);
});

test("rejects request body larger than 1 MB", async () => {
  const largePayload = {
    data: "a".repeat(1024 * 1024 + 100),
  };

  const response = await request(app)
    .post("/user/login")
    .send(largePayload);

  expect(response.statusCode).toBe(413);

  expect(response.body).toEqual(
    expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: "PAYLOAD_TOO_LARGE",
      }),
    })
  );
});

test("returns production-safe error structure for unknown routes", async () => {
  const response = await request(app)
    .get("/this-route-does-not-exist");

  expect(response.statusCode).toBe(404);

  expect(response.body).toEqual({
    success: false,
    message: "Route not found.",
    error: {
      code: "NOT_FOUND",
    },
  });

  expect(response.body.stack).toBeUndefined();
  expect(response.body.error.stack).toBeUndefined();
});
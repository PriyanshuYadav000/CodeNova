const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  test("returns CodeNova API health status", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "CodeNova API is healthy",
    });
  });
});
module.exports = {
  testEnvironment: "node",

  setupFiles: ["<rootDir>/tests/setup.js"],

  testMatch: ["<rootDir>/tests/**/*.test.js"],

  clearMocks: true,

  restoreMocks: true,

  maxWorkers: 1,
};
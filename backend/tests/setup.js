const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.CLIENT_URL = "http://localhost:5173";

process.env.COOKIE_SAME_SITE = "lax";

process.env.RATE_LIMIT_WINDOW_MS = "60000";
process.env.RATE_LIMIT_LOGIN_MAX = "10";
process.env.RATE_LIMIT_REGISTER_MAX = "5";
process.env.RATE_LIMIT_ADMIN_REGISTER_MAX = "3";
process.env.RATE_LIMIT_CODE_RUN_MAX = "10";
process.env.RATE_LIMIT_CODE_SUBMIT_MAX = "5";
process.env.RATE_LIMIT_GENERAL_MAX = "120";
process.env.RATE_LIMIT_ADMIN_WRITE_MAX = "20";

process.env.PROBLEM_CACHE_TTL_SECONDS = "300";
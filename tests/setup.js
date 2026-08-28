const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

process.env.NODE_ENV = "test";
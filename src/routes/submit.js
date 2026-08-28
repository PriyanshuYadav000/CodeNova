
const {codeRunRateLimiter,codeSubmitRateLimiter,} = require("../middleware/rateLimiter");
const express = require('express');
const { submitCode, runCode } = require('../controllers/userSubmission');
const userMiddleware = require('../middleware/userMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateSubmission } = require('../validators/requestValidation');

const submitRouter = express.Router();

submitRouter.post('/submit/:id', userMiddleware,codeSubmitRateLimiter, validateBody(validateSubmission), asyncHandler(submitCode));
submitRouter.post('/run/:id', userMiddleware, codeRunRateLimiter,validateBody(validateSubmission), asyncHandler(runCode));

module.exports = submitRouter;

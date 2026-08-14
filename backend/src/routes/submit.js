const express = require('express');
const { submitCode, runCode } = require('../controllers/userSubmission');
const userMiddleware = require('../middleware/userMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateSubmission } = require('../validators/requestValidation');

const submitRouter = express.Router();

submitRouter.post('/submit/:id', userMiddleware, validateBody(validateSubmission), asyncHandler(submitCode));
submitRouter.post('/run/:id', userMiddleware, validateBody(validateSubmission), asyncHandler(runCode));

module.exports = submitRouter;

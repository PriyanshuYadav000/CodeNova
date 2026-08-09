const express = require('express');
const { submitCode, runCode } = require('../controllers/userSubmission');
const userMiddleware = require('../middleware/userMiddleware');

const submitRouter = express.Router();

submitRouter.post('/submit/:id', userMiddleware, submitCode);
submitRouter.post('/run/:id', userMiddleware, runCode);

module.exports = submitRouter;

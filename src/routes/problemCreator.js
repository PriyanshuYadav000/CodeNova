const { generalRateLimiter, adminWriteRateLimiter } = require("../middleware/rateLimiter"); // ← NEW
const express = require('express');
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem
} = require('../controllers/userProblem');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateProblem } = require('../validators/requestValidation');

const problemRouter = express.Router();

problemRouter.post('/create', adminMiddleware,adminWriteRateLimiter, validateBody(validateProblem), asyncHandler(createProblem));
problemRouter.put('/update/:id', adminMiddleware,adminWriteRateLimiter, validateBody(validateProblem), asyncHandler(updateProblem));
problemRouter.delete('/delete/:id', adminMiddleware,adminWriteRateLimiter, asyncHandler(deleteProblem));

problemRouter.get('/problemById/:id',userMiddleware,generalRateLimiter, asyncHandler(getProblemById));
problemRouter.get('/getAllProblem', userMiddleware, generalRateLimiter, asyncHandler(getAllProblem));
problemRouter.get('/problemSolvedByUser', userMiddleware,generalRateLimiter, asyncHandler(solvedAllProblembyUser));
problemRouter.get('/submittedProblem/:pid', userMiddleware,generalRateLimiter, asyncHandler(submittedProblem));

module.exports = problemRouter;

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

problemRouter.post('/create', adminMiddleware, validateBody(validateProblem), asyncHandler(createProblem));
problemRouter.put('/update/:id', adminMiddleware, validateBody(validateProblem), asyncHandler(updateProblem));
problemRouter.delete('/delete/:id', adminMiddleware, asyncHandler(deleteProblem));

problemRouter.get('/problemById/:id', userMiddleware, asyncHandler(getProblemById));
problemRouter.get('/getAllProblem', userMiddleware, asyncHandler(getAllProblem));
problemRouter.get('/problemSolvedByUser', userMiddleware, asyncHandler(solvedAllProblembyUser));
problemRouter.get('/submittedProblem/:pid', userMiddleware, asyncHandler(submittedProblem));

module.exports = problemRouter;

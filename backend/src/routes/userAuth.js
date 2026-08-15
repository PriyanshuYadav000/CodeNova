const { loginRateLimiter ,registerRateLimiter,adminRegisterRateLimiter} = require("../middleware/rateLimiter");
const express = require('express');
const {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile
} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateRegistration, validateLogin } = require('../validators/requestValidation');

const authRouter = express.Router();

authRouter.post('/register', registerRateLimiter,validateBody(validateRegistration), asyncHandler(register));
authRouter.post('/login', loginRateLimiter, validateBody(validateLogin), asyncHandler(login));
authRouter.post('/logout', userMiddleware, asyncHandler(logout));
authRouter.post('/admin/register',adminMiddleware,adminRegisterRateLimiter,validateBody(validateRegistration), asyncHandler(adminRegister));
authRouter.delete('/deleteProfile', userMiddleware, asyncHandler(deleteProfile));
authRouter.get('/check', userMiddleware, (req, res) => {
  const reply = {
  firstName: req.result.firstName,
  emailId: req.result.emailId,
  _id: req.result.id,
  role: req.result.role
};

  res.status(200).json({
    success: true,
    message: 'Valid User',
    data: reply
  });
});

module.exports = authRouter;

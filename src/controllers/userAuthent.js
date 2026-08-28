const redisClient = require("../config/redis");
const prisma = require('../config/prisma');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const redisKey = require("../utils/redisKey"); 

const tokenCookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
};

const clearTokenCookieOptions = {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
};
const userResponse = (user) => ({
    firstName: user.firstName,
    emailId: user.emailId,
    _id: user.id,
    role: user.role
});

const register = async (req, res, next) => {
    try {
        const { firstName, lastName, emailId, age, password } = req.body;
        const normalizedEmailId = emailId.trim().toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                emailId: normalizedEmailId,
                age,
                password: hashedPassword,
                role: 'user'
            }
        });
        const token = jwt.sign(
            { _id: user.id, emailId: user.emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, tokenCookieOptions);
        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            data: userResponse(user)
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            throw new AppError('Email and password are required.', 400, 'VALIDATION_ERROR');
        }

        const user = await prisma.user.findUnique({
            where: { emailId: emailId.trim().toLowerCase() }
        });

        if (!user) {
            throw new AppError('Invalid email or password.', 401, 'AUTHENTICATION_ERROR');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new AppError('Invalid email or password.', 401, 'AUTHENTICATION_ERROR');
        }

        const token = jwt.sign(
            { _id: user.id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, tokenCookieOptions);
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: userResponse(user)
        });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new AppError('Not authenticated.', 401, 'AUTHENTICATION_ERROR');
        }

        const payload = jwt.decode(token);

        await redisClient.set(redisKey(`token:${token}`),"Blocked"); // ← CHANGED
        await redisClient.expireAt(redisKey(`token:${token}`), payload.exp); // ← CHANGED

        res.clearCookie("token", clearTokenCookieOptions);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: null
        });
    } catch (err) {
        if (err instanceof AppError) return next(err);
        next(new AppError('Unable to log out at this time. Please try again later.', 503, 'EXTERNAL_SERVICE_ERROR'));
    }
};

const adminRegister = async (req, res, next) => {
    try {
        const { firstName, lastName, emailId, age, password } = req.body;
        const normalizedEmailId = emailId.trim().toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                emailId: normalizedEmailId,
                age,
                password: hashedPassword,
                role: 'admin'
            }
        });
        const token = jwt.sign(
            { _id: user.id, emailId: user.emailId, role: 'admin' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, tokenCookieOptions);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: userResponse(user)
        });
    } catch (err) {
        next(err);
    }
};

// TODO: Decide whether account deletion should delete, anonymize, or retain user submissions.
const deleteProfile = async (req, res, next) => {
    try {
        await prisma.user.delete({
            where: { id: req.result.id }
        });

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };

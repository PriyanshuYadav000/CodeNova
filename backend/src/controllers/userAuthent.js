const redisClient = require("../config/redis");
const prisma = require('../config/prisma');
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const tokenCookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
};

const clearTokenCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now())
};

const userResponse = (user) => ({
    firstName: user.firstName,
    emailId: user.emailId,
    _id: user.id,
    role: user.role
});

const sendError = (res, status, message) => {
    res.status(status).json({
        success: false,
        message,
        error: null
    });
};

const registrationErrorStatus = (err) => (err && err.code === 'P2002' ? 409 : 400);
const registrationErrorMessage = (err) => (
    err && err.code === 'P2002'
        ? 'An account with this email already exists.'
        : 'Please provide valid registration details.'
);

const register = async (req, res) => {
    try {
        validate(req.body);
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
        sendError(res, registrationErrorStatus(err), registrationErrorMessage(err));
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return sendError(res, 400, 'Email and password are required.');
        }

        const user = await prisma.user.findUnique({
            where: { emailId: emailId.trim().toLowerCase() }
        });

        if (!user) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return sendError(res, 401, 'Invalid email or password.');
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
        sendError(res, 500, 'Unable to log in at this time. Please try again later.');
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return sendError(res, 401, 'Not authenticated.');
        }

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie('token', null, clearTokenCookieOptions);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: null
        });
    } catch (err) {
        sendError(res, 503, 'Unable to log out at this time. Please try again later.');
    }
};

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
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
        sendError(res, registrationErrorStatus(err), registrationErrorMessage(err));
    }
};

// TODO: Decide whether account deletion should delete, anonymize, or retain user submissions.
const deleteProfile = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.result._id }
        });

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully',
            data: null
        });
    } catch (err) {
        sendError(res, 500, 'Unable to delete the profile at this time. Please try again later.');
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };

const redisClient = require("../config/redis");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

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
    lastName: user.lastName,
    emailId: user.emailId,
    age: user.age,
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
                role: "user"
            }
        });

        const token = jwt.sign(
            {
                _id: user.id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        res.cookie("token", token, tokenCookieOptions);

        res.status(201).json({
            success: true,
            message: "Registered successfully",
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
            throw new AppError(
                "Email and password are required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                emailId: emailId.trim().toLowerCase()
            }
        });

        if (!user) {
            throw new AppError(
                "Invalid email or password.",
                401,
                "AUTHENTICATION_ERROR"
            );
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new AppError(
                "Invalid email or password.",
                401,
                "AUTHENTICATION_ERROR"
            );
        }

        const token = jwt.sign(
            {
                _id: user.id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        res.cookie("token", token, tokenCookieOptions);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
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
            throw new AppError(
                "Not authenticated.",
                401,
                "AUTHENTICATION_ERROR"
            );
        }

        const payload = jwt.decode(token);

        if (payload?.exp) {
            await redisClient.set(
                redisKey(`token:${token}`),
                "Blocked"
            );

            await redisClient.expireAt(
                redisKey(`token:${token}`),
                payload.exp
            );
        }

        res.clearCookie("token", clearTokenCookieOptions);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
            data: null
        });
    } catch (err) {
        if (err instanceof AppError) {
            return next(err);
        }

        next(
            new AppError(
                "Unable to log out at this time. Please try again later.",
                503,
                "EXTERNAL_SERVICE_ERROR"
            )
        );
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
                role: "admin"
            }
        });

        const token = jwt.sign(
            {
                _id: user.id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        res.cookie("token", token, tokenCookieOptions);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: userResponse(user)
        });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.result.id;

        const {
            firstName,
            lastName,
            age
        } = req.body;

        if (!firstName?.trim()) {
            throw new AppError(
                "First name is required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (!lastName?.trim()) {
            throw new AppError(
                "Last name is required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (
            age === undefined ||
            age === null ||
            Number.isNaN(Number(age)) ||
            Number(age) < 13 ||
            Number(age) > 120
        ) {
            throw new AppError(
                "Age must be between 13 and 120.",
                400,
                "VALIDATION_ERROR"
            );
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                age: Number(age)
            }
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userResponse(updatedUser)
        });
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.result.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            throw new AppError(
                "Current password and new password are required.",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (newPassword.length < 6) {
            throw new AppError(
                "New password must be at least 6 characters long.",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (currentPassword === newPassword) {
            throw new AppError(
                "New password must be different from your current password.",
                400,
                "VALIDATION_ERROR"
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new AppError(
                "User not found.",
                404,
                "NOT_FOUND"
            );
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            throw new AppError(
                "Current password is incorrect.",
                401,
                "AUTHENTICATION_ERROR"
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: null
        });
    } catch (err) {
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        await prisma.user.delete({
            where: {
                id: req.result.id
            }
        });

        res.clearCookie("token", clearTokenCookieOptions);

        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
            data: null
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    logout,
    adminRegister,
    updateProfile,
    changePassword,
    deleteProfile
};
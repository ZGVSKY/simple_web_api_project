const authService = require('../services/authService');
const asyncHandler = require('express-async-handler');

// Налаштування кук для Refresh Token
const cookieOptions = {
    httpOnly: true, // Захист від XSS
    secure: process.env.NODE_ENV === 'production', // Тільки через HTTPS у продакшені
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
};

exports.register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({ ...user, accessToken });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ ...user, accessToken });
});

exports.refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        res.status(401);
        throw new Error('Refresh токен відсутній');
    }

    const { accessToken, user } = await authService.refreshSession(refreshToken);
    res.json({ ...user, accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Вихід успішний' });
});

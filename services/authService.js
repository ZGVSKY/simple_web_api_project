const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
    generateAccessToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    }

    generateRefreshToken(id) {
        return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123', { expiresIn: '7d' });
    }

    async registerUser(userData) {
        const { username, email, password } = userData;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('Користувач вже існує');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.create({ username, email, password });
        
        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            accessToken: this.generateAccessToken(user._id),
            refreshToken: this.generateRefreshToken(user._id)
        };
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            return {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                },
                accessToken: this.generateAccessToken(user._id),
                refreshToken: this.generateRefreshToken(user._id)
            };
        } else {
            const error = new Error('Невірний email або пароль');
            error.statusCode = 401;
            throw error;
        }
    }

    async refreshSession(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123');
            const user = await User.findById(decoded.id);
            if (!user) throw new Error('User not found');

            return {
                accessToken: this.generateAccessToken(user._id),
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            };
        } catch (err) {
            const error = new Error('Недійсний refresh токен');
            error.statusCode = 401;
            throw error;
        }
    }
}

module.exports = new AuthService();

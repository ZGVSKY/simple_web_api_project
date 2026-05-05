const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Ім’я користувача обов’язкове'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email обов’язковий'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Пароль обов’язковий'],
        minlength: 6
    }
}, {
    timestamps: true
});

// Хешування пароля перед збереженням
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Метод для перевірки пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

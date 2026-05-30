const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        'string.min': 'Ім’я має бути не менше 3 символів',
        'any.required': 'Ім’я користувача обов’язкове'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Введіть коректний email'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Пароль має бути не менше 6 символів'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };

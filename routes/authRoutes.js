const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація з Refresh Token
 *     tags: [Auth]
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід з Refresh Token
 *     tags: [Auth]
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення Access Token за допомогою Cookie
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід (очищення Cookie)
 *     tags: [Auth]
 */
router.post('/logout', authController.logout);

module.exports = router;

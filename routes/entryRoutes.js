const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');

// Усі маршрути захищені
router.use(protect);

/**
 * @swagger
 * /api/entries:
 *   post:
 *     summary: Створити новий запис у щоденнику
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entry'
 *     responses:
 *       201:
 *         description: Запис успішно створено
 */
router.post('/', entryController.createEntry);

/**
 * @swagger
 * /api/entries:
 *   get:
 *     summary: Отримати список усіх записів користувача
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список записів
 */
router.get('/', entryController.getEntries);

/**
 * @swagger
 * /api/entries/export:
 *   get:
 *     summary: Експорт записів у .txt файл
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Файл успішно згенеровано
 */
router.get('/export', entryController.exportEntries);

/**
 * @swagger
 * /api/entries/{id}:
 *   get:
 *     summary: Отримати запис за ID
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Деталі запису
 */
router.get('/:id', entryController.getEntryById);

/**
 * @swagger
 * /api/entries/{id}:
 *   put:
 *     summary: Оновити запис за ID
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entry'
 *     responses:
 *       200:
 *         description: Запис оновлено
 */
router.put('/:id', entryController.updateEntry);

/**
 * @swagger
 * /api/entries/{id}:
 *   delete:
 *     summary: Видалити запис за ID
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Запис видалено
 */
router.delete('/:id', entryController.deleteEntry);

module.exports = router;

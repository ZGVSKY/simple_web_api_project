const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { entrySchema, updateEntrySchema } = require('../validations/entryValidation');

// Усі маршрути захищені
router.use(protect);

/**
 * @swagger
 * /api/entries:
 *   post:
 *     summary: Створити новий запис
 *     tags: [Entries]
 */
router.post('/', validate(entrySchema), entryController.createEntry);

/**
 * @swagger
 * /api/entries:
 *   get:
 *     summary: Отримати записи з пагінацією
 *     tags: [Entries]
 */
router.get('/', entryController.getEntries);

/**
 * @swagger
 * /api/entries/trash:
 *   get:
 *     summary: Отримати записи з кошика
 *     tags: [Trash]
 */
router.get('/trash', entryController.getTrash);

/**
 * @swagger
 * /api/entries/export:
 *   get:
 *     summary: Експорт у TXT
 *     tags: [Entries]
 */
router.get('/export', entryController.exportEntries);

/**
 * @swagger
 * /api/entries/{id}:
 *   get:
 *     summary: Отримати за ID
 *     tags: [Entries]
 */
router.get('/:id', entryController.getEntryById);

/**
 * @swagger
 * /api/entries/{id}/history:
 *   get:
 *     summary: Отримати історію змін запису
 *     tags: [History]
 */
router.get('/:id/history', entryController.getHistory);

/**
 * @swagger
 * /api/entries/{id}:
 *   put:
 *     summary: Оновити за ID
 *     tags: [Entries]
 */
router.put('/:id', validate(updateEntrySchema), entryController.updateEntry);

/**
 * @swagger
 * /api/entries/{id}:
 *   delete:
 *     summary: Перемістити в кошик
 *     tags: [Entries]
 */
router.delete('/:id', entryController.deleteEntry);

/**
 * @swagger
 * /api/entries/{id}/restore:
 *   patch:
 *     summary: Відновити запис із кошика
 *     tags: [Trash]
 */
router.patch('/:id/restore', entryController.restoreEntry);

/**
 * @swagger
 * /api/entries/{id}/permanent:
 *   delete:
 *     summary: Видалити назавжди
 *     tags: [Trash]
 */
router.delete('/:id/permanent', entryController.permanentlyDeleteEntry);

module.exports = router;

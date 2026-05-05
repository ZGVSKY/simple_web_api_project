const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Entry:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the entry
 *         title:
 *           type: string
 *           description: The title of the diary entry
 *         content:
 *           type: string
 *           description: The main text content of the entry
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the entry
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of the entry
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         title: Мій продуктивний день
 *         content: Сьогодні я завершив планування проекту та почав розробку бази даних.
 *         tags: ["робота", "планування"]
 *         date: 2026-05-05T10:00:00.000Z
 */

const entrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Заголовок обов’язковий'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Контент обов’язковий']
    },
    tags: {
        type: [String],
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Entry', entrySchema);

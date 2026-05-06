const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     EntryHistory:
 *       type: object
 *       properties:
 *         entryId:
 *           type: string
 *         oldData:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *         versionAt:
 *           type: string
 *           format: date-time
 */

const historySchema = new mongoose.Schema({
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry',
        required: true,
        index: true
    },
    oldData: {
        title: String,
        content: String,
        tags: [String]
    },
    versionAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EntryHistory', historySchema);

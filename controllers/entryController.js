const entryService = require('../services/entryService');
const asyncHandler = require('express-async-handler');

// @desc    Create new entry
// @route   POST /api/entries
exports.createEntry = asyncHandler(async (req, res) => {
    const entry = await entryService.createEntry(req.user.id, req.body);
    res.status(201).json(entry);
});

// @desc    Get all entries (active only)
// @route   GET /api/entries
exports.getEntries = asyncHandler(async (req, res) => {
    const data = await entryService.getEntries(req.user.id, req.query);
    res.json(data);
});

// @desc    Get entry by ID
// @route   GET /api/entries/:id
exports.getEntryById = asyncHandler(async (req, res) => {
    const entry = await entryService.getEntryById(req.user.id, req.params.id);
    res.json(entry);
});

// @desc    Update entry
// @route   PUT /api/entries/:id
exports.updateEntry = asyncHandler(async (req, res) => {
    const entry = await entryService.updateEntry(req.user.id, req.params.id, req.body);
    res.json(entry);
});

// @desc    Soft delete entry (move to trash)
// @route   DELETE /api/entries/:id
exports.deleteEntry = asyncHandler(async (req, res) => {
    await entryService.softDeleteEntry(req.user.id, req.params.id);
    res.json({ message: 'Запис переміщено в кошик' });
});

// @desc    Get trash entries
// @route   GET /api/entries/trash
exports.getTrash = asyncHandler(async (req, res) => {
    const entries = await entryService.getTrash(req.user.id);
    res.json(entries);
});

// @desc    Restore entry from trash
// @route   PATCH /api/entries/:id/restore
exports.restoreEntry = asyncHandler(async (req, res) => {
    const entry = await entryService.restoreEntry(req.user.id, req.params.id);
    res.json({ message: 'Запис відновлено', entry });
});

// @desc    Permanently delete entry
// @route   DELETE /api/entries/:id/permanent
exports.permanentlyDeleteEntry = asyncHandler(async (req, res) => {
    await entryService.permanentlyDeleteEntry(req.user.id, req.params.id);
    res.json({ message: 'Запис видалено назавжди' });
});

// @desc    Export entries to .txt
// @route   GET /api/entries/export
exports.exportEntries = asyncHandler(async (req, res) => {
    const content = await entryService.getExportContent(req.user.id, req.user.username);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=diary_export.txt');
    res.send(content);
});

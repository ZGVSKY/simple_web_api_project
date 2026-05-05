const Entry = require('../models/Entry');

// Створення запису
exports.createEntry = async (req, res) => {
    try {
        const entry = new Entry({
            ...req.body,
            user: req.user.id
        });
        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Отримання списку записів з фільтрацією
exports.getEntries = async (req, res) => {
    try {
        const { date, tag } = req.query;
        let query = { user: req.user.id };

        if (date) {
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (tag) {
            query.tags = tag;
        }

        const entries = await Entry.find(query).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Отримання одного запису
exports.getEntryById = async (req, res) => {
    try {
        const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
        if (!entry) return res.status(404).json({ message: 'Запис не знайдено' });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Оновлення запису
exports.updateEntry = async (req, res) => {
    try {
        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!entry) return res.status(404).json({ message: 'Запис не знайдено' });
        res.json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Видалення запису
exports.deleteEntry = async (req, res) => {
    try {
        const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!entry) return res.status(404).json({ message: 'Запис не знайдено' });
        res.json({ message: 'Запис видалено' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Експорт у .txt
exports.exportEntries = async (req, res) => {
    try {
        const entries = await Entry.find({ user: req.user.id }).sort({ date: -1 });
        
        let content = `=== ЩОДЕННИК КОРИСТУВАЧА: ${req.user.username} ===\n\n`;
        
        entries.forEach(entry => {
            content += `Дата: ${entry.date.toLocaleString('uk-UA')}\n`;
            content += `Заголовок: ${entry.title}\n`;
            content += `Теги: ${entry.tags.join(', ')}\n`;
            content += `Зміст:\n${entry.content}\n`;
            content += "-----------------------------------\n\n";
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=diary_export.txt');
        res.send(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Entry = require('../models/Entry');
const History = require('../models/History');

class EntryService {
    async createEntry(userId, entryData) {
        const entry = new Entry({
            ...entryData,
            user: userId
        });
        return await entry.save();
    }

    async getEntries(userId, filters) {
        const { date, tag, search, page = 1, limit = 10 } = filters;
        let query = { user: userId, isDeleted: false }; 

        if (date) {
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            // Використовуємо Full-Text Search замість $regex
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;
        const total = await Entry.countDocuments(query);
        
        // Додаємо сортування за релевантністю, якщо є пошуковий запит
        const entries = await Entry.find(query)
            .sort(search ? { score: { $meta: "textScore" } } : { date: -1 })
            .limit(Number(limit))
            .skip(skip);

        return {
            entries,
            page: Number(page),
            pages: Math.ceil(total / limit),
            total
        };
    }

    async getEntryById(userId, entryId) {
        const entry = await Entry.findOne({ _id: entryId, user: userId });
        if (!entry) {
            const error = new Error('Запис не знайдено');
            error.statusCode = 404;
            throw error;
        }
        return entry;
    }

    async updateEntry(userId, entryId, updateData) {
        // 1. Знаходимо поточний стан ПЕРЕД оновленням
        const currentEntry = await Entry.findOne({ _id: entryId, user: userId });
        if (!currentEntry) {
            const error = new Error('Запис не знайдено');
            error.statusCode = 404;
            throw error;
        }

        // 2. Зберігаємо знімок у історію
        await History.create({
            entryId: currentEntry._id,
            oldData: {
                title: currentEntry.title,
                content: currentEntry.content,
                tags: currentEntry.tags
            }
        });

        // 3. Оновлюємо
        const updatedEntry = await Entry.findOneAndUpdate(
            { _id: entryId, user: userId },
            updateData,
            { new: true, runValidators: true }
        );
        
        return updatedEntry;
    }

    async getEntryHistory(userId, entryId) {
        // Перевіряємо доступ до запису
        const entry = await Entry.findOne({ _id: entryId, user: userId });
        if (!entry) {
            const error = new Error('Запис не знайдено');
            error.statusCode = 404;
            throw error;
        }

        return await History.find({ entryId }).sort({ versionAt: -1 });
    }

    async softDeleteEntry(userId, entryId) {
        const entry = await Entry.findOneAndUpdate(
            { _id: entryId, user: userId },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!entry) {
            const error = new Error('Запис не знайдено');
            error.statusCode = 404;
            throw error;
        }
        return entry;
    }

    async getTrash(userId) {
        return await Entry.find({ user: userId, isDeleted: true })
            .setOptions({ withDeleted: true })
            .sort({ deletedAt: -1 });
    }

    async restoreEntry(userId, entryId) {
        const entry = await Entry.findOneAndUpdate(
            { _id: entryId, user: userId, isDeleted: true },
            { isDeleted: false, deletedAt: null },
            { new: true }
        ).setOptions({ withDeleted: true });
        
        if (!entry) {
            const error = new Error('Запис не знайдено у кошику');
            error.statusCode = 404;
            throw error;
        }
        return entry;
    }

    async permanentlyDeleteEntry(userId, entryId) {
        const entry = await Entry.findOneAndDelete({ 
            _id: entryId, 
            user: userId, 
            isDeleted: true 
        }).setOptions({ withDeleted: true });
        
        if (!entry) {
            const error = new Error('Запис не знайдено у кошику');
            error.statusCode = 404;
            throw error;
        }
        // Видаляємо також всю історію для цього запису
        await History.deleteMany({ entryId });
        
        return entry;
    }

    async getExportContent(userId, username) {
        const entries = await Entry.find({ user: userId }).sort({ date: -1 });
        let content = `=== ЩОДЕННИК КОРИСТУВАЧА: ${username} ===\n\n`;
        
        entries.forEach(entry => {
            content += `Дата: ${entry.date.toLocaleString('uk-UA')}\n`;
            content += `Заголовок: ${entry.title}\n`;
            content += `Теги: ${entry.tags.join(', ')}\n`;
            content += `Зміст:\n${entry.content}\n`;
            content += "-----------------------------------\n\n";
        });
        return content;
    }
}

module.exports = new EntryService();

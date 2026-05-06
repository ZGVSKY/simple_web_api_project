const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
    // Не спамимо помилками в тестах, якщо Redis не запущений
    if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Redis Error:', err.message);
    }
});

client.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('⚡ Redis Connected');
    }
});

// Підключаємося асинхронно
(async () => {
    try {
        await client.connect();
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('❌ Could not connect to Redis:', err.message);
        }
    }
})();

module.exports = client;

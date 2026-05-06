const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Entry = require('../models/Entry');
const User = require('../models/User');
const connectDB = require('../config/db');

let token;
let userId;

beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Entry.deleteMany({});

    const testUser = {
        username: 'testuser',
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
    
    token = res.body.accessToken;
    userId = res.body._id;
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
});

describe('Diary API with Auth', () => {
    let testEntryId;

    it('should NOT create an entry without token', async () => {
        const res = await request(app)
            .post('/api/entries')
            .send({ title: 'No Auth', content: 'Fail' });
        expect(res.statusCode).toEqual(401);
    });

    it('should create a new entry for authenticated user', async () => {
        expect(token).toBeDefined();
        const res = await request(app)
            .post('/api/entries')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'My Auth Entry',
                content: 'Secret content',
                tags: ['auth', 'test']
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.user).toBe(userId);
        testEntryId = res.body._id;
    });

    it('should fetch ONLY user entries', async () => {
        const res = await request(app)
            .get('/api/entries')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.entries).toBeDefined();
        expect(Array.isArray(res.body.entries)).toBeTruthy();
        expect(res.body.entries.length).toBeGreaterThan(0);
    });

    it('should update user entry', async () => {
        const res = await request(app)
            .put(`/api/entries/${testEntryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Auth Entry' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated Auth Entry');
    });

    it('should export user entries', async () => {
        const res = await request(app)
            .get('/api/entries/export')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.header['content-type']).toContain('text/plain');
    });

    it('should delete user entry', async () => {
        const res = await request(app)
            .delete(`/api/entries/${testEntryId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

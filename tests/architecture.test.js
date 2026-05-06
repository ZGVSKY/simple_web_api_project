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
        username: 'tester',
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

describe('Diary API Architecture Tests', () => {
    let testEntryId;

    describe('Auth Workflows', () => {
        it('should login an existing user', async () => {
            const user = await User.findOne({ _id: userId });
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body.accessToken).toBeDefined();
        });

        it('should return 400 for duplicate registration', async () => {
            const user = await User.findOne({ _id: userId });
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'another',
                    email: user.email,
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Користувач вже існує');
        });
    });

    describe('Entry Service Layer & Soft Delete', () => {
        it('should create an entry and automatically link to user', async () => {
            const res = await request(app)
                .post('/api/entries')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Service Layer Test',
                    content: 'Testing architecture',
                    tags: ['test']
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.user).toBe(userId);
            testEntryId = res.body._id;
        });

        it('should fetch entries with pagination structure', async () => {
            const res = await request(app)
                .get('/api/entries?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('entries');
            expect(res.body).toHaveProperty('total');
            expect(Array.isArray(res.body.entries)).toBeTruthy();
        });

        it('should perform SOFT DELETE', async () => {
            const deleteRes = await request(app)
                .delete(`/api/entries/${testEntryId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(deleteRes.statusCode).toEqual(200);
            expect(deleteRes.body.message).toContain('кошик');

            const listRes = await request(app)
                .get('/api/entries')
                .set('Authorization', `Bearer ${token}`);
            
            const entryExists = listRes.body.entries.some(e => e._id === testEntryId);
            expect(entryExists).toBeFalsy();
        });

        it('should find the deleted entry in TRASH', async () => {
            const res = await request(app)
                .get('/api/entries/trash')
                .set('Authorization', `Bearer ${token}`);
            
            const entryExists = res.body.some(e => e._id === testEntryId);
            expect(entryExists).toBeTruthy();
        });

        it('should RESTORE entry from trash', async () => {
            const res = await request(app)
                .patch(`/api/entries/${testEntryId}/restore`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            
            const listRes = await request(app)
                .get('/api/entries')
                .set('Authorization', `Bearer ${token}`);
            
            const entryExists = listRes.body.entries.some(e => e._id === testEntryId);
            expect(entryExists).toBeTruthy();
        });
    });
});

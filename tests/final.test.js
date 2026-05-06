const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Entry = require('../models/Entry');
const History = require('../models/History');
const User = require('../models/User');
const connectDB = require('../config/db');

let token;
let refreshToken;
let userId;

beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Entry.deleteMany({});
    await History.deleteMany({});

    const testUser = {
        username: 'final_tester',
        email: `final_${Date.now()}@example.com`,
        password: 'password123'
    };

    const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
    
    token = res.body.accessToken;
    userId = res.body._id;
    const cookies = res.headers['set-cookie'];
    if (cookies) {
        refreshToken = cookies[0].split(';')[0].split('=')[1];
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
});

describe('Final Integration Tests: Search, History, Auth', () => {
    let entryId;

    describe('Refresh Token Logic', () => {
        it('should refresh access token using cookie', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', [`refreshToken=${refreshToken}`]);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.accessToken).toBeDefined();
            token = res.body.accessToken;
        });

        it('should fail refresh with invalid cookie', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', ['refreshToken=wrong_token']);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Full-Text Search', () => {
        beforeAll(async () => {
            await request(app)
                .post('/api/entries')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Apple Pie', content: 'Cooking a delicious apple pie today.', tags: ['food'] });
        });

        it('should find entries by keyword "apple"', async () => {
            const res = await request(app)
                .get('/api/entries?search=apple')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.entries.length).toBeGreaterThan(0);
        });
    });

    describe('Entry History (Versioning)', () => {
        it('should create history record when entry is updated', async () => {
            const createRes = await request(app)
                .post('/api/entries')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Original Title', content: 'Original content' });
            
            entryId = createRes.body._id;

            await request(app)
                .put(`/api/entries/${entryId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' });

            const historyRes = await request(app)
                .get(`/api/entries/${entryId}/history`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(historyRes.statusCode).toEqual(200);
            expect(historyRes.body.length).toBeGreaterThan(0);
        });
    });
});

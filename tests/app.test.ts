import app from '../src/app';
import request from 'supertest';
import { config } from 'dotenv'

describe('App Tests', () => {
    beforeAll(() => {
        config()
    })

    test('App should be defined', () => {
        expect(app).toBeDefined();
    });

    describe('GET /collections', () => {
        test('It should respond with an array of collections', async () => {
            const response = await request(app).get('/collections');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            // Add more assertions here based on your expected response structure
        });
    });

});


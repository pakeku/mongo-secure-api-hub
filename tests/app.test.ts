import app from '../src/app';
import request from 'supertest';
import { config } from 'dotenv'
import { connectToDatabase } from '../src/mongo';

const dropCollections = async () => {
    const connection = await connectToDatabase();
    const db = connection.db();
    const collectionsList = await db.listCollections().toArray();

    await Promise.all(collectionsList.map(async (col) => {
        await db.collection(col.name).drop()
    }))

    await connection.close();
}

describe('App Tests', () => {

    beforeAll(async () => {
        config()
        await dropCollections()
    })

    afterAll(async () => {
        await dropCollections()
    })

    test('App should be defined', () => {
        expect(app).toBeDefined();
    });

    describe('GET /collections', () => {
        test('It should respond with an array of collections', async () => {
            const response = await request(app).get('/collections');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('POST /collections', () => {
        test('It should respond with a 201 status code', async () => {
            const response = await request(app).post('/collections').send({ collectionName: 'test' });
            expect(response.statusCode).toBe(201);
        });

        test('It should respond with a 400 status code if collection name is missing', async () => {
            const response = await request(app).post('/collections').send({});
            expect(response.statusCode).toBe(400);
        });

        test('It should respond with 501 status code if collection already exists', async () => {
            const response = await request(app).post('/collections').send({ collectionName: 'test' });
            expect(response.statusCode).toBe(501);
        });
    })

    describe('GET /collections/:collectionName', () => {
        test('It should respond with a 200 status code', async () => {
            const response = await request(app).get('/collections/test');
            expect(response.statusCode).toBe(200);
        });

        test('It should respond with a 404 status code if collection does not exist', async () => {
            const response = await request(app).get('/collections/does-not-exist');
            expect(response.statusCode).toBe(404);
        });
    })

    describe('POST /collections/:collectionName', () => {
        test('It should respond with a 201 status code', async () => {
            const response = await request(app).post('/collections/test').send({ name: 'test' });
            expect(response.statusCode).toBe(201);
        });

        test('It should respond with a 400 status code if document is missing', async () => {
            const response = await request(app).post('/collections/test').send({});
            expect(response.statusCode).toBe(400);
        });
    })

    describe('PUT /collections/:collectionName/:id', () => {
        test('It should respond with a 200 status code', async () => {
            const id = await request(app).post('/collections/test').send({ name: 'test' }).then(res => res.body.document._id)
            const response = await request(app).put(`/collections/test/${id}`).send({ name: 'updated test', _id: id });

            expect(response.statusCode).toBe(200);
        });

        test('It should respond with a 400 status code if document is missing', async () => {
            const response = await request(app).put('/collections/test/5effaa5662679b5af2c58829').send({});
            expect(response.statusCode).toBe(400);
        });

        test('It should respond with a 404 status code if document does not exist', async () => {
            const response = await request(app).put('/collections/test/5effaa5662679b5af2c58829').send({ name: 'test' });
            expect(response.statusCode).toBe(404);
        });
    });

    describe('DELETE /collections/:collectionName/:id', () => {
        test('It should respond with a 200 status code', async () => {
            const id = await request(app).post('/collections/test').send({ name: 'test' }).then(res => res.body.document._id)
            const response = await request(app).delete(`/collections/test/${id}`);
            expect(response.statusCode).toBe(200);
        });

        test('It should respond with a 404 status code if document does not exist', async () => {
            const response = await request(app).delete('/collections/test/5effaa5662679b5af2c58829');
            expect(response.statusCode).toBe(404);
        });

        test('It should validate id', async () => {
            const response = await request(app).delete('/collections/test/2');
            expect(response.statusCode).toBe(400);
        })
    })

});


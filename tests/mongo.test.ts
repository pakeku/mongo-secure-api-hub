import { MongoClient } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../src/mongo';
import { config } from 'dotenv';

describe('MongoDB Connection Tests', () => {
    beforeAll(() => {
        config();
    })

    let connection: MongoClient;

    test('connect should return a connection object', async () => {
        connection = await connectToDatabase();
        expect(connection).toBeInstanceOf(MongoClient)
        expect(connection).not.toBeNull();
    });

    test('disconnect should drop the connection', async () => {
        await expect(disconnectFromDatabase(connection)).resolves.not.toThrow();
        expect(connection).toBeNull();
    });
});

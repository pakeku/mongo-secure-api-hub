import { MongoClient } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../src/mongo';
import { config } from 'dotenv';

describe('MongoDB Connection Tests', () => {
    beforeAll(() => {
        config();
    });

    let connection: MongoClient | null = null;

    test('connect should return a connection object', async () => {
        connection = await connectToDatabase();
        expect(connection).toBeInstanceOf(MongoClient);
        // Test if the connection is active by attempting a database operation
        await expect(connection.db('test').command({ ping: 1 })).resolves.toBeTruthy();
    });

    test('disconnect should drop the connection', async () => {
        await expect(disconnectFromDatabase(connection)).resolves.not.toThrow();
        // After disconnecting, attempting a database operation should fail
        if (connection) {
            await expect(connection.db('test').command({ ping: 1 })).rejects.toThrow();
        } else {
            fail('Connection is null'); // Fail test if connection is null
        }
    });

    afterAll(async () => {
        if (connection) {
            await disconnectFromDatabase(connection);
        }
    });
});

import { MongoClient } from 'mongodb';

export const connectToDatabase = async (): Promise<MongoClient> => {
    // Check if the MONGO_URL is defined
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL environment variable is not defined.");
    }

    // Create a new MongoClient instance
    const client = new MongoClient(process.env.MONGO_URL);

    // Connect to the database and return the client
    await client.connect();
    return client;
};

export const disconnectFromDatabase = async (client: MongoClient | null = null): Promise<void> => {
    // Only attempt to close the connection if the client is not null
    if (client) {
        await client.close();
    }
};

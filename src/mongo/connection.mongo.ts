import { MongoClient } from 'mongodb';

export const connectToDatabase =
    async (): Promise<MongoClient> => await new MongoClient(process.env.MONGO_URL as string);

export const disconnectFromDatabase = async (client: MongoClient): Promise<void> =>
    await client.close();


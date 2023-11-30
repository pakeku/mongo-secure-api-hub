import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../mongo'
export const collectionsRouter = Router();

collectionsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    const connection = await connectToDatabase();
    const db = connection.db();
    const collectionsList = await db.collection('collections').find().toArray();

    res.send(collectionsList);
}).post('/', async (req: Request, res: Response): Promise<void> => {
    const collectionName = req.body.collectionName; // Get the collection name from request body

    if (!collectionName) {
        res.status(400).send('Collection name is required');
        return;
    }

    try {
        const connection = await connectToDatabase();
        const db = connection.db();

        // Create a new collection with the specified name
        await db.createCollection(collectionName);

        // Save the metadata in the 'collections' collection
        const collectionsMetadata = db.collection('collections');
        await collectionsMetadata.insertOne({ name: collectionName, createdAt: new Date() });
        await connection.close();
        res.status(201).send({ message: 'Collection created successfully', collectionName });
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).send('Error creating collection');
    }
});

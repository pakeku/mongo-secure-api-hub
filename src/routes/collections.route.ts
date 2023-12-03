import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../mongo';
import { ObjectId } from 'mongodb';

export const collectionsRouter = Router();

export function isValidObjectId(id: string) {
    return ObjectId.isValid(id) && new RegExp("^[0-9a-fA-F]{24}$").test(id);
}

collectionsRouter

    .post('/:collectionName', async (req, res) => {
        const collectionName = req.params.collectionName; // Get the collection name from request params
        const document = req.body; // Get the document from request body

        if (!document || Object.keys(document).length === 0) {
            res.status(400).send('Document is required');
            return;
        }

        try {
            const connection = await connectToDatabase();
            const db = connection.db();

            // Check if the collection exists
            const collectionsList = await db.listCollections().toArray();
            const exists = collectionsList.some(col => col.name === collectionName);

            if (!exists) {
                await connection.close();
                res.status(404).send(`Collection ${collectionName} does not exist`);
                return;
            }

            // Insert the document into the specified collection
            const collection = db.collection(collectionName);
            await collection.insertOne(document);
            await connection.close();

            res.status(201).send({ message: 'Document inserted successfully', document });
        } catch (error) {
            console.error('Error inserting document:', error);
            res.status(500).send('Error inserting document');
        }
    })
    .delete('/:collectionName/:id', async (req, res) => {
        const collectionName = req.params.collectionName; // Get the collection name from request params
        const id = req.params.id; // Get the ID from URL params

        if (!isValidObjectId(id)) {
            res.status(400).send('Invalid ID');
            return;
        }

        try {
            const connection = await connectToDatabase();
            const db = connection.db();

            // Check if the collection exists
            const collectionsList = await db.listCollections().toArray();
            const exists = collectionsList.some(col => col.name === collectionName);

            if (!exists) {
                await connection.close();
                res.status(404).send(`Collection ${collectionName} does not exist`);
                return;
            }

            // Check if document exists
            const collection = db.collection(collectionName);
            const existingDoc = await collection.findOne({ _id: new ObjectId(id) });
            if (!existingDoc) {
                await connection.close();
                res.status(404).send('Document not found');
                return;
            }

            // Delete the document
            await collection.deleteOne({ _id: new ObjectId(id) });
            await connection.close();

            res.send({ message: 'Document deleted successfully', id });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).send('Error deleting document');
        }
    })
    .delete('/:collectionName', async (req, res) => {
        const collectionName = req.params.collectionName; // Get the collection name from request params

        try {
            const connection = await connectToDatabase();
            const db = connection.db();

            // Check if the collection exists
            const collectionsList = await db.listCollections().toArray();
            const exists = collectionsList.some(col => col.name === collectionName);

            if (!exists) {
                await connection.close();
                res.status(404).send(`Collection ${collectionName} does not exist`);
                return;
            }

            // Drop the collection
            await db.dropCollection(collectionName);

            // Delete the metadata from the 'collections' collection
            const collectionsMetadata = db.collection('collections');
            await collectionsMetadata.deleteOne({ name: collectionName });
            await connection.close();

            res.send({ message: 'Collection deleted successfully', collectionName });
        } catch (error) {
            console.error('Error deleting collection:', error);
            res.status(500).send('Error deleting collection');
        }
    }).put('/:collectionName/:id', async (req, res) => {
        const collectionName = req.params.collectionName;
        const id = req.params.id; // Get the ID from URL params
        const document = req.body;

        // Check if the body contains fields other than '_id'
        const updateFields = { ...document };
        delete updateFields._id;
        if (Object.keys(updateFields).length === 0) {
            res.status(400).send('Update fields are required');
            return;
        }

        try {
            const connection = await connectToDatabase();
            const db = connection.db();
            const collection = db.collection(collectionName);

            // Check if document exists
            const existingDoc = await collection.findOne({ _id: new ObjectId(id) });
            if (!existingDoc) {
                res.status(404).send('Document not found');
                return;
            }

            // Update the document
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
            res.send({ message: 'Document updated successfully', document });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).send('Error updating document');
        }
    })
    .get('/:collectionName', async (req, res) => {
        const collectionName = req.params.collectionName; // Get the collection name from request params

        try {
            const connection = await connectToDatabase();
            const db = connection.db();

            // Check if the collection exists
            const collectionsList = await db.listCollections().toArray();
            const exists = collectionsList.some(col => col.name === collectionName);

            if (!exists) {
                await connection.close();
                res.status(404).send(`Collection ${collectionName} does not exist`);
                return;
            }

            // Get all documents from the specified collection
            const collection = db.collection(collectionName);
            const documents = await collection.find().toArray();
            await connection.close();

            res.send(documents);
        } catch (error) {
            console.error('Error getting documents:', error);
            res.status(500).send('Error getting documents');
        }
    })
    .get('/', async (req: Request, res: Response): Promise<void> => {
        const connection = await connectToDatabase();
        const db = connection.db();
        const collectionsList = await db.collection('collections').find().toArray();

        await connection.close();
        res.send(collectionsList);
    })
    .post('/', async (req: Request, res: Response): Promise<void> => {
        const collectionName = req.body.collectionName;

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
            res.status(501).send(`Error creating collection ${collectionName}, it may already exist`);
        }
    });

import express from 'express';
import { collectionsRouter } from './routes/collections.route';

const app = express();

// ... middleware 
app.use(express.json());
// ... routes
app.use('/collections', collectionsRouter);

export default app;

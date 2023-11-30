import express from 'express';
import { collectionsRouter } from './routes/collections.route';

const app = express();

app.use('/collections', collectionsRouter);

// ... middleware and routes

export default app;

import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './api/index.js';
const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
// API routes
app.use('/api', apiRouter);
// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './api/index.js';
const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
// Root endpoint - API information
app.get('/', (_req, res) => {
    res.json({
        name: '小卡拼车网页系统 API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
            cardGroups: '/api/card-groups',
            carpools: '/api/card-groups/:groupId/carpools',
            assignments: '/api/carpools/:carpoolId/assignments',
        },
        documentation: 'See /api/health for server status',
    });
});
// API routes
app.use('/api', apiRouter);
// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map
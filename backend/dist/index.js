import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`CORS Origin: ${config.corsOrigin}`);
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map
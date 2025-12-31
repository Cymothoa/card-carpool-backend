import { config } from '../config/env.js';
export const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin === config.corsOrigin || config.corsOrigin === '*')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
};
//# sourceMappingURL=cors.js.map
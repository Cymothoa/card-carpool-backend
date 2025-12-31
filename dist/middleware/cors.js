import { config } from '../config/env.js';
export const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    // 在开发环境下，允许所有源；生产环境使用配置的源
    if (config.nodeEnv === 'development') {
        // 开发环境：允许所有源
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
    else {
        // 生产环境：只允许配置的源
        if (origin && (origin === config.corsOrigin || config.corsOrigin === '*')) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    // 处理预检请求（OPTIONS）
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
};
//# sourceMappingURL=cors.js.map
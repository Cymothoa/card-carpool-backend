import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  
  // 检查origin是否被允许
  const isOriginAllowed = (): boolean => {
    // 开发环境：允许所有源
    if (config.nodeEnv === 'development') {
      return true;
    }
    
    // 生产环境：检查配置的源
    if (config.corsOrigin === '*') {
      return true;
    }
    
    if (!origin) {
      return false;
    }
    
    // 支持多个域名，用逗号分隔
    const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
    
    // 精确匹配
    if (allowedOrigins.includes(origin)) {
      return true;
    }
    
    // 支持通配符模式匹配（如 *.vercel.app）
    return allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return false;
    });
  };
  
  const allowed = isOriginAllowed();
  
  // 设置CORS头 - 必须在所有响应中设置，包括OPTIONS
  // 注意：Access-Control-Allow-Origin 只能设置一个值，不能是数组
  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    logger.info(`CORS: Setting Access-Control-Allow-Origin to ${origin}`);
  } else {
    logger.warn(`CORS: Not setting Access-Control-Allow-Origin - allowed=${allowed}, origin=${origin}, config=${config.corsOrigin}`);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    logger.info(`CORS: OPTIONS request - origin: ${origin}, allowed: ${allowed}, config: ${config.corsOrigin}`);
    // 使用end()而不是sendStatus()，避免覆盖已设置的响应头
    res.status(200).end();
    return;
  }
  
  // 对于非OPTIONS请求，如果origin不匹配，返回403
  if (origin && !allowed) {
    logger.warn(`CORS: ${req.method} request blocked - origin: ${origin}, allowed: ${config.corsOrigin}`);
    res.status(403).json({ error: 'CORS policy: Origin not allowed' });
    return;
  }
  
  next();
};

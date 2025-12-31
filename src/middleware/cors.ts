import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  
  // 在开发环境下，允许所有源；生产环境使用配置的源
  if (config.nodeEnv === 'development') {
    // 开发环境：允许所有源
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    // 生产环境：支持多个域名（用逗号分隔）或通配符
    if (config.corsOrigin === '*') {
      // 允许所有源（不推荐用于生产环境）
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else {
      // 支持多个域名，用逗号分隔
      const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else if (origin && allowedOrigins.some(allowed => {
        // 支持Vercel域名模式匹配（*.vercel.app）
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return false;
      })) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
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

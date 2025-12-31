export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    console.error('Error:', err);
    // 处理已知错误
    // 业务验证错误（如"车主不存在"）应该返回 400，而不是 404
    if (err.message.includes('车主不存在') || err.message.includes('用户不存在') || err.message.includes('卡组不存在') || err.message.includes('拼车不存在')) {
        res.status(400).json({
            status: 'error',
            error: err.message || 'Validation error',
        });
        return;
    }
    // 路由不存在返回 404
    if (err.message.includes('not found') || err.message.includes('Route')) {
        res.status(404).json({
            status: 'error',
            error: err.message || 'Resource not found',
        });
        return;
    }
    if (err.message.includes('不能为空') || err.message.includes('格式无效') || err.message.includes('已存在')) {
        res.status(400).json({
            status: 'error',
            error: err.message || 'Bad Request',
        });
        return;
    }
    res.status(statusCode).json({
        status,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        error: `Route ${req.originalUrl} not found`,
    });
};
//# sourceMappingURL=errorHandler.js.map
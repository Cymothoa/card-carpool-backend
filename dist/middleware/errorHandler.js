export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    console.error('Error:', err);
    // 处理已知错误
    if (err.message.includes('不存在') || err.message.includes('not found')) {
        return res.status(404).json({
            status: 'error',
            error: err.message || 'Resource not found',
        });
    }
    if (err.message.includes('不能为空') || err.message.includes('格式无效') || err.message.includes('已存在')) {
        return res.status(400).json({
            status: 'error',
            error: err.message || 'Bad Request',
        });
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
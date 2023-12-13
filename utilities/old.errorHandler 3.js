import { Logger } from './logger.js';

export const errorHandler = (err, req, res, next) => {
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
    };
    // Log the error
    // Logger.error(err.message);
    Logger.error(`Error: ${JSON.stringify(errorDetails)}`);

    // Send error response
    res.status(err.status || 500).send({
        error: {
            message: err.message || 'An unexpected error occurred'
        }
    });
};
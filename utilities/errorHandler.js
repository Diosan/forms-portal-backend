import { Logger } from './logger.js';

export const errorHandler = (err, req, res, next) => {
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        // body: req.body,
        query: req.query,
        // params: req.params,
        timestamp: new Date().toISOString()
    };
    // Log the error
    // Logger.error(err.message);
    console.log("..........................................................................")
    Logger.error(`Error: ${JSON.stringify(errorDetails)}`);
    console.log("..........................................................................")

     // Check if the error object has a specific format to return
     if (err.customResponse) {
        // If customResponse is true, use the custom status and json structure
        return res.status(err.status || 500).json({
            outcome: err.outcome || 'error',
            message: err.publicMessage || "",
            error: err.publicMessage || 'An error occurred',
            email: err.email || 'An error occurred'
        });
    } else {
        // If no customResponse, return a standard error message
        res.status(err.status || 500).send(err.publicMessage || 'An unexpected error occurred');
    }
};
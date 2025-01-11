const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        // Ensure a valid HTTP status code
        const statusCode = error.statusCode || 500;

        // Log the error for debugging
        console.error('Error:', error);

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

module.exports = asyncHandler;

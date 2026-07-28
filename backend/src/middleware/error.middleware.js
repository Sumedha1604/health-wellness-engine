function errorMiddleware(err, req, res, next) {

    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV !== "test") {
        console.error({
            message: err.message,
            statusCode,
            stack: err.stack,
        });
    }

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500 && process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message || "Internal Server Error",
    });

}

module.exports = errorMiddleware;

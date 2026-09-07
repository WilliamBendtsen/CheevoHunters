export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const payload = {
    error: {
      message:
        statusCode === 500 ? "Something went wrong on the server." : err.message,
      statusCode,
    },
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  res.status(statusCode).json(payload);
}

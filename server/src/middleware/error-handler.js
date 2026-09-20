export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode ?? err.status ?? 500;
  const payload = {
    error: {
      message:
        statusCode === 413 ? "File or request is too large. Profile pictures must be no larger than 5 MB." :
        statusCode === 500 ? "Something went wrong on the server." : err.message,
      statusCode,
    },
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  res.status(statusCode).json(payload);
}

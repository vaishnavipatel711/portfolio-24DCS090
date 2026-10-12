// Global error handler: 4 arguments = Express treats it as an error handler.
// Must be registered AFTER all routes so errors passed via next(err) reach it.
module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Mongoose validation failure -> clean, structured JSON (not the raw error object)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Duplicate key (e.g. two users racing to register the same email)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err.stack); // full stack stays in the server log only
  res.status(status).json({
    error: status === 500 ? 'Something went wrong' : err.message,
  });
};

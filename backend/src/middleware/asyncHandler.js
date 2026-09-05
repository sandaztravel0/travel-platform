// Wraps an async route handler so any error (like a bad database query)
// gets passed to Express's error handler instead of crashing the server
// or leaving the request hanging.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

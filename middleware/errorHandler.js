module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  
  // Prevent stack trace leakage
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
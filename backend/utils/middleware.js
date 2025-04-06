// Middleware for handling JavaScript content type
const handleJsContentType = (req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
};

export { handleJsContentType };

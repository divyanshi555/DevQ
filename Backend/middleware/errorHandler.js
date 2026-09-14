
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  //Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found.`
  }
  //Mongoose duplicate key
  if(err.code === 11000){
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }
  //Mongosse Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val=>val.message).join(', ');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the limit of 10MB';
  }

  // JWT Invalid Token Error 
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // JWT Expired Token Error 
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  console.error('Error:',{
    message:err.message,
    stack: process.env.NODE_ENV ==='development' ? err.stack : undefined
  });

  
  res.status(statusCode).json({
    success: false,
    statusCode,
    error:message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default  errorHandler;
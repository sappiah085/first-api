const AppError = require('../utils/error');

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0].replaceAll('"', '');

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrDev = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorPro = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.log(err.message, 'Bad💥');
  return res.status(500).json({
    status: 'error',
    message: 'something very bad happened',
  });
};
module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    sendErrDev(err, req, res);
  } else if (env === 'production') {
    let error = err;
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'CastError') error = new AppError('invalid params', 400);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'TokenExpiredError')
      error = new AppError('Token has expired', 401);
    if (error.name === 'JsonWebTokenError')
      error = new AppError('invalid token ', 401);
    sendErrorPro(error, req, res);
  }
};

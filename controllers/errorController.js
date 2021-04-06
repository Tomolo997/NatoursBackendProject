const appError = require('../utils/appError');

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //API
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    //rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      //operational, trusted error => send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  //rendered website
  if (err.isOperational) {
    //operational, trusted error => send message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error('ERROR ', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'please try again later',
  });
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleCastErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. please use antorher value`;
  return new appError(message, 400);
};

const handleJWTError = (err) => {
  return new appError('Invalid token. Please login again', 401);
};

const handleJWTExpireError = (err) => {
  return new appError('Your token has expired, please login again', 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError(error);
    sendErrorProduction(error, req, res);
  }
};

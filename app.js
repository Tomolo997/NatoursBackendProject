const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const APIFeatures = require('./utils/APIFeatures');
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//routes => determine on how the application reacts based on the URL request from an client

//global middleware

//security http headers
app.use(helmet());
//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//data sanitization against noSQL query injection
app.use(mongoSanitize());
//data sanitization agains XSS
app.use(xss());

//prevent paramater polution
app.use(
  hpp({
    whitelist: ['duration', 'price'],
  })
);
//serving static files
//The order of thw middlware is important, so global middlewares are at the beginning
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', CreateTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
//tours

//mounting the routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//after it searched the tourRoutes and userRoutes and it could not be found.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cant find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Cant find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // //we must pass the err into the next()
  // //express recognises, that everything that is passed into thge next(), it will always be error , so it skips all of the middleware and goes to the error middlware
  next(new appError(`Cant find ${req.originalUrl} on this server`, 404));
});

//error handling middleware
app.use(globalErrorHandler);
module.exports = app;

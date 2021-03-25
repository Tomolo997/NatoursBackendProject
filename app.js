const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const app = express();
//routes => determine on how the application reacts based on the URL request from an client

//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
//The order of thw middlware is important, so global middlewares are at the beginning

//error route handling

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
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
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

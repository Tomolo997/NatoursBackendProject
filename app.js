const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const app = express();
const port = 3000;
//routes => determine on how the application reacts based on the URL request from an client

//middleware
app.use(morgan('dev'));

app.use(express.json());
//The order of thw middlware is important, so global middlewares are at the beginning
app.use((req, res, next) => {
  //if there is a third argument called nextm, the express knows its the middleware
  console.log('hello from middleware');
  //we must always pass the next function to go one step more in middleware
  next();
});

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

//start Server
app.listen(port, () => {
  console.log('app running on port' + port);
});

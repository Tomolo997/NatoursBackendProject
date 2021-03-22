const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
//routes => determine on how the application reacts based on the URL request from an client
// app.get('/', (req, res) => {
//   //send some data back
//   res
//     .status(200)
//     .json({ message: 'hello from the server side !', app: 'Natours' });
// });
// app.post('/', (req, res) => {
//   //send some data back
//   res
//     .status(200)
//     .json({ message: 'hello from the server side !', app: 'Natours' });
// });

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  ///:id/:y
  //optional parameters, we add question mark behind them ? => /api/v1/tours/:id/:y?
  console.log(req.params);
  res.status(200).json({
    status: 'success',
  });
});

app.post('/api/v1/tours', (req, res) => {
  //with post request we can send data from client to server, data is available in the request. wee need to include middleware, middleware is just a function that modifies the request data

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
  //cant send two responses
  // res.send('done');
});

app.listen(port, () => {
  console.log('app running on port' + port);
});

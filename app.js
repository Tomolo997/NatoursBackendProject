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

app.listen(port, () => {
  console.log('app running on port' + port);
});

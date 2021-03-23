const Tour = require('../models/tourModel');

exports.checkBody = (req, res, next) => {
  console.log(req.body);
  if (!req.body.name || !req.body.duration || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'incomplete request',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours: tours,
    // },
  });
};

exports.getTour = (req, res) => {
  ///:id/:y
  //optional parameters, we add question mark behind them ? => /api/v1/tours/:id/:y?
  //we convert the parameter from string to number
  const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.CreateTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};
exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

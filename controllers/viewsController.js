const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
  //1)Get tour data from collection
  const tours = await Tour.find();
  //2)Build that template

  //3)Rende that template using our data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //1)Get data for the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //2)Build that template

  //3)Rende that template using our data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

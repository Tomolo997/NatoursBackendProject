const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//create a class for API features

exports.getAllTours = async (req, res) => {
  try {
    //execute query

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;
    //Send RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  ///:id/:y
  //optional parameters, we add question mark behind them ? => /api/v1/tours/:id/:y?
  try {
    const tour = await Tour.findById(req.params.id);
    //findByID => shorthand for Tour.findOne({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.CreateTour = async (req, res) => {
  try {
    //create and save in the DATABASE
    const newTour = await Tour.create(req.body);
    //Send back the data
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    // we wan to send bac kteh response
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
  //we create a new instance of Tour => so new document
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //when the price is not a number ,when its not it will show the error
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data set',
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'succes',
      message: 'succesfuly deleted the Tour',
    });
  } catch (error) {}
};

//aggregation pipeline => matching and grouping
//Aggregation pipline => used for calculating the statisitcs in the database collection. => avgPrice, avgRaating, max, min

//pipline => each document goes through this pipline and the pipline (atleast group) extracts specific parameters(ratingsAverage,price...) and adds tehm up (if there is a sum, or extracst the max or the min ) and returns them.

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      //mathc is to select and filter
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        //allows us to group togethers documents using accumulators
        //acumulators => calculating an average
        $group: {
          // in group , null means everyone,
          //but it can be different _ids => "$difficulty"
          //we can group our results for different fields
          // _id: '$ratingsAverage',
          _id: { $toUpper: '$difficulty' },
          numTours: {
            //for each document that is going through this pipline, 1 will be added to this sum counter
            $sum: 1,
          },
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          avgRating: {
            $avg: '$ratingsAverage',
          },
          avgPrice: {
            $avg: '$price',
          },
          minPrice: {
            $min: '$price',
          },
          maxPrice: {
            $max: '$price',
          },
        },
      },
      {
        //it really goes through pipline => one by one, so in sort we already have the results that we specified in the $group
        $sort: {
          avgPrice: 1,
        },
      },
      // {
      //   //we can still duplicate commands => pipline opreators
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'succes',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        //unwind will decuntrsuct an array field from input documents ,adn then output one document for each element in array
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numTourStarts: {
            $sum: 1,
          },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          //project => menas what to show and what not to show
          // 0 => not show, 1 => show
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'succes',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

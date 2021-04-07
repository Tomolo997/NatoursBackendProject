const Tour = require('../models/tourModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const factory = require('./handlerFactory');
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
const multerStorage = multer.memoryStorage();

//multerfilter
const multerFilter = (req, file, cb) => {
  //test if the uplaod file is the image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new appError('This is not an image, please uplado only iamge', 400),
      false
    );
  }
};

const upload = multer({
  fileFilter: multerFilter,
  storage: multerStorage,
});

//middleware out of the
exports.uploadTourImages = upload.fields;
[
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
];
//create a class for API features

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  //req.file.buffer => we can access the photo in memory,because we used multer.memoryStorage();
  const imageFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile('public/img/tours/' + imageFileName);

  req.body.imageCover = imageFileName;

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile('public/img/tours/' + imageFileName);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.CreateTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//aggregation pipeline => matching and grouping
//Aggregation pipline => used for calculating the statisitcs in the database collection. => avgPrice, avgRaating, max, min

//pipline => each document goes through this pipline and the pipline (atleast group) extracts specific parameters(ratingsAverage,price...) and adds tehm up (if there is a sum, or extracst the max or the min ) and returns them.

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new appError('Please provide lat and lng in format lng,lng'),
      400
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new appError('Please provide lat and lng in format lng,lng'),
      400
    );
  }

  const distances = await Tour.aggregate([
    {
      //geoNear always firs in the line of aggregation
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

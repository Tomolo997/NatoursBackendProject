const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    //BUILD THE QUERY
    //take all the filed out of the objet and create a new object
    //1)FILTERING
    const queryObject = { ...req.query };
    const exludedFields = ['page', 'sort', 'limit', 'fields'];
    exludedFields.forEach((el) => delete queryObject[el]);

    //Advanced filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(lt|lte|gte|gt)\b/g, (match) => {
      return `$${match}`;
    });

    let query = Tour.find(JSON.parse(queryString));

    //2) SORTING
    if (req.query.sort) {
      //query.sort(price) => asscending , -price => descending
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //sort("price,ratingsAverage")
      // ====> sort by price and if the pricesa re the same, then sort by ratingsaverage
      //localhost:3000/api/v1/tours?sort=price,ratingsAverage
    } else {
      //default ordered by the -createdAt
      query = query.sort('-createdAt');
    }

    //3)FIELD LIMITING
    if (req.query.fields) {
      //to include the strings in the response
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //execute query
    const tours = await query;
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

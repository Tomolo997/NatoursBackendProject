const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('No document found with that ID ', 404));
    }
    res.status(204).json({
      status: 'succes',
      message: 'succesfuly deleted the Tour',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //when the price is not a number ,when its not it will show the error
      runValidators: true,
    });
    if (!doc) {
      return next(new appError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsnyc(async (req, res, next) => {
    //create and save in the DATABASE
    const doc = await Model.create(req.body);
    //Send back the data
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new appError('No document found with that ID ', 404));
    }
    //findByID => shorthand for doc.findOne({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

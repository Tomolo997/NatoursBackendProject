const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      //establish reference
      ref: 'Tour',
      required: [true, 'review must belont to the tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      //establish reference
      ref: 'User',
      required: [true, 'review must belong to the user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//each combination of tour and user now has to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //queryy middleware
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  //all the find queries will always populate the guides before finding
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//static method on the schema,
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      //select the tour we want to calculate
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].averageRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review

  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //goal is to get access to the current review document

  //we save ourReview to the document, so we can use it in the post
  this.ourReview = await this.findOne();
  //ourReview is the current document
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // this.ourReview = await this.findOne(); => does NOT work here,query has already executed
  //after the query has already finished and the review has updated

  await this.ourReview.constructor.calcAverageRatings(this.ourReview.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

//post /tour/21351dfs/reviews => this nested route means we can access reviews resource on the tour resource.

//get tour/23123/reviews => get reviews of the id of tour

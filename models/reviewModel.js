const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

//post /tour/21351dfs/reviews => this nested route means we can access reviews resource on the tour resource.

//get tour/23123/reviews => get reviews of the id of tour

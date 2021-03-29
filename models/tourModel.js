const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name '],
      unique: true,
      trim: true,
      maxlength: [40, 'The tour name must have maximum 40 charachers'],
      minlength: [10, 'The tour name must have minimum 10 charachers'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1 '],
      max: [5, 'rating must be below 5 '],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //only works to current doc on NEW document creation
          return val < this.price; //false => will trigger the validatio error
        },
        message: 'Dicsount price should be below regular price',
      },
      default: 0,
    },
    summary: {
      type: String,
      //trim only works for string => remove all the white space at the beggining and start
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  //options for schema
  //each time the JSON is send, the virtuals must be true
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//MIDDLEWARE

//DOCUMENT MIDDLWARE
//before we create or save => .Insert many does not run !
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// //post , => after the document have saved
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY middleware = > this will point to the query
// tourSchema.pre('find', function (next) {
//exectue for everything that starts with "find" => "find", "findOne"
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds!`);
  next();
});

//AGGREWGATION MIDDLWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
//creata  model out of the mongoose
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

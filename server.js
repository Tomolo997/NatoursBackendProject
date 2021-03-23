const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

//connect the mongodb
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB collection succesful');
  });

//Schemas
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name '],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

//creata  model out of the mongoose
const Tour = mongoose.model('Tour', tourSchema);

//new document created out of the TOUR model
//testTour is an instance of Tour, so it has some functions to help us communicate with the database
const testTour = new Tour({
  name: 'The Park camper',
  price: 899,
});
//this will save to the database
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => console.log(err));

//start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app running on prt' + port);
});

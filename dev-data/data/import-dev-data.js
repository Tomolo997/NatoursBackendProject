const fs = require('fs');
const Tour = require('../../models/tourModel');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
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

//read JSON file
const tours = JSON.parse(fs.readFileSync(__dirname + '/tours.json', 'utf-8'));
//import data to database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data succesfuly loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data succesfuly deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

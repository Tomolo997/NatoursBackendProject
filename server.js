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

//start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app running on prt' + port);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

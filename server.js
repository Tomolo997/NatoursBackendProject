const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
//start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app running on port' + port);
});

console.log(process.env);

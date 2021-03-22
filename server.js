const app = require('./app');
const port = 3000;

//start Server
app.listen(port, () => {
  console.log('app running on port' + port);
});

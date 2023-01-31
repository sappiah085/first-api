const dotenv = require('dotenv');
const mongoose = require('mongoose');
//uncaught exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION💥, SHUTTING DOWN😔');
  console.log(err.name, err.message);
  process.exit(1);
});
//dotenv config
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DB.replace('<password>', process.env.MONGOOSE_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log('Connected to database');
});

// server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

//unhandled exception
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION💥, SHUTTING DOWN😔');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app
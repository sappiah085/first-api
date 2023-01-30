const cors = require('cors');
const hpp = require('hpp');
const express = require('express');
const xss = require('xss-clean');
const limter = require('express-rate-limit');
const helmet = require('helmet');
const sanitise = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const guidesRouter = require('./routers/guidesRouter');
const errorController = require('./controllers/errController');
const AppError = require('./utils/error');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
//app
const apiLimiter = limter({
  windowMs: 60 * 60 * 1000 * 24, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.use(
  cors({
    origin: '*',
  })
);
app.use(cookieParser());
//body parser
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(xss());
app.use(helmet());
app.use(sanitise());
app.use(apiLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//routes for guides
app.use('/api/guides', guidesRouter);

//router for users
app.use('/api/users', userRouter);

//router for review
app.use('/api/reviews', reviewRouter);
//router for all
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Such ${req.originalUrl}  does not exist on this server!`,
    404
  );
  next(err);
});
app.use(errorController);
module.exports = app;

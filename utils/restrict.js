const AppError = require('./error');
const statusCodes = require('./statusCodes');

function restrictTo(...roles) {
  return (req, res, next) => {
    const { role } = req.user;
    const index = roles.includes(role);
    if (!index)
      return next(
        new AppError('You are not authorised', statusCodes.UNAUTHORISED)
      );
    next();
  };
}
module.exports = restrictTo;

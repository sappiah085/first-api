const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/error');
const { promisify } = require('util');
const statusCodes = require('../utils/statusCodes');

function signIn(email) {
  return jwt.sign({ data: email }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXP_TIME,
  });
}
const resGen = (res, user, code, req) => {
  const token = signIn(user.email);
  if (req.headers['X-Forwarded-Proto'] === 'https')
    res.cookie('jwt', `Bearer ${token}`, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 2 - 1000),
      httpOnly: true,
    });
  res.status(code).json({
    status: 'success',
    token,
    data: user,
  });
};
exports.addUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  resGen(res, user, statusCodes.CREATED, req);
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError('Enter email and password'),
      statusCodes.BAD_REQUEST
    );
  const user = await User.findOne({ email }).select('+password');
  if (!user)
    return next(new AppError('User does not exist', statusCodes.NOT_FOUND));
  const match = await user.getPasswordCompare(password);
  if (!match)
    return next(
      new AppError('Password does not match'),
      statusCodes.BAD_REQUEST
    );
  resGen(res, user, statusCodes.OK, req);
});

exports.protected = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization &&
    !req.headers.authorization?.startsWith('Bearer')
  ) {
    return next(
      new AppError('You are not authorised'),
      statusCodes.UNAUTHORISED
    );
  }
  const token = req.headers.authorization.split(' ')[1];
  const result = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
  const user = await User.findOne({ email: result.data });
  if (!user) return next(new AppError('User does not exist '));
  const changeBool = user.checkChangedPass(result.iat);
  if (changeBool)
    return next(
      new AppError('You need to login again'),
      statusCodes.UNAUTHORISED
    );
  req.user = user;
  next();
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { confirmPassword, newPassword, oldPassword } = req.body;
  if (!confirmPassword || !newPassword || !oldPassword)
    return next(
      new AppError('Fill all necessary data'),
      statusCodes.BAD_REQUEST
    );
  const user = await User.findOne({ email: req.user.email }).select(
    '+password'
  );
  const match = await user.getPasswordCompare(oldPassword);
  if (!match)
    return next(new AppError('Wrong old password', statusCodes.BAD_REQUEST));
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  const userDoc = await user.save();
  res.status(statusCodes.OK).json({
    status: 'success',
    data: {
      user: userDoc,
    },
  });
  next();
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  let newUpdate = { ...req.body };
  delete newUpdate['role'];
  if (req.user.role === 'admin') {
    newUpdate.role = req.body.role;
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUpdate, {
    runValidators: true,
    new: true,
  });
  res.status(statusCodes.OK).json({
    status: 'success',
    data: user,
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(statusCodes.OK).json({
    status: 'success',
    data: users,
  });
});

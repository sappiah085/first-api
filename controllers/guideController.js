const guideModel = require('../models/guidesScema');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeature');
const AppError = require('../utils/error');
const statusCodes = require('../utils/statusCodes');

exports.postGuide = catchAsync(async (req, res) => {
  const guide = await guideModel.create(req.body);
  res.status(statusCodes.CREATED).json({
    status: 'success',
    data: {
      guide,
    },
  });
});

exports.getGuides = catchAsync(async (req, res, next) => {
  const api = new ApiFeatures(guideModel.find(), req.query);
  const guides = await api.filter().fields().limit().sort().query;
  res.status(statusCodes.OK).json({
    status: 'success',
    number: guides.length,
    data: {
      guides,
    },
  });
});

exports.getTopRated = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-rating';
  next();
};

exports.updateGuide = catchAsync(async (req, res, next) => {
  const guide = await guideModel.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!guide) {
    return next(
      new AppError('No guide found with this id', statusCodes.NOT_FOUND)
    );
  }
  res.status(statusCodes.OK).json({
    status: 'success',
    data: {
      guide,
    },
  });
});
exports.getGuideById = catchAsync(async (req, res, next) => {
  const guide = await guideModel.findById(req.params.id).populate('review');
  if (!guide) {
    return next(
      new AppError('No guide found with this id', statusCodes.NOT_FOUND)
    );
  }
  res.status(statusCodes.OK).json({
    status: 'success',
    data: {
      guide,
    },
  });
});
exports.deleteGuide = catchAsync(async (req, res, next) => {
  const data = await guideModel.findByIdAndDelete(req.params.id);
  if (!data) {
    return next(
      new AppError('No guide found with this id', statusCodes.NOT_FOUND)
    );
  }
  res.status(statusCodes.OK).json({
    status: 'success',
    data: null,
  });
});

exports.guideStatics = catchAsync(async (req, res, next) => {
  const guideStatics = await guideModel.aggregate([
    {
      $match: { rating: { $gte: 1 } },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
        average: { $avg: '$rating' },
        min: { $min: '$rating' },
        max: { $max: '$rating' },
        ratings: { $push: '$title' },
      },
    },
    {
      $addFields: {
        rating: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        rating: -1,
      },
    },
  ]);
  res.status(statusCodes.OK).json({
    status: 'success',
    data: {
      guideStatics,
    },
  });
});

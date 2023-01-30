const catchAsync = require('../utils/catchAsync');
const ReviewModel = require('../models/reviewModel');
const statusCodes = require('../utils/statusCodes');
const AppError = require('../utils/error');

exports.postReview = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.guide = req.params.guideId;
  const review = await ReviewModel.create(req.body);
  res.status(statusCodes.CREATED).json({
    status: 'success',
    data: review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!review)
    return next(
      new AppError('Review of such id does not exist', statusCodes.BAD_REQUEST)
    );
  res.status(statusCodes.OK).json({ status: 'success', data: review });
});

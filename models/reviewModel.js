const mongoose = require('mongoose');
const guideModel = require('./guidesScema');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Provide rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    message: {
      type: String,
      required: [true, 'A review should have a message'],
    },
    postedOn: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
ReviewSchema.index({ guide: 'asc', user: 'asc' }, { unique: true });
ReviewSchema.statics.calculateRating = async function (id) {
  const res = await this.aggregate([
    {
      $match: { guide: id },
    },
    {
      $group: {
        _id: '$guide',
        avgRating: { $avg: '$rating' },
        numRating: { $sum: 1 },
      },
    },
  ]);
  console.log(res);
  await guideModel.findByIdAndUpdate(id, {
    AvRating: res[0].avgRating,
    totalRating: res[0].numRating,
  });
};

ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.forCalc = await this.findOne().clone();
  next();
});
ReviewSchema.post(/^findOneAnd/, async function () {
  await this.forCalc.constructor.calculateRating(this.forCalc.guide);
});
ReviewSchema.post('save', function () {
  this.constructor.calculateRating(this.guide);
});
ReviewSchema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});
const ReviewModel = mongoose.model('Review', ReviewSchema);
module.exports = ReviewModel;

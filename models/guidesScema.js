const mongoose = require('mongoose');
const slugify = require('slugify');

const guideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLen: [8, 'title should be greater than 8 characters'],
      required: [true, 'title should be provided'],
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    AvRating: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    unpublished: {
      type: Boolean,
      default: false,
      select: false,
    },
    message: {
      type: String,
      required: [true, 'message should be provided'],
    },
    slug: String,
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
guideSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});
guideSchema.pre(/^find/, function (next) {
  this.find({ unpublished: { $ne: true } });
  next();
});

guideSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'guide',
});
guideSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { unpublished: { $ne: true } } });
  next();
});

module.exports = mongoose.model('guides', guideSchema);

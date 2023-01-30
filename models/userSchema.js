const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: [true, 'This email is already taken'],
    validate: {
      validator: function (el) {
        return validator.isEmail(el);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: { values: ['user', 'admin', 'staff'], message: 'Invalid role' },
    default: 'user',
  },
  changedPasswordAt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords do not match',
    },
  },
  joinedAt: { type: Date, default: Date.now },
});
UserSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  this.role = 'user';
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.isNew) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.changedPasswordAt = Date.now();
  this.passwordConfirm = undefined;
  next();
});
UserSchema.methods.getPasswordCompare = async function (password) {
  return await bcrypt.compare(password, this.password);
};
UserSchema.methods.checkChangedPass = function (JWTToken) {
  if (!this.changedPasswordAt) return false;
  return parseInt(this.changedPasswordAt.getTime() / 1000, 10) > JWTToken;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;

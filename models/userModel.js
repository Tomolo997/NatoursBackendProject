const mongoose = require('mongoose');
const validator = require('validator');
const bycrpt = require('bcryptjs');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide  your email '],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this only works on CREATE and SAVE!!! => update does not work, for updating we must use save.
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
    required: [true, 'Add password changed at'],
  },
});
//pre saving the data we encryp passowd
userSchema.pre('save', async function (next) {
  //only run this function if password was modified
  if (!this.isModified('password')) {
    return next();
  }
  //hash the password with cost of 12
  this.password = await bycrpt.hash(this.password, 12);
  //deloete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//check for passwords => instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bycrpt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedimestamp, JWTTimestamp);
    return JWTTimestamp < changedimestamp;
  }
  //false means not changed
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;

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
const User = mongoose.model('User', userSchema);

module.exports = User;

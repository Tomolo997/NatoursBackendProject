const User = require('../models/userModel');
const appError = require('../utils/appError');
const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.singUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(ewUser._id);
  newUser._id;
  res.status(201).json({
    status: 'succes',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if the email and passwords exists
  if (!email || !password) {
    return next(new appError('Please provide email and password', 400));
  }
  //2) check if user exists and password is correct
  const user = await User.findOne({
    email: email,
  }).select('+password');

  //   const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('incorrect email or password', 401));
  }

  console.log(user);
  //3) if everytingh ok , send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

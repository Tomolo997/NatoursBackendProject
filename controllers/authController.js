const { promisify } = require('util');
const sendEmail = require('../utils/email');
const User = require('../models/userModel');
const appError = require('../utils/appError');
const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const { decode } = require('punycode');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.singUp = catchAsync(async (req, res) => {
  console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
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

  //3) if everytingh ok , send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new appError('You are not logged in, please login to get access', 401)
    );
  }
  //2) Verification token
  //all this is sa function that we need to call that returns a promise

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded);
  //3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new appError('The user beloning to the user does not exist'),
      401
    );
  }
  //4) Check if user changed password after token was issued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return new appError(
      'The user recentiuly changed password, plase login again',
      401
    );
  }
  //only if the previous 4 are correct then the next will be called and then the user gets the routes
  req.user = freshUser;
  next();
});

//authorizazion => check if user is allowed certain resource
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array , ex.["admin","lead-guide"], role="user"
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('you do not have premmission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email,
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('there is no user with email adress', 404));
  }
  //2)generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/users/resetPassword/${resetToken}`;
  const message = `Fortgot your passwords ? Submit a patch request with your new password and password confint to : ${resetURL}`;
  console.log(resetToken);
  console.log(user.email);
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError(error.message, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //if token has not expirde and there is a use,set the new password
  if (!user) {
    return next(new appError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //Update changedPasswodAtr propery for the userr,

  //log the user in send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

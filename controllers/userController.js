const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-129dcxsafk0913kt32jf9-12321321321.jpeg
//     const ext = file.minetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

//multerfilter
const multerFilter = (req, file, cb) => {
  //test if the uplaod file is the image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new appError('This is not an image, please uplado only iamge', 400),
      false
    );
  }
};

const upload = multer({
  fileFilter: multerFilter,
  storage: multerStorage,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  //req.file.buffer => we can access the photo in memory,because we used multer.memoryStorage();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile('public/img/users/' + req.file.filename);

  next();
};
exports.seeMee = (req, res, next) => {
  console.log(req.file);
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('this sis the file', req.file);
  console.log(req.body);
  //1) create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('This route is not for password updates', 400));
  }
  //2) update user document1
  const filteredBody = filterObj(req.body, 'name', 'email');
  //if there is a file , we add photo to the filtered body
  console.log(req.file);
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//Do not update passwords with this
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not dfefined! Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'message',
    data: null,
  });
});

const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
//we neeed to enable the reveiew router to have access to :tourID mergeParams: true
const router = express.Router();
router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);
module.exports = router;

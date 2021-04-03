const express = require('express');
const authController = require('../controllers/authController');
const reviewRoutes = require('../controllers/reviewController');
//we neeed to enable the reveiew router to have access to :tourID mergeParams: true
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewRoutes.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewRoutes.createReview
  );

module.exports = router;

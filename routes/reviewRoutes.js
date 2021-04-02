const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewRoutes = require('../controllers/reviewController');

router.route('/get-all-reviews').get(reviewRoutes.getAllReviews);
router
  .route('/post-review')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewRoutes.createReview
  );

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
//we neeed to enable the reveiew router to have access to :tourID mergeParams: true
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourAndUserIDs,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);
module.exports = router;

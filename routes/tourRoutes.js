const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

//middleware => for this specific route, we want to use review router
//we neeed to enable the reveiew router to have access to :tourID
router.use('/:tourID/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  //beforew the route get("/"), middleware function protect will be run
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.CreateTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//post /tour/21351dfs/reviews => this nested route means we can access reviews resource on the tour resource.

//get tour/23123/reviews => get reviews of the id of tour

module.exports = router;

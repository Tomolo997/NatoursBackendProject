const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();
//checks for valid or invalid id
// router.param('id', tourController.checkID);

//create a check body => if the body contains the name and price property

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.CreateTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

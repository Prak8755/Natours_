const express = require('express');
const tourRouter = express.Router();
const tourController=require('./../controller/tourController')
const {getAllTours,getTourById,createTour,deleteTour,updateTour,cheapTour}=tourController;
const authController=require('../controller/authController');
const reviewRoutes=require('../Routes/reviewRoutes');



// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTourById);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// tourRouter.param('id',tourController.checkId);
 //This is param middleware which has access to id, it has a function which is being exported from tourController 

//another api for best 5 cheap tours

//Note- here this line is for merging two routes
tourRouter.use('/:tourId/reviews',reviewRoutes);

tourRouter.route('/top-5-cheap').get(cheapTour,getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/get-month-plan/:year').get(authController.protectTours,authController.restrictTo('admin' ,'tour-guide','guide'),tourController.getMonthPlan);

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter.route('/').get(authController.protectTours,getAllTours).post(authController.protectTours,authController.restrictTo('admin','lead-guide'),createTour);
//Note- here when user tries to access getAlltours, first protectTours middleware will be run 

//here above dataContain is another middleware which is checking if the req.body.name or req.body.price exist or not , so after that we have createTour middleware , so it is known as middleware chaining
tourRouter.route('/:id').get(getTourById).patch(authController.protectTours,authController.restrictTo('admin' ,'tour-guide','guide'),updateTour).delete(authController.protectTours,authController.restrictTo('admin','tour-guide'),deleteTour);



module.exports = tourRouter;

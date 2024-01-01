const express=require('express');

const reviewController=require('../controller/reviewController');
const authController=require('../controller/authController');

const reviewRouter=express.Router({mergeParams:true});
//Note POST-/:tourId/reviews or POST -/reviews
//GET /:tourId/reviews or GET /reviews
//Note when you hit //GET /:tourId/reviews- it will show you reviews based on tourId,but when you hit  GET /reviews , it will show you all reviews

reviewRouter.use(authController.protectTours);

reviewRouter.route('/').post(authController.restrictTo('user'),reviewController.setTourIdUserId,reviewController.createReview).get(reviewController.getAllReviews);

reviewRouter.route('/:id').get(reviewController.getReview).delete(authController.restrictTo('user','admin'),reviewController.deleteReview).patch(authController.restrictTo('user','admin'),reviewController.updateReview);

module.exports=reviewRouter;



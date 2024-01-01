const Review=require('../Model/reviewModel');
const catchAsync=require('../utils/catchAsync');

const factoryController=require('../controller/FactoryController');

//This middleware is set for setting tour id and user id for creating reviews
exports.setTourIdUserId=(req,res,next)=>{
    if(!req.body.tour){req.body.tours=req.params.tourId;}
    if(!req.body.user){req.body.users=req.user._id};
    next();
}
//Create
exports.createReview=factoryController.createOne(Review)      
   
//Get all Reviews
exports.getAllReviews=factoryController.getAll(Review)

//delete
exports.deleteReview=factoryController.deleteOne(Review)

//update 
exports.updateReview=factoryController.updateOne(Review)

//Get one Review
exports.getReview=factoryController.getOne(Review)





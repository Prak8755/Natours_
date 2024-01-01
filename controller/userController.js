const User = require('../Model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryController=require('../controller/FactoryController');


exports.getUserById = factoryController.getOne(User)
exports.deleteUser = factoryController.deleteOne(User)
exports.updateUser=factoryController.updateOne(User);
exports.getAllUsers=factoryController.getAll(User);

//get,me - get current user
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}


//Update me route- this route is to update user name and email id
exports.updateMe = catchAsync(async (req, res, next) => {
  //if user types password and confirm password, give him this error
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is invalid ,Please use /updatePassword for updating the password',
        400
      )
    );
  }
  // const filterObj = newFilterObj(req.body, 'name', 'email');  //this function will only allow user to update email and name 
  //update user document- 
  const user = await User.findByIdAndUpdate(req.user.id, {name:req.body.name,email:req.body.email}, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});


//Delete me -current user can deactivate his account
//note here once user hits deleteMe route , his active status will be set false , and it will be updated in the database as well, 
// but we wont keep this user in db , so for that we will use query middleware 
exports.deleteMe=catchAsync(async(req,res,next)=>{
await User.findByIdAndUpdate(req.user.id,{active:false});

res.status(204).json({
  status:"success",
  data:null
})
})






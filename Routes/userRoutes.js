const express = require('express');
const userRouter = express.Router();
const userController=require('./../controller/userController');
const {getAllUsers,getUserById,getMe,deleteUser,updateUser}=userController;
const authController=require('../controller/authController');


userRouter.post('/signup',authController.signup);
userRouter.post('/login',authController.login);
userRouter.get('/logout',authController.logout);

userRouter.use(authController.protectTours)  //after this all routes will be protected 

//for forgot password--Note- this is not working for me as of now , do it later
userRouter.post('/forgotPassword',authController.forgotPassword);
userRouter.patch('/resetPassword/:token',authController.resetPassword)

//update password
userRouter.patch('/updateMyPassword/',authController.updatePassword)

//Get me - get current user
userRouter.get('/me',getMe,getUserById);
//update me
userRouter.patch('/updateMe',userController.updateMe)

//delete me - current user deactivates himself
userRouter.delete('/deleteMe',userController.deleteMe)


userRouter.use(authController.restrictTo('admin'));
userRouter.route('/').get(getAllUsers)
userRouter.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports=userRouter;

const express = require('express');
const router = express.Router();
const viewsController=require('../controller/viewsController');
const authController=require('../controller/authController')



router.get('/',authController.isLoggedIn,viewsController.getOverview)

router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour)

router.get('/login',authController.isLoggedIn,viewsController.login);

router.get('/me',authController.protectTours,viewsController.getAccount);

router.post('/submit-user-data',authController.protectTours,viewsController.updateUser)

module.exports=router;







const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//jwt Token common function
function jwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES,
  });
}

//sendCreateToken common function

const sendCreateToken = (user, statusCode, res) => {
  const token = jwtToken(user._id);

  //sending cookie to client - cookie is a piece of text which is sent from server to client side
  const cookieOption = {
    httpOnly: true, //this allows browsers to not manipulate the cookie in any way , browser just receives it and send it automatically with every request to server
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    result: {
      user: user,
    },
  });
};

//@@@
exports.signup = catchAsync(async (req, res, next) => {
  //  const newUser=await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    changedPasswordAt: req.body.changedPasswordAt,
    role: req.body.role,
  });

  //install jsonwebtoken
  sendCreateToken(newUser, 201, res);
});

///@@@
exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  //check if password and email is entered
  if (!email || !password) {
    return next(new appError('Please provide both password and email', 400));
  }
  //now check if user exists
  const user = await User.findOne({ email }).select('+password');

  //this checks if password is correct or not
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('email or password is wrong', 401));
  }
  sendCreateToken(user, 200, res);
});


// Logout 
exports.logout=async(req,res)=>{
res.cookie('jwt','dummmyjst',{
  expiresIn:new Date(Date.now()+10*1000),
  httpOnly:true,
});
res.status(200).json({status:'success'});
}


//@@@
//protecting our tour routes
exports.protectTours = catchAsync(async (req, res, next) => {
  //check if token exist or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new appError('You are not logged in yet', 401));
  }
  //this is to check if the token is verified
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //now check if user exists or not -suppose user first logged in and right away then user is deleted from data base
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new appError('The user belonging to this token does not exist', 401)
    );
  }

  //to check if user changed password//updated password
  if (user.ifPasswordChanged(decoded.iat)) {
    return next(
      new appError('User recently changed password,Please Login Again')
    );
  }

  //now if all above condition is satisfied then the tours access is given
  req.user = user;
  res.locals.user=user;

  next();
});

//@@@@
//this middleware is to allow only some selected users('admin','tour-guide') to perform delete tour action;
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('you are not allowed to perform this action', 403));
    }
    next();
  };
};

///@@@@ -forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //first find user based on email id
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new appError('There is no email with given email', 404));
  }
  //now generate the random reset token
  const resetToken = user.createResetPasswordToken();
  //   await user.save({ validateBeforeSave: false });

  //now send token to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `forgot your password ?reset your password here ${resetUrl}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'your password reset token is valid for 10 minutes',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // await user.save({ validateBeforeSave: false });

    return next(
      new appError('There is something wrong sending an email, Try later', 500)
    );
  }
  next();
});

//@@Reset password
exports.resetPassword = () => {};

//@@@
exports.updatePassword = catchAsync(async (req, res, next) => {
  //find if user exists or not
  const user = await User.findById(req.user.id).select('+password');
  //here we can not use findByIdAndUpdate because it does not work with encryption middleware and changePasswordAt field middleware - see in authController
  //now check if password is correct or not
  const ifPassMatched = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );

  if (!ifPassMatched) {
    return next(new appError('current password is wrong', 501));
  }

  //if current password is right then update the user
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //log in user ,send Jwt
  sendCreateToken(user, 200, res);
});



//Note - this middleware is for rendering logged in user name and photo if user logges in
exports.isLoggedIn = async (req, res, next) => {
  //check if token exist or not
  if (req.cookies.jwt) {
    try{
       //this is to check if the token is verified
  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  //now check if user exists or not -suppose user first logged in and right away then user is deleted from data base
  const user = await User.findById(decoded.id);

  if (!user) {
    return next();
  }

  //to check if user changed password//updated password
  if (user.ifPasswordChanged(decoded.iat)) {
    return next();
  }

  //now if all above condition is satisfied then the tours access is given
  res.locals.user = user;
  return next();
    }
    catch(err){
      return next()
    }

 
};
next();
};

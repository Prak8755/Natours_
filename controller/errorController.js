const { MongooseError } = require('mongoose');
const AppError = require('../utils/appError');

function sendErrDev(err,req, res) {
  // console.log('dev');
  //this logic isd for the api
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //this logic is for the rendering front end error page based on error
  else{
    res.status(err.statusCode).render('error',{
      title:'something went wrong',
      msg:err.message
    })
  }
  
}

function sendErrProd(err, res) { 
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
    });
  } else {
    // console.log('Error found');
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
}

function handleCastErrDB(err) {
  const message = `invalid${err.path}:${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err){
const msg=`Duplicate name [${err.keyValue.name}],Please try something else`;
return new AppError(msg,400)

}

function handleValidationErrDB(err,res){
const msg=err.message;
return new AppError(msg,400);
 
}

function handleJsonWebTokenErr(err,res){
  return new AppError('invalid login,Please login again',401)
}

function handleTokenExpiredErr(){
  return new AppError('Your session expired,Please login again',401)
}

module.exports = (err, req, res, next) => {
    // console.log('second');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err,req, res);
  } else if (process.env.NODE_ENV === 'production') {

 if(err.name==='CastError'){
  let newErr=handleCastErrDB(err);
  sendErrProd(newErr,req,res);
  return;
 }
 if(err.code===11000){
  let newErr=handleDuplicateFieldsDB(err);
  sendErrProd(newErr,req,res)
  return;
 }
 if(err.name==='ValidationError'){
  let newErr=handleValidationErrDB(err,res);
  sendErrProd(newErr,req,res);
  return;
  ;
 }
if(err.name==='JsonWebTokenError'){
  let newErr=handleJsonWebTokenErr(err,res);
  sendErrProd(newErr,req,res);
  return;
};
if(err.name==='TokenExpiredError'){
  let newErr=handleTokenExpiredErr(err,res);
  sendErrProd(newErr,req,res);
  return;
};
    sendErrProd(err,req,res)
  }

  next();
};

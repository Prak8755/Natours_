class AppError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
        this.status=`${statusCode}`.startsWith('4')?'fail':'error';    
        this.isOperational=true   //this is for we are assuming this is an operational error not a bug;
        Error.captureStackTrace(this,this.constructor);
        console.log('first');
    } 
}
module.exports=AppError;

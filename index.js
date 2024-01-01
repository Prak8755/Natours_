const express = require('express');
const path=require('path');
const fs = require('fs');
const morgan=require('morgan');
const app = express();
const mongoose=require('mongoose');
const AppError=require('./utils/appError.js');
const errController=require('./controller/errorController.js');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const reviewRoutes=require('./Routes/reviewRoutes')
const viewRoutes=require('./Routes/viewRoutes.js');
const cookieParser=require('cookie-parser');
const compression=require('compression')

//Setting security http headers
app.use(helmet());
//now make a request for getTour and check in headers-in postman

//For rendering and view 
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
// app.use(express.static(path.join(__dirname,'public')));




//for development and production
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
// console.log(process.env.NODE_ENV);


//connecting our node js with database
const db=process.env.DATABASE.replace(`<PASSWORD>`,process.env.PASSWORD);
mongoose.connect(db).then(e=>console.log('database is connected '));




app.use(express.json()); //THIS IS A MIDDLE WARE CODE 
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser());

const tourRouter=require('./Routes/tourRoutes');

const userRouter=require('./Routes/userRoutes.js');


app.use(compression());

app.use((req,res,next)=>{   
    // console.log(req.cookies);
    next();
})


// app.use((req, res, next) => {
//   console.log((req.requestTime = 12));
//   next();
// });

//This middleware is for rate limiting - how many request should be allowed ,eg 100 ,200 in an hour
//for this we did npm i express-rate-limit-
//check result in headers in postman while hitting any getTours route etc
const limiter=rateLimit({
    max:100 ,   //maximum 100 requests are allowed
    windowsMs:60*60*1000,  
    message:'Too many request from this IP , Please try after an hour'
})
app.use('/api',limiter);  

///////////////////////////////////////////////////////////////////////////////////////////
//This middle ware is to for data sanitization -like if anyone tries to login with below mentioned details, password is real but email is not , so it protects form such threats
app.use(mongoSanitize());
//{ "email":{"$gt":""},
// "password":"1234567890"}


//////////////////////////////////////////////////////////////////////////////////////////
app.use(xss())
//This protects if any malicious data like when html code is added to our database
// {
//     "name":"<div class='main'>Hemmu</div>",
//     "email":"tet1ss2@gmail.com",
//     "password":"1234567890",
//     "confirmPassword":"1234567890",
//     "role":"guide"
// }

////////////////////////////////////////////////////////////////////////////////////////////
//Preventing http parameter pollution
app.use(hpp({
    whitelist:[
        'duration','difficulty','price','maxGroupSize','ratingsAverage','ratingsQuantity'
    ]
}))
//Note - to understand this -hit this {{URL}}api/v1/tours?sort=price&sort=duration
// first without above hpp middleware it wont work , it will give you an error, so to prevent it 
//we use hpp middleware , and then it will give us the result of last parameter - eg- it will sort our data based on duration because it is mentioned in last 

///////////////////////////////////////////////////////////////////////////////////////////
app.use('/',viewRoutes);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/reviews',reviewRoutes)
//This above code is called mounting a new router on routes like on tours and users

//handling errors for routes which are not defined
app.all('*',function(req,res,next){
    // console.log(x)
    console.log('super');
    next(new AppError(`cant find ${req.originalUrl} on server`,404));
});

app.use(errController)

module.exports=app;


//The Rest Api - Rest stands for Representational state transfer
//Middleware - is defined as function which have access to request object, response object and the next middleware function in the application req-response cycle.

//404-error
//401-bad authentication
//400-bad request -invalid request from client
//403-forbidden, not allowed to perform some action
//200-ok
//201-created
//204-for delete and it returns no content
//500-internal error

//Error handling with expresss
//1- install ndb locally or globally
//2- now mention "debug":"ndb server.js" in package.json
//3- run command - npm run debug - a new chrome window should open

//Note -to start in production - 
//1- got to config.env and change to NODE_ENV=production
//2- npm run start:prod- as we have mentioned this in package.json
//to go back to development NODE_ENV=development


//When database is not connecting- go to network access in mongo db atlas website and then add ip adress

//TOPIC-AUTHORIZATION AND AUTHENTICATION
//How to set authorization Bearer Token automatcially when accessing tour Routes
//1-add environment -from postman
//A- in variable- write URL
//B-innitial value- white http://localhost:port/
//c-copy the innitial value in current value and then add
//now make your every route {{URL}}api/v1/users/signup like this
//go to the sign up route and click on tests section and then click on set an environment variable on the right side
//replace the string like this pm.environment.set("jwt", pm.response.json().token);
//go the get tours route and in authorization section ,set the type to bearer token and in the right side section write {{jwt}}
//now go to the get all tours route and make a get request ,dont forget to clear your authorization which you set earlier manually


//Protecting Delete routes-we will allow only some users like admin tour-guide t delete any tour

//To install parcel 
// sudo npm i parcel-bundler@1 --save-dev
//then write  "watch:js":"parcel watch ./public/js/index.js --out-dir ./public/js --out-file bundle.js",
     // "build":"parcel watch ./public/js/index.js --out-dir ./public/js --out-file bundle.js"
     //in package.json
     //now add  script(src='/js/bundle.js') this in base.pug
     //npm run watch:js




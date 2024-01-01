const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException',(err)=>{
  console.log('UNCAUGHT EXCEPTION ,SHUTTING APP' );
  console.log(err.name,err.message);
  process.exit(1)
})
//The above line of code is to find if we have any error in our files , like console.log(x) ,where we have not defined x etc
//we have put it at the top becuase it will run before our server starts and gives us error if any

const app = require('./index');
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log('server is running');
});

//handling unhandledRejection error -like which are not occured because of mongoose or express either , but outside of them like password of database is wrong  or something else

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandledRejection shutting down');
  server.close(() => {
    process.exit(1);
  }); //this code is for - we are shutting down our app gracefully , because there might be other req going on
});

//TO WORK WITH .ENV FILE -JUST INSTALL DOTENV FIRST, MENTION THE CONFIG CODE AND THEN ACCESS IT IN ANY FILE WITH process.env
//Note-remember to require dotenv before app,otherwise it will give undefined process.env.anything=undefined in other file -as server.js file will be read later

//Mongo db
//Basic crud operation
//to create database - use database name
// db.createCollection('name of collection')
//db.collectionName.insertMany([{name:'Prakash'},{name:'vinod'}]);
//db.collectionName.find({name:'Prakash'})
//db.collectionName.find({age:{$lte:20}}), or gte-where lte stands for less than equal to and same as for gte
//when we want to specify two or more than two condition together
//db.collectionName.find({$or:[{price:{$lt:500}},{rating:{$gte:5}}]})- this will output the result if any one of these two becomes true
//db.collectionName.updateOne({name:'Prakash'},{$set:{age:39}})- it will only update the first one which matches the condition
//db.collectionName.updateMany({name:'Prakash'},{$set:{age:40}}); it will update every element which matches the condition
//db.collectionName.deleteMany({})- it deletes all the elements
//Atlas username-prakashnegi668
//password-

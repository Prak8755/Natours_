const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name must be given'],
      unique: true,
      trim: true,
      minlength: [10, 'tour must have 10 minimum character'],
      maxlength: [40, 'tour must have less than 40 character'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'price must be defined'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration must be mentioned'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must mention group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'must mention difficulty level'],
      enum: {
        values: ['medium', 'easy', 'difficult'],
        message: 'Difficulty should be either medium, easy, difficult',
      },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
          //here keep in mind that this keyword points out to current document on new document creation, it will not work with update method
        },
        message: 'discount price must be less than the original price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'rating should not be greater than 5'],
      min: [1, 'rating must be greater than 1'],
      set:val=>Math.round(val*10)/10  //for rounding the values ,like 4.4567=4.4
    },
    ratingsQuantity: {
      type: Number,
      default: 10,
    },
    imageCover: {
      type: String,
      required: [true, 'must have an image'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'must have a summary'],
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation:{
      type:{
        type:String,
        default:'Point',
        enum:['Point']
      },
      description:String,
      address:String,
      coordinates:[Number]
    },
    locations:[
      {
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        description:String,
        address:String,
        coordinates:[Number]
      }
    ],
    guides:[
      {type:mongoose.Schema.ObjectId,ref:'User'}, 
    ],

  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


tourSchema.index({price:1,ratingsAverage:1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});
//Note - when we getAllTours?price[gt]=1500, then we get some result based on filtering , but behind the scene mongo db compares with everY single data in DB to filter the result ,but instead of doing that we use  this trick so that it does not check with every single data im DB, AND ALSO TAKES MORE MEMORY, 
//ALSO CHECK EXPLAIN IN FACTORY CONTROLLER GET ALL , THER WE HAVE ATTACHED EXPLAIN AFTER QUERY
//BUT WITH THIS CODE IT DOES NOT TAKE A LOT OF MEMORY , // 1 MEANS ASCENDING


//here we can set virtual properties to our data
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Mongoose Middleware

//1- Document Middleware -it runs only with save and create not with update
//this is creating slug property before(pre) the data saves to our Database, the postman method is post -
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  //here this keyword points to current document
  next();
});

//this logs the data to the console after(POST) saving data in the database, when data is created with port method in the postman after that this is saved
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});


//query middleware- here we are using query middleware to hide those toure where secretTour is set to true - means some tours are available for only Vip etc , and we do not show such tours to every user
//so this middleware will run before the find method - but when we find any tour which is secretTour set tp true with id then it returns that tour also which is not a good case , so we have another query middleware findOne
// tourSchema.pre('find',function(next){
//   this.find({secretTour:{$ne:true}});
//   next();
// })

//here this middleware will run before all find method , even if we try to find any tour with id , it will work like findOne
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.populate({
    path:'guides',select:'-__v'
  })
  //here this keyword points to current query
  this.start = Date.now();
  next();
});

//post find- this runs once the find query gets completed
tourSchema.post(/^find/, function (data, next) {
 
  console.log(
    `time taken to save the doc is ${Date.now() - this.start} milliseconds`
  );
  next();
});

//Aggregation middleware - this middleware runs before an aggregator , it is simple removing secret tour when we hit http://localhost:8000/api/v1/tours/tour-stats
//keep in mind -but when we are simply hitting http://localhost:8000/api/v1/tours/tour-stats  , it is also working without below logic -
//commenting this code for our getDistances route - because with this it gives an error, you can uncomment it later 
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });


//Attaching guide property on get All tours by finding id of users 
//Note - we have commented this because there is another way of doing it .just check guides property on tourschema above
// tourSchema.pre('save',async function(next){
//   const guidesPromises=this.guides.map(async id=>await User.findById(id));
//   this.guides=await Promise.all(guidesPromises);
//   next();
// })

//Virtual Populate for reviews on getting single tour- so we have set a virtual property when we hit get tour by id - in that case we get the result of all reviews made on particular tours
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tours',
localField:'_id',
});



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;


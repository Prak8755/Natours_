const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'must have a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    users: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user'],
    },

    tours: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
  //This is for the all virtual properties , if there is any , then those will get saved in the DB
);

//Note -one user should create only one review for one tour, Note - it is not working for me as of now
reviewSchema.index({tours:1,users:1},{unique:true});


//Populate middleware
reviewSchema.pre(/^find/, function (next) {
  console.log('me bhi chal gaya');
  // this.populate({path:'users',select:'name'}).populate({path:'tours',select:'name'});
  //Note - so here we do not want the tours to be populated when we hit get tour by id route , because it is not required their.
  this.populate({ path: 'users', select: 'name' });
  next();
});



//Note--this is for setting avgRating and ratingsQty on a particular tour whose review is added , based ont that rating is given and then avg is calculated
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tours: tourId },
    },
    {
      $group: {
        _id: '$tours',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

 await Tour.findByIdAndUpdate(stats[0]._id,{
  ratingsAverage:stats[0].avgRating,
  ratingsQuantity:stats[0].nRating
 })
 
};

reviewSchema.post('save',function(){
  console.log(this)
  this.constructor.calcAvgRatings(this.tours);
})

//Note - now we also want to update the avgRating and avgQty with update review and delete review 
//Note-it will run only with FindByIdAndUpdate and FindByIdAndDelete
reviewSchema.pre(/^findOneAnd/,async function(next){
 this.r=await review.findOne() ;
 //set this.r to current query so that we can access the toudId in post querry below  
next();
})

reviewSchema.post(/^findOneAnd/,function(){
this.r.constructor.calcAvgRatings(this.r.tours);

})



const review = mongoose.model('Review', reviewSchema);
module.exports = review;

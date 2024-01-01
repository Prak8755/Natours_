const fs = require('fs');

const Tour = require('../Model/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factoryController = require('../controller/FactoryController');

//Middleware for top 5 cheap tours
exports.cheapTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//1- create Tour
exports.createTour = factoryController.createOne(Tour);

//updateTour
exports.updateTour = factoryController.updateOne(Tour);

//getTour by id
exports.getTourById = factoryController.getOne(Tour, { path: 'reviews' });

//delete Tour
exports.deleteTour = factoryController.deleteOne(Tour);

//2- get Tours, filtering, sorting etc
exports.getAllTours = factoryController.getAll(Tour);

//get-tour-stats
exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numOfTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgRatings: { $avg: '$ratingsAverage' },
      },
    },
    { $sort: { avgPrice: 1 } },
    //1 is mentioned to sort in ascending order, for descending use -1
  ]);

  res.status(200).json({
    status: 'success',
    result: {
      stats,
    },
  });
});

//4-get monthly plan
exports.getMonthPlan = catchAsync(async function (req, res, next) {
  const year = req.params.year * 1;
  const result = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //here month is referring to which month ,like march =_id=3 , july =_id=7
        numOfTour: { $sum: 1 }, //here this sum is calculating how many tours are in a particular month
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },

    {
      $project: {
        _id: 0, //to now show hide we do 0, if to show just do 1
      },
    },
    {
      $sort: { numOfTour: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    total: result.length,
    result: result,
  });
});


//Note-finding all the tours within a defined radius
////also check tourModel - index is also added there for this to work
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius=unit==='mi'?distance/3963.2:distance/6378.1;
  

 if(!lat||!lng){
 return  next(new AppError('Please provide lat,lng also'),400);
};

const tours=await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data:tours
  });
});

//note -this is not working for me as of now
exports.getDistances=catchAsync(async(req,res,next)=>{
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');  

 if(!lat||!lng){
 return  next(new AppError('Please provide lat,lng also'),400);
};

const distances=await Tour.aggregate([
  {
    $geoNear:{near:{type:'Point',coordinates:[lng*1,lng*1]},distanceField:'distance'}
  }
]);

res.status(200).json({
  status: 'success',
  data:distances
});

})

//CRUD OPERATION USING MONGOOSE,MONGODB

//1-Create

// exports.createTour = async function (req, res) {
//   try {
//     const tour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tours: tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       msg: err,
//     });
//   }
// };

//2-to get all data or multiple filtering methods,sorting,pagination , etc;
// exports.getAllTours = async function (req, res) {
//   try {
//     const features = new APIfeatures(Tour, req.query)
//       .filter()
//       .sort()
//       .fields()
//       .pagination();

//     const tours = await features.query;

//     res.status(201).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       msg: err,
//     });
//   }
// };

//Tour status
// exports.getTourStats = async function (req, res) {
//   try {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } },
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$difficulty' },
//           numOfTours: { $sum: 1 },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' },
//           avgRatings: { $avg: '$ratingsAverage' },
//         },
//       },
//       { $sort: { avgPrice: 1 } },
//       //1 is mentioned to sort in ascending order, for descending use -1
//     ]);

//     res.status(200).json({
//       status: 'success',
//       result: {
//         stats,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       result: 'There is something wrong',
//     });
//   }
// };

// exports.getMonthPlan = async function (req, res) {
//   try {
//     const year = req.params.year * 1;
//     const result = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group:{
//           _id:{$month:'$startDates'},    //here month is referring to which month ,like march =_id=3 , july =_id=7
//           numOfTour:{$sum:1},  //here this sum is calculating how many tours are in a particular month
//           tours:{$push:'$name'}
//         }
//        },
//        {
//         $addFields:{month:'$_id'}
//        },

//          {
//           $project:{
//             _id:0   //to now show hide we do 0, if to show just do 1
//           }
//          } ,
//          {
//           $sort:{numOfTour:-1}
//          }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       total:result.length,
//       result: result,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       message: 'Error',
//     });
//   }
// });

//2-to get all data or multiple filtering methods,sorting,pagination , etc;
// exports.getAllTours = async function (req, res) {
//   try {
//     const queryObj = { ...req.query };
//      const arr = ['sort', 'page', 'limit', 'fields'];
//      arr.forEach((el) => delete queryObj[el]);

//     //Advance filtering
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // | this sign is checking either one of them shall match
//     // \b \b- checks the exact word ,like gte, gt etc
//     // /g checks if there are multiple gte then those should be also checked

//     let query = Tour.find(JSON.parse(queryStr));

//     //sorting logic
//     if (req.query.sort) {
//       // query = query.sort(req.query.sort);
//       //here the data will be sorted in ascending order,
//       //to sort in descending order use minus sign before price in api ,like sort=-price
//       sortBy=req.query.sort.split(',').join(' ');
//       query=query.sort(sortBy)
//     }
//     else{
//       query=query.sort('createdAt')
//     }

//     //field limit logic
//     if(req.query.fields){
//       newField=req.query.fields.split(',').join(' ');
//       query=query.select(newField);
//     }
//     else{
//       query=query.select('-__v');
//     }

//     //pagination logic

//     if(req.query.page||req.query.limit){
//       let limit=req.query.limit*1||10;
//       let page=req.query.page*1||1;
//       let item=(page-1)*limit;
//       query=query.skip(item).limit(limit);
//       let numOfTotalItem=await Tour.countDocuments();
//       if(item>=numOfTotalItem){
//         throw new error('This page does not exist')
//       }
//     }

//     //Here is a doubt, why we are sending data in js objects
//     const tours = await query;

//     res.status(201).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       msg: err,
//     });
//   }
// };

//This is simple get all tours api
// exports.getAllTours=async function(req,res){
// try{
//   const tours=await Tour.find();
//   res.status(201).json({
//     status:'success',
//     result:tours.length,
//     data:{
//       tours:tours
//     }
//   })
// }
// catch(err){
//   res.status(404).json({
//     status:'failed',
//     msg:'There is something wrong'
//   })
// }
// }

// exports.updateTour = async (req, res) => {
//   try {
//     const result = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',
//       data: {
//         result,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       msg: 'Something went wrong',
//     });
//   }
// };

// exports.getTourById = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'success',
//       msg: 'Id is not valid',
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.deleteOne({ _id: req.params.id });
//     res.status(204).json({
//       status: 'success',
//       msg: null,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       msg: 'There has been some error',
//     });
//   }
// };

//the below code was just for practice
// const tours = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
// );

//Param middleware function to check if id is valid or not
// exports.checkId=(req,res,next,val)=>{
//   // console.log(val);
//   if(req.params.id*1>tours.length){
//    return res.status(404).json({
//       status:'failed',
//       message:'invalid id'
//     })
//   }
//   next();
// }

// exports.dataContain=(req,res,next)=>{
//   // console.log(req.body);
//   if(!req.body.name||!req.body.price){
//   return  res.status(404).json({
//       status:'failed',
//       message:'data is invalid'
//     })
//   }
//   next();
// }

// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours,
//     },
//   });
// };

// exports.createTour = (req, res) => {
//   const id = tours[tours.length - 1].id + 1;
// console.log(req.body);
//   const newObj = Object.assign({ id: id }, req.body);
//   tours.push(newObj);

//   fs.writeFile(
//     './dev-data/data/tours-simple.json',
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           newObj,
//         },
//       });
//     }
//   );
// };

// exports.getTourById = (req, res) => {
//   const tour = tours.find((e) => e.id == req.params.id);

//   if (tour) {
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   }
// };
// exports.updateTour = (req, res) => {
//   const x = tours[req.params.id];
//   const newObj = { ...x, name: req.body.name, duration: req.body.duration };
//   res.send(newObj);
//   //
// };

// exports.deleteTour = (req, res) => {
//   if (req.params.id <= 10) {
//     res.status(204).json({
//       result: 'success',
//     });
//   }
// };

const { application } = require('express');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIfeatures = require('../utils/apiFeatures');

//Delete Document functionality
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      next(new AppError('no document exist with that ID'), 404);
    }

    res.status(204).json({
      status: 'success',
      msg: null,
    });
  });

  //Update 
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return next(new AppError('no document exist with such id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        result,
      },
    });
  });


  //Create
exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

  //get One

  exports.getOne=(Model,popOptions)=>catchAsync(async (req, res,next) => {
    // const tour = await Tour.findById(req.params.id);
    //   const tour = await Tour.findById(req.params.id).populate('reviews');
  
      // const tour = await Tour.findById(req.params.id).populate({path:'guides',select:'-__v'});
      //here populate is just simply referring to guides property on schema- which gives array of users id when we hit getAllTours , but when we hit getTourById route- then on postman , it will give you info about those users 
      //Note -But instead of using it here we use it in tourModel as a middleware , so that we can use it with all find method -whenever there is find with any tours- it runs on all of them

      let query=Model.findById(req.params.id);
      if(popOptions){query.populate(popOptions)};
      const doc=await query;
      if(!doc){
        return next(new AppError('no document exist with such id',404))
      }
      res.status(200).json({
        status: 'success',
        data: {
          doc,
        },
      });
   
  });

  //Get all 
  exports.getAll=(Model)=>catchAsync(async function (req, res,next) {
    //This is only for nested Get reviews on tour
    //GET /Reviews, //GET /tours/:tourId/reviews
    let filter={};
    if(req.params.tourId) filter={tours:req.params.tourId};
 
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
  
    // const doc = await features.query.explain();
    const doc = await features.query.explain();
  
    res.status(201).json({
      status: 'success',
      result: doc.length,
      data: {
        doc: doc,
      },
    });
  
  });
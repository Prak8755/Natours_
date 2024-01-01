const catchAsync = require('../utils/catchAsync');
const Tour = require('../Model/tourModel');
const AppError = require('../utils/appError');
const User = require('../Model/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: ' All tours ',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is not tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

//
exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'login to your account',
  });
});

//
exports.getAccount = async (req, res) => {
  res.status(200).render('account', {
    title: 'my account',
  });
};

//Update user
exports.updateUser = catchAsync(async (req, res, next) => {
  // app.use(express.urlencoded({extended:true,limit:'10kb'})) --for form submit
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'my account',
    user: updatedUser
  });
});

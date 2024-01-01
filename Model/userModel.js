const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { stringify } = require('querystring');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true, //will convert the email to lower case,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false, //this will not send the password to the client
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'tour-guide', 'guide'],
      message: 'Please define a proper role',
    },
    default: 'user',
  },
  confirmPassword: {
    type: String,
    required: [true, 'confirm password is required '],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    }, //this function only runs with create and save
  },
  active:{
    type:Boolean,
     default:true,
     select:false
  },
  passwordResetToken: String,
  passwordResetExpires:Date,
  changedPasswordAt: Date,
});

//this middleware is for encryption of password
userSchema.pre('save', async function (next) {
  if (!this.isModified) return next();
  //now install bcrypt
  this.password = await bcrypt.hash(this.password, 12);
  //hide confirm password -because we dont need it to store on DB
  this.confirmPassword = undefined;
  next();
});


//This is for updating changedPasswordAt field if password changes when user login -like update the password
userSchema.pre('save',function(next){
  if(!this.isModified('password')||this.isNew) return next();
  this.changedPasswordAt=Date.now()-1000;
next();
})

//this method is for checking if password is matched or not - so here when user logins that password first will be hashed and then gets compared with the old one
userSchema.methods.correctPassword = async function (
  loginPassword,
  savedPassword
) {
  return await bcrypt.compare(loginPassword, savedPassword);
};

//this method is for if password is changed after login
userSchema.methods.ifPasswordChanged = function (JwtTimeStamp) {
  if (this.changedPasswordAt) {
    let changePassStamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10);
    return JwtTimeStamp < changePassStamp; //eg- 100<200
    //THIS CONDITION RUNS WHEN USER LET'S SAY LOGIN AND THEN CHANGE PASSWORD , IF HE TRIES TO ACCESS THE TOURS NOW , HE WILL BE ASKED TO LOGIN AGAIN
  }
  return false;
};

//@@@-GENERATE A RANDOM TOKEN WHEN USER FORGETS PASSWORD
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires=Date.now()+10*60*1000;
  
  return resetToken;
};



//this is a querry middleware - which runs before when we hit getAllUsers route
//this middleware is showing now only those users in db whose active status is not equal to false ,
//means the user who deactivated his account will not be deleted from db but he will not simply in db with this middleware
userSchema.pre('/^find/',(req,res,next)=>{
  //this points to the current query
  this.find({active:{$ne:false}});
  next();
}) 

const User = mongoose.model('User', userSchema);
module.exports = User;

const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');

//passowrd hashing
const bcrypt = require('bcryptjs');

//CREATE SCHEMA FOR USER MODEL..
//create username, email, photo, password, confirmPassowrd fields. 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'Please include your email.'],
        validate: [validator.isEmail, 'Please provide valid email.']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your passowrd.'],
        validate : {
            //Only works on SAVE AND CREATE.
            validator: function(el){
                //if the confirmPassword is not equal to password then , this fucntion wil return false on save. 
                return el === this.password
            },
            message: "Confirm password does not match password."
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

//Mongoose middleware presave inorder to salt passowrd or encrypt password when saving to the database. 

userSchema.pre('save', async function(next) {
    //only run this fucntion if password is already modified.
    if(!this.isModified('password')) return next(); 
    //if not then modify it with hash with the cost of 12.
    this.password = await bcrypt.hash(this.password, 12);

    //we dont need to save confirm password, hence we are deleting it by setting it to undefined. 
    this.confirmPassword = undefined

    next()
})

//save passwordChangedAt time after reseting password.
userSchema.pre('save', function(next){

    //this will run and proceed to change pasword if not modified and user has put a request 
    if(!this.isModified || this.isNew) return next();

    //some time db takes time to save password where jwt has already been sent, this a hack to delay user logging in immedietly to the app. 
    this.passwordChangedAt = Date.now() - 1000;
    next();
})
//this is a query middle ware which only run if there is an active property set to false on the current document. and hides it when all requesting all users.
userSchema.pre(/^find/, function(next){
   
    this.find({ active: {$ne : false}})

    next();
})
//decrypt password by instance method.
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

//instance method for user change password.
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt( this.passwordChangedAt.getTime() / 1000, 10);
        
        // if the token issued is less then return true. and password has been changed.
        return JWTTimestamp < changedTimestamp;

      }
    
      // False means NOT changed
      return false;
}
userSchema.methods.createPasswordResetToken = function(){
    //this will be sent to user in order reset the passowrd. only user will have access to this token which will be sent via email.
    //this will not be stored in to the database.

    const resetToken = crypto.randomBytes(32).toString('hex');
    //creating a hash and saving it to the passwordResetToken, and only saving it in a encryted version in db.
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    //password reset passwordResetExpires

    console.log({resetToken}, this.passwordResetToken)
    
    //password token expires in 10 min
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;

}

const User = mongoose.model('User', userSchema)

module.exports = User;
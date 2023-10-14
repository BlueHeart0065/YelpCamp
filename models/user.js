const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    }
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User' , UserSchema);

module.exports = User;
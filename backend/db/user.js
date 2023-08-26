const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Table for the User Schema

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    mobile_number: {
        type: Number,
        require: true,
        unique: true,
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

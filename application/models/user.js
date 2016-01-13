var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({

    username : String,
    nickname : String,
    email : String,
    password : String,
    gender : String,
    avatar : {
        type : String,
        default : 'user.jpg'
    },
    description : String,
    role : {
        type : String,
        default : 'user'
    },

    score : {
        type : Number,
        default : 0
    },
    last_sign : {
        type : Date,
        default : Date.now
    },
    continuous_sign_days : {
        type : Number,
        default : 0
    },

    create_at : {
        type : Date,
        default : Date.now
    },
    update_at : {
        type : Date,
        default : Date.now
    }

})

module.exports = mongoose.model('User', userSchema)
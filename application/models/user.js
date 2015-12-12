var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({

    username : String,
    name : String,
    email : String,
    password : String,
    gender : String,
    role : {
        type : String,
        default : 'user'
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

userSchema.statics = {
    findById: function(id, cb){
        return this.findOne({_id : id}).exec(cb)
    }
}

var User = mongoose.model('User', userSchema)

module.exports = User
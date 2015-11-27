var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({

    name : String,
    username : String,
    email : String,
    password : String,
    gender : String,
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
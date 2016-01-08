var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId

var commentSchema = new mongoose.Schema({

    thread_id : ObjectId,
    commenter_id : ObjectId,
    content : String,
    thanks : {
        type : Number,
        default : 0
    },
    create_at : {
        type : Date,
        default : Date.now
    }

})

var Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var commentSchema = new Schema({

    thread_id : {
        type : Schema.Types.ObjectId,
        ref : 'Thread'
    },
    commenter_id : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    content : String,
    thanks : [Schema.Types.ObjectId],
    create_at : {
        type : Date,
        default : Date.now
    }

})

module.exports = mongoose.model('Comment', commentSchema)
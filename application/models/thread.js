var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId

var threadSchema = new mongoose.Schema({

    title : String,
    content : String,
    category : ObjectId,
    author_id: ObjectId,
    last_reply: ObjectId,
    deleted: {
        type: Boolean,
        default: false
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

var Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
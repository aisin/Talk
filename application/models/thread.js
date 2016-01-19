var mongoose = require('mongoose')
var Schema = mongoose.Schema

var threadSchema = new Schema({

    title : String,
    content : String,
    category : {
        type : Schema.Types.ObjectId,
        ref : 'Category'
    },
    author_id: {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    last_reply: {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    views: {
        type: Number,
        default: 0
    },
    locked: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    thanks : [Schema.Types.ObjectId],
    create_at : {
        type : Date,
        default : Date.now
    },
    update_at : {
        type : Date,
        default : Date.now
    }

})

module.exports = mongoose.model('Thread', threadSchema)
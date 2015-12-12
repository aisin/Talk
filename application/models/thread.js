var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId
var BaseModel = require('./base_model')

var threadSchema = new mongoose.Schema({

    title : String,
    content : String,
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

threadSchema.plugin(BaseModel)

var Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
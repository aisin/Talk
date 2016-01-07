var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId

var threadCollectSchema = new mongoose.Schema({

    user_id : ObjectId,
    thread_id: ObjectId,
    create_at : {
        type : Date,
        default : Date.now
    }
})

var ThreadCollect = mongoose.model('ThreadCollect', threadCollectSchema)

module.exports = ThreadCollect
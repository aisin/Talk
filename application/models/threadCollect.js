var mongoose = require('mongoose')
var Schema = mongoose.Schema

var threadCollectSchema = new Schema({

    user_id : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    thread_id: {
        type : Schema.Types.ObjectId,
        ref : 'Thread'
    },
    create_at : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('ThreadCollect', threadCollectSchema)
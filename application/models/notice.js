var mongoose = require('mongoose')
var Schema = mongoose.Schema

var noticeSchema = new Schema({

    from_user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    to_user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    thread : {
        type : Schema.Types.ObjectId,
        ref : 'Thread'
    },
    comment : {
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    },
    /**
     * Notice:
     *
     * 0: @用户， 1: 回复主题
     *
     */
    type : Number,
    deleted : {
        type: Boolean,
        default: false
    },
    create_at : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('Notice', noticeSchema)
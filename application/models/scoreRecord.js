var mongoose = require('mongoose')
var Schema = mongoose.Schema

var scoreRecordSchema = new Schema({

    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    type : Number, // 0:签到, 1:发布主题, 2:感谢题主, 3:感谢评论主, 4:收到主题感谢, 5:收到评论感谢
    amount : Number,
    asset : Number,
    detail : {
        person : {
            type : Schema.Types.ObjectId,
            ref : 'User'
        },
        thread : {
            type : Schema.Types.ObjectId,
            ref : 'Thread'
        }
    },
    create_at : {
        type : Date,
        default : Date.now
    }

})

module.exports = mongoose.model('ScoreRecord', scoreRecordSchema)
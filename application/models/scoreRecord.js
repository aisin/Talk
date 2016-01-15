var mongoose = require('mongoose')
var Schema = mongoose.Schema

var scoreRecordSchema = new Schema({

    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    /**
     * 收入：0:签到，2:接受感谢（主题），4：接受感谢（评论），6：主题收到评论
     *
     * 消耗：1:创建主题，3:发送感谢（主题），5：发送感谢（评论），7：创建主题评论
     */
    type : Number,
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
var Comment = require('../models/comment')
var Notice = require('../models/notice')

/**
 * 根据主题 ID，获取评论数
 * Callback:
 * - err, 数据库异常
 * - Comment, 评论表
 * @param {String} id 分类 ID
 * @param {Function} callback 回调函数
 */
exports.getCountByThread = function(threadId, callback){
    Comment.count({thread_id: threadId}, callback)
}

/**
 * 获取所有评论条数
 * @param callback
 */
exports.getTotalCount = function(callback){
    Comment.count({}, callback)
}

/**
 *
 * @param fromUser
 * @param toUser
 * @param threadId
 * @param commentId
 * @param callback
 */
exports.sendAtMessage = function(fromUser, toUser, threadId, commentId, callback){
    var data = {
        from_user : fromUser,
        to_user : toUser,
        thread : threadId,
        comment : commentId,
        type : 0
    }
    var notice = new Notice(data)
    notice.save(callback)
}
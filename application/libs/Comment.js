var Comment = require('../models/comment')

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
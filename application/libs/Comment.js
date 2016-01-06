var Comment = require('../models/comment')

/**
 * 根据主题 ID，查找所有评论
 * Callback:
 * - err, 数据库异常
 * - User, 用户表
 * @param {String} id 分类 ID
 * @param {Function} callback 回调函数
 */
exports.getCommentsByThread = function(id, callback){
    if(!id) return callback()
    Comment.find({thread_id: id}, callback).sort({create_at: -1})
}
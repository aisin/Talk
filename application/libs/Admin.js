var User = require('../models/user')

/**
 * 根据用户名，查找管理员用户
 * Callback:
 * - err, 数据库异常
 * - User, 用户表
 * @param {String} username 用户名
 * @param {Function} callback 回调函数
 */
exports.getAdminByUsername = function(username, callback){
    User.findOne({username: username}, callback)
}
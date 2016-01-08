var User = require('../models/user')

/**
 * 根据用户名 ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - User, 用户表
 * @param {String} id 用户 ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function(id, callback){
    User.findOne({_id : id}, callback)
}

/**
 * 根据用户名，查找用户
 * Callback:
 * - err, 数据库异常
 * - User, 用户表
 * @param {String} username 用户名
 * @param {Function} callback 回调函数
 */
exports.getUserByUsername = function(username, callback){
    User.findOne({username: username}, callback)
}

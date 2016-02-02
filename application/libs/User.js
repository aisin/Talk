var moment = require('moment')
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
    User.findOne({_id : id}, function(err, result){
        callback(err, result)
    })
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
    User.findOne({username: username}, function(err, result){
        callback(err, result)
    })
}

/**
 * 根据邮箱，查找用户
 * @param email
 * @param callback
 */
exports.getUserByEmail = function(email, callback){
    User.findOne({email: email}, callback)
}

exports.getTotalCount = function(callback){
    User.count({}, callback)
}

/**
 * 积分操作
 * @param user 需要操作用户对象
 * @param score 分数（增加或者减少）
 * @param callback 回调函数
 */
exports.modifyScore = function(user, score, callback){
    User.findByIdAndUpdate(user, {$inc: {score: score}}, callback)
}


exports.hasSigned = function(userId, callback){
    User.findOne({_id: userId}, function(err, user){
        var todayStamp = moment().startOf('day').unix() //取今天 00:00:00 的时间戳，不含毫秒
        var lastSignStamp = moment(user.last_sign).startOf('day').unix() //取最后签到当天 00:00:00 的时间戳，不含毫秒
        if((todayStamp - lastSignStamp) / 86400 === 0){
            //当天已经签过到
            callback(true)
        }else{
            //当天未曾签到
            callback(false)
        }
    })
}









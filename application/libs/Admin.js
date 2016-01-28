var EventProxy = require('eventproxy')
var User = require('../models/user')
var Category = require('../models/category')
var Thread = require('../models/thread')
var _Thread = require('./Thread')

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

exports.getAllCategories = function(callback){
    Category.find({}, function(err, categories){
        var ep = new EventProxy()
        ep.after('count', categories.length, function(){
            callback(err, categories)
        })
        categories.forEach(function(cate, i){
            _Thread.getCountByCategory({category: cate._id}, ep.done(function(count){
                cate.count = count
                ep.emit('count')
            }))
        })
    })
}

exports.getAllThreads = function(callback){
    Thread.find({})
        .populate('author_id', 'username')
        .sort({update_at: -1})
        .exec(function(err, threads){
            callback(err, threads)
        })
}
var Category = require('../models/category')

/**
 * 查找所有分类
 * Callback:
 * - err, 数据库异常
 * - Category, 分类表
 * @param {Function} callback 回调函数
 */
exports.getAllCategories = function(callback){
    Category.find({}, function(err, categories){
        callback(err, categories)
    })
}

/**
 * 根据分类 ID，查找分类
 * Callback:
 * - err, 数据库异常
 * - User, 用户表
 * @param {String} id 分类 ID
 * @param {Function} callback 回调函数
 */
exports.getCategoryById = function(id, callback){
    Category.findOne({_id : id}, function(err, category){
        callback(err, category)
    })
}
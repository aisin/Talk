var Category = require('../models/category')

/**
 * 查找所有分类
 * Callback:
 * - err, 数据库异常
 * - Category, 分类表
 * @param {Function} callback 回调函数
 */
exports.getAllCategories = function(callback){
    Category.find({}, callback)
}
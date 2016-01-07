var Thread = require('../models/thread')

exports.getAllThreads = function(callback){
    Thread.find({deleted: false}).sort({update_at: -1}).exec(callback)
}

exports.getThreadById = function(id, callback){
    if(!id) return callback()
    Thread.findOne({_id : id}, callback)
}

exports.updateViewsOfThread = function(id, callback){
    Thread.update({_id: id}, {$inc: {views: 1}}).exec(callback)
}

exports.getCountByCategory = function(category, callback){
    Thread.count({category: category, deleted: false}, callback)
}

exports.getThreadsByCategory = function(category, callback){
    Thread.find({category: category, deleted: false}, function(err, threads){
        if(err) return callback(err)
        if(threads.length === 0){
            return callback(null, [])
        }else{
            return callback(null, threads)
        }
    }).sort({update_at: -1})
}
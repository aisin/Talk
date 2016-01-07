var Thread = require('../models/thread')
var ThreadCollect = require('../models/threadCollect')

exports.getAllThreads = function(callback){
    Thread.find({deleted: false}).sort({update_at: -1}).exec(callback)
}

exports.getThreadById = function(id, callback){
    Thread.findOne({_id : id, deleted: false}, callback)
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

exports.getCollectById = function(user_id, thread_id, callback){
    ThreadCollect.findOne({user_id: user_id, thread_id: thread_id}, callback)
}

exports.collectThread = function(user_id, thread_id, callback){
    var thread = new ThreadCollect({user_id: user_id, thread_id: thread_id})
    thread.save(callback)
}

exports.removeCollectThread = function(user_id, thread_id, callback){
    ThreadCollect.remove({user_id: user_id, thread_id: thread_id}, callback)
}
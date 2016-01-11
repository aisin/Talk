var Thread = require('../models/thread')
var ThreadCollect = require('../models/threadCollect')
var _User = require('./User')
var _Category = require('./Category')
var _Comment = require('./Comment')
var EventProxy = require('eventproxy')

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

exports.getCollectById = function(user, thread, callback){
    ThreadCollect.findOne({user_id: user, thread_id: thread}, callback)
}

exports.collectThread = function(user, thread, callback){
    var thread = new ThreadCollect({user_id: user, thread_id: thread})
    thread.save(callback)
}

exports.removeCollectThread = function(user, thread, callback){
    ThreadCollect.remove({user_id: user, thread_id: thread}, callback)
}
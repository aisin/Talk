var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var Category = require('../models/category')
var User = require('../models/user')
var ThreadCollect = require('../models/threadCollect')
var _Comment = require('./Comment')

exports.getAllThreads = function(callback){
    Thread.find({deleted: false}).sort({update_at: -1}).exec(callback)
}

exports.getThreadById = function(id, callback){
    Thread.findOne({_id : id, deleted: false}, function(err, result){
        callback(result)
    })
}

exports.updateViewsOfThread = function(id, callback){
    Thread.update({_id: id}, {$inc: {views: 1}}).exec(callback)
}

exports.getCountByCategory = function(query, callback){
    Thread.count(query, callback)
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

exports.getTotalCount = function(callback){
    Thread.count({deleted: false}, callback)
}

/**
 * 根据用户 ID 获取用户收藏的所有主题
 * @param member
 * @param callback
 */
exports.getCollectsByMember = function(member, callback){
    ThreadCollect.find({user_id: member})
        .populate('thread_id')
        .sort({create_at: -1})
        .exec(function(err, resultsA){
            //deep `populate`
            Category.populate(resultsA, {
                path: 'thread_id.category',
                select: 'name'
            }, function(err, resultsB){

                User.populate(resultsB, {
                    path: 'thread_id.author_id',
                    select: 'nickname',
                }, function(err, resultsC){

                    User.populate(resultsC, {
                        path: 'thread_id.last_reply',
                        select: 'nickname'
                    }, function(err, resultsD){

                        var ep = new EventProxy()
                        ep.after('comments', resultsD.length, function(){
                            callback(resultsD)
                        })
                        resultsD.forEach(function(thread, i){
                            _Comment.getCountByThread(thread.thread_id._id, ep.done(function(count){
                                thread.thread_id.comments = count
                                ep.emit('comments')
                            }))
                        })
                    })
                })
            })
        })
}

/**
 * 根据用户 ID 获取用户创建的所有主题
 * @param member
 * @param callback
 */
exports.getCreatesByMember = function(member, callback){
    Thread.find({author_id: member})
        .populate([{
            path: 'category',
            select: 'name'
        }, {
            path: 'author_id',
            select: 'nickname'
        }, {
            path: 'last_reply',
            select: 'nickname'
        }])
        .sort({update_at: -1})
        .exec(function(err, results){
            var ep = new EventProxy()
            ep.after('comments', results.length, function(){
                callback(results)
            })
            results.forEach(function(thread, i){
                _Comment.getCountByThread(thread._id, ep.done(function(count){
                    thread.comments = count
                    ep.emit('comments')
                }))
            })
        })
}
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

exports.getMemberCollects = function(member, callback){
    ThreadCollect.find({user_id: member}, callback).sort({create_at: -1})
}

exports.getMetas = function(threads, callback){
    var ep = new EventProxy()
    ep.after('whole', threads.length, function(){
        callback(threads)
    })
    threads.forEach(function(thread, i){
        var proxy = new EventProxy()
        var events = ['author', 'category', 'comments', 'last_reply']
        proxy.all(events, function(author, category, comments, lastReply){
            if(author && category){
                thread.author = author.nickname
                thread.authorAvatar = author.avatar
                thread.categoryName = category.name
                thread.comments = comments
                thread.lastReplyName = lastReply.nickname
            }
            ep.emit('whole', threads)
        })
        _User.getUserById(thread.author_id, proxy.done('author'))
        _Category.getCategoryById(thread.category, proxy.done('category'))
        _Comment.getCountByThread(thread._id, proxy.done('comments'))
        _User.getUserById(thread.last_reply, proxy.done('last_reply'))
    })
}

exports.getThreadsByIdArray = function(idAry, callback){
    Thread.find({_id : {$in: idAry}}, callback).sort({create_at: -1})
}
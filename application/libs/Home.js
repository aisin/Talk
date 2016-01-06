var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var User = require('../models/user')
var _User = require('./User')
var _Category = require('./Category')

exports.getThreads = function(callback){

    Thread.find({deleted : false}, function(err, threads){

        if(err) return callback(err)

        if(threads.length === 0) return callback(null, [])

        var ep = new EventProxy()

        ep.after('threads_ready', threads.length, function(){
            return callback(null, threads)
        })

        ep.fail(callback)

        //遍历操作每一条主题
        threads.forEach(function(thread, i){
            var proxy = new EventProxy()

            proxy.all('author', 'category', function(author, category){
                if(author){
                    thread.author = author.nickname
                    thread.authorAvatar = author.avatar
                    thread.categoryName = category.name
                }else{
                    threads[i] = null
                }

                ep.emit('threads_ready')
            })

            _User.getUserById(thread.author_id, proxy.done('author'))
            _Category.getCategoryById(thread.category, proxy.done('category'))
        })
    }).sort({update_at: -1})
}
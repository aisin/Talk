var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')

exports.list = function(req, res, next){
    var cate = req.params.id
    _Thread.getThreadsByCategory(cate, function(err, threads){
        if(err) return next(err)
        var ep = new EventProxy()
        ep.fail(next)
        //查询分类名称
        _Category.getCategoryById(cate, ep.done(function(category){
            ep.emit('category', category)
        }))
        //查询分类下主题数
        _Thread.getCountByCategory(cate, ep.done(function(count){
            ep.emit('count', count)
        }))

        ep.all(['threads_ready', 'category', 'count'], function(threads, category, count){
            return res.render('category/list', {
                session : req.session.user,
                category : category,
                threads : threads,
                count : count
            })
        })

        ep.after('threads_all', threads.length, function(){
            ep.emit('threads_ready', threads)
        })

        threads.forEach(function(thread, i){
            var proxy = new EventProxy()

            proxy.all('author', 'comments', function(author, comments){
                if(author){
                    thread.author = author.nickname
                    thread.authorAvatar = author.avatar
                    thread.comments = comments
                }else{
                    threads[i] = null
                }
                ep.emit('threads_all')
            })

            _User.getUserById(thread.author_id, proxy.done('author'))
            _Comment.getCountByThread(thread._id, proxy.done('comments'))
        })
    })
}
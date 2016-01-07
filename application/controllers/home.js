var _Thread = require('../libs/Thread')
var _User = require('../libs/User')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')
var EventProxy = require('eventproxy')

exports.index = function (req, res, next) {
    _Thread.getAllThreads(function(err, threads){
        var ep = new EventProxy()
        ep.fail(next)
        //获取分类
        _Category.getAllCategories(function(err, categories){
            ep.emit('categories', categories)
        })

        ep.all('threads_ready', 'categories', function(threads, categories){
            res.render('home', {
                session : req.session.user,
                threads : threads,
                categories : categories
            })
        })

        ep.after('threads_all', threads.length, function(){
            ep.emit('threads_ready', threads)
        })

        //处理每一条主题
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
                }else{
                    threads[i] = null
                }
                ep.emit('threads_all')
            })
            _User.getUserById(thread.author_id, proxy.done('author'))
            _Category.getCategoryById(thread.category, proxy.done('category'))
            _Comment.getCountByThread(thread._id, proxy.done('comments'))
            _User.getUserById(thread.last_reply, proxy.done('last_reply'))
        })
    })
}
var _Thread = require('../libs/Thread')
var _User = require('../libs/User')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')
var EventProxy = require('eventproxy')

exports.index = function (req, res, next) {
    _Thread.getAllThreads(function(err, threads){
        var ep = new EventProxy()
        ep.after('threads_ready', threads.length, function(){
            res.render('home', {
                session : req.session.user,
                threads : threads
            })
        })
        ep.fail(next)

        threads.forEach(function(thread, i){
            var proxy = new EventProxy()
            proxy.all('author', 'category', 'comments', 'last_reply', function(author, category, comments, lastReply){
                if(author && category){
                    thread.author = author.nickname
                    thread.authorAvatar = author.avatar
                    thread.categoryName = category.name
                    thread.comments = comments
                    thread.lastReplyName = lastReply.nickname
                }else{
                    threads[i] = null
                }
                ep.emit('threads_ready')
            })
            _User.getUserById(thread.author_id, proxy.done('author'))
            _Category.getCategoryById(thread.category, proxy.done('category'))
            _Comment.getCountByThread(thread._id, proxy.done('comments'))
            _User.getUserById(thread.last_reply, proxy.done('last_reply'))
        })
    })
}
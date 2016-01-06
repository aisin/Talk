var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')
var _Category = require('../libs/Category')

exports.list = function(req, res, next){
    var id = req.params.id

    Thread.find({category: id, deleted: false}, function(err, threads){
        var ep = new EventProxy()

        ep.fail(next)

        ep.after('threads_all', threads.length, function(){

            ep.emit('threads_ready', threads)

        })

        ep.all(['threads_ready', 'category', 'count'], function(threads, category, count){
            res.render('category/list', {
                session : req.session.user,
                category : category,
                threads : threads,
                count : count
            })
        })

        _Thread.getCountByCategory(id, ep.done(function(count){
            ep.emit('count', count)
        }))

        _Category.getCategoryById(id, ep.done('category'))

        threads.forEach(function(thread, i){
            var proxy = new EventProxy()

            proxy.on('author', function(author){
                thread.author = author.nickname
                thread.authorAvatar = author.avatar

                ep.emit('threads_all')
            })

            _User.getUserById(thread.author_id, proxy.done('author'))
        })
    }).sort({update_at: -1})
}
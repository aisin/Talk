var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _User = require('../libs/User')
var _Category = require('../libs/Category')

exports.list = function(req, res, next){
    var id = req.params.id

    Thread.find({category: id, deleted: false}, function(err, threads){
        var ep = new EventProxy()

        ep.fail(next)

        ep.after('threads_all', threads.length, function(){

            ep.emit('threads_ready', threads)

        })

        ep.all(['threads_ready', 'category'], function(threads, category){
            res.render('category/list', {
                session : req.session.user,
                category : category,
                threads : threads
            })
        })

        _Category.getCategoryById(id, ep.done('category'))

        threads.forEach(function(thread, i){
            var proxy = new EventProxy()

            proxy.on('author', function(author){
                thread.author = author.nickname

                ep.emit('threads_all')
            })

            _User.getUserById(thread.author_id, proxy.done('author'))
        })
    })
}
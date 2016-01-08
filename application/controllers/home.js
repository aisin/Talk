var _Thread = require('../libs/Thread')
var _User = require('../libs/User')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')
var EventProxy = require('eventproxy')

exports.index = function (req, res, next) {
    _Thread.getAllThreads(function(err, threads){
        var ep = new EventProxy()
        ep.fail(next)
        ep.all('threads_ready', 'categories', function(threads, categories){
            res.render('home', {
                session : req.session.user,
                threads : threads,
                categories : categories
            })
        })

        //获取分类
        _Category.getAllCategories(function(err, categories){
            ep.emit('categories', categories)
        })

        //处理每一条主题
        _Thread.getMetas(threads, function(results){
            ep.emit('threads_ready', results)
        })
    })
}
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
        var events = ['category', 'count', 'threads_ready']
        ep.all(events, function(category, count, threads){
            return res.render('category/list', {
                session : req.session.user,
                category : category,
                threads : threads,
                count : count
            })
        })

        //查询分类名称
        _Category.getCategoryById(cate, ep.done(function(category){
            ep.emit('category', category)
        }))

        //查询分类下主题数
        _Thread.getCountByCategory(cate, ep.done(function(count){
            ep.emit('count', count)
        }))

        //处理每一条主题
        _Thread.getMetas(threads, function(results){
            ep.emit('threads_ready', results)
        })
    })
}
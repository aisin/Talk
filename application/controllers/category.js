var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _Thread = require('../libs/Thread')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')

exports.list = function(req, res, next){
    var cate = req.params.id
    Thread.find({category: cate, deleted:false})
        .populate([{
            path : 'author_id',
            select : 'nickname avatar'
        }, {
            path : 'last_reply',
            select : 'nickname'
        }])
        .sort({update_at: -1})
        .exec(function(err, threads){
            if(err) return next(err)
            var ep = new EventProxy()
            ep.fail(next)
            var events = ['threadsReady', 'category', 'count']
            ep.all(events, function(threads, category, count){
                res.render('category/list', {
                    session : req.session.user,
                    category : category,
                    threads : threads,
                    count : count
                })
            })

            ep.after('comment', threads.length, function(){
                ep.emit('threadsReady', threads)
            })

            threads.forEach(function(thread, i){
                _Comment.getCountByThread(thread._id, ep.done(function(count){
                    thread.comments = count
                    ep.emit('comment')
                }))
            })

            //查询分类名称
            _Category.getCategoryById(cate, ep.done(function(category){
                ep.emit('category', category)
            }))

            //查询分类下主题数
            _Thread.getCountByCategory(cate, ep.done(function(count){
                ep.emit('count', count)
            }))
        })
}
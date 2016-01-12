var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')

exports.index = function (req, res, next) {
    Thread.find({deleted: false})
        .populate([{
            path : 'category',
            select : 'name'
        }, {
            path : 'author_id',
            select : 'nickname avatar'
        }, {
            path : 'last_reply',
            select : 'nickname'
        }])
        .sort({update_at: -1})
        .exec(function(err, threads){
            var ep = new EventProxy()
            ep.fail(next)
            var events = ['threadsReady', 'categories', 'usersTotal', 'ThreadsTotal', 'commentsTotal']
            ep.all(events, function(threads, categories, usersTotal, ThreadsTotal, commentsTotal){
                res.render('home', {
                    session : req.session.user,
                    threads : threads,
                    categories : categories,
                    usersTotal : usersTotal,
                    ThreadsTotal : ThreadsTotal,
                    commentsTotal : commentsTotal
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

            //获取分类
            _Category.getAllCategories(function(err, categories){
                ep.emit('categories', categories)
            })

            //获取社区总用户数
            _User.getTotalCount(function(err, count){
                ep.emit('usersTotal', count)
            })

            //获取社区总主题数
            _Thread.getTotalCount(function(err, count){
                ep.emit('ThreadsTotal', count)
            })

            //获取社区总评论数
            _Comment.getTotalCount(function(err, count){
                ep.emit('commentsTotal', count)
            })
        })
}
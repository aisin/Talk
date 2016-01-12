var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var _Category = require('../libs/Category')
var _Comment = require('../libs/Comment')
var Common = require('../libs/Common')

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
            var events = ['threadsReady', 'categories', 'communityData']
            ep.all(events, function(threads, categories, communityData){
                res.render('home', {
                    session : req.session.user,
                    threads : threads,
                    categories : categories,
                    usersTotal : communityData.usersTotal,
                    threadsTotal : communityData.threadsTotal,
                    commentsTotal : communityData.commentsTotal
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

            //获取社区数据
            Common.getCommunityData(function(communityData){
                ep.emit('communityData', communityData)
            })
        })
}
var EventProxy = require('eventproxy')
var _Comment = require('../libs/Comment')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')

/**
 * 获取社区的数据：用户总数/主题总数/评论总数
 * Callback:
 * @param {Function} callback 回调函数
 */
exports.getCommunityData = function(callback){
    var ep = new EventProxy()
    var events = ['usersTotal', 'threadsTotal', 'commentsTotal']
    ep.all(events, function(usersTotal, threadsTotal, commentsTotal){
        var communityData = {
            usersTotal : usersTotal,
            threadsTotal : threadsTotal,
            commentsTotal : commentsTotal
        }
        callback(communityData)
    })

    //获取社区总用户数
    _User.getTotalCount(function(err, count){
        ep.emit('usersTotal', count)
    })

    //获取社区总主题数
    _Thread.getTotalCount(function(err, count){
        ep.emit('threadsTotal', count)
    })

    //获取社区总评论数
    _Comment.getTotalCount(function(err, count){
        ep.emit('commentsTotal', count)
    })
}
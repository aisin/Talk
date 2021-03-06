var EventProxy = require('eventproxy')
var XSS = require('xss')
var Comment = require('../models/comment')
var Thread = require('../models/thread')
var validator = require('validator')
var Utils = require('../libs/Utils')
var _At = require('../libs/At')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')
var _Comment = require('../libs/Comment')
var Common = require('../libs/Common')
var xss = new XSS.FilterXSS({
    whiteList: {
        a: ['href', 'title', 'target']
    }
})

//
exports.comment = function(req, res, next){
    var threadId = req.params.id
    _Thread.getThreadById(threadId, function(err, thread){
        res.render('thread/comment', {
            thread_id : threadId,
            thread_title : thread.title
        })
    })
}

//发布评论
exports.add = function(req, res, next){
    var data = {
        commenter_id : req.session.user._id,
        thread_id : req.params.id,
        content : xss.process(validator.trim(req.body.content)).replace(/\r\n/g, '<br>')
    }
    var content = data.content
    var commentScore = 5 //需要扣除的积分
    var ep = new EventProxy()
    ep.fail(next)
    ep.on('errors', function(msg){
        res.status(403)
        return res.render('thread/comment', {
            thread_id : data.thread_id,
            thread_title : msg.title,
            content : data.content,
            errors : msg.msg
        })
    })

    //积分核算
    ep.all('downUser', 'upUser', function(downUser, upUser){
        var downRecord = {
            user : downUser._id,
            type : 7,
            amount : -commentScore,
            asset : downUser.score - commentScore,
            detail : {
                person : data.commenter_id,
                thread : data.thread_id
            }
        }
        var upRecord = {
            user : upUser._id,
            type : 6,
            amount : commentScore,
            asset : upUser.score + commentScore,
            detail : {
                person : data.commenter_id,
                thread : data.thread_id
            }
        }
        if(downUser._id.equals(upUser._id)){
            Common.scoreCalculation('', downRecord, '', downUser._id, commentScore)
        }else{
            Common.scoreCalculation(upRecord, downRecord, upUser._id, downUser._id, commentScore)
        }
        res.redirect('/thread/' + data.thread_id)
    })

    ep.on('enough', function(user){
        //给所 at 的用户添加链接
        data.content = _At.linkUsers(content)
        //提交评论
        var comment = new Comment(data)
        comment.save(function(err, comment){
            ep.emit('sendAtMsg', comment)
        })
        //更新主题的最后回复字段
        Thread.findByIdAndUpdate(data.thread_id, {$set: {last_reply: data.commenter_id}}).exec(function(err, thread){
            _User.getUserById(thread.author_id, function(err, upUser){
                ep.emit('upUser', upUser)
            })
            ep.emit('downUser', user)
        })
    })

    //给所有被 @ 的用户推送消息
    ep.on('sendAtMsg', function(comment){
        var atUsers = _At.fetchUsers(content)
        if(atUsers.length > 0){
            atUsers.forEach(function(username, i){
                _User.getUserByUsername(username, function(err, user){
                    _Comment.sendAtMessage(data.commenter_id, user._id, data.thread_id, comment._id)
                })
            })
        }
    })

    if(data.content){
        //查询用户积分
        _User.getUserById(data.commenter_id, function(err, user){
            if(user.score >= commentScore){
                ep.emit('enough', user)
            }else{
                var error = {
                    msg : '你目前的铜币数量 ' + user.score + ' 不足以评论 &#8250; <a href="/balance">查看余额</a>'
                }
                return ep.emit('errors', error)
            }
        })
    }else{
        _Thread.getThreadById(data.thread_id, function(err, thread){
            var error = {
                msg : "评论的内容不能为空",
                title : thread.title
            }
            ep.emit('errors', error)
        })
    }
}

//评论感谢
exports.thank = function(req, res, next){
    var userId = req.session.user._id
    var commentId = req.body.comment_id
    var commenter_id = req.body.commenter_id
    var thread_id = req.body.thread_id
    var thankScore = 5 //感谢需要赠送（扣除） 5 个铜币，对方增加 5 个
    var ep = new EventProxy()
    ep.fail(next)
    ep.all('downScore', 'upScore', function(downUser, upUser){
        var downRecord = {
            user : userId,
            type : 5,
            amount : -thankScore,
            asset : downUser.score - thankScore,
            detail : {
                person : commenter_id,
                thread : thread_id
            }
        }
        var upRecord = {
            user : commenter_id,
            type : 4,
            amount : thankScore,
            asset : upUser.score + thankScore,
            detail : {
                person : userId,
                thread : thread_id
            }
        }
        Common.scoreCalculation(upRecord, downRecord, commenter_id, userId, thankScore)
    })

    //感谢
    ep.on('thanks', function(){
        //评论更新感谢
        Comment.update({_id: commentId}, {$push: {thanks: userId}}).exec(function(){
            Utils.json(res, 1, '感谢成功')
        })
        //查询当前用户积分
        _User.getUserById(userId, function(err, downUser){
            if(downUser.score >= thankScore){
                ep.emit('downScore', downUser)
                //查询评论人
                _User.getUserById(commenter_id, function(err, upUser){
                    ep.emit('upScore', upUser)
                })
            }
        })
    })

    Comment.findOne({_id: commentId}, function(err, comment){
        if(comment.commenter_id == userId){
            Utils.json(res, 0, '不能感谢自己哦')
        }else{
            if(comment.thanks.indexOf(userId) > -1){
                Utils.json(res, 0, '只能感谢一次哦')
            }else{
                ep.emit('thanks')
            }
        }
    })
}


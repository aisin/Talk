var Comment = require('../models/comment')
var Thread = require('../models/thread')
var validator = require('validator')
var EventProxy = require('eventproxy')
var Utils = require('../libs/Utils')

exports.add = function(req, res, next){
    var data = {
        commenter_id : req.session.user._id,
        thread_id : req.params.id,
        content : validator.trim(req.body.content)
    }
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('thread/comment/' + data.thread_id, {
            session : req.session.user,
            errors : msg
        })
    })

    ep.all('save', 'last_reply', function(){
        res.redirect('/thread/' + data.thread_id)
    })

    if(data.content){
        var comment = new Comment(data)
        comment.save(function(err, _comment){
            ep.emit('save')
        })
        Thread.update({_id: data.thread_id}, {$set: {last_reply: data.commenter_id}}).exec(function(){
            ep.emit('last_reply')
        })
    }else{
        ep.emit('errors', "回复的内容不能为空")
    }
}

exports.thank = function(req, res, next){
    var userId = req.session.user._id
    var commentId = req.body.comment_id
    Comment.findOne({_id: commentId}, function(err, comment){
        if(comment.commenter_id == userId){
            Utils.json(res, 0, '不能感谢自己哦')
        }else{
            if(comment.thanks.indexOf(userId) > -1){
                Utils.json(res, 0, '只能感谢一次哦')
            }else{
                Comment.update({_id: commentId}, {$push: {thanks: userId}}).exec(function(){
                    Utils.json(res, 1, '感谢成功')
                })
            }
        }
    })
}
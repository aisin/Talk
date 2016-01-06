var Comment = require('../models/comment')
var validator = require('validator')
var EventProxy = require('eventproxy')

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
        return res.render('thread/comment/'+threadId, {
            session : req.session.user,
            errors : msg
        })
    })

    if(data.content){
        var comment = new Comment(data)
        comment.save(function(err, _comment){
            if(err) return next(err)
            res.redirect('/thread/'+data.thread_id)
        })
    }else{
        ep.emit('errors', "回复的内容不能为空")
    }
}

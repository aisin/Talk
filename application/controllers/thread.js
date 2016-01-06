var Thread = require('../models/thread')
var _Category = require('../libs/Category')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')
var _Comment = require('../libs/Comment')
var EventProxy = require('eventproxy')

//Get : 发布主题页
exports.new = function (req, res, next) {
    _Category.getAllCategories(function (err, categories) {
        if (err) return next(err)
        res.render('thread/new', {
            session: req.session.user,
            categories: categories
        })
    })
}

//Post : 发布话题操作
exports.doNew = function(req, res, next){

    var _thread = {
        title : req.body.title,
        content : req.body.content,
        category : req.body.category,
        author_id : req.session.user._id,
        last_reply : req.session.user._id
    }
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        _Category.getAllCategories(function (err, categories) {
            if (err) {
                return next(err)
            }else{
                return res.render('thread/new', {
                    threadTitle : _thread.title,
                    threadContent : _thread.content,
                    threadCategory : _thread.category,
                    categories: categories,
                    session : req.session.user,
                    errors : msg
                })
            }
        })
    })

    if(!_thread.title){
        return ep.emit('errors', "主题标题不能为空")
    }else if(!_thread.content){
        return ep.emit('errors', "主题内容不能为空")
    }else if(_thread.content.length > 1000){
        return ep.emit('errors', "主题内容不能超过 1000 个字符")
    }else if(!_thread.category){
        return ep.emit('errors', "请选择一个分类")
    }else{
        var thread = new Thread(_thread)
        thread.save(function(err, thread){
            if (err) return next(err)
            res.redirect('/')
        })
    }
}

//Get : 主题详情页
exports.detail = function(req, res, next){
    var id = req.params.id
    var ep = new EventProxy()
    var events = ['thread', 'author', 'category', 'comments_ready']

    ep.fail(next)

    ep.all(events, function (thread, author, category, comments) {
        res.render('thread/detail', {
            session: req.session.user,
            thread : thread,
            author : author,
            category : category,
            comments : comments
        })
    })

    _Thread.getThreadById(id, function(err, thread){
        if(err) return next(err)
        _Thread.updateViewsOfThread(thread._id, function(){
            thread.views += 1
            thread.save()
            ep.emit('thread', thread)
        })
        _User.getUserById(thread.author_id, ep.done('author'))
        _Category.getCategoryById(thread.category, ep.done('category'))
        _Comment.getCommentsByThread(thread._id, function(err, comments){
            comments.forEach(function(comment, i){
                var proxy = new EventProxy()
                proxy.on('commenter', function(commenter){
                    comment.avatar = commenter.avatar
                    comment.nickname = commenter.nickname

                    ep.emit('comments_all')
                })

                _User.getUserById(comment.commenter_id, proxy.done('commenter'))
            })

            ep.after('comments_all', comments.length, function(){
                ep.emit('comments_ready', comments)
            })
        })
    })
}
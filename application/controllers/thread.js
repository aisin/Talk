var Thread = require('../models/thread')
var _Category = require('../libs/Category')
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
    res.render('thread/detail')
}
var validator = require('validator')
var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var Comment = require('../models/comment')
var ScoreRecord = require('../models/scoreRecord')
var _Category = require('../libs/Category')
var _Thread = require('../libs/Thread')
var _User = require('../libs/User')
var Utils = require('../libs/Utils')

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
        title : validator.trim(req.body.title),
        content : validator.trim(req.body.content),
        category : req.body.category,
        author_id : req.session.user._id,
        last_reply : req.session.user._id
    }
    var ep = new EventProxy()
    ep.fail(next)
    ep.on('ok', function(){
        res.redirect('/')
    })

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
        var proxy = new EventProxy()
        var deductScore = -20 //需要扣除的积分
        var thread = new Thread(_thread)
        thread.save(function(err, result){
            //if (err) return next(err)
            proxy.emit('save', result)
        })

        //扣除积分
        _User.modifyScore(_thread.author_id, deductScore, function(err, result){
            proxy.emit('record', result)
        })

        //创建积分记录
        proxy.all('save', 'record', function(thread, user){
            var record = {
                user : _thread.author_id,
                type : 1,
                amount : deductScore,
                asset : user.score,
                detail : {
                    person : _thread.author_id,
                    thread : thread._id
                }
            }
            var scoreRecord = new ScoreRecord(record)
            scoreRecord.save(function(err, result){
                ep.emit('ok')
            })
        })
    }
}

//Get : 主题详情页
exports.detail = function(req, res, next){
    var me = req.session.user && req.session.user._id
    var threadId = req.params.id
    var ep = new EventProxy()
    var events = ['thread', 'commentsReady', 'collect']
    ep.fail(next)
    ep.all(events, function (thread, comments, collect) {
        res.render('thread/detail', {
            session: req.session.user,
            thread : thread,
            comments : comments,
            collect : collect
        })
    })

    //collect
    if(me){
        _Thread.getCollectById(me, threadId, ep.done(function(thread){
            return thread ? ep.emit('collect', true) : ep.emit('collect', false)
        }))
    }else{
        ep.emit('collect', null)
    }

    //threads
    Thread.findOne({_id: threadId, deleted: false})
        .populate([{
            path: 'category',
            select: 'name'
        }, {
            path: 'author_id',
            select: 'nickname avatar'
        }])
        .exec(function(err, thread){
            ep.emit('thread', thread)
        })

    //comments
    Comment.find({thread_id: threadId})
        .populate('commenter_id', 'nickname avatar')
        .sort({create_at: 1})
        .exec(function(err, comments){
            var proxy = new EventProxy()
            proxy.after('comments', comments.length, function(){
                ep.emit('commentsReady', comments)
            })
            comments.forEach(function(comment, i){
                comment.thanked = comment.thanks.indexOf(me) > -1 ? true : false
                proxy.emit('comments')
            })
        })
}

//Ajax : 主题收藏
exports.collect = function(req, res, next){
    var user_id = req.session.user._id
    var thread_id = req.body.thread_id
    _Thread.getThreadById(thread_id, function(err, thread){
        if(!thread){
            Utils.json(res, 0, '该主题不存在')
        }else{
            var ep = new EventProxy()
            _Thread.getCollectById(user_id, thread_id, ep.done('handler'))
            ep.on('handler', function(result){
                if(!result){
                    _Thread.collectThread(user_id, thread_id, function(){
                        Utils.json(res, 1, '加入收藏成功')
                    })
                }else{
                    _Thread.removeCollectThread(user_id, thread_id, function(){
                        Utils.json(res, 0, '取消收藏成功')
                    })
                }
            })
        }
    })
}
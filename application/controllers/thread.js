var validator = require('validator')
var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var Comment = require('../models/comment')
var ScoreRecord = require('../models/scoreRecord')
var Common = require('../libs/Common')
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
        var threadScore = 20 //需要扣除的积分
        var thread = new Thread(_thread)

        //查询用户积分
        _User.getUserById(_thread.author_id, function(err, user){
            if(user.score >= threadScore){
                proxy.emit('enough', user)
            }else{
                var notice = '你目前的铜币数量 ' + user.score + ' 不足以创建主题 &#8250; <a href="/balance">查看余额</a>'
                return ep.emit('errors', notice)
            }
        })

        //发布主题 && 扣除积分
        proxy.on('enough', function(user){
            thread.save(function(err, result){
                var downRecord = {
                    user : _thread.author_id,
                    type : 1,
                    amount : -threadScore,
                    asset : user.score - threadScore,
                    detail : {
                        person : _thread.author_id,
                        thread : result._id
                    }
                }
                Common.scoreCalculation('', downRecord, '', _thread.author_id, threadScore)
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

    //threads
    Thread.findOne({_id: threadId/*, deleted: false*/})
        .populate([{
            path: 'category',
            select: 'name'
        }, {
            path: 'author_id',
            select: 'nickname avatar'
        }])
        .exec(function(err, thread){
            if(!thread){
                ep.unbind()
                return res.renderErr('主题未找到')
            }
            if(thread.deleted){
                ep.unbind()
                return res.renderErr('主题已被删除')
            }
            thread.views += 1
            thread.save()
            thread.thanked = thread.thanks.indexOf(me) > -1 ? true : false
            ep.emit('thread', thread)
        })

    //collect
    if(me){
        _Thread.getCollectById(me, threadId, ep.done(function(thread){
            return thread ? ep.emit('collect', true) : ep.emit('collect', false)
        }))
    }else{
        ep.emit('collect', null)
    }

    //comments
    ep.on('thread', function(){
        Comment.find({thread_id: threadId})
            .populate('commenter_id', 'nickname avatar role')
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

//Ajax : 主题感谢
exports.thank = function(req, res, next){
    var userId = req.session.user._id
    var threadId = req.body.thread_id
    var thankScore = 15 //感谢主题 15 积分
    var ep = new EventProxy()
    ep.fail(next)
    ep.all('downScore', 'upScore', function(downUser, upUser){
        var downRecord = {
            user : userId,
            type : 3,
            amount : -thankScore,
            asset : downUser.score - thankScore,
            detail : {
                person : upUser._id,
                thread : threadId
            }
        }
        var upRecord = {
            user : upUser._id,
            type : 2,
            amount : thankScore,
            asset : upUser.score + thankScore,
            detail : {
                person : userId,
                thread : threadId
            }
        }
        Common.scoreCalculation(upRecord, downRecord, upUser._id, userId, thankScore)
    })

    //感谢
    ep.on('thanks', function(thread){
        //主题更新感谢
        Thread.update({_id: threadId}, {$push: {thanks: userId}}).exec(function(){
            Utils.json(res, 1, '感谢成功')
        })
        //查询当前用户积分
        _User.getUserById(userId, function(err, downUser){
            if(downUser.score >= thankScore){
                ep.emit('downScore', downUser)
                //查询主题作者
                _User.getUserById(thread.author_id, function(err, upUser){
                    ep.emit('upScore', upUser)
                })
            }
        })
    })

    Thread.findOne({_id: threadId}, function(err, thread){
        if(thread.author_id == userId){
            Utils.json(res, 0, '不能感谢自己哦')
        }else{
            if(thread.thanks.indexOf(userId) > -1){
                Utils.json(res, 0, '只能感谢一次哦')
            }else{
                ep.emit('thanks', thread)
            }
        }
    })
}
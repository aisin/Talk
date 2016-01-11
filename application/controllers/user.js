var EventProxy = require('eventproxy')
var User = require('../models/user')
var Thread = require('../models/thread')
var Category = require('../models/category')
var ThreadCollect = require('../models/threadCollect')
var _User = require('../libs/User')
var _Comment = require('../libs/Comment')
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var _ = require('lodash')

//Get : 注册页
exports.register = function (req, res) {
    res.render('user/register')
}

//Post : 注册操作
exports.doRegister = function (req, res, next) {
    var data = {
        username : validator.trim(req.body.username).toLowerCase(),
        nickname : validator.trim(req.body.nickname),
        email : validator.trim(req.body.email).toLowerCase(),
        gender : req.body.gender,
        description : validator.trim(req.body.description) || '这个人很懒，什么也没有留下~'
    }
    var password = validator.trim(req.body.password)
    var passwordcf = validator.trim(req.body.passwordcf)
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('user/register', {
            username : data.username,
            nickname : data.nickname,
            email : data.email,
            description : description,
            errors : msg
        })
    })

    if(!validator.isUserName(data.username)){
        return ep.emit('errors', "用户名5-12个英文字符")
    }else if(!validator.isEmail(data.email)){
        return ep.emit('errors', "请填写正确的邮箱地址")
    }else if(!password || password !== passwordcf){
        return ep.emit('errors', "密码不能为空，并且两次要输入一致")
    }

    _User.getUserByUsername(data.username, function(err, user){
        if(err) return next(err)
        if(user){
            ep.emit('errors', "该用户名已存在")
        }else{
            Utils.pwHash(password, ep.done(function(passwordHash){
                data.password = passwordHash
                if(!data.nickname) data.nickname = data.username
                var user = new User(data)
                user.save(function(err, _user){
                    if(err) return next(err)
                    req.session.user = _user
                    res.redirect('/')
                })
            }))
        }
    })
}


//Get : 登录页
exports.login = function (req, res) {
    res.render('user/login')
}

//Post : 登录操作
exports.doLogin = function (req, res, next) {
    var username = validator.trim(req.body.username).toLowerCase()
    var password = validator.trim(req.body.password)
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('user/login', {
            username : username,
            errors : msg
        })
    })

    if(!validator.isUserName(username)){
        return ep.emit('errors', "用户名5-12个英文字符")
    }else if(!password){
        return ep.emit('errors', "密码不能为空")
    }

    _User.getUserByUsername(username, function(err, user){
        if(err) return next(err)
        if(!user){
            ep.emit('errors', "该用户名不存在")
        }else{
            Utils.pwVertify(password, user.password, ep.done(function(bool){
                if(!bool){
                    ep.emit('errors', "用户名或密码错误")
                }else{
                    req.session.user = user
                    res.redirect('/')
                }
            }))
        }
    })
}

exports.logout = function(req, res){
    delete req.session.user
    res.redirect('/')
}

exports.profile = function(req, res){
    res.render('user/profile')
}

//Get : 个人设置页
exports.setting = function(req, res){
    var id = req.session.user._id
    _User.getUserById(id, function(err, user){
        if(!user){
            res.render('user/login')
        }else{
            res.render('user/setting', {
                session : req.session.user,
                user : user
            })
        }
    })
}

//Post : 个人设置操作
exports.doSetting = function(req, res, next){
    var id = req.session.user._id
    var username = req.body.username
    var data = {
        nickname : validator.trim(req.body.nickname),
        email : validator.trim(req.body.email).toLowerCase(),
        gender : req.body.gender,
        description : validator.trim(req.body.description)
    }
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('user/setting', {
            user: req.session.user,
            session : req.session.user,
            errors : msg
        })
    })

    if(id){
        if(!validator.isEmail(data.email)) return ep.emit('errors', "请填写正确的邮箱地址")

        if(!data.nickname) data.nickname = username

        _User.getUserById(id, function (err, user) {
            if (err) return next(err)
            data.update_at = Date.now()
            _user = _.assign(user, data)
            _user.save(function (err, user) {
                if (err) return next(err)
                req.session.user = user
                res.redirect('/')
            })
        })
    }else{
        ep.emit('errors', "请登录后操作")
    }
}

//Get : 修改密码页
exports.password = function (req, res) {
    var id = req.session.user._id
    _User.getUserById(id, function(err, user){
        if(!user){
            res.render('user/login')
        }else{
            res.render('user/password', {
                session : req.session.user,
                user : user
            })
        }
    })
}

//Post : 修改密码操作
exports.doPassword = function(req, res, next){
    var id = req.session.user._id
    var password = validator.trim(req.body.password)
    var newpassword = validator.trim(req.body.newpassword)
    var newpasswordcf = validator.trim(req.body.newpasswordcf)

    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('user/password', {
            session : req.session.user,
            errors : msg
        })
    })

    if(id){
        if(!password || !newpassword || !newpasswordcf) {
            return ep.emit('errors', "请完整填写原始密码与新密码")
        }else if(newpassword !== newpasswordcf){
            return ep.emit('errors', "新密码与确认密码不一致")
        }
        _User.getUserById(id, function (err, user) {
            if (err) return next(err)

            Utils.pwVertify(password, user.password, ep.done(function(bool){

                if(!bool){
                    ep.emit('errors', "原始密码错误")
                }else{
                    Utils.pwHash(newpassword, ep.done(function(passwordHash){
                        user.password = passwordHash
                        user.save(function(err){
                            if(err){
                                ep.emit('errors', err)
                            }else{
                                res.redirect('/')
                            }
                        })
                    }))
                }
            }))
        })
    }else{
        ep.emit('errors', "请登录后操作")
    }
}

//Get : 修改头像页
exports.avatar = function(req, res, next){
    var id = req.session.user._id
    _User.getUserById(id, function(err, user){
        if(!user){
            res.render('user/login')
        }else{
            res.render('user/avatar', {
                session : req.session.user,
                user : user
            })
        }
    })
}

//Post : 修改头像操作
exports.doAvatar = function(req, res, next){
    var id = req.session.user._id
    var ep = new EventProxy()
    ep.fail(next)
    ep.on('errors', function(msg){
        res.status(403)
        return res.render('user/avatar', {
            user: req.session.user,
            session : req.session.user,
            errors : msg
        })
    })
    if(!req.file){
        return ep.emit('errors', "请选择图片再上传")
    }
    var data = {
        avatar : req.file.filename
    }

    _User.getUserById(id, function (err, user) {
        if (err) return next(err)
        data.update_at = Date.now()
        _user = _.assign(user, data)
        _user.save(function (err, user) {
            if (err) return next(err)
            req.session.user = user
            res.redirect('/avatar')
        })
    })
}

//Get : 个人信息页
exports.member = function(req, res, next){
    var member = req.params.id
    var ep = new EventProxy()
    var events = ['member', 'threads']
    ep.all(events, function(member, threads){
        res.render('user/member', {
            session : req.session.user,
            member : member,
            threads : threads
        })
    })

    //查询用户信息
    _User.getUserById(member, ep.done(function(member){
        ep.emit('member', member)
    }))

    ThreadCollect.find({user_id: member})
        .populate('thread_id')
        .sort({create_at: -1})
        .exec(function(err, resultsA){
            //deep `populate`
            Category.populate(resultsA, {
                path: 'thread_id.category',
                select: 'name'
            }, function(err, resultsB){

                User.populate(resultsB, {
                    path: 'thread_id.author_id',
                    select: 'nickname',
                }, function(err, resultsC){

                    User.populate(resultsC, {
                        path: 'thread_id.last_reply',
                        select: 'nickname'
                    }, function(err, resultsD){

                        var proxy = new EventProxy()
                        proxy.after('comments', resultsD.length, function(){
                            ep.emit('threads', resultsD)
                        })
                        resultsD.forEach(function(thread, i){
                            _Comment.getCountByThread(thread.thread_id._id, ep.done(function(count){
                                thread.thread_id.comments = count
                                proxy.emit('comments')
                            }))
                        })
                    })
                })
            })
        })
}
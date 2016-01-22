var EventProxy = require('eventproxy')
var User = require('../models/user')
var Thread = require('../models/thread')
var Category = require('../models/category')
var ScoreRecord = require('../models/scoreRecord')
var ThreadCollect = require('../models/threadCollect')
var Common = require('../libs/Common')
var _User = require('../libs/User')
//var _Comment = require('../libs/Comment')
var _Thread = require('../libs/Thread')
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var moment = require('moment')
var _ = require('lodash')

//Get : 注册页
exports.register = function (req, res, next) {
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
            description : data.description,
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
                    req.session.user = _.pick(user, ['_id', 'username', 'nickname', 'email', 'avatar', 'gender', 'description', 'role'])
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
                    req.session.user = _.pick(user, ['_id', 'username', 'nickname', 'email', 'avatar', 'gender', 'description', 'role'])
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
        privacy : req.body.privacy,
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
                req.session.user = _.pick(user, ['_id', 'username', 'nickname', 'email', 'avatar', 'gender', 'description', 'role'])
                res.redirect('/setting')
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

//Get : 个人信息页（收藏的主题列表）
exports.member = function(req, res, next){
    var sessionId = req.session.user && req.session.user._id
    var member = req.params.id
    var channelParam = req.params[0]
    var channel;
    if(channelParam == '/collect'){
        channel = 'collected'
    }else if(channelParam == ''){
        channel = 'created'
    }else{
        res.render404()
    }
    var ep = new EventProxy()
    var events = ['member', 'threads', 'showPrivacyType']
    ep.all(events, function(member, threads, showPrivacyType){
        res.render('user/member', {
            session : req.session.user,
            channel : channel,
            member : member,
            threads : threads,
            showPrivacyType : showPrivacyType
        })
    })

    //查询用户信息
    _User.getUserById(member, function(member){
        if(!member){
            ep.unbind()
            return res.renderErr('用户未找到')
        }
        ep.emit('member', member)
        switch (member.privacy){
            //用户设置只有自己可以查看
            case 2 :{
                if(member._id.equals(sessionId)){
                    ep.emit('getThreads')
                    ep.emit('showPrivacyType', 0)
                }else{
                    ep.emit('showPrivacyType', 2)
                }
            }
            //用户设置只有登录用户可以查看
            case 1 :{
                if(!_.isUndefined(sessionId)){
                    ep.emit('getThreads')
                    ep.emit('showPrivacyType', 0)
                }else{
                    ep.emit('showPrivacyType', 1)
                }
            }
            //用户设置所有人可以查看
            default :{
                ep.emit('getThreads')
                ep.emit('showPrivacyType', 0)
            }
        }
    })

    //获取收藏主题列表
    ep.on('getThreads', function(){
        if(channel == 'collected'){
            _Thread.getCollectsByMember(member, function(threads){
                ep.emit('threads', threads)
            })
        }else if(channel == 'created'){
            _Thread.getCreatesByMember(member, function(threads){
                ep.emit('threads', threads)
            })
        }
    })
}

/**
 * Task 部分
 */

//Get : balance
exports.balance = function(req, res, next){
    var userId = req.session.user._id
    var ep = new EventProxy()
    var events = ['score', 'records']
    ep.all(events, function(score, records){
        res.render('user/balance', {
            session : req.session.user,
            score : score,
            records : records
        })
    })
    //积分查询
    User.findOne({_id: userId}, function(err, user){
        var userScore = user.score
        var score = {
            bronze : userScore % 100,
            silver : Math.floor((userScore / 100) % 100),
            gold : Math.floor(userScore / 10000)
        }
        ep.emit('score', score)
    })
    //积分记录查询
    ScoreRecord.find({user: userId})
        .populate('detail.person', 'nickname')
        .populate('detail.thread', 'title')
        .sort({create_at: -1})
        .exec(function(err, scoreRecord){
            ep.emit('records', scoreRecord)
        })
}

//Get : daily
exports.sign = function(req, res, next){
    res.render('task/sign', {
        session : req.session.user
    })
}

//签到送积分
exports.signed = function(req, res, next){
    var userId = req.session.user._id
    var ep = new EventProxy()
    ep.on('ok', function(data){
        res.render('task/signed', {
            session : req.session.user,
            isSigned : data.isSigned,
            score : data.score,
            days : data.days
        })
    })

    //执行签到 && 积分收益
    ep.on('sign', function(user){
        var signScore = Math.floor(Math.random() * (40 - 0) + 10) //随机获取 [10, 49] 个铜币
        var now = Date.now()
        var todayStamp = moment().startOf('day').unix() //取今天 00:00:00 的时间戳，不含毫秒
        var lastSignStamp = moment(user.last_sign).startOf('day').unix() //取最后签到当天 00:00:00 的时间戳，不含毫秒
        var continuousSignDays = (todayStamp - lastSignStamp) / 86400 === 1 ? user.continuous_sign_days + 1 : 0

        User.findByIdAndUpdate(userId, {$set: {last_sign: now, continuous_sign_days: continuousSignDays}}, function(err, user){
            var data = {
                isSigned : false,
                score : signScore,
                days : continuousSignDays
            }
            ep.emit('ok', data)

            //创建积分变动记录
            var upRecord = {
                user : userId,
                type : 0,
                amount : signScore,
                asset : user.score + signScore
            }
            Common.scoreCalculation(upRecord, '', userId, '', signScore)
        })
    })

    //查询用户当天签到状态
    User.findOne({_id: userId}, function(err, user){
        var todayStamp = moment().startOf('day').unix() //取今天 00:00:00 的时间戳，不含毫秒
        var lastSignStamp = moment(user.last_sign).startOf('day').unix() //取最后签到当天 00:00:00 的时间戳，不含毫秒
        if((todayStamp - lastSignStamp) / 86400 === 0){
            //当天已经签过到
            var data = {
                isSigned : true,
                score : '',
                days : user.continuous_sign_days
            }
            ep.emit('ok', data)
        }else{
            //当天未曾签到
            ep.emit('sign', user)
        }
    })
}
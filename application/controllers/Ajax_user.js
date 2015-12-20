var User = require('../models/user')
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var _ = require('lodash')
var EventProxy = require('eventproxy')

exports.register = function (req, res, next) {
    var data = {
        username : validator.trim(req.body.username).toLowerCase(),
        nickname : validator.trim(req.body.nickname),
        email : validator.trim(req.body.email).toLowerCase(),
        gender : req.body.gender
    }
    var password = validator.trim(req.body.password)
    var passwordcf = validator.trim(req.body.passwordcf)
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        Utils.jsonMsg(res, 0, msg)
    })

    if(!validator.isUserName(data.username)){
        return ep.emit('errors', "用户名5-12个英文字符")
    }else if(!validator.isEmail(data.email)){
        return ep.emit('errors', "请填写正确的邮箱地址")
    }else if(!password || password !== passwordcf){
        return ep.emit('errors', "密码不能为空，并且两次要输入一致")
    }

    User.findOne({username : data.username}, function(err, user){
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
                    Utils.jsonMsg(res, 1, '注册成功')
                })
            }))
        }
    })
}

exports.login = function (req, res, next) {
    var username = validator.trim(req.body.username).toLowerCase()
    var password = validator.trim(req.body.password)
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        Utils.jsonMsg(res, 0, msg)
    })

    if(!validator.isUserName(username)){
        return ep.emit('errors', "用户名5-12个英文字符")
    }else if(!password){
        return ep.emit('errors', "密码不能为空")
    }

    User.findOne({username : username}, function(err, user){
        if(err) return next(err)
        if(!user){
            ep.emit('errors', "该用户名不存在")
        }else{
            Utils.pwVertify(password, user.password, ep.done(function(bool){
                if(!bool){
                    ep.emit('errors', "用户名或密码错误")
                }else{
                    req.session.user = user
                    Utils.jsonMsg(res, 1, '登录成功')
                }
            }))
        }
    })
}

exports.setting = function(req, res, next){
    var id = req.session.user._id
    var username = req.body.username
    var data = {
        nickname : validator.trim(req.body.nickname),
        email : validator.trim(req.body.email).toLowerCase(),
        gender : req.body.gender
    }
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        Utils.jsonMsg(res, 0, msg)
    })

    if(id){
        if(!validator.isEmail(data.email)) return ep.emit('errors', "请填写正确的邮箱地址")

        if(!data.nickname) data.nickname = username

        User.findById(id, function (err, user) {
            if (err) return next(err)
            _user = _.assign(user, data)
            _user.save(function (err, user) {
                if (err) return next(err)
                req.session.user = user
                Utils.jsonMsg(res, 1, '修改成功')
            })
        })
    }else{
        ep.emit('errors', "请登录后操作")
    }
}

exports.password = function(req, res, next){
    var id = req.session.user._id
    var password = validator.trim(req.body.password)
    var newpassword = validator.trim(req.body.newpassword)
    var newpasswordcf = validator.trim(req.body.newpasswordcf)

    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        Utils.jsonMsg(res, 0, msg)
    })

    if(id){
        if(!password || !newpassword || !newpasswordcf) {
            return ep.emit('errors', "请完整填写原始密码与新密码")
        }else if(newpassword !== newpasswordcf){
            return ep.emit('errors', "新密码与确认密码不一致")
        }
        User.findById(id, function (err, user) {
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
                                Utils.jsonMsg(res, 1, '密码修改成功')
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
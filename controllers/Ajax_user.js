var User = require('../models/user')
//验证
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var _ = require('lodash')

exports.register = function (req, res, next) {
    var error
    var username = Utils.trim(req.body.username)
    var name = Utils.trim(req.body.name)
    var email = Utils.trim(req.body.email)
    var password = Utils.trim(req.body.password)
    var passwordcf = Utils.trim(req.body.passwordcf)
    var gender = req.body.gender

    if(!validator.isUserName(username)){
        error = "用户名5-12个英文字符"
    }else if(!validator.isEmail(email)){
        error = "请填写正确的邮箱地址"
    }else if(!password || password !== passwordcf){
        error = "密码不能为空，并且两次要输入一致"
    }

    if(error){
        res.json({
            status : 0,
            msg : error
        })
    }else{
        User.findOne({username : username}, function(err, user){
            if(user){
                res.json({
                    status : 0,
                    msg : '该用户名已存在'
                })
            }else{
                var slat = Utils.gen_salt()
                var newPassword = Utils.encrypt(password, slat)
                req.body.password = newPassword
                req.body.salt = slat
                if(!name) req.body.name = username
                var user = new User(req.body)
                user.save(function(err, user){
                    if(err) return console.log(err)//todo : 优化处理 err 方式

                    req.session.user = {
                        id : user._id,
                        username : user.username,
                        name : user.name,
                        email : user.email
                    }
                    res.json({
                        status : 1,
                        msg : '注册成功'
                    })
                })
            }
        })
    }
}

exports.login = function (req, res, next) {
    var error
    var username = Utils.trim(req.body.username)
    var password = Utils.trim(req.body.password)

    if(!validator.isUserName(username)){
        error = "用户名5-12个英文字符"
    }else if(!password){
        error = "密码不能为空"
    }

    if(error){
        res.json({
            status : 0,
            msg : error
        })
    }else{
        User.findOne({username : username}, function(err, user){
            if(!user){
                res.json({
                    status : 0,
                    msg : '该用户名不存在'
                })
            }else{
                if(username === user.username && user.password === Utils.encrypt(password, user.salt)){
                    req.session.user = {
                        id : user._id,
                        username : user.username,
                        name : user.name,
                        email : user.email
                    }
                    res.json({
                        status : 1,
                        msg : '登录成功'
                    })
                }else{
                    res.json({
                        status : 0,
                        msg : '用户名或密码错误'
                    })
                }
            }
        })
    }
}

exports.setting = function(req, res){
    var error
    var id = req.session.user.id
    var username = req.body.username
    var name = Utils.trim(req.body.name)
    var email = Utils.trim(req.body.email)
    //var gender = req.body.gender

    if(id){

        if(!validator.isEmail(email)) error = "请填写正确的邮箱地址"

        if(error){
            res.json({
                status : 0,
                msg : error
            })
        }else {
            if(!name) req.body.name = username

            User.findById(id, function (err, user) {
                if (err) return console.log(err)//todo : 优化处理 err 方式

                _user = _.assign(user, req.body)
                _user.save(function (err, user) {
                    if (err) {
                        res.json({
                            status: 0,
                            msg: err
                        })
                    } else {
                        req.session.user.name = _user.name
                        req.session.user.email = _user.email

                        res.json({
                            status: 1,
                            msg: '修改成功'
                        })
                    }
                })
            })
        }
    }else{
        res.json({
            status : 0,
            msg : '请登录后操作'
        })
    }
}

exports.password = function(req, res){
    var error
    var id = req.session.user.id
    var password = Utils.trim(req.body.password)
    var newpassword = Utils.trim(req.body.newpassword)
    var newpasswordcf = Utils.trim(req.body.newpasswordcf)

    if(id){
        if(!password || !newpassword || !newpasswordcf) {
            error = '请完整填写原始密码与新密码'
        }else if(newpassword !== newpasswordcf){
            error = '新密码与确认密码不一致'
        }

        if(error){
            res.json({
                status : 0,
                msg : error
            })
        }else{
            User.findById(id, function (err, user) {
                if (err) return console.log(err)//todo : 优化处理 err 方式

                if(Utils.encrypt(password, user.salt) === user.password){
                    user.password = Utils.encrypt(newpassword, user.salt)
                    user.save(function(err){
                        if(err){
                            res.json({
                                status: 0,
                                msg: err
                            })
                        }else{
                            res.json({
                                status: 1,
                                msg: '密码修改成功'
                            })
                        }
                    })
                }else{
                    res.json({
                        status : 0,
                        msg : '原始密码错误'
                    })
                }
            })
        }
    }else{
        res.json({
            status : 0,
            msg : '请登录后操作'
        })
    }
}
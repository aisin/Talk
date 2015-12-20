var User = require('../models/user')
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var _ = require('lodash')
var EventProxy = require('eventproxy')

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
            ep.emit('errors', "该管理员不存在")
        }else{
            if(user.role === 'admin'){
                Utils.pwVertify(password, user.password, ep.done(function(bool){
                    if(!bool){
                        ep.emit('errors', "管理员用户名或密码错误")
                    }else{
                        req.session.user = user
                        Utils.jsonMsg(res, 1, '登录成功')
                    }
                }))
            }else{
                Utils.jsonMsg(res, 0, '您没有管理员权限')
            }
        }
    })
}
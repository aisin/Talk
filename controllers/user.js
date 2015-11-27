//var mongoose = require('mongoose')
var User = require('../models/user')
//var User = mongoose.model('User')
//验证
var validator = require('validator')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')


exports.register = function (req, res) {
    res.render('user/register', {
        title : '注册页面'
    })
}



exports.login = function (req, res) {
    res.render('user/login', {
        title : '登录页面'
    })
}

exports.logout = function(req, res){
    delete req.session.user
    res.redirect('/')
}

exports.profile = function(req, res){
    res.render('user/profile', {
        title : '个人中心页面',
        //session : req.session.user
    })
}

exports.setting = function(req, res){
    var id = req.session.user.id
    User.findOne({_id : id}, function(err, user){
        if(!user){
            res.render('user/login', {
                title : '登录页面'
            })
        }else{
            res.render('user/setting', {
                title : '设置页面',
                session : req.session.user,
                user : user
            })
        }
    })
}

exports.password = function (req, res) {
    var id = req.session.user.id
    User.findOne({_id : id}, function(err, user){
        if(!user){
            res.render('user/login', {
                title : '登录页面'
            })
        }else{
            res.render('user/password', {
                title : '修改密码',
                session : req.session.user,
                user : user
            })
        }
    })
}


exports.ajax = function(req, res){
    var name = req.body.n
    var pass = req.body.p


    console.log(req.body)

    console.log(name)
    console.log(pass)

    if(name == pass){
        res.json({
            result : 1,
            mag : '等于'
        })
    }else{
        res.json({
            result : 0,
            mag : '不等于'
        })
    }
}
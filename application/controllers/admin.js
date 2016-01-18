var EventProxy = require('eventproxy')
var validator = require('validator')
var User = require('../models/user')
var Thread = require('../models/thread')
var Category = require('../models/category')
require('../libs/validator_extend')
var Utils = require('../libs/Utils')
var _Admin = require('../libs/Admin')

//Get : 登录页
exports.login = function (req, res) {
    if(!req.session.user || req.session.user.role !== 'admin'){
        res.render('admin/login')
    }else{
        res.render('admin/dashboard')
    }
}

//Post : 登录操作
exports.doLogin = function (req, res, next) {
    var username = validator.trim(req.body.username).toLowerCase()
    var password = validator.trim(req.body.password)
    var ep = new EventProxy()
    ep.fail(next)

    ep.on('errors', function(msg){
        res.status(403)
        return res.render('admin/login', {
            username : username,
            errors : msg
        })
    })

    if(!validator.isUserName(username)){
        return ep.emit('errors', "用户名5-12个英文字符")
    }else if(!password){
        return ep.emit('errors', "密码不能为空")
    }

    _Admin.getAdminByUsername(username, function(err, user){
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
                        res.redirect('/admin/dashboard')
                    }
                }))
            }else{
                ep.emit('errors', "您没有管理员权限")
            }
        }
    })
}

exports.dashboard = function(req, res, next){
    res.render('admin/dashboard')
}

//分类列表页面
exports.category = function(req, res, next){
    _Admin.getAllCategories(function(err, categories){
        if(err) return next(err)
        res.render('admin/category/list', {
            categories : categories
        })
    })
}

//分类增加页面
exports.categoryAdd = function(req, res, next){
    res.render('admin/category/add')
}

//分类增加操作
exports.categoryDoAdd = function(req, res, next){
    var name = validator.trim(req.body.categoryName)
    var category = new Category()
    if(name){
        category.name = name
        category.save(function(){
            res.redirect('/admin/category')
        })
    }else{
        res.render('admin/category/add', {
            errors: "分类名称不能为空"
        })
    }
}

exports.threadList = function(req, res, next){
    _Admin.getAllThreads(function(err, threads){
        if(err) return next(err)
        res.render('admin/thread/list', {
            threads : threads
        })
    })
}

//主题删除
exports.threadDelete = function(req, res, next){
    var threadId = req.params.id
    Thread.findByIdAndUpdate(threadId, {$set: {deleted: true}}).exec(function(err, thread){
        var message = '主题： ' + thread.title + ' 已经被（逻辑）删除成功！返回' + '<a href="/admin/threads">主题列表</a>'
        res.render('admin/common/message', {
            message : message
        })
    })
}

//主题恢复
exports.threadSetfree = function(req, res, next){
    var threadId = req.params.id
    Thread.findByIdAndUpdate(threadId, {$set: {deleted: false}}).exec(function(err, thread){
        var message = '主题： ' + thread.title + ' 已经被恢复成功！返回 ' + '<a href="/admin/threads">主题列表</a>'
        res.render('admin/common/message', {
            message : message
        })
    })
}
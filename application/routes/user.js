var express = require('express')
var router = express.Router()
var user = require('../controllers/user')
//var userAjax = require('../controllers/userAjax')
var Auth = require('../libs/Auth')

router.get('/register', user.register)

router.get('/login', user.login)

router.post('/login', user.doLogin)

router.post('/register', user.doRegister)

//router.post('/doLogin', user.doLogin)

router.get('/logout', user.logout)

router.get('/profile', user.profile)

//router.post('/updateProfile', Auth.userRequired, user.updateProfile)

router.get('/setting', Auth.userRequired, user.setting)

router.post('/setting', Auth.userRequired, user.doSetting)

router.get('/password', Auth.userRequired, user.password)

router.post('/password', Auth.userRequired, user.doPassword)

//router.post('/doSettingProfile', Auth.userRequired, user.doSettingProfile)

//router.post('/doSettingPassword', Auth.userRequired, user.doSettingPassword)

//测试 Ajax

//router.post('/ajax', Auth.userRequiredAjax, user.ajax)

module.exports = router
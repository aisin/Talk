var express = require('express')
var router = express.Router()
var user = require('../controllers/user')
var Ajax_user = require('../controllers/Ajax_user')
var Auth = require('../libs/Auth')

router.get('/register', user.register)

router.get('/login', user.login)

router.post('/login', Ajax_user.login)

router.post('/register', Ajax_user.register)

//router.post('/doLogin', user.doLogin)

router.get('/logout', user.logout)

router.get('/profile', user.profile)

//router.post('/updateProfile', Auth.userRequired, user.updateProfile)

router.get('/setting', Auth.userRequired, user.setting)

router.post('/setting', Auth.userRequiredAjax, Ajax_user.setting)

router.get('/password', Auth.userRequired, user.password)

router.post('/password', Auth.userRequiredAjax, Ajax_user.password)

//router.post('/doSettingProfile', Auth.userRequired, user.doSettingProfile)

//router.post('/doSettingPassword', Auth.userRequired, user.doSettingPassword)

//测试 Ajax

router.post('/ajax', Auth.userRequiredAjax, user.ajax)

module.exports = router
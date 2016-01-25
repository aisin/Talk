var express = require('express')
var router = express.Router()
var user = require('../controllers/user')
var Auth = require('../libs/Auth')
var Utils = require('../libs/Utils')
//upload
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/uploads/avatar/')
    },
    filename: function (req, file, cb) {
        var email = req.session.user.email
        cb(null, Utils.md5(email) + '.jpg')
    }
})
var upload = multer({storage: storage})


router.get('/register', user.register)

router.get('/login', user.login)

router.post('/login', user.doLogin)

router.post('/register', user.doRegister)

//router.post('/doLogin', user.doLogin)

router.get('/logout', user.logout)

//router.post('/updateProfile', Auth.userRequired, user.updateProfile)

router.get('/setting', Auth.userRequired, user.setting)

router.post('/setting', Auth.userRequired, user.doSetting)

router.get('/password', Auth.userRequired, user.password)

router.post('/password', Auth.userRequired, user.doPassword)

//头像上传
router.get('/avatar', Auth.userRequired, user.avatar)

router.post('/avatar', Auth.userRequired, upload.single('avatar'), user.doAvatar)

router.get('/member/:id*', user.member)

//重置密码

router.get('/forgot', user.forgot)

router.post('/forgot', user.resetApply)

router.get('/reset', user.resetPassword)

router.post('/reset', user.doResetPassword)


/**
 * Task 部分
 */

//balance
router.get('/balance', Auth.userRequired, user.balance)

//sign
router.get('/task/sign', Auth.userRequired, user.sign)

//signed
router.get('/task/signed', Auth.userRequired, user.signed)


// Emial test

router.get('/emailtest', user.emailtest)



//测试 Ajax

//router.post('/ajax', Auth.userRequiredAjax, user.ajax)

module.exports = router
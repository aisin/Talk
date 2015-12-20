var express = require('express')
var router = express.Router()
var Admin = require('../controllers/admin')
var AdminAjax = require('../controllers/adminAjax')
var Auth = require('../libs/Auth')

router.get('/admin', Admin.index)

router.post('/admin/login', AdminAjax.login)

router.get('/admin/*', Auth.adminRequired)

//dashboard
router.get('/admin/dashboard', Admin.dashboard)

//category
router.get('/admin/category', Admin.category)

module.exports = router
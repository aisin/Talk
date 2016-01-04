var express = require('express')
var router = express.Router()
var Admin = require('../controllers/admin')
var Auth = require('../libs/Auth')

router.get('/admin', Admin.login)

router.post('/admin', Admin.doLogin)

router.all('/admin/*', Auth.adminRequired)

//dashboard
router.get('/admin/dashboard', Admin.dashboard)

//category
router.get('/admin/category', Admin.category)

router.get('/admin/category/add', Admin.categoryAdd)

router.post('/admin/category/add', Admin.categoryDoAdd)

module.exports = router
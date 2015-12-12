var express = require('express')
var router = express.Router()
var Admin = require('../controllers/admin')

router.get('/admin', Admin.index)

module.exports = router
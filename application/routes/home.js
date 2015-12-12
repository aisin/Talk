var express = require('express')
var router = express.Router()
var Home = require('../controllers/home')

router.get('/', Home.index)

module.exports = router
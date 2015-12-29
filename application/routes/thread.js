var express = require('express')
var router = express.Router()
var thread = require('../controllers/thread')
var Auth = require('../libs/Auth')

router.get('/thread/new', Auth.userRequired, thread.new)

router.post('/thread/new', Auth.userRequired, thread.doNew)

module.exports = router
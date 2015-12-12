var express = require('express')
var router = express.Router()
var thread = require('../controllers/thread')
var Ajax_thread = require('../controllers/Ajax_thread')
var Auth = require('../libs/Auth')

router.get('/thread/new', Auth.userRequired, thread.new)

router.post('/thread/new', Auth.userRequired, Ajax_thread.new)

module.exports = router
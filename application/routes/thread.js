var express = require('express')
var router = express.Router()
var thread = require('../controllers/thread')
var Auth = require('../libs/Auth')

router.get('/thread/new', Auth.userRequired, thread.new)

router.post('/thread/new', Auth.userRequired, thread.doNew)

router.get('/thread/:id', thread.detail)

router.post('/thread/collect', Auth.userRequiredAjax, thread.collect)

module.exports = router
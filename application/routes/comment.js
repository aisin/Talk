var express = require('express')
var router = express.Router()
var comment = require('../controllers/comment')
var Auth = require('../libs/Auth')

router.post('/thread/comment/:id', Auth.userRequired, comment.add)

module.exports = router
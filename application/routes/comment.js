var express = require('express')
var router = express.Router()
var comment = require('../controllers/comment')
var Auth = require('../libs/Auth')

router.get('/thread/comment/:id', Auth.userRequired, comment.comment)

router.post('/thread/comment/:id', Auth.userRequired, comment.add)

router.post('/comment/thank', Auth.userRequiredAjax, comment.thank)

module.exports = router
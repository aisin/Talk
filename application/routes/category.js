var express = require('express')
var router = express.Router()
var category = require('../controllers/category')

router.get('/category/:id', category.list)

module.exports = router
var _Category = require('../libs/Category')

exports.new = function (req, res, next) {
    _Category.getAllCategories(function (err, categories) {
        if (err) return next(err)
        res.render('thread/new', {
            session: req.session.user,
            categories: categories
        })
    })
}
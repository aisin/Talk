exports.new = function (req, res) {
    res.render('thread/new', {
        session : req.session.user,
    })
}
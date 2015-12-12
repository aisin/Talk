exports.new = function (req, res) {
    res.render('thread/new', {
        title : '添加话题页面',
        session : req.session.user,
    })
}
exports.index = function (req, res, next) {
    res.render('admin/login', {
        title : 'Admin'
    })
}

exports.dashboard = function(req, res, next){
    res.render('admin/dashboard', {
        title : 'Admin Dashboard'
    })
}

//����
exports.category = function(req, res, next){
    res.render('admin/category/categoryList', {
        title : 'Admin Category'
    })
}
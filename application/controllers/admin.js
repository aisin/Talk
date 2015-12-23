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

//分类
exports.category = function(req, res, next){
    res.render('admin/category/categoryList', {
        title : 'Admin Category'
    })
}

exports.categoryAdd = function(req, res, next){
    res.render('admin/category/categoryAdd', {
        title : 'Adming Category'
    })
}
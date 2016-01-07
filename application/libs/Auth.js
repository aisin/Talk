var Auth = {

    userRequired : function(req, res, next){
        if(!req.session.user)
            return res.redirect('/login')
        next()
    },

    userRequiredAjax : function(req, res, next){
        if(!req.session.user)
            return res.json({login : 0, msg : '请登录后再操作'})
        next()
    },

    adminRequired : function(req, res, next){
        if(!req.session.user || req.session.user.role !== 'admin')
            return res.redirect('/admin')
        next()
    },

    adminRequiredAjax : function(req, res, next){
        if(!req.session.user || req.session.user.role !== 'admin')
            return res.json({login : 0, msg : '请登录后再操作'})
        next()
    }

}

module.exports = Auth
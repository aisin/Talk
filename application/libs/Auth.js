var Auth = {

    userRequired : function(req, res, next){

        if(!req.session.user) return res.redirect('/login')

        next()

    },

    userRequiredAjax : function(req, res, next){

        if(!req.session.user) return res.json({status : 0, msg : '请登录后再操作'})

        next()

    }

}

module.exports = Auth
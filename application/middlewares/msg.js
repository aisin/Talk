exports.msg = function(req, res, next){
    res.renderMsg = function(message){
        return res.status(404).render('404')
    }

    res.renderErr = function(error, statusCode){
        if(statusCode === undefined){
            statusCode = 400
        }
        return res.status(statusCode).render('error', {
            error : error
        })
    }

    next()
}
exports.msg = function(req, res, next){
    res.render404 = function(){
        return res.status(404).render('404')
    }
    
    res.renderMsg = function(data, statusCode){
        if(statusCode === undefined){
            statusCode = 400
        }
        return res.status(statusCode).render('message', {
            way : data.way,
            message : data.message,
            error : data.error
        })
    }

    next()
}
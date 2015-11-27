var _home = require('../libs/Home')

exports.index = function (req, res, next) {
    _home.getThreads(function(err, threads){
        res.render('home', {
            title : 'Welcome to Talk',
            session : req.session.user,
            threads : threads
        })
        //console.log(threads)
    })
}
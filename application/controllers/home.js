var _Home = require('../libs/Home')

exports.index = function (req, res, next) {
    _Home.getThreads(function(err, threads){
        res.render('home', {
            session : req.session.user,
            threads : threads
        })
        //console.log(threads)
    })
}
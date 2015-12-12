var User = require('../models/user')

exports.getUserById = function(id, callback){
    if(!id) return callback()

    User.findOne({_id : id}, callback)
}
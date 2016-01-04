var Thread = require('../models/thread')

exports.getThreadById = function(id, callback){
    if(!id) return callback()
    Thread.findOne({_id : id}, callback)
}

exports.updateViewsOfThread = function(id, callback){
    Thread.update({_id: id}, {$inc: {views: 1}}).exec(callback)
}
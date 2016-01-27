var LRU = require('lru-cache')
var User = require('../models/user')
var Comment = require('../models/comment')
var Common = require('../libs/Common')
var config = require('../../config.js').config
var cache = LRU({
    max: config.cache.max,
    maxAge: config.cache.maxAge
})

module.exports = function(app){

    module.communityData = function(req, res, next){
        if(typeof app.locals.communityData === 'undefined' || !cache.has('communityData')){
            Common.getCommunityData(function(communityData){
                cache.set('communityData', communityData)
                app.locals.communityData = cache.get('communityData')
            })
        }
        next()
    }

    module.newComments = function(req, res, next){
        if(typeof app.locals.ts === 'undefined' || !cache.has('newComments')){
            Comment.find({})
                .populate('commenter_id', 'avatar')
                .populate('thread_id', 'title')
                .exec(function(err, comments){
                    cache.set('newComments', comments)
                    //}
                    app.locals.newComments = cache.get('newComments')
                })
        }
        next()
    }

    return module
}


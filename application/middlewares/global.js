var LRU = require('lru-cache')
var User = require('../models/user')
var Comment = require('../models/comment')
var Common = require('../libs/Common')
var _User = require('../libs/User')
var config = require('../../config.js').config
var cache = LRU({
    max: config.cache.max,
    maxAge: config.cache.maxAge
})

module.exports = function(app){

    //社区运营数据
    module.communityData = function(req, res, next){
        if(typeof app.locals.communityData === 'undefined' || !cache.has('communityData')){
            Common.getCommunityData(function(communityData){
                cache.set('communityData', communityData)
                app.locals.communityData = cache.get('communityData')
            })
        }
        next()
    }

    //最新评论
    module.newComments = function(req, res, next){
        if(typeof app.locals.newComments === 'undefined' || !cache.has('newComments')){
            Comment.find({})
                .populate('commenter_id', 'username avatar')
                .populate('thread_id', 'title')
                .sort({create_at: -1})
                .exec(function(err, comments){
                    cache.set('newComments', comments)
                    app.locals.newComments = cache.get('newComments')
                })
        }
        next()
    }

    //是否签到
    module.signed = function(req, res, next){
        if(req.session.user){
            var userId = req.session.user._id
            _User.hasSigned(userId, function(result){
                app.locals.signed = result
            })
        }else{
            app.locals.signed = true
        }
        next()
    }

    //所有金币
    module.money = function(req, res, next){
        if(req.session.user){
            var userId = req.session.user._id
            User.findOne({_id: userId}, function(err, user){
                var userScore = user.score
                var score = {
                    bronze : userScore % 100,
                    silver : Math.floor((userScore / 100) % 100),
                    gold : Math.floor(userScore / 10000)
                }
                app.locals.money = score
            })
        }else{
            app.locals.money = null
        }
        next()
    }

    return module
}


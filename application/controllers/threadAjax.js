var Thread = require('../models/thread')
var Utils = require('../libs/Utils')

exports.new = function(req, res){
    var error
    var title = req.body.title
    var content = req.body.content
    req.body.author_id = req.body.last_reply = req.session.user._id

    var thread = new Thread(req.body)
    thread.save(function(err, thread){
        if(err) return console.log(err)//todo : 优化处理 err 方式

        Utils.jsonMsg(res, 1, '主题发布成功')
    })
}
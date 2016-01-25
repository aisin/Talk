var EventProxy = require('eventproxy')
var mailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
var _Comment = require('../libs/Comment')
var _User = require('../libs/User')
var _Thread = require('../libs/Thread')
var ScoreRecord = require('../models/scoreRecord')
var config = require('../../config.js').config
var transporter = mailer.createTransport(smtpTransport(config.emailOptions))


/**
 * 获取社区的数据：用户总数/主题总数/评论总数
 * Callback:
 * @param {Function} callback 回调函数
 */
exports.getCommunityData = function(callback){
    var ep = new EventProxy()
    var events = ['usersTotal', 'threadsTotal', 'commentsTotal']
    ep.all(events, function(usersTotal, threadsTotal, commentsTotal){
        var communityData = {
            usersTotal : usersTotal,
            threadsTotal : threadsTotal,
            commentsTotal : commentsTotal
        }
        callback(communityData)
    })

    //获取社区总用户数
    _User.getTotalCount(function(err, count){
        ep.emit('usersTotal', count)
    })

    //获取社区总主题数
    _Thread.getTotalCount(function(err, count){
        ep.emit('threadsTotal', count)
    })

    //获取社区总评论数
    _Comment.getTotalCount(function(err, count){
        ep.emit('commentsTotal', count)
    })
}

/**
 * 用户积分账目操作
 * @param upRecordObj 用户积分增加的记录对象
 * @param downRecordObj 用户积分扣除的记录对象
 * @param upUser 积分增加的用户
 * @param downUser 积分扣除的用户
 * @param score 积分
 */

exports.scoreCalculation = function(upRecordObj, downRecordObj, upUser, downUser, score){

    //扣除积分
    if(downRecordObj && downUser){
        _User.modifyScore(downUser, -score, function(){
            var downRecord = new ScoreRecord(downRecordObj)
            downRecord.save()
        })

    }

    //增加积分
    if(upRecordObj && upUser){
        _User.modifyScore(upUser, score, function(){
            var upRecord = new ScoreRecord(upRecordObj)
            upRecord.save()
        })

    }
}

// 发邮件
exports.sendEmail = function (data) {
    transporter.sendMail(data, function (err) {
        if (err) {
            console.log(err)
        }
    })
}

//发送重置密码邮件
exports.sendResetPassMail = function(email, user, token){
    var from = config.emailOptions.auth.name + config.emailOptions.auth.user
    var to = email
    var subject = '社区密码重置';
    var html = '<p>您好：' + user + '</p>' +
        '<p>我们收到您在社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
        '<a href="' + config.site.url + '/reset?token=' + token + '&user=' + user + '">重置密码链接</a>' +
        '<p>若您没有在社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
        '<p>社区 谨上。</p>';

    exports.sendEmail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
}
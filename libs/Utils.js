//加密类
var crypto = require("crypto")
var moment = require('moment')

moment.locale('zh-cn') //使用中文

var Utils = {

    trim : function (str){
        return str.replace(/^\s+|\s+$/gm,'')
    },

    gen_salt : function (length){
        var len = length || 8,
            salt = "",
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for( var i=0; i < len; i++ )
            salt += possible.charAt(Math.floor(Math.random() * possible.length))
        return salt
    },

    encrypt : function(data,key){ // 密码加密
        var cipher = crypto.createCipher("bf",key)
        var newPsd = ""
        newPsd += cipher.update(data,"utf8","hex")
        newPsd += cipher.final("hex")
        return newPsd
    },

    decrypt : function(data,key){ //密码解密
        var decipher = crypto.createDecipher("bf",key)
        var oldPsd = ""
        oldPsd += decipher.update(data,"hex","utf8")
        oldPsd += decipher.final("utf8")
        return oldPsd
    },

    // 格式化时间
    formatDate : function (date, friendly) {
        date = moment(date)

        if (friendly) {
            return date.fromNow()
        } else {
            return date.format('YYYY-MM-DD HH:mm')
        }
    }

}

module.exports = Utils
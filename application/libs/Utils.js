var bcrypt = require("bcryptjs")
var crypto = require('crypto')

var Utils = {

    //密码加密
    pwHash : function(pw, callback){
        bcrypt.hash(pw, 10, callback)
    },

    //密码校验
    pwVertify : function(pw, hash, callback){
        bcrypt.compare(pw, hash, callback)
    },

    //
    json : function(res, status, msg){
        res.json({
            status : status,
            msg : msg
        })
    },

    //Md5
    md5 : function(str){
        return crypto.createHash('md5').update(str).digest("hex")
    }

}

module.exports = Utils
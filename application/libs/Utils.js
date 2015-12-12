var bcrypt = require("bcryptjs")

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
    jsonMsg : function(res, status, msg){
        res.json({
            status : status,
            msg : msg
        })
    }

}

module.exports = Utils
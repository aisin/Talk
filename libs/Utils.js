var bcrypt = require("bcryptjs")

var Utils = {

    pwHash : function(pw, callback){
        bcrypt.hash(pw, 10, callback)
    },

    pwVertify : function(pw, hash, callback){
        bcrypt.compare(pw, hash, callback)
    },

}

module.exports = Utils
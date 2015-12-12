var validator = require('validator')

//自定义校验扩展
validator.extend('isUserName', function (str) {
    return /^[a-zA-Z][a-zA-Z0-9_]{4,11}$/.test(str)
})

validator.extend('isGBKName', function (str) {
    return /[\u4e00-\u9fa5]/.test(str)
})

validator.extend('isPassword', function (str) {
    return /(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/.test(str)
})

validator.extend('isQQ', function (str) {
    return RegExp(/^[1-9][0-9]{4,9}$/).test(str)
})
var _ = require('lodash')

exports.fetchUsers = function(text){
    if (!text) return []

    var ignoreRegexs = [
    /```.+?```/g,                   // 去除单行的 ```
        /^```[\s\S]+?^```/gm,       // ``` 里面的是 pre 标签内容
        /`[\s\S]+?`/g,              // 同一行中，`some code` 中内容也不该被解析
        /^    .*/gm,                // 4个空格也是 pre 标签，在这里 . 不会匹配换行
        /\b\S*?@[^\s]*?\..+?\b/g,   // somebody@gmail.com 会被去除
        /\[@.+?\]\(\/.+?\)/g,       // 已经被 link 的 username
    ]

    ignoreRegexs.forEach(function (ignoreReg) {
        text = text.replace(ignoreReg, '')
    });

    var results = text.match(/@[a-z0-9\-_]+\b/igm)
    var names = []
    if (results) {
        for (var i = 0; i < results.length; i++) {
            var s = results[i];
            s = s.slice(1)
            names.push(s)
        }
    }
    names = _.uniq(names)
    return names
}
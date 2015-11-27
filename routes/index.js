var fs = require('fs')
var path = require('path')

module.exports = function (app) {

    fs.readdirSync(path.join(__dirname, '/')).forEach(function (file) {

        if (!~file.indexOf('index.js')) app.use(require('./' + file))

    })

}
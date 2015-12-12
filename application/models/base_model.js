/**
 * 给所有的 Model 扩展功能
 * http://mongoosejs.com/docs/plugins.html
 */
var Utils = require('../libs/Utils')

module.exports = function (schema) {

    schema.methods.create_at_ago = function () {
        return Utils.formatDate(this.create_at, true)
    }

    schema.methods.update_at_ago = function () {
        return Utils.formatDate(this.update_at, true)
    }

}
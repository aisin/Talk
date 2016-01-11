var mongoose = require('mongoose')
var Schema = mongoose.Schema

var categorySchema = new Schema({

    name : String,
    create_at : {
        type : Date,
        default : Date.now
    },
    update_at : {
        type : Date,
        default : Date.now
    }

})

module.exports = mongoose.model('Category', categorySchema)
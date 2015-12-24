var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId

var categorySchema = new mongoose.Schema({

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

var Category = mongoose.model('Category', categorySchema)

module.exports = Category
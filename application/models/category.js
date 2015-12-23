var mongoose = require('mongoose')
var ObjectId  = mongoose.Schema.ObjectId

var categorySchema = new mongoose.Schema({

    category : String,
    create_at : {
        type : Date,
        default : Date.now
    },
    update_at : {
        type : Date,
        default : Date.now
    }

})

var Category = mongoose.model('Thread', categorySchema)

module.exports = Category
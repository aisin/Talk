var express = require('express')
var app = express()
//var flash = require('connect-flash')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var session = require('client-sessions')
var moment = require('moment')
var config = require('./config.js').config
var msgPageMiddleware = require('./application/middlewares/msg');
moment.locale('zh-cn')

//app.use(flash())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, config.assets)))
app.set('views', path.join(__dirname, config.views))
app.set('view engine', config.view_engine)
app.set('port', process.env.PORT || config.port)

app.locals.moment = moment

app.use(session({
  cookieName: 'session',
  secret: config.session.secret,
  duration : config.session.duration,
  activeDuration : config.session.activeDuration
}))

app.use(msgPageMiddleware.msg)
//Bootstrap routes
require(config.routes)(app)

//Database
var db = mongoose.connect(config.database.url)
//db = mongoose.connection
//db.on('error', function(e){
//    console.log("Error: " +  e.message)
//    console.log(e.stack)
//})
db.connection.on("error", function (error) {
    console.log("Error: " + error)
})
db.connection.on("open", function () {
    console.log("Database Connected successfully!")
})

//Start the server
app.listen(app.get('port'), function () {
    console.log('Talk is running on Port ' + app.get('port'))
})
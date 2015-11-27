var config = {
  "views" : "views",
  "assets" : "assets",
  "routes" : "./routes",

  "view_engine" : "jade",
  "port" : 9900,

  "database" : {
    "url" : "mongodb://127.0.0.1/talk",
    "port" : 27017
  },

  "session" : {
    "secret" : "talksessionsecret",
    "duration" : 24 * 60 * 60 * 1000,
    "activeDuration" : 60 * 1000
  }
}


exports.config = config
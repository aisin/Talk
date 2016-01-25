var config = {
  site : {
    name : "",
    url : "http://localhost:9900"
  },

  "views" : "./application/views",
  "assets" : "assets",
  "routes" : "./application/routes",

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
  },

  emailOptions: {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      name: 'Admin ',
      user: 'iaisin@qq.com',
      pass: 'wanghc815147aisin'
    }
  }
}


exports.config = config
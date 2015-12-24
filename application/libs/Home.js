var EventProxy = require('eventproxy')
var Thread = require('../models/thread')
var User = require('../models/user')
var _User = require('./User')

exports.getThreads = function(callback){

    Thread.find({deleted : false}, function(err, threads){

        if(err) return callback(err)

        if(threads.length === 0) return callback(null, [])

        var ep = new EventProxy()

        ep.after('threads_ready', threads.length, function(){
            //console.log(threads + '............FINAL')

            return callback(null, threads) //最后返回给 view 层
        })

        ep.fail(callback)

        //遍历操作每一条主题
        threads.forEach(function(thread, i){
            var proxy = new EventProxy()

            proxy.all('author', function(author){ //use `on` instead of `all`
                //console.log(author + ' is author...')
                if(author){
                    //console.log(thread + '............BEFORE')
                    thread.author = author.nickname
                    //console.log(Thread.create_at_ago().toString())
                    //thread.create_at = Thread.create_at_ago(true)
                    //console.log(thread.author)
                    //console.log(thread + '............AFTER')
                }else{
                    threads[i] = null
                }

                ep.emit('threads_ready')
            })

            //用查询出的创建者ID去查询用户名
            _User.getUserById(thread.author_id, proxy.done('author'))
        })
    })
}
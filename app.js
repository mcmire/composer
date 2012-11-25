
var express = require('express')
  , app = express()
  , port = 5010
  , mongodb = require('mongodb')
  , mongoserver = new mongodb.Server('127.0.0.1', mongodb.Connection.DEFAULT_PORT,
                                     {auto_reconnect: true})
  , dbconn = new mongodb.Db('composer', mongoserver, {safe: false})

dbconn.open(function(err, db) {
  if (err) {
    console.log("Error opening Mongo connection: " + err.message)
  }
  else {
    app.use(express.static('public'))
    app.use(express.bodyParser())

    app.post('/sequences', function(req, res) {
      var sequence = req.body
        , coll = db.collection('sequences')
      sequence.created_at = (new Date()).toISOString()
      coll.insert(sequence)
      res.send(200)
    })

    app.listen(port)
    console.log('== Composer is listening on port ' + port + '.')
  }
})


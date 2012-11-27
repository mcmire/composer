
var util = require('util')
  , connectToDatabase = function(fn) {
      var mongodb = require('mongodb')
        , databaseUrl = process.env['MONGOLAB_URI'] || ('mongodb://localhost:' + mongodb.Connection.DEFAULT_PORT + '/composer')

      mongodb.Db.connect(databaseUrl, function(err, db) {
        if (err) {
          console.error("Couldn't connect to MongoDB: " + err.message)
        } else {
          fn(db)
        }
      })
    }

connectToDatabase(function(db) {
  var express = require('express')
    , app = express()
    , appPort = process.env.PORT || 5010

  app.use(express.static('public'))
  app.use(express.bodyParser())

  app.post('/sequences', function(req, res) {
    var coll = db.collection('sequences')
      , sequence = req.body
    sequence.created_at = (new Date()).toISOString()
    db.insert(sequence, function (err, saved) {
      if (err) {
        console.error("Saving sequence failed: " + err)
      }
    })
    res.send(200)
  })

  app.listen(appPort, function () {
    console.log('== Composer is listening on port ' + appPort + '.')
  })
})

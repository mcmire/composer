
var util = require('util')
  , express = require('express')
  , Sequence = require('./public/javascripts/app/sequence')

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
  var app = express()
    , appPort = process.env.PORT

  app.use(express.static('public'))
  app.use(express.bodyParser())
  app.use(express.logger())

  app.get('/sequences/new', function (req, res) {
    var sequence = new Sequence(this)
      , allStates = ['start', 'end', null]

    $.v.each(main.tracks, function (sampleName) {
      var track = sequence.addTrack(sampleName)
        , tickStates = []
        , possibleStates = util.copy(allStates)
        , isOpen = false
        , lastStateAt = []
        , state

      for (var i = 0, len = main.numberOfTicks; i < len; i++) {
        if (isOpen && i === len-1) {
          state = 'end'
        } else {
          if (isOpen) {
            util.array.delete(possibleStates, 'start')
          } else {
            util.array.delete(possibleStates, 'end')
          }
          state = util.random.sample(possibleStates)
        }
        tickStates.push(state)
        if (state === 'start')    { isOpen = true  }
        else if (state === 'end') { isOpen = false }
      }

      $.v.each(tickStates, function (state, i) {
        if (state === 'start') {
          if (lastStateAt[0] === 'end') {
            track.addOffCell(i - lastStateAt[1]);
          }
          lastStateAt = [state, i]
        } else if (state === 'end') {
          if (lastStateAt[0] === 'start') {
            track.addOnCell(i - lastStateAt[1]);
          }
          lastStateAt = [state, i]
        }
      })
    })

    console.log(sequence.toStore())
    //res.send(sequence.toStore())
    res.send(200)
  })

  app.post('/sequences', function (req, res) {
    var coll = db.collection('sequences')
      , sequence = req.body
    sequence.created_at = (new Date()).toISOString()
    coll.insert(sequence, function (err, saved) {
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


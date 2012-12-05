
var nodeutil = require('util')
  , path = require('path')
  , fs = require('fs')

  , express = require('express')
  , v = require('valentine')

  , composer = require('./javascripts/app/common/index')
  , Sequence = require('./javascripts/app/common/sequence')
  , util = require('./javascripts/app/common/util')

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
  var rootDir = path.join(__dirname)
    , app = express()
    , appPort = process.env.PORT || 5000

  app.use('/javascripts', express.static(path.join(rootDir, 'javascripts')))
  app.use('/stylesheets', express.static(path.join(rootDir, 'stylesheets')))
  app.use('/audio', express.static(path.join(rootDir, 'audio')))

  app.use(express.bodyParser())
  app.use(express.logger())

  app.get('/', function (req, res) {
    var file = path.join(rootDir, 'index.html')
      , html = fs.readFileSync(file, 'utf-8')
    res.send(html)
  })

  app.get('/sequences/new', function (req, res) {
    var sequence = new Sequence(this)
      , allStates = [
          ['start']         // => ['end'], ['end', 'start'], null
        , ['end']           // => ['start'], null
        , ['end', 'start']  // => ['end'], null
        , null              // => ['start'], ['end'], ['end', 'start']
        ]

    var generateTickStates = function () {
      var tickStates = []
        , isOpen = false
        , possibleStates
        , state
        , lastState

      for (var i = 0, len = composer.numberOfTicks+1; i < len; i++) {
        if (isOpen && i === len-1) {
          state = ['end']
        } else {
          if (lastState) {
            possibleStates = v.reject(allStates, function (s) {
              if (s === null) { return false }
              if (lastState === s) { return true }
              return (lastState[lastState.length-1] === s[0])
            })
          } else {
            possibleStates = [ ['start'] , null ]
          }
          state = util.random.sample(possibleStates)
        }
        tickStates.push(state)

        if (state) {
          if (state[state.length-1] === 'start') {
            isOpen = true
          } else if (state[state.length-1] === 'end') {
            isOpen = false
          }
        }

        if (state) { lastState = state }
      }
      console.log({tickStates: tickStates})

      return tickStates
    }

    var tickStatesToNoteEvents = function (track, tickStates) {
      var totalDurationInTicks = 0
        , lastNoteEventAt
        , state
      v.each(tickStates, function (state, i) {
        var finalState
          , durationInTicks
          , isOn
          , noteEvent

        if (!state) { return }

        // Test cases:
        // * null -> does nothing
        // * null..., start -> note off event
        // * start, [null...], end -> note on event for end.index - start.index
        // * end, [null...], start -> note off event for start.index - end.index
        // * start, [null...], end|start -> end makes note on event, start does
        //   nothing until end
        // * start, [null...], <eof> -> autocreates note on event

        // If it's the first start event and doesn't appear at index 0, add a
        // note off event up to the start
        if (i > 0) {
          if (!lastNoteEventAt && state[0] == ['start']) {
            durationInTicks = i
            noteEvent = track.addNoteEvent(durationInTicks, false)
          } else {
            durationInTicks = i - lastNoteEventAt[1]
            isOn = (state[0] === 'end')
            noteEvent = track.addNoteEvent(durationInTicks, isOn)
          }
          totalDurationInTicks += durationInTicks
        }
        lastNoteEventAt = [noteEvent, i]
      })
      console.log(nodeutil.inspect({
        totalDurationInTicks: totalDurationInTicks
      , track: track.toStore()
      }, true, null))
    }

    v.each(composer.tracks, function (sampleName) {
      var track = sequence.addTrack(sampleName)
      var tickStates = generateTickStates()
      tickStatesToNoteEvents(track, tickStates)
    })

    res.send(sequence.toStore())
    //res.send(200)
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


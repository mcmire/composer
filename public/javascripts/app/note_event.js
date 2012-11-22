'use strict'

window.composer || (window.composer = {})

composer.NoteEvent = function NoteEvent(track, sample, time, durationInTime, isOn) {
  var node
    , main = track.getSequence().getMain()
    , schedule = function() {
        // XXX: time needs to be relative until we get to this point?
        ctxTime = main.getAudioContextStartTime() + time
        node = main.connectNewSample(sample)
        console.log("scheduling " + sample.name + " at " + ctxTime)
        start(ctxTime)
        stop(ctxTime + duration)
      }
    , unschedule = function() {
        // node.playbackState isnt 2  # i.e. playing
        // XXX: will this work if the node is unscheduled?
        node && stop(0)
      }
    , start = function() {
        // deal with recent changes to the Web Audio API
        method = ('start' in node) ? 'start' : 'noteOn'
        node[method](time)
      }
    , stop = function() {
        // deal with recent changes to the Web Audio API
        method = ('stop' in node) ? 'stop' : 'noteOff'
        node[method](time)
      }
  $.v.extend(this, {
    durationInTime: durationInTime
  , isOn: isOn
  , schedule: schedule
  , unschedule: unschedule
  })
}


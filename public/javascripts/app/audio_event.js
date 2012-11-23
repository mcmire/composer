'use strict'

window.composer || (window.composer = {})

// You should only create one of these objects if you are about to schedule a
// note event -- do not keep the object around in memory
//
composer.AudioEvent = function(noteEvent) {
  var audio = composer.audio
    , audioNode = audio.connectNewSample(audio.lookupSample(noteEvent.sample))

    , getNumFrames = function() {
        return noteEvent.numFrames
      }

    , scheduleAt = function (time, durationInTime) {
        if (noteEvent.isOn) {
          startAt(time)
          stopAt(time + durationInTime)
        } else {
          stopAt(time)
        }
      }

    , stop = function () {
        noteEvent.isOn && stopAt(0)
      }

    , startAt = function (time) {
        // deal with recent changes to the Web Audio API
        var method = ('start' in audioNode) ? 'start' : 'noteOn'
        audioNode[method](time)
      }

    , stopAt = function (time) {
        // deal with recent changes to the Web Audio API
        var method = ('stop' in audioNode) ? 'stop' : 'noteOff'
        audioNode[method](time)
      }

    , isFinished = function () {
        return audioNode.playbackState == 3
      }

  $.v.extend(this, {
    getNumFrames: getNumFrames
  , scheduleAt: scheduleAt
  , stop: stop
  , isFinished: isFinished
  })
}

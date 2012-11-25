'use strict'

window.composer || (window.composer = {})

// You should only create one of these objects if you are about to schedule a
// note event -- do not keep the object around in memory
//
composer.AudioEvent = function(cell) {
  var audio = composer.audio
    , sample = audio.lookupSample(cell.getSampleName())
    // TODO: connect each track's cells to a different gain node
    , audioNode = audio.connectNewSample(sample)

    , getDurationInTicks = function() {
        return cell.durationInTicks
      }

    , getDurationInTime = function () {
        return main.ticksToTime(cell.durationInTicks)
      }

    , scheduleAt = function (time, durationInTime) {
        if (cell.isOn) {
          startAt(time)
          durationInTime && stopAt(time + durationInTime)
        } else {
          stopAt(time)
        }
      }

    , stop = function () {
        cell.isOn && stopAt(0)
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
    getDurationInTicks: getDurationInTicks
  , scheduleAt: scheduleAt
  , stop: stop
  , isFinished: isFinished
  })
}

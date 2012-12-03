'use strict'

composer.AudioEvent = (function () {
  var v = valentine

    , audio = composer.audio
    , main = composer.main

  // You should only create an AudioEvent object if you are about to schedule a
  // note event -- do not keep the AudioEvent object around in memory
  return function AudioEvent(cell) {
    var sample = audio.lookupSample(cell.getSampleName())
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
          cell.isOn && !isPlaying() && stopAt(0)
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
          // https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioBufferSourceNode
          return audioNode.playbackState == 3
        }

      , isPlaying = function () {
          // https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioBufferSourceNode
          return audioNode.playbackState == 2
        }

    v.extend(this, {
      getDurationInTicks: getDurationInTicks
    , scheduleAt: scheduleAt
    , stop: stop
    , isFinished: isFinished
    })
  }
})()


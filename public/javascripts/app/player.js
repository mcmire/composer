'use strict'

window.composer || (window.composer = {})

composer.player = (function () {
  var audio = composer.audio

    , main
    , sequence
    , startFrame
    , scheduledAudioEvents

    , init = function (_main) {
        main = _main
        scheduledAudioEvents = []
        return this
      }

    , setSequence = function (_sequence) {
        sequence = _sequence
      }

    , start = function () {
        var startTime = audio.getAudioContext().currentTime
        removeFinishedAudioEvents()
        sequence.eachFrame(function (noteEvents, frameIndex) {
          if (frameIndex < startFrame) { return }
          var time = startTime + main.framesToTime(frameIndex)
          $.v.each(noteEvents, function (noteEvent) {
            var audioEvent = new composer.AudioEvent(noteEvent)
              , durationInTime = main.framesToTime(audioEvent.getNumFrames())
            audioEvent.scheduleAt(time, durationInTime)
            scheduledAudioEvents.push(audioEvent)
          })
        })
      }

    , stop = function () {
        removeFinishedAudioEvents()
        $.v.each(scheduledAudioEvents, function (audioEvent) {
          audioEvent.stop()
        })
        startFrame = 0
      }

    , removeFinishedAudioEvents = function () {
        var newScheduledAudioEvents = []
        $.v.each(scheduledAudioEvents, function (audioEvent) {
          if (!audioEvent.isFinished()) {
            newScheduledAudioEvents.push(audioEvent)
          }
        })
        scheduledAudioEvents = newScheduledAudioEvents
      }

    , setToFrame = function (frameIndex) {
        startFrame = frameIndex
      }

  return {
    init: init
  , setSequence: setSequence
  , start: start
  , stop: stop
  , setToFrame: setToFrame
  }
})()

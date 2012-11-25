'use strict'

window.composer || (window.composer = {})

composer.player = (function () {
  var audio = composer.audio

    , main
    , sequence
    , startTick
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
        sequence.eachTick(function (noteEvents, tickIndex) {
          if (tickIndex < startTick) { return }
          var time = startTime + main.ticksToTime(tickIndex)
          $.v.each(noteEvents, function (noteEvent) {
            var audioEvent = new composer.AudioEvent(noteEvent)
              , durationInTime = main.ticksToTime(audioEvent.getDurationInTicks())
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
        startTick = 0
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

    , setToTick = function (tickIndex) {
        startTick = tickIndex
      }

  return {
    init: init
  , setSequence: setSequence
  , start: start
  , stop: stop
  , setToTick: setToTick
  }
})()

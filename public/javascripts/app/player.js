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

      // FIXME: when all audio events have been played, state should be set to
      // stopped so that pressing play starts immediately
    , start = function () {
        var startTime = audio.getAudioContext().currentTime
        removeFinishedAudioEvents()
        sequence.eachTick(function (cells, tickIndex) {
          if (tickIndex < startTick) { return }
          var time = startTime + main.ticksToTime(tickIndex)
            , tickAudioEvent
          $.v.each(cells, function (cell) {
            var audioEvent = new composer.AudioEvent(cell)
            audioEvent.scheduleAt(time)
            scheduledAudioEvents.push(audioEvent)
          })
          if ((tickIndex % 2) === 0) {
            tickAudioEvent = new composer.AudioEvent({
              isOn: true
            , getSampleName: function () { return 'tick' }
            })
            tickAudioEvent.scheduleAt(time, 0.1)
            scheduledAudioEvents.push(tickAudioEvent)
          }
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

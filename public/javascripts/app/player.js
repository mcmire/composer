'use strict'

window.composer || (window.composer = {})

composer.player = (function () {
  var audio = composer.audio

    , main
    , sequence
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
        var currentTick = main.getCurrentTick()
          , startTime = audio.getAudioContext().currentTime

        removeFinishedAudioEvents()
        sequence.eachTick(function (cells, tickIndex) {
          if (tickIndex < currentTick) { return }
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
            , getSampleName: function () {
                return tickIndex === 0 ? 'ticd' : 'ticu'
              }
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

  return {
    init: init
  , setSequence: setSequence
  , start: start
  , stop: stop
  }
})()

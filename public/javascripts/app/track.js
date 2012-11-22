'use strict'

window.composer || (window.composer = {})

composer.Track = (function() {
  var time = 0
  return function Track(sequence, sample) {
    var main = sequence.getMain()
      , noteEvents = []
      , getSequence = function () {
          return sequence
        }
      , addOnEvent = function (durationType) {
          return addNoteEvent.call(this, durationType, true)
        }
      , addOffEvent = function (durationType) {
          return addNoteEvent.call(this, durationType, false)
        }
      , addNoteEvent = function (durationType, isOn) {
          var durationInTime = main.durationTypeToTime(durationType)
            , noteEvent = new composer.NoteEvent(this, sample, time, durationInTime, isOn)
          noteEvents.push(noteEvent)
          time += noteEvent.durationInTime
          return noteEvent
        }
      , eachNoteEvent = function (fn) {
          $.v.each(noteEvents, fn)
        }
      , getNumNoteEvents = function () {
          return noteEvents.length
        }

    $.v.extend(this, {
      getSequence: getSequence
    , addOnEvent: addOnEvent
    , addOffEvent: addOffEvent
    , addNoteEvent: addNoteEvent
    , eachNoteEvent: eachNoteEvent
    , getNumNoteEvents: getNumNoteEvents
    })
  }
})()

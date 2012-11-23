'use strict'

window.composer || (window.composer = {})

composer.Track = (function() {
  return function Track(sequence, sample) {
    var frameCounter = 0
      , main = sequence.getMain()
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

      , addNoteEvent = function (numFrames, isOn) {
          var noteEvent = new composer.NoteEvent(this, sample, numFrames, isOn)
          noteEvents.push(noteEvent)
          sequence.addNoteEventToFrame(frameCounter, noteEvent)
          frameCounter += noteEvent.numFrames
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
    , noteEvents: noteEvents
    , getNumNoteEvents: getNumNoteEvents
    })
  }
})()

'use strict'

;(function () {
  var v = require('valentine')
    , NoteEvent = require('./note_event')

    , Track = function Track(sequence, sampleName) {
        var tickCounter = 0
          , noteEvents = []
          , noteEventsByTick = []

          , getSequence = function () {
              return sequence
            }

          , getSampleName = function () {
              return sampleName
            }

          , addOnNoteEvent = function (durationInTicks) {
              return addNoteEvent.call(this, durationInTicks, true)
            }

          , addOffNoteEvent = function (durationInTicks) {
              return addNoteEvent.call(this, durationInTicks, false)
            }

          , addNoteEvent = function (/* noteEvent | durationInTicks, isOn */) {
              var noteEvent
              if (arguments.length === 1) {
                noteEvent = arguments[0]
              } else {
                noteEvent = new NoteEvent(this, arguments[0], arguments[1])
              }
              noteEvents.push(noteEvent)

              noteEventsByTick[tickCounter] = noteEvent
              sequence.addNoteEvent(tickCounter, noteEvent)

              tickCounter += noteEvent.durationInTicks

              return noteEvent
            }

          , eachNoteEvent = function (fn) {
              v.each(noteEvents, fn)
            }

          , getNumNoteEvents = function () {
              return noteEvents.length
            }

          , findNoteEvent = function(noteEventIndex) {
              return noteEvents[noteEventIndex]
            }

          , toStore = function () {
              var noteEvents_ = v.map(noteEvents, function (noteEvent) {
                return noteEvent.toStore()
              })
              return {
                sampleName: sampleName
              , noteEvents: noteEvents_
              }
            }

        v.extend(this, {
          getNoteEvents: noteEvents   // for debugging purposes
        , getSequence: getSequence
        , getSampleName: getSampleName
        , addOnNoteEvent: addOnNoteEvent
        , addOffNoteEvent: addOffNoteEvent
        , addNoteEvent: addNoteEvent
        , eachNoteEvent: eachNoteEvent
        , getNumNoteEvents: getNumNoteEvents
        , findNoteEvent: findNoteEvent
        , toStore: toStore
        })
      }

  Track.fromStore = function (sequence, trackData) {
    var track = new Track(sequence, trackData.sampleName)
    v.each(trackData.noteEvents, function (noteEventData) {
      track.addNoteEvent(NoteEvent.fromStore(track, noteEventData))
    })
    return track
  }

  if (typeof module === 'undefined') {
    composer.define('track', 'Track', Track)
  } else {
    module.exports = Track
  }
})()

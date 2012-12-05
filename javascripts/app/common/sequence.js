'use strict'

;(function () {
  var v = require('valentine')
    , Track = require('./track')

    , Sequence = function Sequence() {
        var tracks = []
          , noteEventsByTick = []

          , getDurationInTicks = function() {
              return noteEventsByTick.length
            }

          , addTrack = function (/* track | sampleName */) {
              var track
              if (arguments[0] instanceof Track) {
                track = arguments[0]
              } else {
                track = new Track(this, arguments[0])
              }
              tracks.push(track)
              return track
            }

          , eachTrack = function (fn) {
              v.each(tracks, fn)
            }

          , getNumTracks = function () {
              return tracks.length
            }

          , addNoteEvent = function (tickNo, noteEvent) {
              (noteEventsByTick[tickNo] || (noteEventsByTick[tickNo] = [])).push(noteEvent)
            }

          , eachTick = function (fn) {
              var i = 0
              while (i < getDurationInTicks()) {
                fn(noteEventsByTick[i] || [], i)
                i++
              }
            }

          , findTrack = function (trackIndex) {
              return tracks[trackIndex]
            }

          , findNoteEvent = function (trackIndex, noteEventIndex) {
              var track = findTrack(trackId)
              return (track && track.findNoteEvent(noteEventIndex))
            }

          , toggleGoalStateOfNoteEvent = function (trackIndex, noteEventIndex) {
              var track = findTrack(trackIndex)
                , noteEvent = (track && track.findNoteEvent(noteEventIndex))
              noteEvent && noteEvent.toggleGoalState()
            }

          , toStore = function () {
              var tracks_ = v.map(tracks, function (track) {
                return track.toStore()
              })
              return {
                tracks: tracks_
              }
            }

        v.extend(this, {
          _tracks: tracks   // for debugging purposes
        , getDurationInTicks: getDurationInTicks
        , addTrack: addTrack
        , eachTrack: eachTrack
        , getNumTracks: getNumTracks
        , addNoteEvent: addNoteEvent
        , eachTick: eachTick
        , findNoteEvent: findNoteEvent
        , toggleGoalStateOfNoteEvent: toggleGoalStateOfNoteEvent
        , toStore: toStore
        })
      }

  Sequence.fromStore = function (sequenceData) {
    var sequence = new Sequence()
    v.each(sequenceData.tracks, function (trackData) {
      sequence.addTrack(Track.fromStore(sequence, trackData))
    })
    return sequence
  }

  if (typeof module === 'undefined') {
    composer.define('sequence', 'Sequence', Sequence)
  } else {
    module.exports = Sequence
  }
})()


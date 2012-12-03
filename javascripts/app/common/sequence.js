'use strict'

;(function () {
  var v = require('valentine')
    , Track = require('./track')

    , Sequence = function Sequence() {
        var tracks = []
          , cellsByTick = []

          , getDurationInTicks = function() {
              return cellsByTick.length
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

          , addCell = function (tickNo, cell) {
              (cellsByTick[tickNo] || (cellsByTick[tickNo] = [])).push(cell)
            }

          , eachTick = function (fn) {
              var i = 0
              while (i < getDurationInTicks()) {
                fn(cellsByTick[i] || [], i)
                i++
              }
            }

          , findTrack = function (trackIndex) {
              return tracks[trackIndex]
            }

          , findCell = function (trackIndex, cellIndex) {
              var track = findTrack(trackId)
              return (track && track.findCell(cellIndex))
            }

          , toggleCellGoalState = function (trackIndex, cellIndex) {
              var track = findTrack(trackIndex)
                , cell = (track && track.findCell(cellIndex))
              cell && cell.toggleGoalState()
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
        , addCell: addCell
        , eachTick: eachTick
        , findCell: findCell
        , toggleCellGoalState: toggleCellGoalState
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


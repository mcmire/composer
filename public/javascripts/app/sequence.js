'use strict'

window.composer || (window.composer = {})

composer.Sequence = function Sequence(main) {
  var tracks = []
    , cellsByTick = []

    , getMain = function() {
        return main
      }

    , getDurationInTicks = function() {
        return cellsByTick.length
      }

    , addTrack = function (sample) {
        var track = new composer.Track(this, sample)
        tracks.push(track)
        return track
      }

    , eachTrack = function (fn) {
        $.v.each(tracks, fn)
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
        var tracks_ = $.v.map(tracks, function (track) {
          return track.toStore()
        })
        return {
          tracks: tracks_
        }
      }

  $.v.extend(this, {
    _tracks: tracks   // for debugging purposes
  , getMain: getMain
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

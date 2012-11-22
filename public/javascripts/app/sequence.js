'use strict'

window.composer || (window.composer = {})

var util = composer.util

composer.Sequence = function Sequence(main) {
  var tracks = []
    , getMain = function() {
        return main
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

  $.v.extend(this, {
    getMain: getMain
  , addTrack: addTrack
  , eachTrack: eachTrack
  , getNumTracks: getNumTracks
  })
}

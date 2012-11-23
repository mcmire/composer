'use strict'

window.composer || (window.composer = {})

composer.Sequence = function Sequence(main) {
  var tracks = []
    , frames = []

    , getMain = function() {
        return main
      }

    , setBpm = function(bpm) {
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

    , addNoteEventToFrame = function (frameIndex, noteEvent) {
        if (!(frameIndex in frames)) {
          frames[frameIndex] = []
        }
        frames[frameIndex].push(noteEvent)
      }

    , eachFrame = function (fn) {
        $.v.each(frames, fn)
      }

  $.v.extend(this, {
    getMain: getMain
  , addTrack: addTrack
  , tracks: tracks
  , eachTrack: eachTrack
  , getNumTracks: getNumTracks
  , addNoteEventToFrame: addNoteEventToFrame
  , eachFrame: eachFrame
  })
}

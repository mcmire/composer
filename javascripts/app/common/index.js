'use strict'

;(function () {
  var TRACKS = ['snare', 'kick']
    , NUMBER_OF_TICKS = 16
    , TICK_DURATION_IN_BEATS = 1 / NUMBER_OF_TICKS
    , NUMBER_OF_ITERATIONS = 4

    , composer = {
        tracks: TRACKS
      , numberOfTicks: NUMBER_OF_TICKS
      , tickDurationInBeats: TICK_DURATION_IN_BEATS
      , numberOfIterations: NUMBER_OF_ITERATIONS
      }

  if (typeof module === 'undefined') {
    window.composer || (window.composer = {})
    $.v.extend(window.composer, composer)
  } else {
    module.exports = composer
  }
})()

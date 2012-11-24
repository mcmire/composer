'use strict'

window.composer || (window.composer = {})

// This is the controller
composer.main = (function () {
  var TRACKS = ['kick']
    , NUMBER_OF_FRAMES = 16
    , FRAME_LENGTH = 1 / NUMBER_OF_FRAMES

    , canvas
    , cursor
    , player
    , currentSequence
    , isRunning
    , currentFrame
    , bpm
    , spb
    , secondsPerFrame

    , init = function (opts) {
        var bpm = opts.bpm

        canvas = composer.canvas.init(this)
        cursor = canvas.getCursor()
        player = composer.player.init(this)

        setBpm(bpm)

        loadNewSequence()

        isRunning = false
        currentFrame = 0

        addEvents()

        return this
      }

    , getIsRunning = function () {
        return isRunning
      }

    , setBpm = function (_bpm) {
        bpm = _bpm
        // ex: 120 bpm is 120 beats / 60 seconds or 0.5 per beat
        spb = 60 / bpm
        secondsPerFrame = (FRAME_LENGTH / bpm) * 60
        cursor.setBpm(bpm)
      }

      // Convert some number of beats to time in seconds.
      //
      // Example:
      //
      //   # assume bpm = 120, so spb = 0.5
      //   beatsToTime(4)  #=> 2 seconds
      //
    , beatsToTime = function (n) {
        return n * spb
      }

    , framesToTime = function(n) {
        return n * secondsPerFrame
      }

    , start = function () {
        isRunning = true
        player.start()
        cursor.start()
      }

    , stop = function () {
        isRunning = false
        player.stop()
        cursor.stop()
      }

    , toggle = function () {
        isRunning ? stop() : start()
      }

    , setToFrame = function (number) {
        player.setToFrame(number)
        cursor.setToFrame(number)
      }

    , nextFrame = function (number) {
        currentFrame = (currentFrame + 1) % (NUMBER_OF_FRAMES + 1)
        setToFrame(currentFrame)
      }

    , prevFrame = function (number) {
        currentFrame = currentFrame === 0 ? NUMBER_OF_FRAMES : currentFrame - 1
        setToFrame(currentFrame)
      }

    , setToStart = function () {
        currentFrame = 0
        setToFrame(currentFrame)
      }

    , setToEnd = function () {
        currentFrame = NUMBER_OF_FRAMES
        setToFrame(currentFrame)
      }

    , loadNewSequence = function () {
        var sequence = new composer.Sequence(this)
        $.v.each(TRACKS, function (sample) {
          var j
            , track = sequence.addTrack(sample)
          for (j = 0; j < NUMBER_OF_FRAMES; j++) {
            track.addNoteEvent(1, Math.round(Math.random()) === 0)
          }
        })
        currentSequence = sequence
        canvas.setSequence(currentSequence)
        player.setSequence(currentSequence)
      }

    , addEvents = function () {
        $(window).on('keydown.composer.main', function (e) {
          switch (e.keyCode) {
            // home, H
            case 36: case 72:
              return setToStart()
            // end, L
            case 35: case 76:
              return setToEnd()
            // left arrow, J
            case 37: case 74:
              return prevFrame()
            // right arrow, K
            case 39: case 75:
              return nextFrame()
            // space
            case 32:
              return toggle()
          }
        })
        canvas.addEvents()
      }

    , removeEvents = function () {
        $(window).off('.composer.main')
        canvas.removeEvents()
      }

  return {
    init: init
  , numberOfFrames: NUMBER_OF_FRAMES
  , framesToTime: framesToTime
  }
})()


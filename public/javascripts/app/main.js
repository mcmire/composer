'use strict'

window.composer || (window.composer = {})

composer.main = (function () {
  var TRACKS = ['kick']
    , NUMBER_OF_FRAMES = 16
    , FRAME_LENGTH = 1 / NUMBER_OF_FRAMES

    , canvas
    , cursor
    , audio
    , player
    , isRunning
    , currentFrame
    , bpm
    , spb
    , secondsPerFrame

    , initWhenReady = function (bpm, opts) {
        init.call(this, bpm, opts)
        whenReady(addEvents)
      }

    , init = function (bpm, opts) {
        canvas = composer.canvas.init(this)
        cursor = canvas.getCursor()
        audio  = composer.audio.init(this)
        player = composer.player.init(this, audio)

        setBpm(bpm)

        var sequence = generateSequence.call(this)
        canvas.setSequence(sequence)
        player.setSequence(sequence)

        isRunning = false
        currentFrame = 0

        return this
      }

    , whenReady = function (fn) {
        audio.whenReady(fn)
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

    , generateSequence = function () {
        var sequence = new composer.Sequence(this)
        $.v.each(TRACKS, function (sample) {
          var j
            , track = sequence.addTrack(sample)
          for (j = 0; j < NUMBER_OF_FRAMES; j++) {
            track.addNoteEvent(1, Math.round(Math.random()) === 0)
          }
        })
        return sequence
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
      }

  return {
    initWhenReady: initWhenReady
  , init: init
  , numberOfFrames: NUMBER_OF_FRAMES
  , framesToTime: framesToTime
  }
})()


'use strict'

window.composer || (window.composer = {})

// This is the controller
composer.main = (function () {
  var TRACKS = ['snare', 'kick']
    , NUMBER_OF_TICKS = 16
    , TICK_LENGTH = 1 / NUMBER_OF_TICKS

    , canvas
    , cursor
    , player
    , currentSequence
    , isRunning
    , currentTick
    , bpm
    , spb
    , secondsPerTick

    , init = function (opts) {
        var bpm = opts.bpm

        canvas = composer.canvas.init(this)
        cursor = canvas.getCursor()
        player = composer.player.init(this)

        setBpm(bpm)

        loadNewSequence()

        isRunning = false
        currentTick = 0

        addEvents()

        return this
      }

    , getCurrentSequence = function () {
        return currentSequence
      }

    , getIsRunning = function () {
        return isRunning
      }

    , setBpm = function (_bpm) {
        bpm = _bpm
        // ex: 120 bpm is 120 beats / 60 seconds or 0.5 per beat
        spb = 60 / bpm
        secondsPerTick = (TICK_LENGTH / bpm) * 60
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

    , ticksToTime = function(n) {
        return n * secondsPerTick
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

    , setToTick = function (number) {
        player.setToTick(number)
        cursor.setToTick(number)
      }

    , nextTick = function (number) {
        currentTick = (currentTick + 1) % (NUMBER_OF_TICKS + 1)
        setToTick(currentTick)
      }

    , prevTick = function (number) {
        currentTick = currentTick === 0 ? NUMBER_OF_TICKS : currentTick - 1
        setToTick(currentTick)
      }

    , setToStart = function () {
        currentTick = 0
        setToTick(currentTick)
      }

    , setToEnd = function () {
        currentTick = NUMBER_OF_TICKS
        setToTick(currentTick)
      }

    , loadNewSequence = function () {
        var sequence = new composer.Sequence(this)
        $.v.each(TRACKS, function (sample) {
          var j
            , track = sequence.addTrack(sample)
          for (j = 0; j < NUMBER_OF_TICKS; j++) {
            track.addCell(1, Math.round(Math.random()) === 0)
          }
        })
        setSequence(sequence)
      }

    , setSequence = function (sequence) {
      currentSequence = sequence
      canvas.setSequence(sequence)
      player.setSequence(sequence)
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
              return prevTick()
            // right arrow, K
            case 39: case 75:
              return nextTick()
            // space
            case 32:
              return toggle()
          }
        })
        canvas.addEvents()
        $('#next').on('click', function() {
          $.ajax({
            method: 'post'
          , type: 'json'
          , contentType: 'application/json'
          , url: '/sequences'
          , data: JSON.stringify(currentSequence.toStore())
          })
          loadNewSequence()
        })
      }

    , removeEvents = function () {
        $(window).off('.composer.main')
        canvas.removeEvents()
      }

  return {
    init: init
  , getCurrentSequence: getCurrentSequence
  , numberOfTicks: NUMBER_OF_TICKS
  , ticksToTime: ticksToTime
  }
})()


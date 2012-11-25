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
    , autoStopTimer
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

    , getCurrentTick = function () {
        return currentTick
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
        setToStart()
        var durationInTime = ticksToTime(currentSequence.getDurationInTicks())
        isRunning = true
        player.start()
        cursor.start()
        // add 300ms so the sound doesn't cut off
        autoStopTimer = setTimeout(function() { stop() }, (durationInTime * 1000) + 300)
      }

    , stop = function () {
        autoStopTimer && clearTimeout(autoStopTimer)
        isRunning = false
        player.stop()
        cursor.stop()
        setToStart()
      }

    , toggle = function () {
        isRunning ? stop() : start()
      }

    , setToTick = function (number) {
        currentTick = number
        cursor.update()
      }

    , nextTick = function (number) {
        setToTick((currentTick + 1) % (NUMBER_OF_TICKS + 1))
      }

    , prevTick = function (number) {
        setToTick(currentTick === 0 ? NUMBER_OF_TICKS : currentTick - 1)
      }

    , setToStart = function () {
        setToTick(0)
      }

    , setToEnd = function () {
        setToTick(NUMBER_OF_TICKS)
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
  , getCurrentTick: getCurrentTick
  , numberOfTicks: NUMBER_OF_TICKS
  , ticksToTime: ticksToTime
  }
})()


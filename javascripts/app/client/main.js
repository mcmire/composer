'use strict'

composer.main = (function () {
  var util = composer.util
    , Sequence = composer.Sequence

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

    , getNumberOfIterations = function () {
        return composer.numberOfIterations
      }

    , setBpm = function (_bpm) {
        bpm = _bpm
        // ex: 120 bpm is 120 beats / 60 seconds or 0.5 per beat
        spb = 60 / bpm
        secondsPerTick = (composer.tickDurationInBeats / bpm) * 60
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
        var durationInTime =
          ticksToTime(currentSequence.getDurationInTicks()) *
          getNumberOfIterations()
        isRunning = true
        player.start()
        cursor.start()
        autoStopTimer = setTimeout(function() { stop() }, durationInTime * 1000)
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
        setToTick((currentTick + 1) % (composer.numberOfTicks + 1))
      }

    , prevTick = function (number) {
        setToTick(currentTick === 0 ? composer.numberOfTicks : currentTick - 1)
      }

    , setToStart = function () {
        setToTick(0)
      }

    , setToEnd = function () {
        setToTick(composer.numberOfTicks)
      }

    , loadNewSequence = function () {
        $.ajax({
          method: 'get'
        , type: 'json'
        , url: '/sequences/new'
        , success: function (sequenceData) {
            setSequence(Sequence.fromStore(sequenceData))
          }
        })
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
          , success: function () {
              loadNewSequence()
            }
          })
        })
      }

    , removeEvents = function () {
        $(window).off('.composer.main')
        canvas.removeEvents()
      }

  return {
    init: init
  , ticksToTime: ticksToTime
  , getCurrentSequence: getCurrentSequence
  , getCurrentTick: getCurrentTick
  , getNumberOfIterations: getNumberOfIterations
  }
})()


'use strict'

window.composer || (window.composer = {})

composer.main = (function () {
  var TRACKS = ['snare']
    , NUMBER_OF_CELLS = 16
    , DURATION_TIMES = {
        '16th': (1/16)
      }

    , canvas
    , cursor
    , isRunning
    , currentCell
    , bpm
    , spb

    , init = function (bpm, opts) {
        canvas = composer.canvas.init(this)
        cursor = canvas.getCursor()
        setBpm(bpm)
        var sequence = generateSequence.call(this)
        canvas.setSequence(sequence)
        isRunning = false
        currentCell = 0
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

    , durationTypeToTime = function (durationType) {
        return beatsToTime(DURATION_TIMES[durationType])
      }

    , start = function () {
        isRunning = true
        //player.start()
        cursor.start()
      }

    , stop = function () {
        isRunning = false
        //player.stop()
        cursor.stop()
      }

    , toggle = function () {
        isRunning ? stop() : start()
      }

    , setToCell = function (number) {
        //@player.setToCell(number)
        cursor.setToCell(number)
      }

    , nextCell = function (number) {
        currentCell = (currentCell + 1) % (NUMBER_OF_CELLS + 1)
        setToCell(currentCell)
      }

    , prevCell = function (number) {
        currentCell = currentCell === 0 ? NUMBER_OF_CELLS : currentCell - 1
        setToCell(currentCell)
      }

    , setToStart = function () {
        currentCell = 0
        setToCell(currentCell)
      }

    , setToEnd = function () {
        currentCell = NUMBER_OF_CELLS
        setToCell(currentCell)
      }

    , generateSequence = function () {
        var track
          , j
          , sequence = new composer.Sequence(this)
        $.v.each(TRACKS, function (sample) {
          track = sequence.addTrack(sample)
          for (j = 0; j < NUMBER_OF_CELLS; j++) {
            track.addNoteEvent('16th', Math.round(Math.random()) === 0)
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
              return prevCell()
            // right arrow, K
            case 39: case 75:
              return nextCell()
            // space
            case 32:
              return toggle()
          }
        })
      }

    , removeEvents = function () {
        $(window).off('.composer.main')
      }

  return {
    init: init
  , numberOfCells: NUMBER_OF_CELLS
  , durationTypeToTime: durationTypeToTime
  }
})()


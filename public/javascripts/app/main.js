'use strict'

window.composer || (window.composer = {})

composer.main = (function () {
  var NUMBER_OF_SLOTS = 16
    , BEATS_PER_SLOT = 1 / NUMBER_OF_SLOTS

    , canvas
    , cursor
    , isRunning
    , currentBeat
    , bpm
    , spb

    , init = function (bpm, opts) {
        canvas = composer.canvas.init(this)
        cursor = canvas.getCursor()
        setBpm(bpm)
        isRunning = false
        currentBeat = 0
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

    , setToBeat = function (number) {
        //@player.setToBeat(number)
        cursor.setToBeat(number)
      }

    , nextBeat = function (number) {
        currentBeat = (currentBeat + 1) % (NUMBER_OF_SLOTS + 1)
        setToBeat(currentBeat)
      }

    , prevBeat = function (number) {
        currentBeat = currentBeat === 0 ? NUMBER_OF_SLOTS : currentBeat - 1
        setToBeat(currentBeat)
      }

    , setToStart = function () {
        currentBeat = 0
        setToBeat(currentBeat)
      }

    , setToEnd = function () {
        currentBeat = numberOfSlots
        setToBeat(currentBeat)
      }

    , addEvents = function () {
        $(window).on('keydown.composer', function (e) {
          switch (e.keyCode) {
            // home, H
            case 36: case 72:
              return setToStart()
            // end, L
            case 35: case 76:
              return setToEnd()
            // left arrow, J
            case 37: case 74:
              return prevBeat()
            // right arrow, K
            case 39: case 75:
              return nextBeat()
            // space
            case 32:
              return toggle()
          }
        })
      }

    , removeEvents = function () {
        $(window).unbind('.composer')
      }

  return {
    init: init
  , numberOfSlots: NUMBER_OF_SLOTS
  , beatsPerSlot: BEATS_PER_SLOT
  }
})()


'use strict'

window.composer || (window.composer = {})

composer.main = (function () {
  var NUMBER_OF_SLOTS = 16
    , BEATS_PER_SLOT = 1 / NUMBER_OF_SLOTS

  return {
    init: function (bpm, opts) {
      this.canvas = composer.canvas.init(this)
      this.cursor = this.canvas.getCursor()
      this.setBpm(bpm)
      this.isRunning = false
      this.currentBeat = 0
      this._addEvents()
      return this
    }

  , getNumberOfSlots: function () {
      return NUMBER_OF_SLOTS
    }

  , getBeatsPerSlot: function () {
      return BEATS_PER_SLOT
    }

  , setBpm: function (bpm) {
      this.bpm = bpm
      // ex: 120 bpm is 120 beats / 60 seconds or 0.5 per beat
      this.spb = 60 / this.bpm
      this.cursor.setBpm(bpm)
    }

    // Convert some number of beats to time in seconds.
    //
    // Example:
    //
    //   # assume bpm = 120, so spb = 0.5
    //   beatsToTime(4)  #=> 2 seconds
    //
  , beatsToTime: function (n) {
      return n * this.spb
    }

  , start: function () {
      this.isRunning = true
      //this.player.start()
      this.cursor.start()
    }

  , stop: function () {
      this.isRunning = false
      //this.player.stop()
      this.cursor.stop()
    }

  , toggle: function () {
      this.isRunning ? this.stop() : this.start()
    }

  , setToBeat: function (number) {
      //@player.setToBeat(number)
      this.cursor.setToBeat(number)
    }

  , nextBeat: function (number) {
      this.currentBeat = (this.currentBeat + 1) % (NUMBER_OF_SLOTS + 1)
      this.setToBeat(this.currentBeat)
    }

  , prevBeat: function (number) {
      this.currentBeat = this.currentBeat === 0 ? NUMBER_OF_SLOTS : this.currentBeat - 1
      this.setToBeat(this.currentBeat)
    }

  , setToStart: function () {
      this.currentBeat = 0
      this.setToBeat(this.currentBeat)
    }

  , setToEnd: function () {
      this.currentBeat = this.numberOfSlots
      this.setToBeat(this.currentBeat)
    }

  , _addEvents: function () {
      $(window).on('keydown.composer', function (e) {
        switch (e.keyCode) {
          // home, H
          case 36: case 72:
            return this.setToStart()
          // end, L
          case 35: case 76:
            return this.setToEnd()
          // left arrow, J
          case 37: case 74:
            return this.prevBeat()
          // right arrow, K
          case 39: case 75:
            return this.nextBeat()
          // space
          case 32:
            return this.toggle()
        }
      }.bind(this))
    }

  , _removeEvents: function () {
      $(window).unbind('.composer')
    }
  }
})()


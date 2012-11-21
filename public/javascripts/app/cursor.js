'use strict'

window.composer || (window.composer = {})

composer.cursor = (function () {
  var elem
    , numberOfSlots
    , beatsPerSlot
    , finishDistance
    , startTime
    , timer
    , render

    , getStyle = document.defaultView.getComputedStyle
    , isRunning = false

    , set = function (val) {
        return elem.style.left = val + 'px'
      }

  return {
    init: function (canvas) {
      this.canvas = canvas
      this.main = this.canvas.getMain()
      this.$elem = $('#cursor')
      elem = this.$elem[0]
      numberOfSlots = this.main.getNumberOfSlots()
      beatsPerSlot = this.main.getBeatsPerSlot()
      finishDistance = this.canvas.getBeatPosition('last')
      return this
    }

  , setBpm: function (bpm) {
      var secondsPerBeat = 60 / bpm
        , numBeats = beatsPerSlot * numberOfSlots
        , finishElapsedTime = secondsPerBeat * numBeats * 1000

      render = function () {
        var distanceSoFar,
            elapsedTimeSoFar,
            now,
            pctComplete

        if (!isRunning) {
          return
        }
        // map time to pixels
        // not a 1-to-1, pixels < time so some frames will be no movement
        // at the same time cannot assume time-pixel synchronicity so if we have
        //  fallen behind we need to catch up
        // so, how many pixels do we need to move to catch up?
        now = (new Date()).getTime()
        // map pct time to pct pixels
        elapsedTimeSoFar = now - startTime
        if (elapsedTimeSoFar >= finishElapsedTime) {
          this.setToEnd()
          return
        }
        pctComplete = elapsedTimeSoFar / finishElapsedTime
        if (pctComplete >= 1) {
          pctComplete = 1
        }
        distanceSoFar = pctComplete * finishDistance
        if (distanceSoFar >= finishDistance) {
          this.setToEnd()
          isRunning = false
        } else {
          set(distanceSoFar)
          return timer = window.webkitRequestAnimationFrame(render)
        }
      }.bind(this)
    }

  , isRunning: function () {
      return isRunning
    }

  , start: function () {
      this.setToStart()
      startTime = (new Date()).getTime()
      isRunning = true
      timer = window.webkitRequestAnimationFrame(render)
    }

  , stop: function () {
      this.setToStart()
      isRunning = false
      window.webkitCancelRequestAnimationFrame(timer)
    }

  , setToBeat: function (number) {
      set(this.canvas.getBeatPosition(number))
    }

  , setToStart: function () {
      set(0)
    }

  , setToEnd: function () {
      set(finishDistance)
    }
  }
})()


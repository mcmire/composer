'use strict'

composer.cursor = (function () {
  var canvas
    , main
    , $elem
    , elem
    , numberOfTicks
    , finishDistance
    , bpm
    , startTime
    , timer
    , render

    , getStyle = document.defaultView.getComputedStyle
    , isRunning = false

    , init = function (_canvas) {
        canvas = _canvas
        main = canvas.getMain()
        $elem = $('#cursor')
        elem = $elem[0]
        numberOfTicks = composer.numberOfTicks
        finishDistance = canvas.getTickPosition('last')
        return this
      }

    , setBpm = function (_bpm) {
        bpm = _bpm
      }

    , setSequence = function (sequence) {
        var secondsPerBeat = 60 / bpm
          , finishElapsedTime = main.ticksToTime(sequence.getDurationInTicks()) * 1000

        render = function () {
          var distanceSoFar,
              elapsedTimeSoFar,
              now,
              pctComplete

          if (!isRunning) { return }

          // map time to pixels
          // not a 1-to-1, pixels < time so some frames will be no movement
          // at the same time cannot assume time-pixel synchronicity so if we have
          //  fallen behind we need to catch up
          // so, how many pixels do we need to move to catch up?
          now = (new Date()).getTime()
          // map pct time to pct pixels
          elapsedTimeSoFar = now - startTime
          if (elapsedTimeSoFar > finishElapsedTime) {
            startTime += finishElapsedTime
            elapsedTimeSoFar = now - startTime
          }
          pctComplete = elapsedTimeSoFar / finishElapsedTime
          if (pctComplete >= 1) {
            pctComplete = 1
          }
          distanceSoFar = pctComplete * finishDistance
          moveTo(distanceSoFar)
          timer = window.webkitRequestAnimationFrame(render)
        }
      }

    , isRunning = function () {
        return isRunning
      }

    , start = function () {
        startTime = (new Date()).getTime()
        isRunning = true
        timer = window.webkitRequestAnimationFrame(render)
      }

    , stop = function () {
        isRunning = false
        window.webkitCancelRequestAnimationFrame(timer)
      }

    , moveTo = function (val) {
        elem.style.left = val + 'px'
      }

    , update = function () {
        moveTo(canvas.getTickPosition(main.getCurrentTick()))
      }

  return {
    init: init
  , setBpm: setBpm
  , setSequence: setSequence
  , start: start
  , stop: stop
  , update: update
  }
})()


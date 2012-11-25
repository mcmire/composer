'use strict'

window.composer || (window.composer = {})

composer.cursor = (function () {
  var canvas
    , main
    , $elem
    , elem
    , numberOfTicks
    , finishDistance
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
        numberOfTicks = main.numberOfTicks
        finishDistance = canvas.getBeatPosition('last')
        return this
      }

    , setBpm = function (bpm) {
        var secondsPerBeat = 60 / bpm
          , finishElapsedTime = secondsPerBeat * 1000

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
            setToEnd()
            return
          }
          pctComplete = elapsedTimeSoFar / finishElapsedTime
          if (pctComplete >= 1) {
            pctComplete = 1
          }
          distanceSoFar = pctComplete * finishDistance
          if (distanceSoFar >= finishDistance) {
            setToEnd()
            isRunning = false
          } else {
            moveTo(distanceSoFar)
            return timer = window.webkitRequestAnimationFrame(render)
          }
        }
      }

    , isRunning = function () {
        return isRunning
      }

      // FIXME: when all audio events have been played, state should be set to
      // stopped so that pressing play starts immediately
    , start = function () {
        setToStart()
        startTime = (new Date()).getTime()
        isRunning = true
        timer = window.webkitRequestAnimationFrame(render)
      }

    , stop = function () {
        setToStart()
        isRunning = false
        window.webkitCancelRequestAnimationFrame(timer)
      }

    , setToTick = function (number) {
        moveTo(canvas.getBeatPosition(number))
      }

    , setToStart = function () {
        moveTo(0)
      }

    , setToEnd = function () {
        moveTo(finishDistance)
      }

    , moveTo = function (val) {
        return elem.style.left = val + 'px'
      }

  return {
    init: init
  , setBpm: setBpm
  , setToTick: setToTick
  , start: start
  , stop: stop
  }
})()


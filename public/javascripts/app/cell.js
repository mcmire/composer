'use strict'

;(function (context) {
  var composer = context.composer || require('./composer')
  composer.define('cell', function (require, exports, define) {
    var Cell = function Cell(track, durationInTicks, isOn) {
      var goalState

        , getTrack = function () {
            return track
          }

        , getSampleName = function () {
            return track.getSampleName()
          }

        , toggleGoalState = function () {
            // There are four states:
            // * off and nothing decided
            //  * off and should be on
            // * on and nothing decided
            //  * on and should be off
            if (isOn) {
              goalState = (goalState === 'off') ? 'on' : 'off'
            } else {
              goalState = (goalState === 'on') ? 'off' : 'on'
            }
          }

        , toStore = function () {
            return {
              durationInTicks: durationInTicks
            , isOn: isOn
            , goalState: goalState
            }
          }

      $.v.extend(this, {
        durationInTicks: durationInTicks
      , isOn: isOn
      , getTrack: getTrack
      , getSampleName: getSampleName
      , toggleGoalState: toggleGoalState
      , toStore: toStore
      })
    }

    Cell.fromStore = function (track, cellData) {
      return new Cell(track, cellData.durationInTicks, cellData.isOn)
    }

    module.exports = Cell
  })
})(this)

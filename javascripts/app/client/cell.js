'use strict'

composer.define('cell', function () {
  var v = valentine

  function Cell(track, durationTicks, isOn) {
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

    v.extend(this, {
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

  return Cell
})


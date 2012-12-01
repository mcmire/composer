'use strict'

;(function (context) {
  var composer = context.composer || require('./composer')
  composer.define('track', function(require, exports, module) {
    var Track = function Track(sequence, sampleName)
        {
          var tickCounter = 0
            , cells = []
            , cellsByTick = []

            , getSequence = function () {
                return sequence
              }

            , getSampleName = function () {
                return sampleName
              }

            , addOnCell = function (durationInTicks) {
                return addCell.call(this, durationInTicks, true)
              }

            , addOffCell = function (durationInTicks) {
                return addCell.call(this, durationInTicks, false)
              }

            , addCell = function (/* cell | durationInTicks, isOn */) {
                var cell
                if (arguments.length === 1) {
                  cell = arguments[0]
                } else {
                  cell = new composer.Cell(this, arguments[0], arguments[1])
                }
                cells.push(cell)

                cellsByTick[tickCounter] = cell
                sequence.addCell(tickCounter, cell)

                tickCounter += cell.durationInTicks

                return cell
              }

            , eachCell = function (fn) {
                $.v.each(cells, fn)
              }

            , getNumCells = function () {
                return cells.length
              }

            , findCell = function(cellIndex) {
                return cells[cellIndex]
              }

            , toStore = function () {
                var cells_ = $.v.map(cells, function (cell) {
                  return cell.toStore()
                })
                return {
                  sampleName: sampleName
                , cells: cells_
                }
              }

          $.v.extend(this, {
            _cells: cells   // for debugging purposes
          , getSequence: getSequence
          , getSampleName: getSampleName
          , addOnCell: addOnCell
          , addOffCell: addOffCell
          , addCell: addCell
          , eachCell: eachCell
          , getNumCells: getNumCells
          , findCell: findCell
          , toStore: toStore
          })
        }

    Track.fromStore = function (sequence, trackData) {
      var track = new Track(sequence, trackData.sampleName)
      $.v.each(trackData.cells, function (cellData) {
        track.addCell(Cell.fromStore(track, cellData))
      })
      return track
    }

    module.exports = Track
  })
})(this)

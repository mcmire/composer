'use strict'

window.composer || (window.composer = {})

composer.Track = (function() {
  return function Track(sequence, sampleName) {
    var tickCounter = 0
      , main = sequence.getMain()
      , cells = []
      , cellsByTick = []

      , getSequence = function () {
          return sequence
        }

      , getSampleName = function () {
          return sampleName
        }

      , addOnCell = function (durationType) {
          return addCell.call(this, durationType, true)
        }

      , addOffCell = function (durationType) {
          return addCell.call(this, durationType, false)
        }

      , addCell = function (durationInTicks, isOn) {
          var cell = new composer.Cell(this, durationInTicks, isOn)
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
      getSequence: getSequence
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
})()

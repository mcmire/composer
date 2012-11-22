'use strict'

window.composer || (window.composer = {})

composer.canvas = (function () {
  var CELL_SIZE = 32    // pixels
    , CELL_PADDING = 8  // pixels

    , main
    , numberOfCells
    , $elem
    , $board
    , cursor

    , init = function (_main, sequence) {
        main = _main
        numberOfCells = main.numberOfCells
        $elem = $('#canvas').css({
          width: (CELL_SIZE + CELL_PADDING) * numberOfCells
        })
        $board = $('#board')
        cursor = composer.cursor.init(this)
        addEvents()
        return this
      }

    , setSequence = function (sequence) {
        populateBoard(sequence)
      }

    , getMain = function () {
        return main
      }

    , getCursor = function () {
        return cursor
      }

    , getBeatPosition = function (index) {
        var pos
        if (index === 'last') {
          index = numberOfCells
        }
        pos = (CELL_SIZE + CELL_PADDING) * (index - 1)
        if (index == numberOfCells) {
          pos += CELL_SIZE
        } else {
          pos += CELL_SIZE + CELL_PADDING
        }
        return pos
      }

    , populateBoard = function (sequence) {
        sequence.eachTrack(function (track, i) {
          var $track = $('<div class="track">')
          $track.css({
            height: CELL_SIZE
          })
          if (i === sequence.getNumTracks()-1) {
            $track.addClass('last')
          } else {
            $track.css({'margin-bottom': CELL_PADDING})
          }
          track.eachNoteEvent(function (event, j) {
            var $cell = $('<div class="cell"><div></div></div>')
            $cell.css({
              width: CELL_SIZE,
              height: CELL_SIZE,
              'margin-right': CELL_PADDING
            })
            if (event.isOn) {
              $cell.addClass('on')
            }
            if (j === track.getNumNoteEvents()-1) {
              $cell.addClass('last')
            }
            $track.append($cell)
          })
          $board.append($track)
        })
        $board.find('.cell:not(.on) > div').append("✓")
        $board.find('.cell.on > div').append("✗")
      }

    , addEvents = function () {
        $board
          .on('click.composer.canvas', '.cell', function () {
            return $(this).toggleClass('selected')
          })
          .on('mousedown.composer.canvas', '.cell', function () {
            return $(this).addClass('mousedown')
          })
          .on('mouseup.composer.canvas', '.cell', function () {
            return $(this).addClass('over')
          })
          .on('mouseup.composer.canvas', function () {
            return $('.cell', this).removeClass('mousedown')
          })
          .on('mouseout.composer.canvas', '.cell', function () {
            return $(this).removeClass('over')
          })
      }

    , removeEvents = function() {
        $board.off('.composer.canvas')
      }

  return {
    init: init
  , getMain: getMain
  , getCursor: getCursor
  , getBeatPosition: getBeatPosition
  , setSequence: setSequence
  }
})()


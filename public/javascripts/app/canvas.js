'use strict'

window.composer || (window.composer = {})

composer.canvas = (function () {
  var CELL_SIZE = 32    // pixels
    , CELL_PADDING = 8  // pixels
    , NUMBER_OF_TRACKS = 2

    , main
    , numberOfSlots
    , $elem
    , $board
    , cursor

    , init = function (_main) {
        main = _main
        numberOfSlots = main.numberOfSlots
        $elem = $('#canvas').css({
          width: (CELL_SIZE + CELL_PADDING) * numberOfSlots
        })
        $board = $('#board')
        cursor = composer.cursor.init(this)
        populateBoard()
        addEvents()
        return this
      }

    , getMain = function () {
        return main
      }

    , getCursor = function () {
        return cursor
      }

    , getCellSize = function () {
        return CELL_SIZE
      }

    , getCellPadding = function () {
        return CELL_PADDING
      }

    , getNumberOfTracks = function () {
        return NUMBER_OF_TRACKS
      }

    , getBeatPosition = function (index) {
        var pos
        if (index === 'last') {
          index = numberOfSlots
        }
        pos = (CELL_SIZE + CELL_PADDING) * (index - 1)
        if (index == numberOfSlots) {
          pos += CELL_SIZE
        } else {
          pos += CELL_SIZE + CELL_PADDING
        }
        return pos
      }

    , populateBoard = function () {
        var $cell
          , $track
          , i
          , j
        for (i = 0; i < NUMBER_OF_TRACKS; i++) {
          $track = $('<div class="track">')
          $track.css({
            height: CELL_SIZE,
            'margin-bottom': CELL_PADDING
          })
          j = 0
          for (j = 0; j < numberOfSlots; j++) {
            $cell = $('<div class="cell"><div></div></div>')
            $cell.css({
              width: CELL_SIZE,
              height: CELL_SIZE,
              'margin-right': CELL_PADDING
            })
            if (Math.round(Math.random()) === 0) {
              $cell.addClass('on')
            }
            if (i === 15) {
              $cell.addClass('last')
            }
            $track.append($cell)
          }
          $board.append($track)
        }
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

  return {
    init: init
  , getMain: getMain
  , getCursor: getCursor
  , getBeatPosition: getBeatPosition
  }
})()


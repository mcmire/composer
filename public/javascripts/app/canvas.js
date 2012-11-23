'use strict'

window.composer || (window.composer = {})

composer.canvas = (function () {
  var FRAME_SIZE = 32    // pixels
    , FRAME_PADDING = 8  // pixels

    , main
    , numberOfFrames
    , $elem
    , $board
    , cursor

    , init = function (_main, sequence) {
        main = _main
        numberOfFrames = main.numberOfFrames
        $elem = $('#canvas').css({
          width: (FRAME_SIZE + FRAME_PADDING) * numberOfFrames
        })
        $board = $('#board')
        cursor = composer.cursor.init(this)
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
          index = numberOfFrames
        }
        pos = (FRAME_SIZE + FRAME_PADDING) * (index - 1)
        if (index == numberOfFrames) {
          pos += FRAME_SIZE
        } else {
          pos += FRAME_SIZE + FRAME_PADDING
        }
        return pos
      }

    , populateBoard = function (sequence) {
        sequence.eachTrack(function (track, i) {
          var $track = $('<div class="track">')
          $track.css({
            height: FRAME_SIZE
          })
          if (i === sequence.getNumTracks()-1) {
            $track.addClass('last')
          } else {
            $track.css({'margin-bottom': FRAME_PADDING})
          }
          track.eachNoteEvent(function (event, j) {
            var $cell = $('<div class="cell"><div></div></div>')
            $cell.css({
              width: FRAME_SIZE,
              height: FRAME_SIZE,
              'margin-right': FRAME_PADDING
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
  , addEvents: addEvents
  , removeEvents: removeEvents
  }
})()


'use strict'

window.composer || (window.composer = {})

composer.canvas = (function () {
  var CELL_SIZE = 32    // pixels
    , CELL_PADDING = 8  // pixels

    , main
    , numberOfTicks
    , $elem
    , $board
    , $labels
    , $cells
    , cursor

    , init = function (_main) {
        main = _main
        numberOfTicks = main.numberOfTicks
        $elem = $('#canvas')
        $board = $('#board').css({
          width: (CELL_SIZE + CELL_PADDING) * main.numberOfTicks
        })
        $labels = $('#labels')
        $cells = $('#cells')
        cursor = composer.cursor.init(this)
        return this
      }

    , setSequence = function (sequence) {
        renderSequence(sequence)
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
          index = numberOfTicks
        }
        pos = (CELL_SIZE + CELL_PADDING) * (index - 1)
        if (index == numberOfTicks) {
          pos += CELL_SIZE
        } else {
          pos += CELL_SIZE + CELL_PADDING
        }
        return pos
      }

    , renderSequence = function (sequence) {
        $labels.html("")
        $cells.html("")

        sequence.eachTrack(function (track, trackIndex) {
          var $label = $('<div class="label">')
            , $track = $('<div class="track">')

          $track
            .data('idx', trackIndex)
            .css({height: CELL_SIZE})
          if (trackIndex === sequence.getNumTracks()-1) {
            $track.addClass('last')
          } else {
            $track.css({'margin-bottom': CELL_PADDING})
          }

          $label
            .text(track.getSampleName())
            .css({
              width: CELL_SIZE*2
            , height: CELL_SIZE
            , 'margin-bottom': CELL_PADDING
            , 'margin-right': CELL_PADDING*2
            })
          $labels.append($label)

          track.eachCell(function (cell, cellIndex) {
            var $cell = $('<div class="cell"><div></div></div>')
              .data('track-idx', trackIndex)
              .data('idx', cellIndex)
              .css({
                width: CELL_SIZE,
                height: CELL_SIZE,
                'margin-right': CELL_PADDING
              })
            if (cell.isOn) {
              $cell.addClass('on').find('> div').append("✗")
            } else {
              $cell.find('> div').append("✓")
            }
            if (cellIndex === track.getNumCells()-1) {
              $cell.addClass('last')
            }
            $track.append($cell)
          })
          $cells.append($track)
        })
      }

    , addEvents = function () {
        $cells
          .on('click.composer.canvas', '.cell', function () {
            var $cell = $(this)
              , trackIndex = $cell.data('track-idx')
              , cellIndex = $cell.data('idx')
              , sequence = main.getCurrentSequence()
            sequence.toggleCellGoalState(trackIndex, cellIndex)
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
        $cells.off('.composer.canvas')
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


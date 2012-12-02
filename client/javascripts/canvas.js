'use strict'

window.composer = composer || {}

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
          width: CELL_SIZE * main.numberOfTicks
        })
        $labels = $('#labels')
        $cells = $('#cells')
        cursor = composer.cursor.init(this)
        return this
      }

    , setSequence = function (sequence) {
        renderSequence(sequence)
        cursor.setSequence(sequence)
      }

    , getMain = function () {
        return main
      }

    , getCursor = function () {
        return cursor
      }

    , getTickPosition = function (index) {
        var pos
        if (index === 'last') {
          index = numberOfTicks
        }
        pos = CELL_SIZE * index
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
            , 'line-height': CELL_SIZE + 'px'
            , 'margin-bottom': CELL_PADDING
            , 'margin-right': CELL_PADDING*2
            })
          $labels.append($label)

          track.eachCell(function (cell, cellIndex) {
            var $cell = $('<div class="cell"><div></div></div>')
              .data('track-idx', trackIndex)
              .data('idx', cellIndex)
              .css({
                width: CELL_SIZE * cell.durationInTicks
              , height: CELL_SIZE
              })
            if (cell.isOn) {
              $cell.addClass('on').find('> div').append("✗")
            } else {
              $cell.find('> div').append("✓")
            }
            if (cellIndex === 0) {
              $cell.addClass('first')
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
  , getTickPosition: getTickPosition
  , setSequence: setSequence
  , addEvents: addEvents
  , removeEvents: removeEvents
  }
})()

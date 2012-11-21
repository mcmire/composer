'use strict'

window.composer || (window.composer = {})

composer.canvas = (function () {
  var CELL_SIZE = 32    // pixels
    , CELL_PADDING = 8  // pixels
    , NUMBER_OF_TRACKS = 2

  return {
    init: function (main) {
      this.main = main
      this.numberOfSlots = this.main.getNumberOfSlots()
      this.$elem = $('#canvas').css({
        width: (CELL_SIZE + CELL_PADDING) * this.numberOfSlots
      })
      this.$board = $('#board')
      this.cursor = composer.cursor.init(this)
      this._populateBoard()
      this._addEvents()
      return this
    }

  , getMain: function () {
      return this.main
    }

  , getCellSize: function () {
      return CELL_SIZE
    }

  , getCellPadding: function () {
      return CELL_PADDING
    }

  , getNumberOfTracks: function () {
      return NUMBER_OF_TRACKS
    }

  , getCursor: function () {
      return this.cursor
    }

  , getBeatPosition: function (index) {
      var pos
      if (index === 'last') {
        index = this.numberOfSlots
      }
      pos = (CELL_SIZE + CELL_PADDING) * (index - 1)
      if (index == this.numberOfSlots) {
        pos += CELL_SIZE
      } else {
        pos += CELL_SIZE + CELL_PADDING
      }
      return pos
    }

  , _populateBoard: function () {
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
        for (j = 0; j < this.numberOfSlots; j++) {
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
        this.$board.append($track)
      }
      this.$board.find('.cell:not(.on) > div').append("✓")
      this.$board.find('.cell.on > div').append("✗")
    }

  , _addEvents: function () {
      this.$board
        .on('click.main', '.cell', function () {
          return $(this).toggleClass('selected')
        })
        .on('mousedown.main', '.cell', function () {
          return $(this).addClass('mousedown')
        })
        .on('mouseup.main', '.cell', function () {
          return $(this).addClass('over')
        })
        .on('mouseup.main', function () {
          return $('.cell', this).removeClass('mousedown')
        })
        .on('mouseout.main', '.cell', function () {
          return $(this).removeClass('over')
        })
    }
  }
})()


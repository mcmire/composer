
'use strict'

window.composer || (window.composer = {})

$.v.extend(composer, {
  init: function(opts) {
    composer.audio.load(function() {
      composer.main.init(opts)
    })
  }
})


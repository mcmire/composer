'use strict'

window.composer = composer || {}

composer.init = function () {
  composer.audio.load(function () {
    composer.main.init(opts)
  })
}

// As suggested here: <https://github.com/ded/bonzo#useselector>
function $(selector) {
  return bonzo(qwery(selector))
}

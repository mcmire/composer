'use strict'

$.noConflict(function(require, provide, ender) {
  window.ender = ender
})

;(function () {
  var nodeModule  = (typeof module !== 'undefined' ? module : null)
    , nodeRequire = (typeof require !== 'undefined' ? require : null)
    , env = nodeModule ? 'node' : 'browser'

  ;(function () {
    var init = function(opts) {
          composer.audio.load(function() {
            composer.main.init(opts)
          })
        }

      , ourDefine = function (name, definition) {
          var _require, _module
          if (env == 'node') {
            _require = nodeRequire
            _module = nodeModule
            definition(_require, _module.exports, _module)
          } else {
            _require = composer.require
            _module = {}
            definition(_require, null, _module)
            composer[name] = _module.exports
          }
        }

      , ourRequire = function (name) {
          name = name.replace(/^\.\//, "")
          return composer[name]
        }

      , composer = {
          init: init
        , define: ourDefine
        , require: ourRequire
        }

    if (env == 'node') {
      console.error('nooo')
      module.exports = composer
    } else {
      window.composer = composer
    }
  })()
})()


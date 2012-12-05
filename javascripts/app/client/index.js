'use strict'

// Do not define require() and provide() globally as we will provide our own
// require() (ha!)
$.noConflict(function (require, provide, ender) {
  window.enderRequire = require
  window.$ = ender
})

//---

window.composer || (window.composer = {})

;(function () {
  var modules = {}

    , init = function (opts) {
        composer.audio.load(function () {
          composer.main.init(opts)
        })
      }

    , define = function (path, key, mod) {
        modules[path] = mod
        composer[key] = mod
      }

      // node.js require() shim
      // This is stupid simple, we just need it to do one thing
    , require = function (name) {
        var mod = modules[name.replace(/^\.\//, "")] || enderRequire(name) || window[name]
        if (!mod) {
          throw new Error("Couldn't find module '" + name + "'")
        }
        return mod
      }

  $.v.extend(composer, {
    init: init
  , define: define
  })

  window.require = require
})()


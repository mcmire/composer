'use strict'

;(function () {
  var v = require('valentine')

    , __slice = [].slice
    , __hasProp = {}.hasOwnProperty

    , audio = {
        // http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
        loadBuffers: function (audioContext, urls, callback) {
          var buffers = []
            , numLoaded = 0
          v.each(urls, function (url, i) {
            var request = new XMLHttpRequest()
            request.open('GET', url, true)
            request.responseType = 'arraybuffer'
            request.onload = function() {
              audioContext.decodeAudioData(request.response, function (buffer) {
                if (!buffer) {
                  console.error("error decoding file data: #{url}")
                  return
                }
                buffers[i] = {buffer: buffer, url: url}
                numLoaded++
                if (numLoaded === urls.length) {
                  console.log("All audio buffers are loaded")
                  callback(buffers)
                }
              })
            }
            request.onerror = function () {
              console.error("BufferLoader: XHR error")
            }
            request.send()
          })
        }
      }

    , array = {
        indexBy: function (arr, key) {
          var hash = {}
          v.each(arr, function (obj) {
            hash[obj[key]] = obj
          })
          return hash
        }

      , groupBy: function (arr, key) {
          var hash = {}
          v.each(arr, function (obj) {
            (obj[key] in hash) || obj[key] = []
            hash[obj[key]].push(obj)
          })
          return hash
        }

      , delete: function (arr, elem) {
          var index = arr.indexOf(elem)
          if (index >= 0) {
            array.deleteAt(arr, index)
          }
        }

      , deleteAt: function (arr, index) {
          arr.splice(index, 1)
        }
      }

    , is = {
        plainObject: function (obj) {
          return (typeof obj === 'object' && !Array.isArray(obj))
        }
      }

    , obj = {
        //--------------------------------------------------------------------------
        // Methods for making objects via prototypes

        // Augmenting an object lets you add properties to an object with some special
        // magic: if you are overriding a method that already exists you get access to
        // it via a `_super` reference.
        //
        aug: (function() {
          var fnContainsSuper = function (fn) {
                return /\b_super\b/.test(fn)
              }
            , wrap = function (_super, fn) {
                return function() {
                  var ret, tmp
                  tmp = this._super
                  this._super = _super
                  ret = fn.apply(this, arguments)
                  this._super = tmp
                  return ret
                }
              }
          return function() {
            var mixins = __slice(arguments)
              , base = mixins.shift()
            v.each(mixins, function (mixin) {
              var key
              for (key in mixin) {
                if (!__hasProp.call(mixin, key)) {
                  continue
                }
                if (
                  typeof base[k] === 'function' &&
                  typeof mixin[k] === 'function' &&
                  fnContainsSuper(mixin[k])
                ) {
                  base[k] = wrap(base[k], mixin[k])
                } else {
                  base[k] = obj.copy(mixin[k])
                }
              }
            })
            return base
          }
        })()

        // Cloning an object is the way to make an object from another one. The child
        // object is tied to its parent via prototype. cloneWith is the pattern that
        // simply combines cloning with augmenting.
        //
      , cloneWith: function () {
          var mixins = __slice(arguments)
            , obj = mixins.shift()
            , clone
            , F
          if ('create' in Object) {
            clone = Object.create(obj)
          } else {
            F = function () { }
            F.prototype = obj
            clone = new F()
          }
          obj.aug.apply(obj, [clone].concat(mixins))
          return clone
        }

        // This method lets you define a 'base object', i.e., an object that is
        // intended to be cloned. When you clone this object you can choose to use
        // either clone() or create(). We've already seen clone(); create() is like
        // that but it lets you provide an 'init' function which will be called on
        // cloning. If you need to extend the object after it's been cloned, you can
        // use aug().
        //
      , proto: function(p) {
          p.clone = p.cloneWith = function () {
            obj.cloneWith.apply(obj, [this].concat(arguments))
          }
          p.create = function () {
            var clone = this.clone()
            clone.init.apply(clone, arguments)
            return clone
          }
          p.init = function () {}
          p.aug = function () {
            obj.aug.apply(obj, [this].concat(arguments))
            return this
          }
          return p
        }

      //----------------------------------------------------------------------------
      // Methods for extending existing objects

      , copyWith: function () {
          var args = __slice.call(arguments)
            , ret
          if (util.is.plainObject(args[0])) {
            return v.extend.apply(v, [{}].concat(args))
          } else if (Array.isArray(args[0])) {
            ret = []
            for (var i = 0, len = args.length; i < len; i++) {
              // ah, JavaScript, you amuse me so
              ret = ret.concat(args[i])
            }
            return ret
          } else {
            return args[0]
          }
        }
      }

    , random = {
        // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
        float: function (min, max) {
          return Math.random() * (max - min) + min
        }

        // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
      , int: function (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min
        }

      , bit: function () {
          return random.int(0, 1)
        }

      , sample: function (arr) {
          return arr[random.int(0, arr.length-1)]
        }
      }

    , util = {
        audio: audio
      , array: array
      , is: is
      , obj: obj
      , random: random
      }

  util.obj.clone = util.obj.cloneWith
  util.obj.copy = util.obj.copyWith

  if (typeof module === 'undefined') {
    composer.define('util', 'util', util)
  } else {
    module.exports = util
  }
})()


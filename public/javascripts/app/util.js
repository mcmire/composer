'use strict'

window.composer || (window.composer = {})

composer.util = {
  audio: {
    // http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
    loadBuffers: function (audioContext, urls, callback) {
      var buffers = []
        , numLoaded = 0
      $.v.each(urls, function (url, i) {
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

, arr: {
    indexBy: function (array, key) {
      var hash = {}
      $.v.each(array, function (obj) {
        hash[obj[key]] = obj
      })
      return hash
    }

  , groupBy: function (array, key) {
      var hash = {}
      $.v.each(array, function (obj) {
        (obj[key] in hash) || obj[key] = []
        hash[obj[key]].push(obj)
      })
      return hash
    }
  }

, obj: {
    isPlainObject: function (obj) {
      return (typeof obj === 'object' && !Array.isArray(obj))
    }
  }
}

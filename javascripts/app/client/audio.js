'use strict'

composer.audio = (function () {
  var v = valentine

    , util = composer.util

    , SAMPLE_NAMES = ['hic', 'hio', 'kick', 'snare', 'ticu', 'ticd']

    , $body = $(document.body)

    , samplesByName
    , isLoaded = false
    , audioContext
    , masterNode

    , load = function (fn) {
        setupAudioContext()
        loadSamples(function() {
          $body.removeClass('audio-loading')
          fn()
        })
        return this
      }

    , getAudioContext = function () {
        return audioContext
      }

    , connectNewSample = function (sample) {
        // We have to create a brand new AudioBufferSourceNode object because
        // once it plays once, we can't replay it. From the spec:
        //
        // > Once an AudioBufferSourceNode has reached the FINISHED state it
        // > will no longer emit any sound. Thus start() and stop() may not be
        // > issued multiple times for a given AudioBufferSourceNode.
        //
        var node = audioContext.createBufferSource()
        node.buffer = sample.buffer
        node.connect(masterNode)
        return node
      }

    , setupAudioContext = function () {
        // This is the AudioContext - everything points back here
        // audioContext.currentTime starts at 0 and increments indefinitely
        audioContext = new webkitAudioContext()
        // Have to connect something to the audioContext in order to make
        // currentTime increment along with system time, otherwise it will
        // remain at 0 until the first note node is connected. (Unfortunately,
        // this doesn't seem to be documented in the spec anywhere.)
        masterNode = audioContext.createGainNode()
        masterNode.connect(audioContext.destination)
      }

    , loadSamples = function (fn) {
        var samples = v.map(SAMPLE_NAMES, function (name) {
          return {name: name, url: "audio/"+name+".wav"}
        })
        samplesByName = util.arr.indexBy(samples, 'name')
        var samplesByUrl = util.arr.indexBy(samples, 'url')
        var sampleUrls = v.map(samples, function (s) { return s.url })

        util.audio.loadBuffers(audioContext, sampleUrls, function (buffers) {
          v.each(buffers, function (buffer) {
            var sample = samplesByUrl[buffer.url]
            sample.buffer = buffer.buffer
          })
          isLoaded = true
          fn()
        })
      }

    , lookupSample = function (name) {
        return samplesByName[name]
      }

  return {
    getAudioContext: getAudioContext
  , samplesByName: samplesByName
  , load: load
  , connectNewSample: connectNewSample
  , lookupSample: lookupSample
  }
})()


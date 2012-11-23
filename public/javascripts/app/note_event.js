'use strict'

window.composer || (window.composer = {})

composer.NoteEvent = function NoteEvent(track, sample, numFrames, isOn) {
  $.v.extend(this, {
    sample: sample
  , numFrames: numFrames
  , isOn: isOn
  })
}


#-------------------------------------------------------------------------------
# A lot of this code was taken from:
# * http://chromium.googlecode.com/svn/trunk/samples/audio/shiny-drum-machine.html
#
# Also see:
# * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
#-------------------------------------------------------------------------------

"use strict"

class Player
  SAMPLE_NAMES = ['hic', 'hio', 'kick', 'snare']

  # This is actually this equation:
  #
  # 1/2^(log_2(x)-2)
  # which is y = 1/2^(x-3) replacing x for log_2(x)+1 which is the inverse of
  # x = 2^(y-1)
  #
  DURATION_TO_BEATS =
    1: 4
    2: 2
    4: 1
    8: 0.5
    16: 0.25

  constructor: (@composer, opts) ->
    @samples = ({name: name, url: "samples/#{name}.wav"} for name in SAMPLE_NAMES)
    @samplesByName = indexBy(@samples, 'name')
    @samplesByUrl = indexBy(@samples, 'url')

    @scheduledNoteEvents = []
    @queuedNoteEvents = []
    @startTime = new Date()

    @_setupAudio => @play() if @autoplay

  add: (noteEventGroups) ->
    if @isPlaying
      @schedule(noteEventGroups)
    else
      @queue(noteEventGroups)

  schedule: (noteEventGroups) ->
    for noteEventGroup in noteEventGroups
      noteEventGroup.schedule()
      @scheduledNoteEventGroups.push(noteEventGroup)

  queue: (noteEventGroups) ->
    @queuedNoteEvents.concat(noteEventGroups)

  start: ->
    @composer.checkAudioLoaded()
    @isPlaying = true
    @_scheduleQueued()

  stop: ->
    @isPlaying = false
    @_unscheduleScheduled()

  calculateSequenceTimes: (noteEventGroups) ->
    @timeLength = 0
    for noteEventGroup in noteEventGroups
      @timeLength += noteEventGroup.timeLength
    { timeLength: @timeLength }

  connectNewSample: (sample) ->
    # We have to create a brand new AudioBufferSourceNode object because once
    # it plays once, we can't replay it. From the spec:
    #
    # > Once an AudioBufferSourceNode has reached the FINISHED state it will
    # > no longer emit any sound. Thus start() and stop() may not be issued
    # > multiple times for a given AudioBufferSourceNode.
    #
    node = @audioContext.createBufferSource()
    node.buffer = sample.buffer
    node.connect(@masterNode)
    return node

  _checkAudioLoaded: ->
    if not @composer.audioLoaded
      console.error "Audio isn't loaded yet, can't play!"
      return

  _setupAudio: (fn) ->
    # This is the AudioContext - everything points back here
    # audioContext.currentTime starts at 0 and increments indefinitely
    @audioContext = new webkitAudioContext()
    # Have to connect something to the audio audioContext in order to make
    # currentTime increment along with system time, otherwise it will remain
    # at 0 until the first note node is connected. (Unfortunately, this
    # doesn't seem to be documented in the spec anywhere.)
    @masterNode = @audioContext.createGainNode()
    @masterNode.connect(@audioContext.destination)

    sampleUrls = (s.url for s in @samples)
    loadAudioBuffers @audioContext, sampleUrls, (buffers) =>
      for buffer in buffers
        sample = @samplesByUrl[buffer.url]
        sample.buffer = buffer.buffer
      @audioLoaded = true
      fn?()

  _scheduleQueued: ->
    while (noteEventGroup = @queuedNoteEventGroups.shift())
      noteEventGroup.schedule()

  _unscheduleScheduled: ->
    while (noteEventGroup = @scheduledNoteGroups.shift())
      noteEventGroup.unschedule()


# Two concepts:
#
# sequence - The note events which comprise the loop.
# buffer   - Since the sequence has to be scheduled ahead of time, and to
#            give us time to schedule the next loop of the sequence, the
#            sequence is buffered. The buffer is at least equal to the
#            the buffer time.
#
# Three scenarios here:
#
# sequence length < buffer time:
#   .--------- #1 -----------.-------- #2 ---------.
#   |''``````````*```:```````|````````:````````````|```:
#   |____________*___:_______|________:____________|___:
#   0s              1s               2s                3s
#                ^-- schedule next buffer here
#   `------------ buffer -------------'
#   In this case the buffer consists of multiple instances of the sequence,
#   enough to fill the buffer time. For example, assume the buffer time is 2
#   seconds. If the sequence length is 1.4 seconds, then the buffer size is
#   2 sequences for a total of 2.8 seconds. We schedule the next buffer a
#   little more than midway through the current buffer.
#
# sequence length > buffer time:
#   .------------------ #1 -----------------.------- #2 ----------------
#   |''``*```````````:````````````````:`````|``````````:
#   |____*___________:________________:_____|__________:
#   0s              1s               2s                3s
#   `------------ buffer -------------'
#        ^--- schedule next buffer here
#   In this case we just schedule the next buffer at this buffer's end time
#   less the buffer length, subtracting the current time from this timestamp
#   to get a relative time.
#
# sequence length == buffer length:
#   .-------------- #1 ---------------.------- #2 ----------------
#   *''``````````````:````````````````|````````````````:
#   *________________:________________|________________:
#   0s              1s               2s                3s
#   ^--- schedule next buffer here??
#   `------------ buffer -------------'
#   In this case we need to just schedule 2 buffers at time 0.
#
class Looper
  # This is basically the negative amount of time from the end of this
  # sequence that the next sequence will be scheduled. It also governs how
  # many sequences are scheduled (schedule as many sequences that add up to
  # this buffer time).
  BUFFER_TIME = 2  # seconds
  BUFFER_TIME_MS = BUFFER_TIME * 1000

  initialize: (@sequence) ->
    @player = new Player

  setBpm: (bpm) ->
    @player.setBpm()
    @_stopTimer()
    @_startTimer()

  start: ->
    @isRunning = true
    @scheduledNoteEventGroups = []
    @_startTimer()

  _startTimer: ->
    $.v.extend @sequence, @player.calculateSequenceTimes(@sequence)
    @_calculateTimes()
    @_scheduleNoteEventGroups()
    fn = =>
      @timer = setInterval (=> @_scheduleNoteEventGroups()), BUFFER_TIME_MS
    if BUFFER_TIME == @sequence.timeLength
      @_scheduleNextNoteEventGroups()
      fn()
    else
      lastNoteEventGroup = @scheduledNoteEventGroups[@scheduledNoteEventGroups.length-1]
      currentTime = (new Date()).getTime()
      timeToWait = lastNoteEventGroup.endTime - BUFFER_TIME_MS - currentTime
      setTimeout(fn, timeToWait)

  _scheduleNoteEventGroups: ->
    if not @isRunning
      @_unscheduleNoteEventGroups()
      return
    @_removeFinishedNoteEventGroups()
    @player.schedule(@sequence)

  _unscheduleScheduledNoteEventGroups: ->
    for noteEventGroups in @scheduledNoteEventGroups
      noteEventGroup.unschedule()

  _removeFinishedNoteEventGroups: ->
    currentTime = @audioContext.currentTime
    i = 0
    loop
      break if @scheduledNoteEventGroups[i].audioContextStartTime >= currentTime
      i++
    if i > 0
      @scheduledNoteEventGroups = @scheduledNoteEventGroups[i..-1]

  _debug: (diff) ->
    seq = @scheduledNoteEventGroups[@scheduledNoteEventGroups.length-1]
    console.log "Current time: #{@audioContext.currentTime}"
    console.log "Number of sequences: #{@scheduledNoteEventGroups.length}"
    if @scheduledNoteEventGroups.length
      console.log "First scheduled sequence start time: #{@scheduledNoteEventGroups[@scheduledNoteEventGroups.length-1].audioContextStartTime}"
      console.log "Last scheduled sequence end time: #{@scheduledNoteEventGroups[0].audioContextEndTime}"
    console.log "diff: #{diff}"
    console.log "---"

#---

# A Sequence represents a pattern of note events (actually NoteEventGroups) that
# may be repeated over and over.
#
# Properties:
#
# composer              - The composer POJO.
# audioContext          - The AudioContext object that manages audio.
# eventGroups           - The Array of NoteEventGroup objects in the sequence,
#                         in order of increasing time.
# audioContextStartTime - The Float time that this sequence starts, in number
#                         of seconds since the audio context was created.
# audioContextEndTime   - The Float time that this sequence ends, in number
#                         seconds since the audio context was created.
# timeLength            - The Float number of seconds that this sequence
#                         lasts.
#
class Sequence
  constructor: (@composer, eventGroups=[]) ->
    @audioContext = @composer.audioContext
    @eventGroups = []
    @add(eventGroup) for eventGroup in eventGroups

  clone: ->
    eventGroups = (eventGroup.clone() for eventGroup in @eventGroups)
    new Sequence(@composer, eventGroups)

  add: (eventGroup) ->
    eventGroup.sequence = this
    @eventGroups.push(eventGroup)

  scheduledAt: (startTime) ->
    @clone().scheduleAt(startTime)

  scheduleAt: (startTime) ->
    @startAt(startTime)
    @schedule()
    return this

  schedule: ->
    eventGroup.scheduleAll() for eventGroup in @eventGroups

  unschedule: ->
    eventGroup.unscheduleAll() for eventGroup in @eventGroups

  startAt: (audioContextTime) ->
    # XXX: times needs to be relative until events are scheduled?
    for eventGroup in @eventGroups
      eventGroup.audioContextStartTime = audioContextTime + eventGroup.time
      eventGroup.audioContextEndTime = eventGroup.audioContextStartTime + eventGroup.timeLength
    @audioContextStartTime = @eventGroups[0].audioContextStartTime
    @audioContextEndTime   = @eventGroups[@eventGroups.length-1].audioContextEndTime
    @timeLength            = @audioContextEndTime - @audioContextStartTime

  debug: ->
    for eventGroup, i in @eventGroups
      console.log "NoteEvent ##{i}: time=#{eventGroup.time} acst=#{eventGroup.audioContextStartTime} timeLength=#{eventGroup.timeLength}"
      for event in eventGroup.events
        console.log "- #{event.sample.name}: time=#{event.time} len=#{event.length}"

# An NoteEventGroup is a collection of events in a known sequence of events that
# share the same time.
#
# Properties:
#
# sequence   - The Sequence that this NoteEventGroup belongs to.
# composer   - The composer POJO.
# time       - The Integer time that events in this group should be scheduled;
#              the number of seconds since the first event group in the
#              sequence.
# events     - An Array of POJO: the events in this group. Each object should
#              have three properties: 'sample', 'time', and 'length'. See
#              the definition of NoteEvent for what these are.
# timeLength - The Integer number of seconds of the longest event in this
#              event group.
#
class NoteEventGroup
  constructor: (@parent, @time, events=[]) ->
    @timeLength = 0
    @events = []
    @add(event) for event in events

  getAudioContextStartTime: ->
    @parent.audioContextStartTime

  clone: ->
    events = (event.clone() for event in @events)
    eventGroup = new NoteEventGroup(@composer, @time, events)

  add: (event) ->
    unless event instanceof NoteEvent
      event = new NoteEvent(this,
        event.sample,
        event.time,
        event.length
      )
    event.eventGroup = this
    @events.push(event)
    @timeLength = event.length if event.length > @timeLength

  # Schedule all of the events in this event group.
  #
  schedule: ->
    event.schedule() for event in @events

  # Prevent all of the events in this event group from generating sound.
  #
  unschedule: ->
    event.unschedule() for event in @events

# An NoteEvent represents a note (technically, a sample) that turns on or off at
# a specific time.
#
# Properties:
#
# eventGroup   - The NoteEventGroup where this NoteEvent belongs.
# composer     - The composer POJO.
# audioContext - The AudioContext object that manages audio.
# sample       - A POJO that represents a waveform. It has a 'source' property
#                which is a AudioBufferSourceNode object within the W3C Web
#                Audio API.
# time         - The Float time in seconds since the sequence started;
#                the event will be executed when this time is reached.
# length       - The Float length in seconds of this event.
#
class NoteEvent
  constructor: (@eventGroup, @sample, @time, @length) ->
    @composer = @eventGroup.composer
    @audioContext = @composer.audioContext

  clone: ->
    new NoteEvent(@eventGroup, @sample, @time, @length)

  schedule: ->
    # XXX: time needs to be relative until we get to this point?
    ctxTime = @eventGroup.getAudioContextStartTime() + @time
    @node = @composer.connectNewSample(@sample)
    console.log "scheduling #{@sample.name} at #{ctxTime}"
    @_start(ctxTime)
    @_stop(ctxTime + @length)

  unschedule: ->
    # node.playbackState isnt 2  # i.e. playing
    # XXX: will this work if the node is unscheduled?
    @_stop(0) if @node  # immediately

  _start: (time) ->
    # deal with recent changes to the Web Audio API
    method = if 'start' in @node then 'start' else 'noteOn'
    @node[method](time)

  _stop: (time) ->
    # deal with recent changes to the Web Audio API
    method = if 'stop' in @node then 'stop' else 'noteOff'
    @node[method](time)

window.composer = do ->
  NUMBER_OF_SLOTS = 16
  BEATS_PER_SLOT = 1/16

  init: (bpm, opts) ->
    #@player = new Player(this, @sequences, autoplay: opts.autoplay)
    @canvas = canvas.init(this)
    @cursor = @canvas.getCursor()
    #$('#controls').addEventListener 'click', => @toggle()
    @setBpm(bpm)
    @isRunning = false
    @currentBeat = 0
    @_addEvents()
    return this

  getNumberOfSlots: -> NUMBER_OF_SLOTS
  getBeatsPerSlot: -> BEATS_PER_SLOT

  setBpm: (@bpm) ->
    # 120 bpm is 120 beats / 60 seconds or 0.5 per beat
    @spb = 60 / @bpm
    #@tickSize = @beatsToTime(1)
    @cursor.setBpm(bpm)

  # Convert some number of beats to time in seconds.
  #
  # Example:
  #
  #   # assume bpm = 120, so spb = 0.5
  #   beatsToTime(4)  #=> 2 seconds
  #
  beatsToTime: (n) -> n * @spb

  start: ->
    @isRunning = true
    #@player.start()
    @cursor.start()

  stop: ->
    @isRunning = false
    #@player.stop()
    @cursor.stop()

  toggle: ->
    if @isRunning then @stop() else @start()

  setToBeat: (number) ->
    #@player.setToBeat(number)
    @cursor.setToBeat(number)

  nextBeat: (number) ->
    @currentBeat = (@currentBeat + 1) % (NUMBER_OF_SLOTS + 1)
    @setToBeat(@currentBeat)

  prevBeat: (number) ->
    @currentBeat = if @currentBeat is 0 then NUMBER_OF_SLOTS else @currentBeat - 1
    @setToBeat(@currentBeat)

  setToStart: ->
    @currentBeat = 0
    @setToBeat(@currentBeat)

  setToEnd: ->
    @currentBeat = @numberOfSlots
    @setToBeat(@currentBeat)

  _addEvents: ->
    $(window).on 'keydown.composer', (e) =>
      switch e.keyCode
        when 36, 72  # home, H
          @setToStart()
        when 35, 76  # end, L
          @setToEnd()
        when 37, 74  # left arrow, J
          @prevBeat()
        when 39, 75  # right arrow, K
          @nextBeat()
        when 32  # space
          @toggle()

  _removeEvents: ->
    $(window).unbind '.composer'

#---

$(window).on 'load', ->
  composer.init(30)
  #composer.start()


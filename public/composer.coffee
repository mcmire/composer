
#-------------------------------------------------------------------------------
# A lot of this code was taken from:
# * http://chromium.googlecode.com/svn/trunk/samples/audio/shiny-drum-machine.html
#
# Also see:
# * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
#-------------------------------------------------------------------------------

"use strict"

$ = -> document.querySelector.apply(document, arguments)

#---

indexBy = (array, key) ->
  hash = {}
  hash[obj[key]] = obj for obj in array
  hash

groupBy = (array, key) ->
  hash = {}
  (hash[obj[key]] ||= []).push(obj) for obj in array
  hash

extend = (obj, obj2) ->
  obj[k] = v for k, v of obj2
  obj

isPlainObject = (obj) ->
  typeof obj is 'object' and not (obj instanceof Array)

#---

# http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
loadAudioBuffers = (audioContext, urls, callback) ->
  buffers = []
  numLoaded = 0
  for url, i in urls
    do (url, i) ->
      request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.responseType = 'arraybuffer'
      request.onload = =>
        audioContext.decodeAudioData request.response, (buffer) ->
          unless buffer
            console.error "error decoding file data: #{url}"
            return
          buffers[i] = {buffer: buffer, url: url}
          numLoaded++
          if numLoaded is urls.length
            console.log "All audio buffers are loaded"
            callback(buffers)
      request.onerror = ->
        console.error "BufferLoader: XHR error"
      request.send()

#---

class Player
  constructor: (@composer, @sequences) ->
    @loopIndex = 0

  play: ->
    @composer.checkAudioLoaded()
    @isPlaying = true
    @scheduledSequences = []
    @scheduleNextSequences()

  stop: ->
    @isPlaying = false

  setBpm: (bpm) ->
    # 120 bpm is 120 beats / 60 seconds or 0.5 per beat
    @bpm = bpm
    @spb = 60 / @bpm
    @tickSize = @beatsToTime(1)

  # Convert some number of beats to time in seconds.
  #
  # Example:
  #
  #   # assume bpm = 120, so spb = 0.5
  #   beatsToTime(4)  #=> 2 seconds
  #
  beatsToTime: (n) -> n * @spb

  # Here's how times work:
  #
  # audioContext.currentTime starts at 0 (when the audioContext was created) and
  # gets incremented indefinitely. The sequence, on the other hand, will reset
  # to 0 when the sequence repeats. The sequence, then, might look something
  # like this:
  #
  #   audioContext.currentTime: 0 10 20 30 40 50 60 70 80 ...
  #   sequenceContextStartTime: 0       30       60       ...
  #   event time:               0 10 20  0 10 20  0 10 20 ...
  #   event audioContext time:  0 10 20 30 40 50 60 70 80 ...
  #
  scheduleNextSequences: ->
    #console.log 'scheduleNextSequences'

    if not @isPlaying or @loopIndex is LOOP_LENGTH
      sequence.unschedule() for sequence in @scheduledSequences
      return

    currentTime = @audioContext.currentTime

    # Remove sequences that have ended
    i = @scheduledSequences.length-1
    while i >= 0
      if currentTime > @scheduledSequences[i].audioContextEndTime
        @scheduledSequences.splice(i, 1)
      i--

    if @scheduledSequences.length
      lastSequenceEndTime = @scheduledSequences[0].audioContextEndTime
    else
      lastSequenceEndTime = currentTime
    nudgedLastSequenceEndTime = lastSequenceEndTime - BUFFER_TIME
    distancePastLastSequence = currentTime - nudgedLastSequenceEndTime

    # Schedule the next sequences ahead of time
    if !@scheduledSequences.length or distancePastLastSequence >= 0
      startTime = 0
      while startTime < (BUFFER_TIME * 2)
        console.log 'scheduling a sequence'
        # build a new sequence here so we can adjust the bpm at runtime
        sequence = @_buildSequence().scheduleAt(lastSequenceEndTime + startTime)
        #sequence.debug()
        @scheduledSequences.unshift(sequence)
        startTime += sequence.timeLength

    #@_debug(distancePastLastSequence)

    @loopIndex++ if LOOP_LENGTH > 0

    # Put execution of this same method on the browser's internal event queue --
    # it'll get executed when it gets a chance
    # http://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
    setTimeout('composer.scheduleNextSequences()', 0)

  _debug: (diff) ->
    seq = @scheduledSequences[@scheduledSequences.length-1]
    console.log "Current time: #{@audioContext.currentTime}"
    console.log "Number of sequences: #{@scheduledSequences.length}"
    if @scheduledSequences.length
      console.log "First scheduled sequence start time: #{@scheduledSequences[@scheduledSequences.length-1].audioContextStartTime}"
      console.log "Last scheduled sequence end time: #{@scheduledSequences[0].audioContextEndTime}"
    console.log "diff: #{diff}"
    console.log "---"

window.composer = do ->
  c = {}

  # A Sequence represents a pattern of note events (actually EventGroups) that
  # may be repeated over and over.
  #
  # Properties:
  #
  # composer              - The composer POJO.
  # audioContext          - The AudioContext object that manages audio.
  # eventGroups           - The Array of EventGroup objects in the sequence,
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
        console.log "Event ##{i}: time=#{eventGroup.time} acst=#{eventGroup.audioContextStartTime} timeLength=#{eventGroup.timeLength}"
        for event in eventGroup.events
          console.log "- #{event.sample.name}: time=#{event.time} len=#{event.length}"

  # An EventGroup is a collection of events in a known sequence of events that
  # share the same time.
  #
  # Properties:
  #
  # sequence   - The Sequence that this EventGroup belongs to.
  # composer   - The composer POJO.
  # time       - The Integer time that events in this group should be scheduled;
  #              the number of seconds since the first event group in the
  #              sequence.
  # events     - An Array of POJO: the events in this group. Each object should
  #              have three properties: 'sample', 'time', and 'length'. See
  #              the definition of Event for what these are.
  # timeLength - The Integer number of seconds of the longest event in this
  #              event group.
  #
  class EventGroup
    constructor: (@composer, @time, events=[]) ->
      @timeLength = 0
      @events = []
      @add(event) for event in events

    clone: ->
      events = (event.clone() for event in @events)
      eventGroup = new EventGroup(@composer, @time, events)

    add: (event) ->
      unless event instanceof Event
        event = new Event(this,
          event.sample,
          event.time,
          event.length
        )
      event.eventGroup = this
      @events.push(event)
      @timeLength = event.length if event.length > @timeLength

    # Schedule all of the events in this event group.
    #
    scheduleAll: ->
      event.schedule() for event in @events

    # Prevent all of the events in this event group from generating sound.
    #
    unscheduleAll: ->
      event.unschedule() for event in @events

  # An Event represents a note (technically, a sample) that turns on or off at a
  # specific time.
  #
  # Properties:
  #
  # eventGroup   - The EventGroup where this Event belongs.
  # composer     - The composer POJO.
  # audioContext - The AudioContext object that manages audio.
  # sample       - A POJO that represents a waveform. It has a 'source' property
  #                which is a AudioBufferSourceNode object within the W3C Web
  #                Audio API.
  # time         - The Float time in seconds since the sequence started;
  #                the event will be executed when this time is reached.
  # length       - The Float length in seconds of this event.
  #
  class Event
    constructor: (@eventGroup, @sample, @time, @length) ->
      @composer = @eventGroup.composer
      @audioContext = @composer.audioContext

    clone: ->
      new Event(@eventGroup, @sample, @time, @length)

    schedule: ->
      # XXX: time needs to be relative until we get to this point?
      ctxTime = @eventGroup.sequence.audioContextStartTime + @time
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

  songGenerator =
    generate: ->
      @sequences = []
      @seqLength = 1
      @timeLength = 4

      d = new Date()
      loop
        @generateSequence()
        break if @seqLength is 16
        @seqLength *= 2
        @timeLength /= 2
      @removeSymmetricalSequences()
      d2 = new Date()
      console.log "Time taken: #{d2 - d}"

      return @sequences

    generateSequence: ->
      # Let's let binary math do the work for us!
      # Here's kind of how this works:
      #
      # 2x1 - 0, 1 (len: 4)
      # 4x2 - 00, 01, 10, 11 (len: 2)
      # 8x4 - 0000, 0001 ... 1111 (len: 1)
      # 16x8 - 00000000, 00000001 ... 11111111 (len: 1/2)
      # 32x16 - 0000000000000000, 0000000000000001 ... 1111111111111111 (len: 1/4)
      #
      allEmpty = (0 for i in [0...@seqLength])
      allFull = (1 for i in [0...@seqLength])
      max = parseInt(allFull.join(""), 2)
      #console.log "@seqLength: #{@seqLength} , allEmpty: #{JSON.stringify(allEmpty)} , allFull: #{JSON.stringify(allFull)} , max: #{max}"
      for i in [0..max]
        # generate a zero-padded binary version of i
        bits = i.toString(2).split('')
        len = allEmpty.length - bits.length
        bits = (if len is 0 then [] else allEmpty[0...len]).concat(bits)
        #console.log "bits:", bits
        time = 0
        sequence = []
        for bit in bits
          event = {on: bit, time: time, length: @timeLength}
          #console.log "on: #{bit}, time: #{time}, length: #{@timeLength}"
          sequence.push(event)
          time += @timeLength
        @sequences.push({sequence: sequence, bits: bits.join("")})
        #console.log "---"
      #console.log "==="

    removeSymmetricalSequences: ->
      console.log "# of sequences before: #{@sequences.length}"
      i = @sequences.length-1
      while i >= 0
        bits = @sequences[i].bits
        mid = (bits.length / 2) - 1
        # if it's symmetrical down the middle that means that the halfs of the
        # halfs are also symmetrical
        if bits[0..mid] is bits[mid+1..-1]
          @sequences.splice(i, 1)
        i--
      console.log "# of sequences after: #{@sequences.length}"

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

  # This is basically the negative amount of time from the end of this sequence
  # that the next sequence will be scheduled. It also governs how many sequences
  # are scheduled (schedule as many sequences that add up to this buffer time).
  BUFFER_TIME = 4  # seconds

  # How many times to loop
  LOOP_LENGTH = -1

  # Whether to play as soon as the page loads
  AUTOPLAY = false

  extend c,
    init: (patternOrSampleNames, bpm) ->
      if isPlainObject(patternOrSampleNames)
        @pattern = patternOrSampleNames
        sampleNames = (k for k, v of @pattern)
      else
        sampleNames = patternOrSampleNames

      @samples = ({name: name, url: "samples/#{name}.wav"} for name in sampleNames)
      @samplesByName = indexBy(@samples, 'name')
      @samplesByUrl = indexBy(@samples, 'url')

      @sequences = songGenerator.generate()

      throw 'nah'

      @player = new Player(this, @sequences)
      @player.setBpm(bpm)

      @setupAudio =>
        @play() if AUTOPLAY

      $('#controls').addEventListener 'click', => @toggle()

      return this

    checkAudioLoaded: ->
      if not @composer.audioLoaded
        console.error "Audio isn't loaded yet, can't play!"
        return

    setupAudio: (fn) ->
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

    play: ->
      @player.play()

    stop: ->
      @player.stop()

    toggle: ->
      if @player.isPlaying
        @play()
      else
        @stop()

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

    _buildSequenceFromPattern: (pattern) ->
      eventObjects = @_buildEventObjectsFromPattern(pattern)
      sequence = @_buildSequenceFromEventObjects(eventObjects)
      return sequence

    _buildEventObjectsFromPattern: (patternsBySampleName) ->
      eventObjectsBySampleName = {}
      for sampleName, pattern of patternsBySampleName
        sample = @samplesByName[sampleName]
        eventObjects = eventObjectsBySampleName[sampleName] = []
        for str in pattern.split(" ")
          type = str[0]
          dur = str.substr(1)
          isOn = switch type
            when 'x' then true
            when 'r' then false
          length = @player.beatsToTime(DURATION_TO_BEATS[dur])
          event =
            on: isOn
            sample: sample
            time: time
            length: length
          eventObjects.push(event)
      return eventObjectsBySampleName

    _buildSequenceFromEventObjects: (eventObjectsBySampleName) ->
      eventGroupsByTime = {}
      times = []
      for sampleName, events of eventObjectsBySampleName
        sample = @samplesByName[sampleName]
        time = 0
        for event in events
          if event.on
            unless eventGroup = eventGroupsByTime[event.time]
              eventGroup = new EventGroup(this, event.time)
              eventGroupsByTime[event.time] = eventGroup
              times.push(event.time)
            event.sample = sample
            eventGroup.add(event)
          time += event.length
      times.sort()
      eventGroups = (eventGroupsByTime[time] for time in times)
      new Sequence(this, eventGroups)

#---

window.addEventListener 'load', ->
  pattern = {
    'hic':   'x8 r8 x8 x8 x8 r8 x8 x8'
    'hio':   'r8 x8 r8 r8 r8 x8 r8 r8'
    'kick':  'x16 x16 r8 r8 r16 x8 x16 x8 r16 x8 x16'
    'snare': 'r4 x4 r4 x4'
  }
  bpm = 60
  composer.init(pattern, bpm)


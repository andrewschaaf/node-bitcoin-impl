
assert = require 'assert'
events = require 'events'

h = require('hexy').hexy

{ByteQueue, Unpacker, nullPad12, sha256_sha256_4} = require './helpers'
{unpack_net_addr, unpack32} = require './value_unpackers'


payload_parsers = {
  
  version: (u) ->
    x = {}
    x.version         = u.le32()
    x.services        = u.le64()
    x.timestamp       = u.le64()
    x.addr_me         = unpack_net_addr u
    x.addr_you        = unpack_net_addr u
    x.nonce           = u.raw 8
    x.sub_version_num = u.vardata()
    x.start_height    = u.le32()
    x
  
  verack: (u) ->
    {}
  
}

PADDED64_NAME_MAP = {}
for own k, f of payload_parsers
  k2 = nullPad12(new Buffer(k)).toString('base64')
  PADDED64_NAME_MAP[k2] = k
  payload_parsers[k2] = f
  delete payload_parsers[k]


exports.MessageParser = class MessageParser extends events.EventEmitter
  
  constructor: (expectedMagic, @conn) ->
    
    events.EventEmitter.call this
    
    @expectedMagic64 = expectedMagic.toString 'base64'
    @parseError = false
    @q = new ByteQueue
    
    if @conn
      @conn.on 'data', (data) => @push(data)
  
  push: (data) ->
    if not @parseError
      @q.push data
      @parse()
  
  parse: () ->
    
    # Message headers size: 20 if {version,verack}, else 24
    
    while @q.length >= 20
      
      if @q.peekrange(0, 4).toString('base64') != @expectedMagic64
        @parseError = true
        @emit 'parseError', new Error 'Unexpected magic'
        return
      
      commandPadded = @q.peekrange(4, 16)
      command64 = commandPadded.toString 'base64'
      commandName = PADDED64_NAME_MAP[command64]
      
      headerLength = if (commandName == 'version' or commandName == 'verack') then 20 else 24
      payloadLength = unpack32 @q.peekrange(16, 20)
      
      if @q.length >= (headerLength + payloadLength)
        
        header = @q.popleft(headerLength)
        payload = @q.popleft(payloadLength)
        
        try
          if headerLength == 24
            payloadHash = header.slice(20, 24)
            assert.deepEqual sha256_sha256_4(payload), payloadHash
          f = payload_parsers[command64]
          assert.ok f
          x = f(new Unpacker payload)
          @emit 'command', commandName, x
          @emit commandName, x
        catch e
          @parseError = true
          @emit 'parseError', e
          return



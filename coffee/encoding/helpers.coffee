
{joinBuffers, max, min} = require './../util'


exports.EMPTY_BUFFER = EMPTY_BUFFER = new Buffer []
exports.IP_12 = new Buffer [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF]

exports.MAIN_MAGIC    = new Buffer [0xF9, 0xBE, 0xB4, 0xD9]
exports.TESTNET_MAGIC = new Buffer [0xFA, 0xBF, 0xB5, 0xDA]


exports.nullPad12 = (src) ->
  dest = new Buffer 12
  for i in [0...12]
    dest[i] = 0
  for i in [0...src.length]
    dest[i] = src[i]
  dest


exports.sha256_sha256_4 = (buf1) ->
  buf2 = new Buffer crypto.createHash('sha256').update(buf1).digest('base64'), 'base64'
  buf3 = new Buffer crypto.createHash('sha256').update(buf2).digest('base64'), 'base64'
  buf3.slice 0, 4


exports.ByteQueue = class ByteQueue
  
  constructor: () ->
    @length = 0
    @bufs = []
  
  push: (buf) ->
    len = buf.length
    if len > 0
      @length += len
      @bufs.push buf
  
  peekall: () ->
    joinBuffers @bufs
  
  peekrange: (gte, lt) ->
    len = lt - gte
    if lt > @length or len <= 0
      throw new Error "Invalid range"
    
    firstBuf = @bufs[0]
    if lt <= firstBuf.length
      firstBuf.slice gte, lt
    else
      throw new Error "TODO"
  
  popleft: (n) ->
    
    if n == 0
      return EMPTY_BUFFER
    
    if n > @length
      throw new Error "Invalid range"
    
    firstBuf = @bufs[0]
    firstBufLen = firstBuf.length
    if n == firstBufLen
      result = firstBuf
      @bufs = @bufs.slice(1)
    else if n <= firstBufLen
      result = firstBuf.slice 0, n
      @bufs[0] = firstBuf.slice n
    else
      throw new Error "TODO"
    
    @length -= n
    
    result


exports.Unpacker = class Unpacker
  
  constructor: (@_buf) ->
    @pos = 0
  
  raw: (n) ->    
    x = @_buf.slice @pos, @pos + n
    @pos += n
    x
  
  varint: () ->
    o1 = @raw(1)[0]
    return o1 if o1 < 0xFD
    return @le16() if o1 < 0xFE
    return @le32() if o1 < 0xFF
    return @le64()
  
  vardata: () ->
    len = @varint()
    @raw len
  
  le16: () ->
    i = @pos
    d = @_buf
    x = (
          (d[i]) +
          (d[i + 1] << 8))
    @pos += 2
    x
  
  be16: () ->
    i = @pos
    d = @_buf
    x = (
          (d[i + 1] << 8) +
          (d[i]))
    @pos += 2
    x
  
  le32: () ->
    i = @pos
    d = @_buf
    x = (
          (d[i]) +
          (d[i + 1] << 8) +
          (d[i + 2] << 16) +
          (d[i + 3] * 0x1000000))
    @pos += 4
    x
  
  le64: () ->
    i = @pos
    d = @_buf
    x = (
          (d[i]) +
          (d[i + 1] << 8) +
          (d[i + 2] << 16) +
          (d[i + 3] * 0x1000000) +
          (d[i + 4] * 0x100000000) +
          (d[i + 5] * 0x10000000000) +
          (d[i + 6] * 0x1000000000000) +
          (d[i + 7] * 0x100000000000000))
    @pos += 8
    x


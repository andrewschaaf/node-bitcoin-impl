


assert = require 'assert'
net = require 'net'


IPV4_REGEX = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/

exports.addr_buffer_from_conn = (conn) ->
  assert net.isIPv4 conn
  m = conn.remoteAddress.match IPV4_REGEX
  new Buffer [
    parseInt(m[1], 10)
    parseInt(m[2], 10)
    parseInt(m[3], 10)
    parseInt(m[4], 10)
  ]


exports.joinBuffers = joinBuffers = (bufs) ->
  size = 0
  for buf in bufs
    size += buf.length
  result = new Buffer size
  pos = 0
  for buf in bufs
    buf.copy result, pos
    pos += buf.length
  result


exports.max = (x, y) ->
  if x > y then x else y


exports.min = (x, y) ->
  if x < y then x else y


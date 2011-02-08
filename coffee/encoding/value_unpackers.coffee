
assert = require 'assert'
{IP_12} = require './helpers'

h = require('hexy').hexy

exports.unpack_net_addr = (u) ->
  x = {}
  x.services = u.le64()
  console.log 'services', x.services
  ip12 = u.raw(12)
  console.log 'ip12', h ip12
  console.log h IP_12
  assert.deepEqual ip12, IP_12
  console.log 2
  x.ip = u.raw(4)
  x.port = u.be16()
  x


exports.unpack32 = (d) ->
  (
    (d[0]) +
    (d[1] << 8) +
    (d[2] << 16) +
    (d[3] * 0x1000000))

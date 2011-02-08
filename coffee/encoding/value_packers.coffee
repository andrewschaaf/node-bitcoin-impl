
assert = require 'assert'

{joinBuffers} = require './../util'
{IP_12} = require './helpers'



exports.pack16 = pack16 = (n) ->
  new Buffer [
    n & 0xFF
    (n >> 8) & 0xFF
  ]

exports.pack16be = pack16be = (n) ->
  new Buffer [
    (n >> 8) & 0xFF
    n & 0xFF
  ]

exports.pack32 = pack32 = (n) ->
  new Buffer [
    n & 0xFF
    (n >> 8) & 0xFF
    (n >> 16) & 0xFF
    n >>> 24
  ]

exports.pack32_be = pack32_be = (n) ->
  new Buffer [
    n >>> 24
    (n >> 16) & 0xFF
    (n >> 8) & 0xFF
    n & 0xFF
  ]

exports.pack64 = pack64 = (n) ->
  high = Math.floor(n / 0x100000000)
  low = n % 0x100000000
  new Buffer [
    (low) & 0xFF
    (low >> 8) & 0xFF
    (low >> 16) & 0xFF
    (low >>> 24) & 0xFF
    (high) & 0xFF
    (high >> 8) & 0xFF
    (high >> 16) & 0xFF
    (high >>> 24) & 0xFF
  ]

exports.pack_uint = pack_uint = (n) ->
  if n < 0xFD
    new Buffer [n]
  else if n < 0x10000
    new Buffer [
      0xFD
      n & 0xFF
      (n >> 8) & 0xFF
    ]
  else if n < 0x100000000
    new Buffer [
      0xFE
      n >>> 24
      (n >> 16) & 0xFF
      (n >> 8) & 0xFF
      n & 0xFF
    ]
  else
    joinBuffers [
      new Buffer [0xFF]
      pack64 n
    ]


exports.pack_net_addr = pack_net_addr = (x) ->
  assert.equal x.ip.length, 4
  joinBuffers [
    
    # u64 services
    pack64 x.services
    
    # ip
    IP_12, x.ip
    
    # u16 port
    pack16be x.port
  ]



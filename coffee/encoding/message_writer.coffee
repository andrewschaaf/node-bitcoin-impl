
assert = require 'assert'
crypto = require 'crypto'

{joinBuffers} = require './../util'
helpers = require './helpers'
{nullPad12, sha256_sha256_4} = helpers
{MAIN_MAGIC, EMPTY_BUFFER, IP_12} = helpers


{pack_uint, pack_net_addr, pack16, pack16be, pack32, pack32_be, pack64} = require './value_packers'


pack_inventory_payload = (x) ->
  bufs = [pack_uint x.inventory.length]
  for inv in x.inventory
    bufs.push(
      pack32(inv.type),
      inv.hash)
  joinBuffers bufs


pack_tx_ins = (arr) ->
  bufs = [pack_uint arr.length]
  for y in arr
    bufs.push(
      (          y.previous_output.hash)
      (pack32    y.previous_output.index)
      (pack_uint y.signature.length)
      (          y.signature)
      (pack32    y.sequence))
  joinBuffers bufs

pack_tx_outs = (arr) ->
  bufs = [pack_uint arr.length]
  for y in arr
    bufs.push(
      (pack64    y.value)
      (pack_uint y.pk_script.length)
      (          y.pk_script))
  joinBuffers bufs

pack_tx = (x) ->
    joinBuffers [
      pack32       x.version
      pack_tx_ins  x.ins
      pack_tx_outs x.outs
      pack32       x.lock_time
    ]


message_packers = {
  
  version: (x) ->
    joinBuffers [
      (pack32        x.version)
      (pack64        x.services)
      (pack64        x.timestamp)
      (pack_net_addr x.addr_me)
      (pack_net_addr x.addr_you)
      (              x.nonce)
      (pack_uint     x.sub_version_num.length)
      (              x.sub_version_num)
      (pack32        x.start_height)
    ]
  
  verack:  (x) -> EMPTY_BUFFER
  ping:    (x) -> EMPTY_BUFFER
  getaddr: (x) -> EMPTY_BUFFER
  
  addr: (x) ->
    bufs = [pack_uint x.addresses.length]
    for addr in x.addresses
      bufs.push(
        pack32(addr.timestamp),
        pack_net_addr(addr))
    joinBuffers bufs
  
  alert: (x) ->
    joinBuffers [
      (pack_uint x.message.length)
      (          x.message)
      (pack_uint x.signature.length)
      (          x.signature)
    ]
  
  inv:     pack_inventory_payload
  getdata: pack_inventory_payload
  
  getblocks: (x) ->
    bufs = []
    if x.version?
      bufs.push pack32 x.version
    bufs.push pack_uint x.start_hashes.length
    for hash in x.start_hashes
      bufs.push hash
    bufs.push x.stop_hash
    joinBuffers bufs
  
  tx: pack_tx
  
  block: (x) ->
    bufs = [
      (pack32    x.version)
      (          prev_block)
      (          merkle_root)
      (pack32    timestamp)
      (pack32    difficulty)
      (pack32    nonce)
      (pack_uint x.transactions.length)
    ]
    for tx in x.transactions
      bufs.push pack_tx tx
    joinBuffers bufs
  
  checkorder: (x) ->
    throw new Error "TODO"
  
  submitorder: (x) ->
    throw new Error "TODO"
  
  reply: (x) ->
    throw new Error "TODO"
}


NULL_PADDED_COMMAND_NAMES = {}
for own commandName of message_packers
  NULL_PADDED_COMMAND_NAMES[commandName] = nullPad12 new Buffer commandName


pack_message_header = (commandName, payload) ->
  magic = MAIN_MAGIC #TODO
  bufs = [
    magic
    NULL_PADDED_COMMAND_NAMES[commandName]
    pack32 payload.length
  ]
  if not (commandName == 'version' or commandName == 'verack')
    bufs.push sha256_sha256_4 payload
  joinBuffers bufs


exports.pack_messages = pack_messages = (messages) ->
  bufs = []
  for [commandName, payload] in messages
    if payload not instanceof Buffer
      f = message_packers[commandName]
      payload = f payload
    header = pack_message_header(commandName, payload)
    bufs.push(
      header
      payload)
  joinBuffers bufs


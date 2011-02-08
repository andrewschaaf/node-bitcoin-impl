
{MessageParser} = require './../encoding/message_parser'
{pack_messages} = require './../encoding/message_writer'
{MAIN_MAGIC} = require './../encoding/helpers'
h = require('hexy').hexy

hex_decode = (hex) ->
  new Buffer (for i in [0...(hex.length / 2)]
    parseInt(hex.substr(2 * i, 2), 16))


check = (hex) ->
  (t) ->
    p = new MessageParser MAIN_MAGIC
    buf = hex_decode hex
    p.on 'parseError', (e) ->
      console.log '*** parse error ***'
      throw e
    p.on 'command', (name, x) ->
      console.log 'parsed', name
      buf2 = pack_messages [[name, x]]
      try
        assert.deepEqual buf, buf2
      catch e
        console.log '------- example -------'
        console.log h buf
        console.log '------- enc dec example -------'
        console.log h buf2
      t.deepEqual buf, buf2
      t.finish()
    p.push buf

VERACK = 'F9BEB4D976657261636B00000000000000000000'
VERSION = 'F9BEB4D976657273696F6E0000000000550000009C7C00000100000000000000E615104D00000000010000000000000000000000000000000000FFFF0A000001DAF6010000000000000000000000000000000000FFFF0A000002208DDD9D202C3AB457130055810100'

module.exports =
  
  verack: check VERACK
  version: check VERSION



if module == require.main
  require('async_testing').run __filename, process.ARGV


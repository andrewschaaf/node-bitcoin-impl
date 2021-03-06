
assert = require 'assert'

{base58_encode, new_keypair, pubkey_to_address256} = require './../main'


module.exports =
  
  base58_encode: (t) ->
    f = (octets, result) ->
      t.deepEqual base58_encode(new Buffer octets), result
    f [], ""
    f [0], "1"
    f [1], "2"
    f [58], "21"
    f [0x0D, 0x24], "211"
    f [0x02, 0xFA, 0x28], "2111"
    f [0, 0, 1], "112"
    t.finish()
  
  new_keypair: (t) ->
    [priv, pub] = new_keypair()
    assert.equal priv.length, 279
    assert.equal pub.length, 65
    t.finish()
  
  pubkey_to_address256: (t) ->
    [priv, pub] = new_keypair()
    address256 = pubkey_to_address256 pub
    assert.equal address256.length, 25
    t.finish()



if module == require.main
  require('async_testing').run __filename, process.ARGV


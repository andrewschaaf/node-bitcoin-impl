
{new_keypair, pubkey_to_address256, base58_encode} = require './../build-cc/default/native'


exports.new_keypair = new_keypair
exports.pubkey_to_address256 = pubkey_to_address256
exports.base58_encode = base58_encode


exports.main = () ->
  opt = require('optimist').argv
  if opt['new-key']
    [priv, pub] = new_keypair()
    process.stdout.write((JSON.stringify {
      private64: priv.toString 'base64'
      public64: pub.toString 'base64'
      bitcoin_address: base58_encode(pubkey_to_address256(pub))
    }) + '\n')
  else
    console.log "Invalid args"
    process.exit 1


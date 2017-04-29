((() => {
  var base58_encode;
  var new_keypair;
  var pubkey_to_address256;
  var _ref;
  _ref = require('./../build-cc/default/native'), new_keypair = _ref.new_keypair, pubkey_to_address256 = _ref.pubkey_to_address256, base58_encode = _ref.base58_encode;
  exports.new_keypair = new_keypair;
  exports.pubkey_to_address256 = pubkey_to_address256;
  exports.base58_encode = base58_encode;
  exports.main = () => {
    var opt;
    var priv;
    var pub;
    var _ref;
    opt = require('optimist').argv;
    if (opt['new-key']) {
      _ref = new_keypair(), priv = _ref[0], pub = _ref[1];
      return process.stdout.write((JSON.stringify({
        private64: priv.toString('base64'),
        public64: pub.toString('base64'),
        bitcoin_address: base58_encode(pubkey_to_address256(pub))
      })) + '\n');
    } else {
      console.log("Invalid args");
      return process.exit(1);
    }
  };
})).call(this);

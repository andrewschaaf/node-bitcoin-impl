(function() {
  var n;
  n = require('./../build-cc/default/native');
  exports.new_keypair = n.new_keypair;
  exports.pubkey_to_address256 = n.pubkey_to_address256;
  exports.base58_encode = n.base58_encode;
}).call(this);

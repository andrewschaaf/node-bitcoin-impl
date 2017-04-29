((() => {
  var assert;
  var base58_encode;
  var new_keypair;
  var pubkey_to_address256;
  var _ref;
  assert = require('assert');
  _ref = require('./../main'), base58_encode = _ref.base58_encode, new_keypair = _ref.new_keypair, pubkey_to_address256 = _ref.pubkey_to_address256;
  module.exports = {
    base58_encode(t) {
      var f;
      f = (octets, result) => t.deepEqual(base58_encode(new Buffer(octets)), result);
      f([], "");
      f([0], "1");
      f([1], "2");
      f([58], "21");
      f([0x0D, 0x24], "211");
      f([0x02, 0xFA, 0x28], "2111");
      f([0, 0, 1], "112");
      return t.finish();
    },
    new_keypair(t) {
      var priv;
      var pub;
      var _ref;
      _ref = new_keypair(), priv = _ref[0], pub = _ref[1];
      assert.equal(priv.length, 279);
      assert.equal(pub.length, 65);
      return t.finish();
    },
    pubkey_to_address256(t) {
      var address256;
      var priv;
      var pub;
      var _ref;
      _ref = new_keypair(), priv = _ref[0], pub = _ref[1];
      address256 = pubkey_to_address256(pub);
      assert.equal(address256.length, 25);
      return t.finish();
    }
  };
  if (module === require.main) {
    require('async_testing').run(__filename, process.ARGV);
  }
})).call(this);

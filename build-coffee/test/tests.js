(function() {
  var assert, base58_encode, new_keypair, pubkey_to_address256, _ref;
  assert = require('assert');
  _ref = require('./../main'), base58_encode = _ref.base58_encode, new_keypair = _ref.new_keypair, pubkey_to_address256 = _ref.pubkey_to_address256;
  module.exports = {
    base58_encode: function() {
      var f;
      f = function(octets, result) {
        return assert.eql(base58_encode(new Buffer(octets)), result);
      };
      f([], "");
      f([0], "1");
      f([1], "2");
      f([58], "21");
      f([0x0D, 0x24], "211");
      f([0x02, 0xFA, 0x28], "2111");
      return f([0, 0, 1], "112");
    },
    new_keypair: function() {
      var priv, pub, _ref;
      _ref = new_keypair(), priv = _ref[0], pub = _ref[1];
      assert.equal(priv.length, 279);
      return assert.equal(pub.length, 65);
    },
    pubkey_to_address256: function() {
      var address256, priv, pub, _ref;
      _ref = new_keypair(), priv = _ref[0], pub = _ref[1];
      address256 = pubkey_to_address256(pub);
      return assert.equal(address256.length, 25);
    }
  };
}).call(this);

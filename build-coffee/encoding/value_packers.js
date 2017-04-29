((() => {
  var IP_12;
  var assert;
  var joinBuffers;
  var pack16;
  var pack16be;
  var pack32;
  var pack32_be;
  var pack64;
  var pack_net_addr;
  var pack_uint;
  assert = require('assert');
  joinBuffers = require('./../util').joinBuffers;
  IP_12 = require('./helpers').IP_12;
  exports.pack16 = pack16 = n => new Buffer([n & 0xFF, (n >> 8) & 0xFF]);
  exports.pack16be = pack16be = n => new Buffer([(n >> 8) & 0xFF, n & 0xFF]);
  exports.pack32 = pack32 = n => new Buffer([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, n >>> 24]);
  exports.pack32_be = pack32_be = n => new Buffer([n >>> 24, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF]);
  exports.pack64 = pack64 = n => {
    var high;
    var low;
    high = Math.floor(n / 0x100000000);
    low = n % 0x100000000;
    return new Buffer([low & 0xFF, (low >> 8) & 0xFF, (low >> 16) & 0xFF, (low >>> 24) & 0xFF, high & 0xFF, (high >> 8) & 0xFF, (high >> 16) & 0xFF, (high >>> 24) & 0xFF]);
  };
  exports.pack_uint = pack_uint = n => {
    if (n < 0xFD) {
      return new Buffer([n]);
    } else if (n < 0x10000) {
      return new Buffer([0xFD, n & 0xFF, (n >> 8) & 0xFF]);
    } else if (n < 0x100000000) {
      return new Buffer([0xFE, n >>> 24, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF]);
    } else {
      return joinBuffers([new Buffer([0xFF]), pack64(n)]);
    }
  };
  exports.pack_net_addr = pack_net_addr = x => {
    assert.equal(x.ip.length, 4);
    return joinBuffers([pack64(x.services), IP_12, x.ip, pack16be(x.port)]);
  };
})).call(this);

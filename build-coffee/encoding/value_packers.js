(function() {
  var IP_12, assert, joinBuffers, pack16, pack16be, pack32, pack32_be, pack64, pack_net_addr, pack_uint;
  assert = require('assert');
  joinBuffers = require('./../util').joinBuffers;
  IP_12 = require('./helpers').IP_12;
  exports.pack16 = pack16 = function(n) {
    return new Buffer([n & 0xFF, (n >> 8) & 0xFF]);
  };
  exports.pack16be = pack16be = function(n) {
    return new Buffer([(n >> 8) & 0xFF, n & 0xFF]);
  };
  exports.pack32 = pack32 = function(n) {
    return new Buffer([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, n >>> 24]);
  };
  exports.pack32_be = pack32_be = function(n) {
    return new Buffer([n >>> 24, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF]);
  };
  exports.pack64 = pack64 = function(n) {
    var high, low;
    high = Math.floor(n / 0x100000000);
    low = n % 0x100000000;
    return new Buffer([low & 0xFF, (low >> 8) & 0xFF, (low >> 16) & 0xFF, (low >>> 24) & 0xFF, high & 0xFF, (high >> 8) & 0xFF, (high >> 16) & 0xFF, (high >>> 24) & 0xFF]);
  };
  exports.pack_uint = pack_uint = function(n) {
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
  exports.pack_net_addr = pack_net_addr = function(x) {
    assert.equal(x.ip.length, 4);
    return joinBuffers([pack64(x.services), IP_12, x.ip, pack16be(x.port)]);
  };
}).call(this);

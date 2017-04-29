((() => {
  var IPV4_REGEX;
  var assert;
  var joinBuffers;
  var net;
  assert = require('assert');
  net = require('net');
  IPV4_REGEX = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/;
  exports.addr_buffer_from_conn = conn => {
    var m;
    assert(net.isIPv4(conn));
    m = conn.remoteAddress.match(IPV4_REGEX);
    return new Buffer([parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), parseInt(m[4], 10)]);
  };
  exports.joinBuffers = joinBuffers = bufs => {
    var buf;
    var pos;
    var result;
    var size;
    var _i;
    var _j;
    var _len;
    var _len2;
    size = 0;
    for (_i = 0, _len = bufs.length; _i < _len; _i++) {
      buf = bufs[_i];
      size += buf.length;
    }
    result = new Buffer(size);
    pos = 0;
    for (_j = 0, _len2 = bufs.length; _j < _len2; _j++) {
      buf = bufs[_j];
      buf.copy(result, pos);
      pos += buf.length;
    }
    return result;
  };
  exports.max = (x, y) => {
    if (x > y) {
      return x;
    } else {
      return y;
    }
  };
  exports.min = (x, y) => {
    if (x < y) {
      return x;
    } else {
      return y;
    }
  };
})).call(this);

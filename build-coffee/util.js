(function() {
  var IPV4_REGEX, assert, joinBuffers, net;
  assert = require('assert');
  net = require('net');
  IPV4_REGEX = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/;
  exports.addr_buffer_from_conn = function(conn) {
    var m;
    assert(net.isIPv4(conn));
    m = conn.remoteAddress.match(IPV4_REGEX);
    return new Buffer([parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), parseInt(m[4], 10)]);
  };
  exports.joinBuffers = joinBuffers = function(bufs) {
    var buf, pos, result, size, _i, _j, _len, _len2;
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
  exports.max = function(x, y) {
    if (x > y) {
      return x;
    } else {
      return y;
    }
  };
  exports.min = function(x, y) {
    if (x < y) {
      return x;
    } else {
      return y;
    }
  };
}).call(this);

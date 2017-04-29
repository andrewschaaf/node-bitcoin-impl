((() => {
  var IP_12;
  var assert;
  var h;
  assert = require('assert');
  IP_12 = require('./helpers').IP_12;
  h = require('hexy').hexy;
  exports.unpack_net_addr = u => {
    var ip12;
    var x;
    x = {};
    x.services = u.le64();
    console.log('services', x.services);
    ip12 = u.raw(12);
    console.log('ip12', h(ip12));
    console.log(h(IP_12));
    assert.deepEqual(ip12, IP_12);
    console.log(2);
    x.ip = u.raw(4);
    x.port = u.be16();
    return x;
  };
  exports.unpack32 = d => d[0] + (d[1] << 8) + (d[2] << 16) + (d[3] * 0x1000000);
})).call(this);

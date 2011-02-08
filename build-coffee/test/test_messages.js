(function() {
  var MAIN_MAGIC, MessageParser, VERACK, VERSION, check, h, hex_decode, pack_messages;
  MessageParser = require('./../encoding/message_parser').MessageParser;
  pack_messages = require('./../encoding/message_writer').pack_messages;
  MAIN_MAGIC = require('./../encoding/helpers').MAIN_MAGIC;
  h = require('hexy').hexy;
  hex_decode = function(hex) {
    var i;
    return new Buffer((function() {
      var _ref, _results;
      _results = [];
      for (i = 0, _ref = hex.length / 2; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push(parseInt(hex.substr(2 * i, 2), 16));
      }
      return _results;
    })());
  };
  check = function(hex) {
    return function(t) {
      var buf, p;
      p = new MessageParser(MAIN_MAGIC);
      buf = hex_decode(hex);
      p.on('parseError', function(e) {
        console.log('*** parse error ***');
        throw e;
      });
      p.on('command', function(name, x) {
        var buf2;
        console.log('parsed', name);
        buf2 = pack_messages([[name, x]]);
        try {
          assert.deepEqual(buf, buf2);
        } catch (e) {
          console.log('------- example -------');
          console.log(h(buf));
          console.log('------- enc dec example -------');
          console.log(h(buf2));
        }
        t.deepEqual(buf, buf2);
        return t.finish();
      });
      return p.push(buf);
    };
  };
  VERACK = 'F9BEB4D976657261636B00000000000000000000';
  VERSION = 'F9BEB4D976657273696F6E0000000000550000009C7C00000100000000000000E615104D00000000010000000000000000000000000000000000FFFF0A000001DAF6010000000000000000000000000000000000FFFF0A000002208DDD9D202C3AB457130055810100';
  module.exports = {
    verack: check(VERACK),
    version: check(VERSION)
  };
  if (module === require.main) {
    require('async_testing').run(__filename, process.ARGV);
  }
}).call(this);

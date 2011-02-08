(function() {
  var ByteQueue, MessageParser, PADDED64_NAME_MAP, Unpacker, assert, events, f, h, k, k2, nullPad12, payload_parsers, sha256_sha256_4, unpack32, unpack_net_addr, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  assert = require('assert');
  events = require('events');
  h = require('hexy').hexy;
  _ref = require('./helpers'), ByteQueue = _ref.ByteQueue, Unpacker = _ref.Unpacker, nullPad12 = _ref.nullPad12, sha256_sha256_4 = _ref.sha256_sha256_4;
  _ref2 = require('./value_unpackers'), unpack_net_addr = _ref2.unpack_net_addr, unpack32 = _ref2.unpack32;
  payload_parsers = {
    version: function(u) {
      var x;
      x = {};
      x.version = u.le32();
      x.services = u.le64();
      x.timestamp = u.le64();
      x.addr_me = unpack_net_addr(u);
      x.addr_you = unpack_net_addr(u);
      x.nonce = u.raw(8);
      x.sub_version_num = u.vardata();
      x.start_height = u.le32();
      return x;
    },
    verack: function(u) {
      return {};
    }
  };
  PADDED64_NAME_MAP = {};
  for (k in payload_parsers) {
    if (!__hasProp.call(payload_parsers, k)) continue;
    f = payload_parsers[k];
    k2 = nullPad12(new Buffer(k)).toString('base64');
    PADDED64_NAME_MAP[k2] = k;
    payload_parsers[k2] = f;
    delete payload_parsers[k];
  }
  exports.MessageParser = MessageParser = (function() {
    __extends(MessageParser, events.EventEmitter);
    function MessageParser(expectedMagic, conn) {
      this.conn = conn;
      events.EventEmitter.call(this);
      this.expectedMagic64 = expectedMagic.toString('base64');
      this.parseError = false;
      this.q = new ByteQueue;
      if (this.conn) {
        this.conn.on('data', __bind(function(data) {
          return this.push(data);
        }, this));
      }
    }
    MessageParser.prototype.push = function(data) {
      if (!this.parseError) {
        this.q.push(data);
        return this.parse();
      }
    };
    MessageParser.prototype.parse = function() {
      var command64, commandName, commandPadded, header, headerLength, payload, payloadHash, payloadLength, x, _results;
      _results = [];
      while (this.q.length >= 20) {
        if (this.q.peekrange(0, 4).toString('base64') !== this.expectedMagic64) {
          this.parseError = true;
          this.emit('parseError', new Error('Unexpected magic'));
          return;
        }
        commandPadded = this.q.peekrange(4, 16);
        command64 = commandPadded.toString('base64');
        commandName = PADDED64_NAME_MAP[command64];
        headerLength = commandName === 'version' || commandName === 'verack' ? 20 : 24;
        payloadLength = unpack32(this.q.peekrange(16, 20));
        if (this.q.length >= (headerLength + payloadLength)) {
          header = this.q.popleft(headerLength);
          payload = this.q.popleft(payloadLength);
          try {
            if (headerLength === 24) {
              payloadHash = header.slice(20, 24);
              assert.deepEqual(sha256_sha256_4(payload), payloadHash);
            }
            f = payload_parsers[command64];
            assert.ok(f);
            x = f(new Unpacker(payload));
            this.emit('command', commandName, x);
            this.emit(commandName, x);
          } catch (e) {
            this.parseError = true;
            this.emit('parseError', e);
            return;
          }
        }
      }
      return _results;
    };
    return MessageParser;
  })();
}).call(this);

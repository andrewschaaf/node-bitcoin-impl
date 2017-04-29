((() => {
  var EMPTY_BUFFER;
  var IP_12;
  var MAIN_MAGIC;
  var NULL_PADDED_COMMAND_NAMES;
  var assert;
  var commandName;
  var crypto;
  var helpers;
  var joinBuffers;
  var message_packers;
  var nullPad12;
  var pack16;
  var pack16be;
  var pack32;
  var pack32_be;
  var pack64;
  var pack_inventory_payload;
  var pack_message_header;
  var pack_messages;
  var pack_net_addr;
  var pack_tx;
  var pack_tx_ins;
  var pack_tx_outs;
  var pack_uint;
  var sha256_sha256_4;
  var _ref;
  var __hasProp = Object.prototype.hasOwnProperty;
  assert = require('assert');
  crypto = require('crypto');
  joinBuffers = require('./../util').joinBuffers;
  helpers = require('./helpers');
  nullPad12 = helpers.nullPad12, sha256_sha256_4 = helpers.sha256_sha256_4;
  MAIN_MAGIC = helpers.MAIN_MAGIC, EMPTY_BUFFER = helpers.EMPTY_BUFFER, IP_12 = helpers.IP_12;
  _ref = require('./value_packers'), pack_uint = _ref.pack_uint, pack_net_addr = _ref.pack_net_addr, pack16 = _ref.pack16, pack16be = _ref.pack16be, pack32 = _ref.pack32, pack32_be = _ref.pack32_be, pack64 = _ref.pack64;
  pack_inventory_payload = x => {
    var bufs;
    var inv;
    var _i;
    var _len;
    var _ref;
    bufs = [pack_uint(x.inventory.length)];
    _ref = x.inventory;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inv = _ref[_i];
      bufs.push(pack32(inv.type), inv.hash);
    }
    return joinBuffers(bufs);
  };
  pack_tx_ins = arr => {
    var bufs;
    var y;
    var _i;
    var _len;
    bufs = [pack_uint(arr.length)];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      y = arr[_i];
      bufs.push(y.previous_output.hash, pack32(y.previous_output.index), pack_uint(y.signature.length), y.signature, pack32(y.sequence));
    }
    return joinBuffers(bufs);
  };
  pack_tx_outs = arr => {
    var bufs;
    var y;
    var _i;
    var _len;
    bufs = [pack_uint(arr.length)];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      y = arr[_i];
      bufs.push(pack64(y.value), pack_uint(y.pk_script.length), y.pk_script);
    }
    return joinBuffers(bufs);
  };
  pack_tx = x => joinBuffers([pack32(x.version), pack_tx_ins(x.ins), pack_tx_outs(x.outs), pack32(x.lock_time)]);
  message_packers = {
    version(x) {
      return joinBuffers([pack32(x.version), pack64(x.services), pack64(x.timestamp), pack_net_addr(x.addr_me), pack_net_addr(x.addr_you), x.nonce, pack_uint(x.sub_version_num.length), x.sub_version_num, pack32(x.start_height)]);
    },
    verack(x) {
      return EMPTY_BUFFER;
    },
    ping(x) {
      return EMPTY_BUFFER;
    },
    getaddr(x) {
      return EMPTY_BUFFER;
    },
    addr(x) {
      var addr;
      var bufs;
      var _i;
      var _len;
      var _ref;
      bufs = [pack_uint(x.addresses.length)];
      _ref = x.addresses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        addr = _ref[_i];
        bufs.push(pack32(addr.timestamp), pack_net_addr(addr));
      }
      return joinBuffers(bufs);
    },
    alert(x) {
      return joinBuffers([pack_uint(x.message.length), x.message, pack_uint(x.signature.length), x.signature]);
    },
    inv: pack_inventory_payload,
    getdata: pack_inventory_payload,
    getblocks(x) {
      var bufs;
      var hash;
      var _i;
      var _len;
      var _ref;
      bufs = [];
      if (x.version != null) {
        bufs.push(pack32(x.version));
      }
      bufs.push(pack_uint(x.start_hashes.length));
      _ref = x.start_hashes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hash = _ref[_i];
        bufs.push(hash);
      }
      bufs.push(x.stop_hash);
      return joinBuffers(bufs);
    },
    tx: pack_tx,
    block(x) {
      var bufs;
      var tx;
      var _i;
      var _len;
      var _ref;
      bufs = [pack32(x.version), prev_block, merkle_root, pack32(timestamp), pack32(difficulty), pack32(nonce), pack_uint(x.transactions.length)];
      _ref = x.transactions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tx = _ref[_i];
        bufs.push(pack_tx(tx));
      }
      return joinBuffers(bufs);
    },
    checkorder(x) {
      throw new Error("TODO");
    },
    submitorder(x) {
      throw new Error("TODO");
    },
    reply(x) {
      throw new Error("TODO");
    }
  };
  NULL_PADDED_COMMAND_NAMES = {};
  for (commandName in message_packers) {
    if (!__hasProp.call(message_packers, commandName)) continue;
    NULL_PADDED_COMMAND_NAMES[commandName] = nullPad12(new Buffer(commandName));
  }
  pack_message_header = (commandName, payload) => {
    var bufs;
    var magic;
    magic = MAIN_MAGIC;
    bufs = [magic, NULL_PADDED_COMMAND_NAMES[commandName], pack32(payload.length)];
    if (!(commandName === 'version' || commandName === 'verack')) {
      bufs.push(sha256_sha256_4(payload));
    }
    return joinBuffers(bufs);
  };
  exports.pack_messages = pack_messages = messages => {
    var bufs;
    var f;
    var header;
    var payload;
    var _i;
    var _len;
    var _ref;
    bufs = [];
    for (_i = 0, _len = messages.length; _i < _len; _i++) {
      _ref = messages[_i], commandName = _ref[0], payload = _ref[1];
      if (!(payload instanceof Buffer)) {
        f = message_packers[commandName];
        payload = f(payload);
      }
      header = pack_message_header(commandName, payload);
      bufs.push(header, payload);
    }
    return joinBuffers(bufs);
  };
})).call(this);

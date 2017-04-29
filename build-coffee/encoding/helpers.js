((() => {
  var ByteQueue;
  var EMPTY_BUFFER;
  var Unpacker;
  var joinBuffers;
  var max;
  var min;
  var _ref;
  _ref = require('./../util'), joinBuffers = _ref.joinBuffers, max = _ref.max, min = _ref.min;
  exports.EMPTY_BUFFER = EMPTY_BUFFER = new Buffer([]);
  exports.IP_12 = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF]);
  exports.MAIN_MAGIC = new Buffer([0xF9, 0xBE, 0xB4, 0xD9]);
  exports.TESTNET_MAGIC = new Buffer([0xFA, 0xBF, 0xB5, 0xDA]);
  exports.nullPad12 = src => {
    var dest;
    var i;
    var _ref;
    dest = new Buffer(12);
    for (i = 0; i < 12; i++) {
      dest[i] = 0;
    }
    for (i = 0, _ref = src.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      dest[i] = src[i];
    }
    return dest;
  };
  exports.sha256_sha256_4 = buf1 => {
    var buf2;
    var buf3;
    buf2 = new Buffer(crypto.createHash('sha256').update(buf1).digest('base64'), 'base64');
    buf3 = new Buffer(crypto.createHash('sha256').update(buf2).digest('base64'), 'base64');
    return buf3.slice(0, 4);
  };
  exports.ByteQueue = ByteQueue = ((() => {
    function ByteQueue() {
      this.length = 0;
      this.bufs = [];
    }
    ByteQueue.prototype.push = function(buf) {
      var len;
      len = buf.length;
      if (len > 0) {
        this.length += len;
        return this.bufs.push(buf);
      }
    };
    ByteQueue.prototype.peekall = function() {
      return joinBuffers(this.bufs);
    };
    ByteQueue.prototype.peekrange = function(gte, lt) {
      var firstBuf;
      var len;
      len = lt - gte;
      if (lt > this.length || len <= 0) {
        throw new Error("Invalid range");
      }
      firstBuf = this.bufs[0];
      if (lt <= firstBuf.length) {
        return firstBuf.slice(gte, lt);
      } else {
        throw new Error("TODO");
      }
    };
    ByteQueue.prototype.popleft = function(n) {
      var firstBuf;
      var firstBufLen;
      var result;
      if (n === 0) {
        return EMPTY_BUFFER;
      }
      if (n > this.length) {
        throw new Error("Invalid range");
      }
      firstBuf = this.bufs[0];
      firstBufLen = firstBuf.length;
      if (n === firstBufLen) {
        result = firstBuf;
        this.bufs = this.bufs.slice(1);
      } else if (n <= firstBufLen) {
        result = firstBuf.slice(0, n);
        this.bufs[0] = firstBuf.slice(n);
      } else {
        throw new Error("TODO");
      }
      this.length -= n;
      return result;
    };
    return ByteQueue;
  }))();
  exports.Unpacker = Unpacker = ((() => {
    function Unpacker(_buf) {
      this._buf = _buf;
      this.pos = 0;
    }
    Unpacker.prototype.raw = function(n) {
      var x;
      x = this._buf.slice(this.pos, this.pos + n);
      this.pos += n;
      return x;
    };
    Unpacker.prototype.varint = function() {
      var o1;
      o1 = this.raw(1)[0];
      if (o1 < 0xFD) {
        return o1;
      }
      if (o1 < 0xFE) {
        return this.le16();
      }
      if (o1 < 0xFF) {
        return this.le32();
      }
      return this.le64();
    };
    Unpacker.prototype.vardata = function() {
      var len;
      len = this.varint();
      return this.raw(len);
    };
    Unpacker.prototype.le16 = function() {
      var d;
      var i;
      var x;
      i = this.pos;
      d = this._buf;
      x = d[i] + (d[i + 1] << 8);
      this.pos += 2;
      return x;
    };
    Unpacker.prototype.be16 = function() {
      var d;
      var i;
      var x;
      i = this.pos;
      d = this._buf;
      x = (d[i + 1] << 8) + d[i];
      this.pos += 2;
      return x;
    };
    Unpacker.prototype.le32 = function() {
      var d;
      var i;
      var x;
      i = this.pos;
      d = this._buf;
      x = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + (d[i + 3] * 0x1000000);
      this.pos += 4;
      return x;
    };
    Unpacker.prototype.le64 = function() {
      var d;
      var i;
      var x;
      i = this.pos;
      d = this._buf;
      x = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + (d[i + 3] * 0x1000000) + (d[i + 4] * 0x100000000) + (d[i + 5] * 0x10000000000) + (d[i + 6] * 0x1000000000000) + (d[i + 7] * 0x100000000000000);
      this.pos += 8;
      return x;
    };
    return Unpacker;
  }))();
})).call(this);

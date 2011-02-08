
{ByteQueue} = require './../encoding/helpers'


buf = (x) ->
  if x instanceof Buffer
    x
  else
    new Buffer x


module.exports = 
  
  onebuf: (t) ->
    q = new ByteQueue
    t.equal q.length, 0
    q.push buf 'foo bar'
    t.equal q.length, 7
    
    t.deepEqual q.peekrange(1, 2), buf 'o'
    t.deepEqual q.peekrange(1, 5), buf 'oo b'
    t.deepEqual q.peekrange(0, 7), buf 'foo bar'
    t.deepEqual q.popleft(1), buf 'f'
    t.deepEqual q.peekall(), buf 'oo bar'
    t.deepEqual q.popleft(1), buf 'o'
    t.deepEqual q.peekall(), buf 'o bar'
    t.deepEqual q.popleft(1), buf 'o'
    t.deepEqual q.peekall(), buf ' bar'
    t.deepEqual q.popleft(2), buf ' b'
    t.deepEqual q.peekall(), buf 'ar'
    t.deepEqual q.popleft(1), buf 'a'
    t.deepEqual q.peekall(), buf 'r'
    t.deepEqual q.popleft(1), buf 'r'
    t.deepEqual q.peekall(), buf ''
    t.finish()
  ###
  multibuf: (t) ->
    q = new ByteQueue
    t.equal q.length, 0
    q.push buf 'foo'
    q.push buf ' '
    q.push buf 'bar'
    t.equal q.length, 7
    t.deepEqual q.peekrange(1, 2), buf 'o'
    t.deepEqual q.peekrange(1, 5), buf 'oo b'
    t.deepEqual q.peekrange(0, 7), buf 'foo bar'
    t.deepEqual q.popleft(1), buf 'f'
    t.deepEqual q.peekall(), buf 'oo bar'
    t.deepEqual q.popleft(1), buf 'o'
    t.deepEqual q.peekall(), buf 'o bar'
    t.deepEqual q.popleft(1), buf 'o'
    t.deepEqual q.peekall(), buf ' bar'
    t.deepEqual q.popleft(2), buf ' b'
    t.deepEqual q.peekall(), buf 'ar'
    t.deepEqual q.popleft(1), buf 'a'
    t.deepEqual q.peekall(), buf 'ar'
    t.deepEqual q.popleft(1), buf 'r'
    t.deepEqual q.peekall(), buf ''

###


if module == require.main
  require('async_testing').run __filename, process.ARGV


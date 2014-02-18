node-repipe
===========

reconnect/remake streams that are piped to a single output stream

Any time you would like to make a best effort to retrieve a whole stream over a connection that may be interupted this is invaluable.

This is how i use it so i can restart my db server any time. 


```js

var repipe = require('repipe');
// make database connection and ensure it reconnects automatically
var multilevel ...

var s = through();
repipe(s,function(err,last,done){
  if(err && err.message != "unexpected disconnection") return done(err);
  // its the first stream or the stream was cut off before it emitted the end event
  // start the new read stream from where it left off..
  var key;
  if(last) key = last.key+"\x00";
  done(false,multilevel.createReadStream({start:key});
});

s.on('data',function(data){
  console.log(data);
});

s.on('end',function(){
  //yay!
})


```

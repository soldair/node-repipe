var test = require('tape');
var through = require('through');
var repipe = require('../')

test("can repipe",function(t){
  var result = [];
  var output = through(function(data){
    result.push(data);
    console.log('data',data)
  }).on('end',function(){
    t.deepEquals(result, [ '1: a', '1: b', '2: c', '2: d', '3: e' ],'should have gotten all of the data from all of the right streams');
    t.end();
  });


  var input;
  var i = 0;
  repipe(output,function(err,last,done){
    // if you can handle the error
    if(err && err.code != "disconnect") return done(err);

    // make the stream here.
    var id = ++i;
    input = through(function(data){
      this.queue(id+': '+data);
    });
    done(false,input);
  });

  var oinput = input;
  input.write('a');
  input.write('b');
  input.emit('error',_e('oh no','disconnect'));
  t.ok(oinput !== input,'made new stream after error');
  oinput = input;
  input.write('c');
  input.write('d'); 
  input.emit('error',_e('oh no2','disconnect'));
  t.ok(oinput !== input,'made new stream again after error');
  input.write('e'); 
  input.end();

});


function _e(msg,code){
  var e = new Error('msg');
  e.code = code;
  return e;
}


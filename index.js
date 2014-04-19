
module.exports = repipe;

function repipe(s,makeSource){
  function work(err,oldsource){
    oldsource = oldsource||{};
    makeSource(err,oldsource.last,function(err,source){
      if(err) return s.emit('error',err);

      // not returning a source is how you stop the repipe.
      if(!source) {
        var e = new Error('repipe. no source stream');
        e.code = "E_REPIPE";
        return s.emit('error',e);
      }
   
      resumeable(oldsource.last,source,s);

      source.on('error',function(err){ 
        work(err, source);
      })

      source.on('disconnect',function(last,err){
        work(err,source);
      });

    });
  }

  work();
}

// its kinda like pipe except everythig bubbles.
function resumeable(last,source,s){
  source.last = last;
  source.on('data',function(data){
    source.last = data;
    s.write(data);
  })

  var onPause = function(){
    source.pause();
  };

  var onDrain = function(){
    source.resume();
  };

  var onEnd = function(){
    source.end();
  };

  var cleanup = function(){
    s.removeListener('pause',onPause);
    s.removeListener('drain',onDrain);
    s.removeListener('end',onEnd);
  };

  s.on('pause',onPause);
  s.on('drain',onDrain);
  s.on('end',onEnd);

  source.on('error',function(){
    source._errored = true;
    cleanup();
  });
  source.on('end',function(){
    cleanup();
    if(!source._errored) {
      s.end();
    }
  })
  return s;
}

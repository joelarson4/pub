const { log, args, dateStuff, runCommand } = require('sweet-potato');

function Waiter(text, waitDisplay, waitMilliseconds) {
  log(waitDisplay)
  var id = (100 + Math.floor(Math.random() * 999));
  var counter = 0;
  var waitCharsOptions = [
    function(counter) { return ['@','#','!','$','%','*'][Math.floor(Math.random() * 6)]+['@','#','!','$','%','*'][Math.floor(Math.random() * 6)]+['@','#','!','$','%','*'][Math.floor(Math.random() * 6)]; },
    [ '** ', ' **', '  *', ' **', '** ', '*  ' ],
    [ '^  ', ' ^ ', '  ^', '  v', ' v ', 'v  '],
    [ '[#]', '[ ]',  '[#]', '[ ]',  '[#]', '[ ]',  '[#]', '[ ]',  '[#]', '[ ]',  '[#]', '(*)', '[#]', '[ ]'],
    [ '/  ',' / ','  /','  |','  \\',' \\ ','\\  ','|  '],
    [ '⎺  ','-  ','_  ','   ',' ⎺ ',' - ',' _ ','   ','  ⎺','  -','  _','   '],
    [ '   ', '=  ', '== ', '===', ' ==', '  =' ],
    function(counter) { return ['∙  ',' ∙ ','  ∙','∙∙ ',' ∙∙','∙ ∙','∙∙∙','   '][Math.floor(Math.random() * 8)]; },
    [ '.  ', '.: ', '.:!', '.: ', '.  ', '   '],
    function(counter) { return ['|',':','.'][Math.floor(Math.random() * 3)]+['|',':','.'][Math.floor(Math.random() * 3)]+['|',':','.'][Math.floor(Math.random() * 3)]; },
    function(counter) { return ['.  ',' . ','  .'][Math.floor(Math.random() * 3)]; },
    function(counter) { return ['⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','⌾△⌾','-△⌾','⌾△-','-△⌾','⌾△-','-△-'][Math.floor(Math.random() * 21)]; },
    function(counter) { return ['#  ',' # ','  #'][Math.floor(Math.random() * 3)]; },
    function(counter) { return Math.random().toString(36).toUpperCase().slice(4,7); },
    function(counter) { return ['_','⎺','-'][Math.floor(Math.random() * 3)]+['_','⎺','-'][Math.floor(Math.random() * 3)]+['_','⎺','-'][Math.floor(Math.random() * 3)]; },
    function(counter) { return ['∙  ',' ∙ ','  ∙'][Math.floor(Math.random() * 3)]; },
    function(counter) { return Math.random().toString(16).toUpperCase().slice(4,7); },
    function(counter) { return Math.random().toString(2).slice(4,7); },
    function(counter) { return Math.random().toString().slice(4,7); },
    function(counter) { return ['___','.__','_._','__.'][Math.floor(Math.random() * 4)]; },
    [ '=  ','== ','===','== ','=  ', '   '],
    [ '#_#', '#-#', '#‾#', '#-#' ],
    ['∙  ',' ∙ ','  ∙','   '],
    ['  ∙',' ∙ ','∙  ','   '],
    [')  ', ')) ', ')))', ' ))', '  )', '   ', '  (', ' ((', '(((', '(( ', '(  ', '   ',']  ', ']] ', ']]]', ' ]]', '  ]', '   ', '  [', ' [[', '[[[', '[[ ', '[  ', '   '],
    ['⇢  ',' ⇢ ', '  ⇢', '  ⇠', ' ⇠ ', '⇠  '],
    ['.  ',' . ', '  .', '  :', ' : ', ':  '],
    [ '>>>','>><','><<','<<<','><<','>><'],
    [ '  .', ' o.', 'Oo.', ' o.', '  .', '   '],
    [ '⎺#_', '-#-', '_#⎺', '-#-' ],
    [ '#  ','## ','###',' ##','  #','   '],
    [ '⎺  ','-  ','_  ',' _ ',' - ',' ⎺ ','  ⎺','  -','  _',' _ ',' - ',' ⎺ '],
    [ ' - ',' = ',' - ','- -','= =','- -'],
    [ '*  ',' * ','  *','  *',' * ','*  '],
    [ '_  ', ' _ ', '  _', '  |', '  ⎻', ' ⎻ ', '⎻  ', '|  '],
    [ '>  ', '-  ', ' - ', '  -', '  <', '  -', ' - ', '-  '],
    [ '/  ', '-  ', ' - ', ' \\ ', ' | ', ' / ', ' - ', '-  ', '\\  ', '|  '],
    [ '.  ', ' . ', '  .', ' . '],
    [ '>> ', ' >>', '  >', '   ', '>  '],
    [ 'O  ', ' o ', '  O', ' o '],
    [ '.  ', '.o ', '.oO', '.o ', '.  ', '   '],
    [ '   ', '  =', ' ==', '===', '== ', '=  ' ]
  ];
  waitChars = waitCharsOptions[isNaN(waitDisplay) || waitDisplay == null ? Math.floor(Math.random()* waitCharsOptions.length) : waitDisplay];

  //text += ' [' + id + ']  ';
  text += '  ';
  var baseText = text;
  if(baseText.length > 100) {
    baseText = baseText.substring(0, 100);
  }
  var backspaces = '\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b'.substring(0, baseText.length + 4);
  var tmo; 
  var stopped = true;

  this.go = function() {
    if(!tmo) {
      this.start();
    }
    stopped = false;
  }

  this.start = function() {
    stopped = false;
    if(tmo) {
      try {
        clearTimeout(tmo);
      } catch(e) { }
      tmo = null;
    }
    
    tmo = setInterval(function() {
      if(!stopped && tmo) {
        process.stdout.write(backspaces);
        counter++;
        var chars = typeof waitChars == 'function' ? waitChars(counter) : waitChars[counter % waitChars.length];
        process.stdout.write(baseText + chars + ' ');
        if(typeof waitDisplay == 'undefined' && (Math.random() < 0.003 || counter % 137 == 0)) {
          waitChars = waitCharsOptions[Math.floor(Math.random()* waitCharsOptions.length)];
        }
      }
    }, waitMilliseconds || 250);
    //log('tmo=' + tmo, id+ ' ' + text);
  }

  this.erase = function() {
    process.stdout.write(backspaces);
  }

  this.stop = function() {
    //if(!stopped) log('stopped waiter [' + id + ' = ' + baseText + ']');
    stopped = true;
    if(!tmo) return;
    try {
      //log('clearing ' + tmo, id + ' ' + text);
      clearTimeout(tmo);
      process.stdout.write(backspaces);
      process.stdout.write(baseText + ' ✘ \n');
    } catch(e) {
      //log(e);
      //log(e.stack);
    }
    tmo = null;
  } 
}


if(!module.parent) {
  log('testing from command line')
  var waiter = new Waiter('testing', args.display, args.waitMilliseconds);
  waiter.start();
  setTimeout(function() {
    waiter.stop();
  }, Number(args.seconds || 10) * 1000);
} else {
  module.exports = Waiter;
}

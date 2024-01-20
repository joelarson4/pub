var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
var fs = require('fs');
var _ = require('lodash');
const { Midi } = require('@tonejs/midi');


args.waitOnErrors();
args.declare('hanon', 'number', 1)
args.throwIfErrors();

var DIR = './midis/';
var fileName = 'hanon' + (100 + args.hanon).toString().substring(1) + '.mid';

const midiData = fs.readFileSync(`${DIR}${fileName}`);
const midi = new Midi(midiData);
var pairsByTicks = {};

midi.tracks.forEach(function(track) {
  track.notes.forEach(function(note) {
    var pair = pairsByTicks[note.ticks] = pairsByTicks[note.ticks] || [];
    pair.push(note.midi);
  });
});

var stringStarts = [
 { note: 'E', midi: 64 }, 
 { note: 'B', midi: 59 },
 { note: 'G', midi: 55 },
 { note: 'D', midi: 50 },
 { note: 'A', midi: 45 },
 { note: 'E', midi: 40 }
];

var output = [];
output.push('Hannon ' + args.hanon + ' in C, low');
buildSet(output, 6, 2, true, 0);
output.push('\n\n');
output.push('Hannon ' + args.hanon + ' in C, high');
buildSet(output, 12, 8, false, 0);
output.push('\n\n');
output.push('Hannon ' + args.hanon + ' in E, low');
buildSet(output, 6, 2, true, -7);
output.push('\n\n');
output.push('Hannon ' + args.hanon + ' in E, high');
buildSet(output, 12, 8, false, -7);
log(output.join('\n'))
fs.writeFileSync('./data/hanon-tab-' + args.hanon + '.txt', output.join('\n'));

function buildSet(output, maxFret, minFret, useMin, offs) {
  var phrases = [];
  var phrase = [];
  _.values(pairsByTicks).forEach(function(pair) {
    var useNote = Math[ useMin ? 'min' : 'max' ](pair[0], pair[1]);
    phrase.push({ midi: useNote - offs });
    if(phrase.length == 8) {
      if(_.find(phrase, function(play) { return play.midi < 40; })) {
        //too low
      } else {
        phrases.push(phrase);
      }
      phrase = [];
    }
  });

  //log(phrases);

  phrases.forEach(function(phrase) {
    var previous = null;
    phrase.forEach(function(play) {
      play.string = 5;
      play.fret = play.midi - stringStarts[play.string].midi;
      //if(play.fret < 0) { play.remove = true; return; }
      if(previous) {
        log([play.midi , previous.midi, Math.abs(play.midi - previous.midi)]);
      }
      var justOneDiffFudge = (previous && Math.abs(play.midi - previous.midi) == 1) ? 1 : 0;

      while(play.fret > maxFret + justOneDiffFudge && play.string > 0) {
        play.string--;
        play.fret = play.midi - stringStarts[play.string].midi;
      }

      previous = play;
    });
  });

  for(var pi = 0; pi < phrases.length; pi+=3) {
    renderPhrases(output, phrases.slice(pi, pi + 3));
  }

  function renderPhrases(output, phrases) {
    var fretBoard = [];
    stringStarts.forEach(function(string) {
      fretBoard.push([string.note ]);
    });

    phrases.forEach(function(phrase) {
      phrase.forEach(function(play, pi) {
        var ch = pi == 0 ? '・-' : '--';
        stringStarts.forEach(function(string, index) {
         if(play.string == index) {
           if(play.fret < 10) {
             fretBoard[index].push(ch + play.fret);
           } else {
             fretBoard[index].push(ch.charAt(0) + play.fret);
           }
         } else {
           fretBoard[index].push(ch + '-');
         }
        });    
      });
      /*stringStarts.forEach(function(string, index) {
       fretBoard[index].push('.');
      });*/
    });
    fretBoard.forEach(function(string) {
      output.push(string.join(''));
    });
    output.push('');
  }

}
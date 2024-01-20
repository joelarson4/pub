var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');
const midi = require('midi');



var stringStarts = [
 { note: 'A', midi: 69 },
 { note: 'E', midi: 64 }, 
 { note: 'C', midi: 60 },
 { note: 'G', midi: 55 }
];

var length = 13;
var dotPoints = {3:1, 5:1,7:1,10:1,12:1};
var dotRow = [];
for(var li = 0; li < length; li++) {
  if(dotPoints[li]) {
    if(li == 10) {
      dotRow.push(' .. ');
    } else {
      dotRow.push(' .  ');
    }
  } else {
    dotRow.push('    ');
  }
}

var activeNotes = {};

const input = new midi.Input();
input.on('message', (deltaTime, message) => {
  console.log(`m: ${message} d: ${deltaTime}`);
  if(message[0] == '144') {
    if(message[2] == '0') {
      delete activeNotes[message[1]];
    } else {
      activeNotes[message[1]] = 1;
    }
  }

  showNeck(_.keys(activeNotes));
});

input.openPort(0);



function showNeck(midiNotes) {
  //for(var i = 0; i < 50; i++) { log('');  }

  var stringOutput = [];
  stringStarts.forEach(function(string, index) {
    var stringArr = [ ' ' + string.note + ' |'];
    for(var li = 0; li < length - 1; li++) {
      if(dotPoints[li + 1] && index == 1) {
        stringArr.push('-.-|');
      } else {
        stringArr.push('---|');
      }
    }
    stringOutput.push(stringArr);
  });
  stringOutput.push(dotRow)

  midiNotes.forEach(function(midi) {
    stringStarts.forEach(function(string, index) {
      var off12 = midi % 12;
      var sff12 = string.midi % 12;
      if(sff12 > off12) {
        off12 += 12;
      }
      var fret = off12 - sff12;
      if(fret == 0) {
        stringOutput[index][fret] = ' ' + stringStarts[index].note + ' X';
      } else {
        stringOutput[index][fret] = '-◉-|';
      }

    });
  });


  log(stringOutput.map(function(s) { return s.join(''); }).join('\n'))
}

var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');

if (require.main === module) {
  var stringStarts = [
   { note: 'E', midi: 64 }, 
   { note: 'B', midi: 59 },
   { note: 'G', midi: 55 },
   { note: 'D', midi: 50 },
   { note: 'A', midi: 45 },
   { note: 'E', midi: 40 }
  ];

  var length = 13;
  var dotPoints = {5:1,7:1,9:1,12:1};
  paintNeck('Guitar', stringStarts, length, dotPoints);
} else {
  module.exports = paintNeck;
}



function paintNeck(name, stringStarts, length, dotPoints) {
  var out = [];
  var dotRow = ['  '];
  for(var li = 0; li < length; li++) {
    if(dotPoints[li]) {
      if(li == 12) {
        dotRow.push('•=•=');
      } else {
        dotRow.push('=•==');
      }
    } else {
      dotRow.push('====');
    }
  }


  var variants = ['', 'm', 'maj', 'maj7', 'm7', 'aug', 'dim', 'sus2', 'sus4', 'add2'];
  var chars = { 0: '◉', 1: '◎', 2: '◎', 3: '○', 4: '○' };

  for(var n = 0; n < 12; n++) {
    for(var v = 0; v < variants.length; v++) {
      var noteObj = pianissimo.note(n + 45);
      var noteName = noteObj.getRootName() + noteObj.getAlteration();
      var chordName = noteName + variants[v];

      out.push('');

      var nameLine = [];
      for(var ni = 0; ni < (2 + length)  * 4 / (3 + chordName.length); ni++) {
        nameLine.push(chordName);
      }
      out.push(nameLine.join(' ■ '));

      let chord = pianissimo.chord(chordName);
      var noteLine = [];
      chord.getNotes().forEach(function(note, noteIndex) {
        noteLine.push(chars[noteIndex] + ' ' + pianissimo.note(note.getMidiNumber()).getRoot()); //have to route this through these calls to avoid ##
      });
      noteLine = '  (' + noteLine.join('  +  ') + ')';
      out.push(noteLine)

      out.push('  ____________________________________________________')

      var c1 = stringStarts.length == 4 ? 1 : 2;
      var c2 = stringStarts.length == 4 ? 2 : 3;

      var stringOutput = [];
      stringStarts.forEach(function(string, index) {
        var stringArr = [ '  ' + string.note + '  |'];
        for(var li = 0; li < length - 1; li++) {
          if(li == 11 && dotPoints[li + 1] && index == c1) {
            stringArr.push('-◇-|');
          } else if(li == 11 && dotPoints[li + 1] && index == c2) {
            stringArr.push('-◇-|');
          } else if(dotPoints[li + 1] && index == c1) {
            stringArr.push('-▵-|');
          } else if(dotPoints[li + 1] && index == c2) {
            stringArr.push('-▿-|');
          } else {
            stringArr.push('---|');
          }
        }
        stringOutput.push(stringArr);
      });
      stringOutput.push(dotRow)

      chord.getNotes().forEach(function(note, noteIndex) {
        var midi = note.getMidiNumber();

        stringStarts.forEach(function(string, index) {
          var off12 = midi % 12;
          var sff12 = string.midi % 12;
          if(sff12 > off12) {
            off12 += 12;
          }
          var fret = off12 - sff12;
          if(fret == 0) {
            stringOutput[index][fret] = '  ' + stringStarts[index].note + ' ' + chars[noteIndex] + '|';
          } else {
            stringOutput[index][fret] = ' ' + chars[noteIndex] + ' |';
          }

        });
      });


      out.push(stringOutput.map(function(s) { return s.join(''); }).join('\n'))
    }
  }

  var pages = [];
  var page = { startChord: 'A', endChord: null, lines: [] };
  var linesPerChord = 6 + stringStarts.length;
  var pageBreakLine = 350;

  out.forEach(function(line, lineNumber) {
    if(page.lines.length >= pageBreakLine && line.indexOf('■') > -1) {
      var lastPage = page;
      pages.push(lastPage);
      var chord = justTheChord(line.split('■').pop().trim());
      page = { startChord: chord, endChord: null, lines: [] };

      for(var ln = lastPage.lines.length - 1; ln >= 0; ln--) {
        if(lastPage.lines[ln].indexOf('■') > -1) {
          var prevChord = justTheChord(lastPage.lines[ln].split('■').pop().trim());
          
          if(prevChord !== chord) {
            lastPage.endChord = prevChord;
            break;
          }
          page.lines.shift(lastPage.pop());
        }
      }
    }
    page.lines.push(line);
  });
  page.endChord = 'G#';
  pages.push(page);
  //return;

  pages.forEach(function(page, number) {
    page.lines.unshift('===== ' + name + ' Chord Map ' + page.startChord + ' to ' + page.endChord + '=====\n')
    log(page.lines.join('\n'));

    fs.writeFileSync('./data/' + name + '-' + page.startChord + '-neck.txt', page.lines.join('\n'));
  });
}

function justTheChord(chord) {
  return chord.split('aug')[0].split('maj')[0].split('dim')[0].split('sus')[0].split('add')[0].split('7')[0];
}
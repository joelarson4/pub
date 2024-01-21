var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');
var pChord = require('@patrady/chord-js').Chord;

var stringStarts = [
 { note: 'E', midi: 64 }, 
 { note: 'B', midi: 59 },
 { note: 'G', midi: 55 },
 { note: 'D', midi: 50 },
 { note: 'A', midi: 45 },
 { note: 'E', midi: 40 }
];

function getChordName(notes, fullNotes, sub) {
  notes = [].concat(notes);
  fullNotes = [].concat(fullNotes);
  //log({notes:notes, fullNotes: fullNotes})
  var chordName = null;
  try {
    chordName = pChord.for(notes.join(' ')).getName();
  } catch(e) {
    try {
      chordName = pianissimo.chord(fullNotes).getName();
    } catch(e2) {
      log(notes, 'notes')
      log(fullNotes,'fullNotes');
      log('-')
      throw e2;
    }
  }
  if(chordName && chordName !== 'cant find name') {
    return chordName + (true ? '~' : '');
  }
  notes.pop();
  fullNotes.pop();
  return getChordName(notes, fullNotes, true)
}

function parseFret(fret) {
  if(fret.toLowerCase() == 'x') { return 'x'; }  
  return parseInt(fret, 36)
}

function toFret(fret) {
  if(fret == 'x' || fret == 'X') { return 'x'; }
  return fret.toString(26).toUpperCase();
}

var noteNames = 'A,A#,B,C,C#,D,D#,E,F,F#,G,G#'.split(',');

function getPlayChordName(play, name) {
  var notes = [];
  var fullNotes = [];
  play.toUpperCase().split('').forEach(function(fret, index) {
    if(fret == 'X') { return; }
    fret = parseFret(fret);
    var midi = stringStarts[5 - index].midi + fret;

    var note = noteNames[(midi - 33) % 12];
    notes.push(note);
    fullNotes.push(pianissimo.note(midi));
  });

  var chordName = name || getChordName(notes, fullNotes)
  return chordName;
}

function getChordChart(play, name, spaceLength) {
  if(play.length !== 6) {
    log('play must be 6 chars long');
    return;
  }
  spaceLength = spaceLength || 12;

  var maxFret = 0;
  var minFret = 20;
  var notes = [];
  var fullNotes = [];
  play.toUpperCase().split('').forEach(function(fret, index) {
    if(fret == 'X') { return; }
    fret = parseFret(fret);
    if(fret > maxFret) maxFret = fret;
    if(fret < minFret && fret !== 0) minFret = fret;
  });

  var chordName = name || getPlayChordName(play, name);

  var out = [];

  var chordId = chordName + '            '.substring(0,spaceLength).substring(chordName.length) + ' = ' + play;
  out.push(chordId);

  var chart = [
    '    ______'.split('')
  ];

  var firstFret = (minFret > 3 ? minFret - 2 : 0);
  maxFret = Math.max(maxFret, firstFret + 4);

  for(var fi = firstFret; fi < maxFret; fi++) {
    chart.push('    ||||||'.split(''));
  }
  if(minFret > 4) {
    var digi = minFret.toString().split('');
    if(digi.length == 2) {
      chart[2][2] = digi[0];
      chart[2][3] = digi[1];
    } else {
      chart[2][3] = digi[0];
    }
  }

  play.toUpperCase().split('').forEach(function(fret, index) {
    if(fret == 'X') { chart[0][index  + 4] = 'x'; return;}
    var fretN = parseFret(fret) - firstFret;
    if(fret == 0) {
      chart[0][index  + 4] = 'o';
    } else {
      chart[fretN ][index  + 4] = '●';
    } 
  });

  out = out.concat(chart.map(function(r) { return r.join(''); }));
  return out;
}

var delimiter = '---------------------';

function loadAllChords(addChord) {
  var input = fs.readFileSync('./data/all-chords.txt').toString();
  var allMap = {};
  if(addChord) { input += delimiter + '\n' + addChord; }
  input.split(delimiter).forEach(function(chunk) {
    var id = chunk.split('\n')[1];
    if(id.trim().length==0) return;
    var play = id.split('=')[1].trim();
    var name = id.split('=')[0].trim();
    var fixId = name + '            '.substring(name.length) + ' = ' + play;
    allMap[fixId] = getChordChart(play,name).join('\n');
  });

  return allMap;
}

function main() {
  if(!args.name && args.n) {
    args.name = args.n;
  }

  if(args.play.length > 6 && !args.name) {
    args.name = args.play.substring(6);
    args.play = args.play.substring(0,6).toLowerCase();
  }
  var playChord = getChordChart(args.play, args.name).join('\n');

  log(playChord);

  if(typeof args.save !== 'undefined') {
    var allMap = loadAllChords(playChord);
    
    var keys = _.keys(allMap);
    keys.sort();

    var write = [];
    keys.forEach(function(key) {
      //log(key)
      write.push('\n' + delimiter + '\n' + allMap[key].trim());
    });

    fs.writeFileSync('./data/all-chords.txt', write.join('\n'));

    writeFolded(keys, allMap, 'chromatic');


    //now sort by center of fret gravity
    var keysByFret = [];
    _.forOwn(allMap, function(lines, key) {
      var frets = key.split('= ').pop();
      frets = frets.split('x').join('').split('X').join('').split('0').join('');
      var total = 0;
      frets.split('').forEach(function(f) { total += parseFret(f); });
      var average = total / frets.length;
      keysByFret.push({average:average, key: key, lines: lines});
    });
    keysByFret = _.sortBy(keysByFret, 'average').map(function(i) { return i.key });
    writeFolded(keysByFret, allMap, 'fret');

  }
}

function centerFret(play) {
  var frets = play.split('x').join('').split('X').join('').split('0').join('');
  var total = 0;
  frets.split('').forEach(function(f) { total += parseFret(f); });

  var average = total / frets.length;
  return average;
}

function writeFolded(keys, allMap, suffix) {
  var columns = 3;
  var foldingRows = [];
  var row = { maxLines: 0, cell: [] };
  keys.forEach(function(key) {
    //log(key)
    var cline = allMap[key].split('\n');
    row.cell.push(cline);
    row.maxLines = Math.max(row.maxLines, cline.length); 
    if(row.cell.length >= columns) {
      foldingRows.push(row);
      row = { maxLines: 0, cell: [] };
    }
  });

  if(row.length > 0) {
    foldingRows.push(row);
  }

  write = [];
  foldingRows.forEach(function(row) {
    for(var l = 0; l < row.maxLines; l++) {
      var line = [];
      row.cell.forEach(function(cell) {
        var cellLine = ((cell[l] || '') + '                   ').substring(0, 19);
        line.push(cellLine);
      });
      write.push(line.join(' '));
    }
    write.push(' \n ');
  });
  fs.writeFileSync('./data/all-chords-fold-' + suffix + ' .txt', write.join('\n'));
}

if (require.main === module) { 
  throw new Error('use tonal for chord name, and fix chord names!')
  main();
} else {
  module.exports = {
    stringStarts: stringStarts,
    getChordName: getChordName,
    getPlayChordName: getPlayChordName,
    parseFret: parseFret,
    toFret: toFret,
    noteNames: noteNames,
    getChordChart: getChordChart,
    loadAllChords: loadAllChords,
    centerFret: centerFret
  }
}
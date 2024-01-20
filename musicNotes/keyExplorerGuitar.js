var { log, args, writeCsv, readCsv, runCommand, SeededRandom } = require('sweet-potato');
const { Chord } = require("tonal");
var fs = require('fs');
var _ = require('lodash');
var keyChords = require('./keyChords.js');
var chordDistance = require('./chordDistance.js');
var chordExploder = require('./chordExploder.js');
var {
  stringStarts,
  parseFret,
  toFret,
  noteNames,
  getChordChart,
  loadAllChords,
  centerFret
} = require('./chordChart');

function printPage(options) {
  var out = [];

  var rand = new SeededRandom(Math.random() * 1000);

  var key = options.key;
  if(!key) {
    key = rand.get(keyChords.sharps) + rand.get(['m', '']);
    out.push('==== Randomly chose key: ' + key + ' ====');
  } else {
    out.push('==== Key: ' + key + ' ====');
  }
  out.push('');

  var keyMinor = key.indexOf('m') > -1;
  var keyNote = key.split('m')[0];
  var keyNoteIndex = _.indexOf(keyChords.sharps, keyNote);

  var baseTable = keyChords.tables[keyMinor ? 1 : 0].base;
  var allChords = _.flatten(baseTable);
  var poolSize = 30;
  var allNames = _.keys(chordExploder.byName);

  allChords.forEach(function(chord) {
    chord.note = keyChords.sharps[(chord.noteIndex + keyNoteIndex) % 12];

    chord.chordName = chord.note + chord.alteration;

    chord.plays = chordExploder.byName[chord.chordName] || [];
    chord.plays = rand.shuffle(chord.plays);
    if(chord.plays.length < poolSize) {
      var startsWith = [];
      allNames.forEach(function(name) {
        if(name.indexOf(chord.chordName) == 0) {
          startsWith = startsWith.concat(chordExploder.byName[name]);
        }
      });
      startsWith = rand.shuffle(startsWith);
      chord.plays = chord.plays.concat(startsWith);
    }
    chord.plays = _.uniq(chord.plays);
    if(chord.plays.length >= poolSize) {
      chord.plays = chord.plays.slice(0, poolSize);
    }

    while(chord.plays.length >= poolSize / 2 && rand.get(100) < 99)  {
      var index = rand.get(chord.plays.length);
      if(chord.plays[index].split('x').length >= 3) {
        chord.plays.splice(index, 1);
      }
    }  
  })


  var rootChord = baseTable[baseTable.length - 1][0];
  rootChord.usePlay = rand.get(rootChord.plays);
  rootChord.useDistance = 0;
  rootChord.useXs = 0;
  delete rootChord.plays;

  allChords.forEach(function(chord) {
    if(chord.usePlay) return;
    var byDistance = [];
    chord.plays.forEach(function(play) {
      var distance = chordDistance(play, rootChord.usePlay);
      byDistance.push({ play: play, distance: distance });
    })
    byDistance = _.sortBy(byDistance, 'distance');
    //log(byDistance);
    chord.usePlay = byDistance[0].play;
    chord.useDistance = byDistance[0].distance;
    chord.useXs = byDistance[0].play.split('x').length - 1;
    delete chord.plays;
  });

  //log(allChords)
  allChords = _.sortBy(allChords, 'useXs');
  allChords = allChords.slice(0,18);
  allChords = _.sortBy(allChords, 'useDistance');
  allChords = allChords.slice(0,12);
  //log(allChords);


  var columnCount = 3;
  var rowCount = 4;

  var grid = [];

  function getCenterString(play) {
    var stringTotal = 0;
    var countTotal = 0;
    play.split('').forEach(function(fret, index) {
      var fretNo = parseFret(fret);
      if(fretNo == 'x') return;
      stringTotal += index;
      countTotal++;
    })
    return stringTotal / countTotal;
  }

  allChords.forEach(function(chord, index) {
    var row = Math.floor(index / columnCount);
    var col = index % columnCount;
    var gridRow = grid[row] || [];
    var actualName = chordExploder.byPlay[chord.usePlay];
    gridRow[col] = getChordChart(chord.usePlay, actualName.replace('M',''), 6);
    //gridRow[col].push(chord.useDistance.toFixed(2))
    gridRow[col].centerFret = centerFret(chord.usePlay);
    gridRow[col].centerString = -1 * getCenterString(chord.usePlay);

    grid[row] = gridRow;
  });

  var move = 1;

  //worlds dumbest sort
  while(move > 0) {
    move = 0;
    for(var col = 0; col < columnCount; col++) {
      for(var row = 0; row < rowCount - 1; row++) {
        if(grid[row][col].centerFret > grid[row + 1][col].centerFret) {
          var g = grid[row + 1][col];
          grid[row + 1][col] = grid[row][col];
          grid[row][col] = g;
          move++;
        }
      }
    }
    for(var row = 0; row < rowCount; row++) {
      for(var col = 0; col < columnCount - 1; col++) {
        if(grid[row][col].centerFret > grid[row][col + 1].centerFret) {
          var g = grid[row][col + 1];
          grid[row][col + 1] = grid[row][col];
          grid[row][col] = g;
          move++;
        }
      }
    }  
  }

  var chartOut = [];

  var linesPerRow = 10;
  var spacePerCol = 25;
  grid.forEach(function(gridRow, rowIndex) {
    for(var subIndex = 0; subIndex < linesPerRow; subIndex++) {
      chartOut[rowIndex * linesPerRow + subIndex] = '                                                                                                    ';
    }
    gridRow.forEach(function(gridCol, colIndex) {
      gridCol.forEach(function(subRow, subIndex) {
        chartOut[rowIndex * linesPerRow + subIndex] = chartOut[rowIndex * linesPerRow + subIndex].substring(0, spacePerCol * colIndex) + subRow + '                                                                                                    ';
      });
    });
  });
  chartOut.forEach(function(row, index) {
    chartOut[index] = row.substring(0, 3 * spacePerCol);
  });

  out = out.concat(chartOut);


  return out.join('\n');
}

if (require.main === module) { 
  if(args.key == 'All') {
    var out = [];

    keyChords.sharps.forEach(function(note) {
      ['', 'm'].forEach(function(alt) {
        for(var i = 0; i < 3; i++) {
          out = out.concat(printPage({key:note + alt}));
        }
      })
    });

    log(out.join('\n'));
  } else {
    log(printPage(args));
  }
} else {
  module.exports = {
    printPage
  }
}





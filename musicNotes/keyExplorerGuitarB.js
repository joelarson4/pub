var { log, args, writeCsv, readCsv, runCommand, SeededRandom } = require('sweet-potato');
const { Chord } = require("tonal");
var fs = require('fs');
var _ = require('lodash');
var keyChords = require('./keyChords.js');
var chordDistance = require('./chordDistance.js');
var chordExploder = require('./chordExploder.js');
var Waiter = require('./waiter.js')
var {
  stringStarts,
  parseFret,
  toFret,
  noteNames,
  getChordChart,
  loadbaseTableChords,
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

  var rootChordName = key.indexOf('m') > -1 ? key : key + 'M';
  //log(chordExploder.byName[rootChordName],rootChordName)

  var leastXs = _.sortBy(chordExploder.byName[rootChordName], function(p) { return p.split('x').length; });
  leastXs = leastXs.slice(0, Math.ceil(leastXs.length / 3));
  var rootChordPlay = rand.get(leastXs);

  chordExploder.allRows.forEach(function(chord) {
    if(chord.play.split('x').length > 2 && rand.get(2) == 1) {
      chord.distance = 100;
      return;
    }
    chord.distance = chordDistance(chord.play, rootChordPlay, true);
  });

  chordExploder.allRows = _.sortBy(chordExploder.allRows, 'distance');
  

  var baseTable = keyChords.tables[keyMinor ? 1 : 0].base;
  var baseTableChords = _.flatten(baseTable);
  var poolSize = 30;
  var allNames = _.keys(chordExploder.byName);

  baseTableChords.forEach(function(chord) {
    chord.note = keyChords.sharps[(chord.noteIndex + keyNoteIndex) % 12];

    chord.chordName = chord.note + chord.alteration;
    
    for(var ri = 0; ri < chordExploder.allRows.length; ri++) {
      if(chordExploder.allRows[ri].name.indexOf(chord.chordName) == 0 && rand.get(2) == 0) {
        _.extend(chord,chordExploder.allRows[ri]);
        break;
      }
    }
  })
  baseTableChords = _.sortBy(baseTableChords, 'distance');
  
  baseTableChords = baseTableChords.slice(0,12);
  
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

  baseTableChords.forEach(function(chord, index) {
    var row = Math.floor(index / columnCount);
    var col = index % columnCount;
    var gridRow = grid[row] || [];
    var actualName = chordExploder.byPlay[chord.play];
    gridRow[col] = getChordChart(chord.play, actualName.replace('M',''), 6);
    gridRow[col].centerFret = centerFret(chord.play);
    gridRow[col].centerString = -1 * getCenterString(chord.play);

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

  var linesPerRow = 9;
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
  var waiter = new Waiter('building');
  if(args.key == 'All') {
    var out = [];

    keyChords.sharps.forEach(function(note) {
      ['', 'm'].forEach(function(alt) {
        for(var i = 0; i < 3; i++) {
          out = out.concat(printPage({key:note + alt}));
        }
      })
    });

    waiter.stop();
    log(out.join('\n'));
  } else {
    log(printPage(args));
  }
} else {
  module.exports = {
    printPage
  }
}





var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const { Chord } = require("tonal");
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');
var pChord = require('@patrady/chord-js').Chord;
var {
  stringStarts,
  parseFret,
  toFret,
  noteNames,
  getChordChart,
  loadAllChords,
  centerFret: centerFret
} = require('./chordChart');


function getFingering(play) {
  var parts = play.split('');
  var minFret = 20;
  var fingerings = parts.map(function(part, index) {
    var fret = parseFret(part);
    if(fret == 0 || fret == 'x') {
      return 'x';
    } else {
      if(fret < minFret) {
        minFret = fret;
      }
      return fret;
    }
  });
  fingerings.forEach(function(fret, index) {
    if(fret == 'x') return;
    fingerings[index] = fret - minFret + 1;
  });
  return fingerings;
}

function getFingerDetails(fingering) {
  var fingerIndex = 0;
  var details = {
    fingers: [],
    minFret: 20,
    maxFret: 0,
    minString: 10,
    maxString: -1,
    fingersDown: 0
  }
  fingering.forEach(function(fret, string) {
    if(fret == 'x') return;
    details.fingers.push({ fret: fret, string: string });
    details.fingersDown++;
    details.minFret = Math.min(fret, details.minFret);
    details.maxFret = Math.max(fret, details.maxFret);
    details.minString = Math.min(string, details.minString);
    details.maxString = Math.max(string, details.maxString);
  });
  return details;
}

function iterateThru(val1, val2, func) {
  var start = val1 < val2 ? val1 : val2;
  var end = val1 < val2 ? val2 : val1;
  //log(['it',val1,val2,start,end])
  for(var i = start; i < end + 1; i++) {
    func(i);
  }
}


function getFingerGrid(fingers, fretOffs, stringOffs) {
  var grid = {};
  for(var string = -5; string < 5; string++) {
    for(var fret = -5; fret < 5; fret++) {
      var addr = string + ',' + fret;
      grid[addr] = 0;
    }
  }

  fingers.forEach(function(finger) {
    var addr = (stringOffs + finger.string) + ',' + (fretOffs + finger.fret);
    grid[addr] = 1;
  });
  return grid;
}

function printGrid(grid) {
  var out = [];
  for(var i = 0; i < 15; i++) { out.push([]); }
  for(var string = -5; string < 10; string++) {
    for(var fret = -5; fret < 10; fret++) {
      var addr = string + ',' + fret;
      out[fret + 5][string + 5] = grid[addr] ? 'X' : '|';
    }
  }
  log(out.map(function(a) { return a.join(''); }).join('\n'))
}


function chordDistance(play1, play2) {
  var center1 = centerFret(play1);
  var center2 = centerFret(play2);
  //log([play1,play2,center1,center2])

  var fretDistance = Math.abs(center1 - center2);
  //log(fretDistance + ' fret distance');
  
  var fingering1 = getFingering(play1);
  var fingering2 = getFingering(play2);
  var details1 = getFingerDetails(fingering1);
  var details2 = getFingerDetails(fingering2);
  var detailsA = details1.fingersDown > details2.fingersDown ? details1 : details2;
  var detailsB = details1.fingersDown > details2.fingersDown ? details2 : details1;

  var offsets = [];
  var gridA = getFingerGrid(detailsA.fingers, 0, 0);
  //printGrid(gridA);
  
  iterateThru(-5, 5, function(fretOffs) {
    iterateThru(-5, 5, function(stringOffs) {      
      var gridB = getFingerGrid(detailsB.fingers, fretOffs, stringOffs);
      //log(`\nf=${fretOffs}, s=${stringOffs}`);
      var fingerDistance = Math.abs(fretOffs) + Math.abs(stringOffs);
      _.keys(gridA).forEach(function(addr) {
        if(gridA[addr] !== gridB[addr]) { fingerDistance++ }
      });

      //printGrid(gridB);
      //log(fingerDistance);

      offsets.push({ fingerDistance: fingerDistance, fretOffs: fretOffs, stringOffs });

    });
  });
  offsets = _.sortBy(offsets, 'fingerDistance');
  //log(offsets[0])
  
  return fretDistance / 2 + offsets[0].fingerDistance;
}


module.exports = chordDistance;
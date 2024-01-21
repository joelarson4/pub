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

var rand = new SeededRandom(Math.random() * 1000);



var mainChord = rand.get(chordExploder.allRows);

chordExploder.allRows.forEach(function(chord) {
  chord.distance = chordDistance(chord.play, mainChord.play);
});

chordExploder.allRows = _.sortBy(chordExploder.allRows, 'distance');

var subChord = chordExploder.allRows.slice(0, 1000);
log(subChord)
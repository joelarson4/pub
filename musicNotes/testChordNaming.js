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
  loadAllChords
} = require('./chordChart');

function getPlayName(play) {
  var notes = [];
  var fullNotes = [];
  play.toUpperCase().split('').forEach(function(fret, index) {
    if(fret == 'X') { return; }
    var nfret = parseFret(fret);
    var midi = stringStarts[5 - index].midi + nfret;
    //log(play + ' ' + index + ':' + midi + ' ' + fret + ' ' + nfret)
    var note = noteNames[(midi - 33) % 12];
    notes.push(note);
    fullNotes.push(pianissimo.note(midi));
  });
  log(notes)

  notes = [].concat(notes);
  fullNotes = [].concat(fullNotes);
  //log({notes:notes, fullNotes: fullNotes})
  var chordName = null;
  try {
    var detected = Chord.detect(notes);
    chordName = detected[0];// pianissimo.chord(fullNotes).getName();
  } catch(e) { }
  if(typeof chordName !== 'string') {
    try {
      chordName = pChord.for(notes.join(' ')).getName() +' p';
    } catch(e2) {
      chordName = null;
    }
  }
  if(chordName !== null && chordName.indexOf('cant find name') > -1) { chordName = null; }
  if(chordName !== null && chordName.match(/\d/g) && chordName.match(/\d/g).length > 2) { chordName = null; }
  if(chordName !== null && chordName.indexOf('+') > -1) { chordName = null; }
  if(chordName !== null && chordName.indexOf('♭') > 3) { chordName = null; }
  if(chordName !== null && chordName.indexOf('♯') > 3) { chordName = null; }

  return chordName;
}

var plays = [
  '320003',
  '3321xx',
  '0442xx'
]

plays.forEach(function(play) {
  log(play + ':' + getPlayName(play))
})

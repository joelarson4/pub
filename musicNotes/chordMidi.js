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
      chordName = 'no name found'
    }
  }
  if(chordName && chordName !== 'cant find name') {
    return chordName + (true ? '~' : '');
  }
  notes.pop();
  fullNotes.pop();
  return getChordName(notes, fullNotes, true)
}

function fretNo(fret) {
  return Number(fret == 'A' ? 10 : fret == 'B' ? 11 :  fret == 'C' ? 12 :  fret == 'D' ? 13  :  fret == 'E' ? 14 : fret);
}

var noteNames = 'A,A#,B,C,C#,D,D#,E,F,F#,G,G#'.split(',');

function getChordChart(play, name) {
  if(play.length !== 6) {
    log('play must be 6 chars long');
    return;
  }

  var maxFret = 0;
  var minFret = 20;
  var notes = [];
  var fullNotes = [];
  var midi = [];
  play.toUpperCase().split('').forEach(function(fret, index) {
    if(fret == 'X') { return; }
    fret = fretNo(fret);
    if(fret > maxFret) maxFret = fret;
    if(fret < minFret && fret !== 0) minFret = fret;
    var midi = stringStarts[5 - index].midi + fret;

    log(midi + ' ' + pianissimo.note(midi).getName());


  });


}

getChordChart(args.play, args.name)
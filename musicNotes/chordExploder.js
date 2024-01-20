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

var filePath = './data/exploded-chords.txt';

function main() {
  function getPlayName(play) {
    var notes = [];
    var fullNotes = [];

    play.toUpperCase().split('').forEach(function(fret, index) {
      if(fret == 'X' || fret == 'x') { return; }
      var nfret = parseFret(fret);
      var midi = stringStarts[5 - index].midi + nfret;
      //log(play + ' ' + index + ':' + midi + ' ' + fret + ' ' + nfret)
      var note = noteNames[(midi - 33) % 12];
      notes.push(note);
      fullNotes.push(pianissimo.note(midi));
    });

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


    if(chordName !== null && chordName.indexOf('/') > -1) {
      overRoot = chordName.split('/').pop();
      var matches = false;
      for(var n = 1; n < notes.length; n++) {
        if(notes[n] == overRoot) { 
          matches = true;
        }
      }
      if(!matches) {
        //log('Does not match: ' + chordName + ' ' + play + ' ' + notes);
        chordName = null;
      } else {
        //log('Does match: ' + chordName + ' ' + play + ' ' + notes);
      }
    }

    return chordName;
  }

  var allChordsMap = loadAllChords();

  var allPlayed = _.keys(allChordsMap).map(function(id) {
    return id.split('=').pop().trim();
  });

  var allFingerings = allPlayed.map(function(play) {
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

    return fingerings.join('');
  });
  allFingerings = _.uniq(allFingerings);

  //move configurations right and left
  var addFingerings = [];
  for(var i = 0; i < 5; i++) {
    allFingerings.forEach(function(fingering) {
      var newFingering = ('xxxxx'.substring(i) + fingering).substring(0, 6);
      if(newFingering.substring(0, 4) == 'xxxx') { return; }
      addFingerings.push(newFingering);
    });
    allFingerings.forEach(function(fingering) {
      var newFingering = (fingering + 'xxxxx'.substring(i)).substring(0, 6);
      if(newFingering.substring(0, 4) == 'xxxx') { return; }
      addFingerings.push(newFingering);
    });  
  }
  allFingerings = _.uniq(allFingerings.concat(addFingerings));

  //now toggle all fingers up and down (opening or muting more)
  addFingerings = [];
  allFingerings.forEach(function(fingering) {
    var fingersDown = [];
    fingering.split('').forEach(function(fret, index) {
      if(fret !== 'x') fingersDown.push(index)
    })
    var combos = Math.pow(2, fingersDown.length);
    for(var c = 0; c < combos; c++) {
      var bits = '0000' + c.toString(2);
      bits = bits.substring(bits.length - 3).split('');
      var fingerVariant = fingering.split('');
      bits.forEach(function(b, i) {
        if(b == '0') fingerVariant[fingersDown[i]] = 'x';
      })
      var newFingering = fingerVariant.join('');
      if(newFingering.substring(0, 4) == 'xxxx') { return; }
      addFingerings.push(newFingering);    
    }
    //log(combos + ' ' + fingersDown.join(), fingering);
  });
  allFingerings = _.uniq(allFingerings.concat(addFingerings));


  //now toggle all x's to opens
  addFingerings = [];
  allFingerings.forEach(function(fingering) {
    var fingersUp = [];
    fingering.split('').forEach(function(fret, index) {
      if(fret == 'x') fingersUp.push(index)
    })
    var combos = Math.pow(2, fingersUp.length);
    for(var c = 0; c < combos; c++) {
      var bits = '0000' + c.toString(2);
      bits = bits.substring(bits.length - 3).split('');
      var fingerVariant = fingering.split('');
      bits.forEach(function(b, i) {
        if(b == '0') fingerVariant[fingersUp[i]] = '0';
      })
      var newFingering = fingerVariant.join('');

      addFingerings.push(newFingering);    
    }
    //log(combos + ' ' + fingersDown.join(), fingering);
  });

  allFingerings = _.uniq(allFingerings.concat(addFingerings));
  allFingerings = _.filter(allFingerings, function(fingering) {
    return fingering.match(/[^x]/g).length > 2; //too many x's
  });
  allFingerings.sort();

  var allPlays = [];
  allFingerings.forEach(function(fingering) {
    var fingersString = [];
    var fingersFret = [];
    fingering.split('').forEach(function(fret, index) {
      if(fret !== 'x' && fret !== '0') {
        fingersString.push(index);
        fingersFret.push(Number(fret));
      }
    });
    for(var t = 0; t < 12; t++) {
      var play = fingering.split('');
      fingersString.forEach(function(string, index) {
        play[string] = toFret(fingersFret[index] + t);
      });
      play = play.join('');
      //log(fingering + ' ' + t + ' ' + play)
      var name = getPlayName(play);
      if(name !== null) {
        //name = name.split('M').join('');
        allPlays.push(name + ' = ' + play);
      }
    }
    //process.exit();
  });
  allPlays.sort();
  allPlays = _.uniq(allPlays)
  log(allPlays.join('\n'))
  log(allPlays.length);
  fs.writeFileSync(filePath, allPlays.join('\n'));


  //log(allFingerings);
  //log(allFingerings.length);

  /* assumptions/todos:
  all shapes can move towards higher pitched strings; the reverse is not true
  all shapes can move up and down the fretboard
  all fingers can be lifted to open a chord (may not in fact be true)
  muted strings can be left open (may not always be true)
  for picking purposes even three nearby strings is enough (need not be strummable)
  advanced -- try all root notes to find a "chord compatible" fingering
  */
}

function load() {
  var text = fs.readFileSync(filePath).toString();
  var byChordName = {};
  var byPlay = {};
  var allRows = []
  text.split('\n').forEach(function(row) {
    var chunk = row.split(' = ');
    var name = chunk[0];
    var play = chunk[1];
    byChordName[name] = byChordName[name] || [];
    byChordName[name].push(play);
    allRows.push({name:name,play:play});
    byPlay[play] = name;
  });
  return {
    byName: byChordName,
    byPlay: byPlay,
    allRows: allRows
  }
}



if (require.main === module) { 
  main();
} else {
  module.exports = load();
}

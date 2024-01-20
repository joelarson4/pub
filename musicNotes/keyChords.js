var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const { Chord } = require("tonal");
var fs = require('fs');
var _ = require('lodash');

var tables = [
    {
        name: 'C major',
        table: [
            ['Bo',  'Bø',  'B♭',  'B♭7' ],
            ['Am',  'Am7', 'A♭',  'A♭Δ', 'As2', 'As4' ],
            ['G',   'G7',  'Gm',  'Gm7', 'Gs2', 'Gs4' ],
            ['F',   'FΔ',  'Fm',  'Fm7', 'Fs2' ],
            ['Em',  'Em7', 'E♭',  'E♭Δ', 'Es4' ],
            ['Dm',  'Dm7', 'Do',  'Dø',  'Ds2', 'Ds4'  ],
            ['C',   'CΔ',  'Cm',  'Cm7', 'Cs2', 'Cs4' ]
        ]
    },
    {
        name: 'C minor (natural)',
        table: [          
            [ 'B♭',  'B♭7', 'Bo',  'Bø', 'B♭s2', 'B♭s4'  ],
            [ 'A♭',  'A♭Δ', 'Am',  'Am7', 'A♭s2' ],
            [ 'Gm',  'Gm7', 'G',   'GΔ', 'Gs4'  ],
            [ 'Fm',  'Fm7', 'F',   'FΔ', 'Fs2', 'Fs4'  ],
            [ 'E♭',  'E♭Δ', 'Em',  'Em7', 'Es2', 'Es4' ],
            [ 'Do',  'Dø',  'Dm',  'Dm7' ],
            [ 'Cm',  'Cm7', 'C',   'CΔ', 'Cs2', 'Cs4'  ]
        ]
    }
];

var flats  = 'C,D♭,D,E♭,E,F,G♭,G,A♭,A,B♭,B'.split(',');
var sharps = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'.split(',');

var alterationMap = {
  '': 'M',
  '7': '7',
  'm': 'm',
  'm7': 'm7',
  'o': 'dim',
  's2': 'sus2',
  's4': 'sus4',
  'ø': 'DELETE',
  'Δ': '7'
}

function parseTable(table) {
    var out = [];
    table.table.forEach(function(row) {
        var outrow = [];
        row.forEach(function(cell) {
            var notePart = null;
            var noteIndex = -1;
            flats.forEach(function(flat, flatIndex) {
                if(cell.indexOf(flat) == 0 && (notePart == null || flat.length > notePart.length)) {
                    notePart = flat;
                    noteIndex = flatIndex;
                }
            });
            var alt = cell.split(notePart).pop();

            var altMapped = alterationMap[alt] || alt;
            if(altMapped == 'DELETE') return;
            
            outrow.push({ noteIndex: noteIndex, alterationRaw: alt, alteration: altMapped });
        });
        out.push(outrow);
    });

    table.base = out;
    return table
}

function printTable(table, type, noteIndex) {
    var out = [];
    table.base.forEach(function(row) {
        var outrow = { columns: [] };
        row.forEach(function(cell) {
            var notePart = sharps[(noteIndex + cell.noteIndex) % 12];
            outrow.columns.push({cell: notePart + cell.alteration});
        });
        out.push(outrow);
    });
    
    return { name: sharps[noteIndex] + ' ' + type, rows: out };
}

parseTable(tables[0]);
parseTable(tables[1]);
//log(JSON.stringify(tables,0,'  '));return
module.exports = {
  tables: tables,
  flats: flats,
  sharps: sharps
}
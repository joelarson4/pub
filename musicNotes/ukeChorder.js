var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
var fs = require('fs');
var _ = require('lodash');

var stringStarts = [
 { note: 'A', midi: 69 },
 { note: 'E', midi: 64 }, 
 { note: 'C', midi: 60 },
 { note: 'G', midi: 55 }
];

var notes = [0, 5, 9];


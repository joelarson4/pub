var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');
var paintNeck = require('./guitarNeck');


var stringStarts = [
 { note: 'A', midi: 69 },
 { note: 'E', midi: 64 }, 
 { note: 'C', midi: 60 },
 { note: 'G', midi: 55 }
];

var length = 13;
var dotPoints = {3:1, 5:1,7:1,10:1,12:1};

paintNeck('Ukelele', stringStarts, length, dotPoints);

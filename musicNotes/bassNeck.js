var { log, args, writeCsv, readCsv, runCommand } = require('sweet-potato');
const pianissimo = require("pianissimo");
var fs = require('fs');
var _ = require('lodash');
var paintNeck = require('./guitarNeck');


var stringStarts = [
   { note: 'G', midi: 55-12 },
   { note: 'D', midi: 50-12 },
   { note: 'A', midi: 45-12 },
   { note: 'E', midi: 40-12 }
   ]

var length = 13;
var dotPoints = {3:1,5:1,7:1,9:1,12:1};

paintNeck('Bass', stringStarts, length, dotPoints);

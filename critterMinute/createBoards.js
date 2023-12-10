const _ = require('lodash');
const fs = require('fs');
const { log, args, readCsv, writeCsv, runCommand, SeededRandom } = require('sweet-potato');

var randOffs = Math.random() * 50000 + Math.random();

for(var board = 0; board < 100; board++) {
  var boardData = { board: board };
  var rand = SeededRandom(board + randOffs);

  var levelSizes = [
      [2,3],//1
      [3,4],//2
      [3,4],//3
      [3,4],//4
      [3,4],//5
      [3,4],//6
      [3,4],//7
      [3,4],//8
      [4,5],//9
      [4,5]//10
  ];

  var segments = 16;
  var eyes = 10;

  boardData.levels = [];
  levelSizes.forEach(function(size, levelIndex) {
    var level = {
      levelIndex: levelIndex,
      size: size,
      critters: []
    }

    level.goal = levelIndex < 2 ? 'twins' :
       levelIndex < 7 ? rand.get(['twins','triplets']) :
       rand.get(['twins','triplets','twinPair']);

    var critters = [];
    for(var c = 0; c < size[0] * size[1]; c++) {
      var segs = [rand.get(segments),rand.get(segments),rand.get(segments)];
      
      critters.push(segs);
    }
    
    var nonUnique = 1;
    if(level.goal == 'twins') {
      critters.unshift(critters[0]);
    } else if(level.goal == 'triplets') {
      critters.unshift(critters[0]);
      critters.unshift(critters[0]);
      nonUnique = 2;
    } else if(level.goal == 'twinPair') {
      critters.unshift(critters[0]);
      critters.unshift(critters[2]);
      nonUnique = 2;
    }

    critters.forEach(function(critter, index) {
      var leye = rand.get(eyes);
      var reye = leye; if(rand.get(10) == 0) reye = rand.get(eyes);
      while(leye==5 || reye==5) {//TODO WTF
        leye = rand.get(eyes);
        reye = leye; if(rand.get(10) == 0) reye = rand.get(eyes);
      }      
      var details = [rand.get(2),leye,reye];
      critters[index] = critter.concat(details).join('/');
    })

    if(_.uniq(critters).length + nonUnique < size[0] * size[1]) {
      log(critters);
      log(_.uniq(critters))
      log('NOT RIGHT');
      throw new Error()
    }

    critters = critters.slice(0,size[0] * size[1]);
    rand.shuffle(critters);
    rand.shuffle(critters);
    rand.shuffle(critters);
    level.critters = critters;

    boardData.levels.push(level)
  })

  fs.writeFileSync('./data/board-' + board + '.json', JSON.stringify(boardData,0,'  '));
}
//TODO: some of the image files are not sized properly
//todo normalize eye size + random position
//baseline from feet!
//eyes are not positioned quite identically on flip

function log(text) {
  console.log(text);
}

function rand(max, min) {
  return Math.floor(max * Math.random() + (min || 0));
}

function SeededRand(seed) {
  var string = seed.toString();
  var integer = 0;
  string.split('').forEach(function(c,i) { integer += string.charCodeAt(i) * i; });
  this.get = function(max,min) {
    min = min || 0;
    integer++;
    var val = (1+(Math.sin(integer) * 100 + Math.cos(100 - integer) * 50) % 1)%1;
    return Math.floor((max-min) * val + min);
  }
}

function clickCritter(id) {
  $('.level' + board.level + '#' + id).toggleClass('critterSelected');

  var levelData = board.levels[board.level];
  var selectionTarget = levelData.goal == 'twinPair' ? 4 :
    levelData.goal == 'triplets' ? 3 : 2;

  var selected = $('.critterSelected');
  if(selected.length == selectionTarget) {
    var critters = [];
    selected.toArray().forEach(function(s) {
      critters.push(s.getAttribute('data-critter'));
    });
    critters.sort();

    var confirmed = false;
    if(levelData.goal == 'twins') {
      confirmed = critters[0] == critters[1];
    } else if(levelData.goal == 'triplets') {
      confirmed = critters[0] == critters[1] && critters[0] == critters[2];
    } else if(levelData.goal == 'twinPair') {
      confirmed = critters[0] == critters[1] && critters[2] == critters[3];
    }
    log(critters[0] + ' ' + critters[1]);
    log(confirmed);

    if(confirmed) {
      board.level++;
      selected.addClass('confirmed');
      setTimeout(function() {
        nextScreen();
      }, 500);
    } else {
      $('.critterSelected').addClass('wrong')
      setTimeout(function() {
        $('.wrong').removeClass('wrong');
        $('.critterSelected').removeClass('critterSelected')
      },200);
    }
  }
  //level++;
  //nextScreen();
}

function getCritterHtml(id, seg, boxSize) {
  var html = '<div class="critter ' +
    ` level${board.level}` +
    `" data-critter="${seg[0]},${seg[1]},${seg[2]}" onclick="clickCritter('${id}')" id="${id}"` +
    `style="width: ${boxSize}px; height: ${boxSize}px;">` +
    `<canvas class="critterInner" width="${boxSize}" height="${boxSize}">` + 
    //`<img class="segment segment1" src="./images/${images[0]}"/>` +
    //`<img class="segment segment2" src="./images/${images[1]}"/>` +
    //`<img class="segment segment3" src="./images/${images[2]}"/>` +
    //'<img class="eye eyeL" src="./images/ceL' + 4 + '.png"/>' + 
    //'<img class="eye eyeR" src="./images/ceR' + 4 + '.png"/>' + 
    '</canvas></div>'// + id + ' ' + seg +'</div>';
  return html;
}

function nextScreen() {
  var levelData = board.levels[board.level];
  if(!levelData) {
    done();
    return;
  }

  $('.instruction').html('...');
  var width = levelData.size[0];
  var height = levelData.size[1];
  var boxSize = ($('.body').width() / width) - (width * 5);

  var grid = [];
  for(var y = 0; y < height; y++) {
    var row = [];
    grid.push(row);
    for(var x = 0; x < width; x++) {
      row.push(levelData.critters[y * width + x].split('/'));
    }
  }

  var out = [];
  var critters = [];
  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
      var id = `critter-${x}-${y}`;
      critters.push({id: id, segs: grid[y][x].slice(0,3), flip: grid[y][x][3] == 1, eyes: grid[y][x].slice(4) });
      out.push(getCritterHtml(id, grid[y][x], boxSize));
    }
    out.push('<br/>');
  }

  if(board.level == 0) {
    $('.time').html('-:--');
  }
  $('.level').html('L' + (1 + board.level));
  $('.body').html(out.join('\n'));

  setTimeout(function() {
    critters.forEach(function(critter) {
      drawCritter(critter, boxSize);
    });

    var instructions = {
      twins: 'FIND THE TWINS',
      triplets: 'FIND ALL THREE TRIPLETS',
      twinPair: 'FIND TWO PAIRS OF TWINS',
    }

    $('.instruction').html(instructions[levelData.goal]);
  }, 2);


  setTimeout(function() {
    $('.critterSelected').removeClass('critterSelected');
  }, 200);
  setTimeout(function() {
    $('.critterSelected').removeClass('critterSelected');
  }, 300);  
}

function done() {
  $('.level').html('FIN');
  $('.instruction').html('YA DID IT!');
  $('.body').html(`<div class="done">★ NICE! ★<p style="font-size: 30px;">It took you ${gameTime.minutes} minutes, ${gameTime.seconds} seconds</div>`);
}

var startTime = null;
var gameTime = null;
function start() {
  var startTime = Date.now();
  var tmo = setInterval(function() {
    var secondsRunning = (Date.now() - startTime) / 1000;
    var minutesRunning = Math.floor(secondsRunning / 60);
    var secondsInMinuteRunning = (100 + (secondsRunning - minutesRunning * 60)).toFixed(0).substring(1);
    gameTime = { minutes: minutesRunning, seconds: secondsInMinuteRunning };
    $('.time').html(`${minutesRunning}:${secondsInMinuteRunning}`);
  }, 200);

  nextScreen();
}


var board = null;
var images = { };
function loadImages() {
    ['h','b','r'].forEach(function(seg) {
      for(var i = 0; i < 16; i++) {
        images['c' + seg + i] = new Image;
        images['c' + seg + i].onerror = function() { this.src = this.src + '?' + Date.now(); }
        images['c' + seg + i].onload = function() { this.loaded = true; }
        images['c' + seg + i].src = 'images/c' + seg + i + '-big.gif';
      }
    });

    ['L','R'].forEach(function(eye) {
      for(var i = 0; i < 10; i++) {
        images['ce' + eye + i] = new Image;
        images['ce' + eye + i].onerror = function() { this.src = this.src + '?' + Date.now(); }
        images['ce' + eye + i].onload = function() { this.loaded = true; }
        images['ce' + eye + i].src = 'images/ce' + eye + i + '-big.gif';
      }
    });
  
  waitLoad();
}

function waitLoad() {
  for(var i in images) {
    if(images[i].onload && !images[i].loaded) {
      return setTimeout(function() { waitLoad(); }, 200);
    }
  }
  if(board == null) {
    return setTimeout(function() { waitLoad(); }, 200);
  }
  $('#start').show();

  ///**/start();
}

function loadBoard() {
  var boardIndex = Math.floor(Math.random() * 50);
  $.getJSON( 'data/board-' + boardIndex + '.json', function( data ) {
    board = data;
    board.level = 0;
  });
}

loadImages();
loadBoard();

function isOpaque(context, x, y) { // x, y coordinate of pixel
  return context.getImageData(x, y, 1, 1).data[3] > 0; // 4th byte is alpha
}

function bottomPixel(canvas, context) {
  for(var y = canvas.height - 1; y > 0; y--) {
    for(var x = canvas.width - 1; x > 0; x--) {
      if(isOpaque(context, x, y)) {
        return y;
      }
    }
  }
}
function drawCritter(critter, boxSize) {
  var outCanvas = document.getElementById(critter.id).getElementsByTagName('canvas')[0];
  var outContext = outCanvas.getContext('2d');
  var critterCanvas = document.createElement('canvas');
  critterCanvas.height = boxSize;
  critterCanvas.width = boxSize;
  
  var critterContext = critterCanvas.getContext("2d", {willReadFrequently: true});
  
  critterContext.globalCompositeOperation = "multiply";

  var imageKeys = [
    'ch' + critter.segs[0],
    'cb' + critter.segs[1],
    'cr' + critter.segs[2]
  ];

  var scale = 2/3 *  critterCanvas.height / images[imageKeys[0]].height;
  //log([critterCanvas.width ,critterCanvas.height , images[imageKeys[0]].height])

  critter.segs.forEach(function(seg, index) {
    critterContext.drawImage(images[imageKeys[index]], Math.floor(images[imageKeys[index]].width * scale * index), 0, images[imageKeys[index]].width * scale, images[imageKeys[index]].height * scale);
  });

  var yOffs = (0.8 * critterCanvas.height) - bottomPixel(critterCanvas, critterContext);

  var critterRand = new SeededRand(JSON.stringify(critter));

  var destinationImage = new Image();
  destinationImage.onload = function(){
    //outContext = canvas.getContext('2d');
    var color = [critterRand.get(360),critterRand.get(35) + 65,critterRand.get(25)+75];
    outContext.fillStyle = `hsl(${color[0]},${color[1]}%,${color[2]}%)`;
    outContext.fillRect(0, yOffs, outCanvas.width, outCanvas.height);

    outContext.globalCompositeOperation = "multiply";
    outContext.drawImage(destinationImage, 0, yOffs, critterCanvas.width, critterCanvas.height);
 
    outContext.globalCompositeOperation = "destination-in";
    outContext.drawImage(destinationImage, 0, yOffs, critterCanvas.width, critterCanvas.height)

    outContext.globalCompositeOperation = "source-over";
    var leye = critter.eyes[0];
    var reye = critter.eyes[1];

    var offs = [critterRand.get(40), critterRand.get(40), critterRand.get(40), critterRand.get(40)];
    var xOffs = 0;
    var leyeX = 680 + xOffs - images['ceL' + leye].width - offs[0];
    var leyeY = 460 + offs[2] - 10;
    var reyeX = 680 + xOffs + offs[2];
    var reyeY = 460 + offs[3] - 10;
    //log([leyeX,leyeX * scale])
    outContext.drawImage(images['ceL' + leye], leyeX * scale, leyeY * scale + yOffs, images['ceL' + leye].width * scale, images['ceL' + leye].height * scale);
    outContext.drawImage(images['ceR' + reye], reyeX * scale, reyeY * scale + yOffs, images['ceR' + reye].width * scale, images['ceR' + reye].height * scale);
    
    //outContext.drawImage(images['ceR6.png'], 450,400);
    if(critter.flip) outCanvas.style="-webkit-transform: scaleX(-1);"
  };
  destinationImage.src = critterCanvas.toDataURL();

}

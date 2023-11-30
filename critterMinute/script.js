//TODO: some of the image files are not sized properly
//todo normalize eye size + random position
//baseline from feet!
//eyes are not positioned quite identically on flip

var level = 0;

function log(text) {
  console.log(text);
}

function rand(max, min) {
  return Math.floor(max * Math.random() + (min || 0));
}

function clickCritter(id) {
  $('.level' + level + '#' + id).toggleClass('critterSelected');

  var selected = $('.critterSelected');
  if(selected.length == 2) {
    if(selected[0].getAttribute('data-critter') == selected[1].getAttribute('data-critter')) {
      level++;
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


function getCritterSegments() {
  var seg = [ rand(16), rand(16), rand(16) ];
  return seg;
}

function getCritterHtml(id, seg, boxSize) {
  var html = '<div class="critter ' +
    ` level${level}` +
    `" data-critter="${seg[0]},${seg[1]},${seg[2]}" onclick="clickCritter('${id}')" id="${id}"` +
    `style="width: ${boxSize}px; height: ${boxSize}px;">` +
    `<canvas class="critterInner" width="${boxSize}" height="${boxSize}">` + 
    //`<img class="segment segment1" src="./images/${images[0]}"/>` +
    //`<img class="segment segment2" src="./images/${images[1]}"/>` +
    //`<img class="segment segment3" src="./images/${images[2]}"/>` +
    //'<img class="eye eyeL" src="./images/ceL' + 4 + '.png"/>' + 
    //'<img class="eye eyeR" src="./images/ceR' + 4 + '.png"/>' + 
    `</canvas></div>`;
  return html;
}

function nextScreen() {
  var sizes = [
    [2,3],
    [3,4],
    [3,4],
    [3,4],
    [3,4],
    [3,4],
    [4,5],
    [4,5],
    [5,6]
  ];

  if(level >= sizes.length) {
    done();
    return;
  }

  $('.instruction').html('FIND THE TWINS!');
  var width = sizes[level][0];
  var height = sizes[level][1];
  var boxSize = ($('.body').width() / width) - (width * 5);

  var grid = [];
  for(var y = 0; y < height; y++) {
    var row = [];
    grid.push(row);
    for(var x = 0; x < width; x++) {
      row.push(getCritterSegments());
    }
  }

  var twin1x = rand(width);
  var twin1y = rand(height);
  var twin2x = rand(width);
  var twin2y = rand(height);
  while(twin2x == twin1x) {
    twin2x = rand(width);
  }
  while(twin2y == twin1y) {
    twin2y = rand(height);
  }

  grid[twin2y][twin2x] = [].concat(grid[twin1y][twin1x]);

  var out = [];
  var critters = [];
  for(var y = 0; y < height; y++) {
    for(var x = 0; x < width; x++) {
      var id = `critter-${x}-${y}`;
      critters.push({id: id, segs: grid[y][x] });
      out.push(getCritterHtml(id, grid[y][x], boxSize));
    }
    out.push('<br/>');
  }

  $('.level').html('L' + (1 + level));
  $('.body').html(out.join('\n'));

  setTimeout(function() {
    critters.forEach(function(critter) {
      drawCritter(critter, boxSize);
    });
  }, 100);


  setTimeout(function() {
    $('.critterSelected').removeClass('critterSelected');
  }, 200);
  setTimeout(function() {
    $('.critterSelected').removeClass('critterSelected');
  }, 300);  
}

function done(level) {
  $('.level').html('FIN');
  $('.instruction').html('YA DID IT!');
  $('.body').html(`<div class="done">★ NICE! ★<p style="font-size: 30px;">It took you ${gameTime.minutes} minutes, ${gameTime.seconds} seconds</div>`);
}

var startTime = Date.now();
var gameTime = null;
function start() {
  var tmo = setInterval(function() {
    var secondsRunning = (Date.now() - startTime) / 1000;
    var minutesRunning = Math.floor(secondsRunning / 60);
    var secondsInMinuteRunning = (100 + (secondsRunning - minutesRunning * 60)).toFixed(0).substring(1);
    gameTime = { minutes: minutesRunning, seconds: secondsInMinuteRunning };
    $('.time').html(`${minutesRunning}:${secondsInMinuteRunning}`);
  }, 200);

  nextScreen();
}

/*
function start() {
  var startTime = Date.now();
  var lengthOfGameSeconds = 5 * 60 + 0.5;
  var tmo = setInterval(function() {
    var secondsRunning = (Date.now() - startTime) / 1000;
    var secondsLeft = lengthOfGameSeconds - secondsRunning;
    var minutesLeft = Math.floor(secondsLeft / 60);
    var secondsInMinuteLeft = (100 + (secondsLeft - minutesLeft * 60)).toFixed(0).substring(1);
    $('.time').html(`${minutesLeft}:${secondsInMinuteLeft}`);
    if(secondsLeft <= 0) {
      $('.time').html('0:00');
      done(level);
      clearTimeout(tmo);
    }
  }, 200);

  nextScreen();
}*/





var images = { };
function loadImages() {
  ['','-flip'].forEach(function(flip) { 
    ['h','b','r'].forEach(function(seg) {
      for(var i = 0; i < 16; i++) {
        images['c' + seg + i + flip] = new Image;
        images['c' + seg + i + flip].onerror = function() { this.src = this.src + '?' + Date.now(); }
        images['c' + seg + i + flip].onload = function() { this.loaded = true; }
        images['c' + seg + i + flip].src = 'images/c' + seg + i + flip + '-big.png';
      }
    });
  });

  ['','-flip'].forEach(function(flip) { 
    ['L','R'].forEach(function(eye) {
      for(var i = 0; i < 10; i++) {
        images['ce' + eye + i + flip] = new Image;
        images['ce' + eye + i + flip].onerror = function() { this.src = this.src + '?' + Date.now(); }
        images['ce' + eye + i + flip].onload = function() { this.loaded = true; }
        images['ce' + eye + i + flip].src = 'images/ce' + eye + i + flip + '-big.png';
      }
    });
  });
  
  waitLoad();
}

function waitLoad() {
  for(var i in images) {
    if(images[i].onload && !images[i].loaded) {
      return setTimeout(function() { waitLoad(); }, 200);
    }
  }
  $('#start').show();
}

loadImages();

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
  log([critter.id,critterCanvas.height,critterCanvas.width]);

  var critterContext = critterCanvas.getContext("2d", {willReadFrequently: true});
  
  critterContext.globalCompositeOperation = "multiply";

  var flip = Math.random() < 0.5;
  var imageKeys = [
    'ch' + critter.segs[0] + (flip ? '-flip' : '' ),
    'cb' + critter.segs[1] + (flip ? '-flip' : '' ),
    'cr' + critter.segs[2] + (flip ? '-flip' : '' )
  ];
  if(flip) {
    imageKeys.reverse();
  }

  var scale = 2/3 *  critterCanvas.height / images[imageKeys[0]].height;
  //log([critterCanvas.width ,critterCanvas.height , images[imageKeys[0]].height])

  critter.segs.forEach(function(seg, index) {
    critterContext.drawImage(images[imageKeys[index]], Math.floor(images[imageKeys[index]].width * scale * index), 0, images[imageKeys[index]].width * scale, images[imageKeys[index]].height * scale);
  });


  var yOffs = (0.8 * critterCanvas.height) - bottomPixel(critterCanvas, critterContext);

  //var yOffs = bodyBottoms[segs[1]] * critterCanvas.height;
  //log(yOffs)

  var destinationImage = new Image();
  destinationImage.onload = function(){
    //outContext = canvas.getContext('2d');
    var color = [rand(360),rand(35) + 65,rand(25)+75];
    outContext.fillStyle = `hsl(${color[0]},${color[1]}%,${color[2]}%)`;
    outContext.fillRect(0, yOffs, outCanvas.width, outCanvas.height);

    outContext.globalCompositeOperation = "multiply";
    outContext.drawImage(destinationImage, 0, yOffs, critterCanvas.width, critterCanvas.height);
 
    outContext.globalCompositeOperation = "destination-in";
    outContext.drawImage(destinationImage, 0, yOffs, critterCanvas.width, critterCanvas.height)

    outContext.globalCompositeOperation = "source-over";
    var leye = rand(10);
    var reye = leye; if(rand(5) == 0) reye = rand(10);
    while(leye==5 || reye==5) {//TODO WTF
      leye = rand(10);
      reye = leye; if(rand(5) == 0) reye = rand(10);

    }

    var offs = [rand(40), rand(40), rand(40), rand(40)];
    var xOffs = flip ? 1200 : 0;
    var leyeX = 680 + xOffs - images['ceL' + leye].width - offs[0];
    var leyeY = 460 + offs[2] - 10;
    var reyeX = 680 + xOffs + offs[2];
    var reyeY = 460 + offs[3] - 10;
    //log([leyeX,leyeX * scale])
    outContext.drawImage(images['ceL' + leye], leyeX * scale, leyeY * scale + yOffs, images['ceL' + leye].width * scale, images['ceL' + leye].height * scale);
    outContext.drawImage(images['ceR' + reye], reyeX * scale, reyeY * scale + yOffs, images['ceR' + reye].width * scale, images['ceR' + reye].height * scale);
    
    //outContext.drawImage(images['ceR6.png'], 450,400);
  };
  destinationImage.src = critterCanvas.toDataURL();

}


setTimeout(function() {
  start();
}, 400)
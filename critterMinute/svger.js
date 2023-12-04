
/*
drop every path but rgb(1,1,1)
simplify path
etc
*/
const _ = require('lodash');
const { log, args, readCsv, writeCsv, runCommand, SeededRandom } = require('sweet-potato');

var fs = require('fs');

var ImageTracer = require('imagetracerjs' );

var svgParser = require('svg-parser');

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
var PNGReader = require('./node_modules/imagetracerjs/nodecli/PNGReader');

var imageDir = '/Users/joelarson/apps/critterMinute/images/';

var pngFiles = fs.readdirSync(imageDir);
pngFiles = _.filter(pngFiles, function(name) {
  return name.indexOf('png') > -1 && name.indexOf('big') > -1 && name.indexOf('flip') < 0 && name.indexOf('p') !== 0;
});

function nextPng() {
  var file = pngFiles.pop();
  if(!file) {
    log('done');
    return;
  }
  file = file.split('.')[0]

  var infilepath = '/Users/joelarson/apps/critterMinute/images/' + file + '.png';
  var outfilepath = '/Users/joelarson/apps/critterMinute/images/' + file + '.svg';

  fs.readFile(    
    infilepath,
    
    function( err, bytes ){ // fs.readFile callback
      if(err){ console.log(err); throw err; }
    
      var reader = new PNGReader(bytes);
    
      reader.parse( function( err, png ){ // PNGReader callback
        if(err){ console.log(err); throw err; }
        
        // creating an ImageData object
        var myImageData = { width:png.width, height:png.height, data:png.pixels };
        
        // tracing to SVG string
        var options = { }; // options object; option preset string can be used also
        
        var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
        
        var chunks = svgstring.split('<');
        var outchunks = [];

        chunks.forEach(function(chunk) {
          if(chunk.indexOf('path') != 0) {
            outchunks.push(chunk);
            return;
          }
          if(chunk.indexOf(' opacity="0"') > -1 || chunk.indexOf(' 1658 L') > -1 || chunk.indexOf(' 1659 L') > -1  || chunk.indexOf(' 1660 L') > -1) {
            return;
          }
          chunk = chunk.split(' fill="rgb(1,1,1)"').join('').split(' opacity="0.9803921568627451"').join(' opacity="1"');
          var color = chunk.split('(').pop().split(')')[0].split(',');
          var total = Number(color[0])+ Number(color[1])+ Number(color[2]);
          if(total < 50) {
            outchunks.push(chunk);
          }
        });

        svgstring = outchunks.join('\n<');


        /*
        M = move to x y
        L = line
        Z = close path
        V = vertical
        H = horizontal
        */

        //return;

        // writing to file
        console.log( outfilepath + ' saving' ); 
        fs.writeFile(
          outfilepath,
          svgstring,
          function(err){
            if(err){ 
              console.log(err); throw err;
            } 
            
            nextPng();
          }
        );
        
      });// End of reader.parse()
      
    }// End of readFile callback()
    
  );// End of fs.readFile()
}

nextPng();
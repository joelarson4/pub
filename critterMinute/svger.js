
/*
drop every path but rgb(1,1,1)
simplify path
etc
*/


var fs = require('fs');

var ImageTracer = require('imagetracerjs' );

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
var PNGReader = require('./node_modules/imagetracerjs/nodecli/PNGReader' );

// Input and output filepaths / URLs
var infilepath = '/Users/joelarson/apps/critterMinute/images/cb3-big.png';
var outfilepath = '/Users/joelarson/apps/critterMinute/images/cb3-big.svg';


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
            var options = { scale: 0.1, ltres:0.1, qtres:0.1 }; // options object; option preset string can be used also
            
            var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
            
            // writing to file
            fs.writeFile(
                outfilepath,
                svgstring,
                function(err){ if(err){ console.log(err); throw err; } console.log( outfilepath + ' was saved!' ); }
            );
            
        });// End of reader.parse()
        
    }// End of readFile callback()
    
);// End of fs.readFile()
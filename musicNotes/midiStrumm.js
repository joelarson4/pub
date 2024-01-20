const midi = require('midi');

const log = function(text) { console.log(text)}

// Set up a new output.
const output = new midi.Output();

output.openVirtualPort("MorpherOutput");

// Count the available output ports.
console.log('getPortCount:' + output.getPortCount());

// Get the name of a specified output port.
console.log('getPortName:' + output.getPortName(0));

// Open the first available output port.

var notes = [
  40,
  47,
  52,
  56,
  59,
  64,
]

var count = 0;
var tmi =  setInterval(function() {
    console.log('sent');
    // Send a MIDI message.
    //144 = Channel 1 (or zero in MIDI base zero), 145 = Channel 2, etc.

    if(count % 30 < 6) {
      var string = count%6;
      log(string);
      output.sendMessage([144 + string,notes[string],127]); // 146 = channel 3

      setTimeout(function() {
        output.sendMessage([128+ string,notes[string],0]); // 146 = channel 3
      }, 28);      
    }
    if(count % 30 >= 9 && count % 30 < 15) {
      var string = 5-((count + 3)%6);
      log(string);
      output.sendMessage([144+ string,notes[string],80]); // 146 = channel 3

      setTimeout(function() {
        output.sendMessage([128+ string,notes[string],0]); // 146 = channel 3
      }, 60);
    }
    //output.sendMessage([143 + 1, Math.floor(Math.random() * 127),127]); // Play start for drum
    count++;
}, 8);

setTimeout(function() {
// Close the port when done.
    output.closePort();
    cancelInterval(tmi);
}, 260000);
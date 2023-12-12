var fs = require('fs');
var eyes = {
    L: [
        'ceL0-big.png',
        'ceL1-big.png',
        'ceL2-big.png',
        'ceL3-big.png',
        'ceL4-big.png',
        'ceL5-big.png',
        'ceL6-big.png',
        'ceL7-big.png',
        'ceL8-big.png',
        'ceL9-big.png'
        ],
    R: [
        'ceR0-big.png',
        'ceR1-big.png',
        'ceR2-big.png',
        'ceR3-big.png',
        'ceR4-big.png',
        'ceR5-big.png',
        'ceR6-big.png',
        'ceR7-big.png',
        'ceR8-big.png',
        'ceR9-big.png'
        ]
}

var out = [];
for(var l = 0; l < 10; l++) {
    for(var r = 0; r < 10; r++) {
        out.push(`<span style='margin: 10px; display: inline-block; width: 300px; height: 100px; border: 10px solid black; border-radius: 100px'><img src=${eyes.L[l]}><img src=${eyes.R[r]}> ${l} ${r}</span>`);
    }
    out.push('<br>')
}

fs.writeFileSync('./images/edits/eyes.html', out.join('\n'));
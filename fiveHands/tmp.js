var _ = require('lodash');
var fs = require('fs');
var poker = require('pokersolver');
var { log, SeededRandom } = require('sweet-potato');

var list = [
['Royal Flush', 'As,Ks,Qs,Js,Ts'.split(',')],
['Straight Flush', '2h,3h,4h,5h,6h'.split(',')],
['Four of a kind', '2h,2s,2d,2c,9h'.split(',')],
['Full house', '6s,6h,8s,8h,8d'.split(',')],
['Flush', '2h,4h,6h,8h,9h'.split(',')],
['Straight', '2h,3d,4h,5h,6h'.split(',')],
['Three of a kind', 'Jh,Jd,Js,6h,7h'.split(',')],
['Two pair', 'Jh,Jd,4h,4d,7h'.split(',')],
['One pair', 'Jh,Jd,4h,6h,7h'.split(',')],
['High card', 'Jh,2d,4h,6h,7h'.split(',')],
]
list.forEach(function(item) {
    
    var hand = poker.Hand.solve(item[1]);
    log(hand.descr + ' ' + hand.rank);
})
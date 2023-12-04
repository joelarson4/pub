var _ = require('lodash');
var fs = require('fs');
var poker = require('pokersolver');
var { log, SeededRandom } = require('sweet-potato');
const percom = require("percom");

for(var board = 0; board < 50; board++) {
  log('Creating ' + board);
  var rand = new SeededRandom(board);//.substring(0,15));

  function scoreHand(hand) {
    var handResult = poker.Hand.solve(hand);
    handResult.score = handResult.rank;
    if(handResult.rank == 9) {
      if(hand.join().indexOf('A') > -1) {
        handResult.score = 10;//royal flush
      }
    }
    return handResult;
  }

  var ranks = {
    'A': ' A',
    '2': ' 2',
    '3': ' 3',
    '4': ' 4',
    '5': ' 5',
    '6': ' 6',
    '7': ' 7',
    '8': ' 8',
    '9': ' 9',
    'T': '10',
    'J': ' J',
    'Q': ' Q',
    'K': ' K'
  }

  var suits = {
    d: '♢',
    h: '♡',
    s: '♤',
    c: '♧'
  }


  var cards = [];
  _.forOwn(ranks, function(rText, rCode) {
    _.forOwn(suits, function(cText, cCode) {
      cards.push(rCode + cCode);
    })
  });

  rand.shuffle(cards);
  rand.shuffle(cards);
  rand.shuffle(cards);



  var deal = cards.slice(0,25);

  log('  ' + deal.slice(0,5).map((c) => c ).join('  '));
  log('  ' + deal.slice(5,10).map((c) => c ).join('  '));
  log('  ' + deal.slice(10,15).map((c) => c ).join('  '));
  log('  ' + deal.slice(15,20).map((c) => c ).join('  '));

  var highestHands = [];

  function findHighest() {
    var remaining = getRemaining();
    var highestFive = null;
    var perms = percom.per(remaining,5);
    var countsByDesc = {};
    perms.map(function(perm, index) {
      if(index % 500000 == 0) log('  ' + board + ': ' + index + '/' + perms.length);
      var hand = scoreHand(perm);
      if(highestFive == null || highestFive.score < hand.score) {
        highestFive = {
          cards: perm,
          score: hand.score,
          desc: hand.name
        }
      }

      countsByDesc[hand.name] = countsByDesc[hand.name] || { name: hand.name, count: 0 }
      countsByDesc[hand.name].count++;
    });
    log(_.values(countsByDesc));

    return highestFive;
  }

  function getRemaining() {
    var remaining = [].concat(deal);
    highestHands.forEach(function(hand) {
      hand.cards.forEach(function(card) {
        _.remove(remaining, function(r) { return r == card });
      });
    });
    return remaining;
  }


  highestHands.push(findHighest());
  highestHands.push(findHighest());
  highestHands.push(findHighest());
  highestHands.push(findHighest());
  //log(highestHands)
  var score = 0;
  highestHands.forEach(function(hand) { score += hand.score; });
  fs.writeFileSync('./data/board-' + board + '.json', JSON.stringify({ board: board, score: score, highest: highestHands, deal: deal }, 0, '  '));
}
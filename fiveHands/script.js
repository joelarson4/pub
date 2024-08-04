  function log(text) { console.log(text); }

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
    d: '♦️',
    h: '♥️',
    s: '♠️',
    c: '♣️'
  }

  var scores = {
    'Royal Flush': 10,
    'Straight Flush': 9,
    'Four of a Kind': 8,
    'Full House': 7,
    'Flush': 6,
    'Straight': 5,
    'Three of a Kind': 4,
    'Two Pair': 3,
    'Pair': 2,
    'High Card': 1,
  }

  $(function() {
    $('[data-action="help"]').on('click', function() {
      $('#help').show();
      $('#game').hide();
      $('#welcome').hide();
    });


    var board = Math.floor(Math.random() * 100);
    var totalScore = 0;
    $.getJSON('./data/board-' + board + '.json') .done(function( data ) {
      var rowWidth = 5;

      $('#scores').html('Target: ' + data.score);

      var hands = [];

      var html = [''];
      data.deal.forEach(function(card, index) {
        var chunks = card.split('');
        var rank = ranks[chunks[0]];
        var suit = suits[chunks[1]];
        html.push(`<div class="card" data-card="${card}"><span class="rank">${rank}</span><br/><span class="suit">${suit}</span></div>`);
      })

      $('#deal').html(html.join('\n'));

      $('.card').on('click', function() {
        var this$ = $(this);
        if(this$.hasClass('chosen')) return;

        this$.toggleClass('selected');

        var selected = $('.selected');
        if(selected.length == 5) {
          setTimeout(function() {
            handChosen(selected);
          }, 500);
        }
      });

      function scoreHand(hand) {
        var handResult = Hand.solve(hand);
        handResult.score = handResult.rank;
        if(handResult.rank == 9) {
          if(hand.join().indexOf('A') > -1) {
            handResult.score = 10;
          }
        }
        return handResult;
      }

      var ended = false;
      function autoEnd() {
        if(ended) return;
        ended = true;
        $('#deal .card').addClass('selected');
        handChosen($('.selected'));

        setTimeout(function() {
          showComputer();
        }, 2000);
      }

      function handChosen(selected) {
        $('#hands #user h2').show();
        var hand = selected.toArray().map(function(ele) { return ele.getAttribute('data-card'); });
        selected.animate({opacity: 0 },function() {
          selected.remove();
          if($('#deal .card').length == 5) {
            setTimeout(function() { autoEnd(); }, 500);
          }
        });

        var handResult = scoreHand(hand);
        totalScore += handResult.score;

        $('#scores').html('Score: ' + totalScore + ' / ' + data.score);
        var html = [`<div class="row"><h3><span class="points">${handResult.score}p</span> ${handResult.descr}</h3>`];
        hand.sort();
        hand.reverse();
        hand.forEach(function(card, index) {
          var chunks = card.split('');
          var rank = ranks[chunks[0]];
          var suit = suits[chunks[1]];
          html.push(`<div class="card" data-card="${card}"><span class="rank">${rank}</span><br/><span class="suit">${suit}</span></div>`);
        })
        html.push('</div>');
        //log(html)

        $('#user').append(html.join('\n'));
      }

      function showComputer() {
        var html = []
        data.highest.forEach(function(hand) {
          html.push(`<div class="row"><h3><span class="points">${hand.score}p</span> ${hand.desc}</h3>`);
          hand.cards.sort();
          hand.cards.reverse();
          hand.cards.forEach(function(card, index) {
            var chunks = card.split('');
            var rank = ranks[chunks[0]];
            var suit = suits[chunks[1]];
            html.push(`<div class="card" data-card="${card}"><span class="rank">${rank}</span><br/><span class="suit">${suit}</span></div>`);
          })
          html.push('</div>');
        });
        $('#hands').addClass('split').append('<div id="computer"><h2>Computer</h2>' + html.join('') + '</div>');
      }
    });
  });
// client-side js
// run by the browser each time your view template is loaded

$(function() {

});

function log(a,h) {
  if(h) {
    console.log('=== ' + h + ' ===');
  }
  console.log(a);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function showError(message) {
  var header = ['Uh oh...', 'Oops', 'Whoops', 'Rats!', 'Dangit..', 'Whelp...', 'Umm...'];
  $('#error h2').html(getRandomItem(header));
  $('#error p').html(message);
  $('#error').show();
}

function showAuthButton() {
  $('#authButton').show();
}
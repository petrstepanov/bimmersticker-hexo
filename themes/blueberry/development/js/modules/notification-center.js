
// Popup notifications based on noty.js
var Noty = require('noty');

function makeHtml(type, text) {
  return '<p class="type">' + type.toUpperCase() + '</p><p>' + text + '</p>';
}

function notify(type, text, timeout) {
  var milliseconds = typeof timeout !== 'undefined' ? timeout : 5000;
  new Noty({
    type: type,
    text: makeHtml(type, text),
    layout: 'responsive',
    theme: 'custom',
    timeout: milliseconds,
    animation: {
      open: 'animate__animated animate__fadeInUp', // Animate.css class names
      close: 'animate__animated animate__fadeOutUp' // Animate.css class names
    }
  }).show();
}

exports.notify = notify;
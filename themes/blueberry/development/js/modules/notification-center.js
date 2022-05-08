
// Popup notifications based on noty.js
var Toastify = require('toastify-js')

// function makeHtml(type, text) {
//   return '<p class="type">' + type.toUpperCase() + '</p><p>' + text + '</p>';
// }

function notify(type, message, timeout) {
  var milliseconds = typeof timeout !== 'undefined' ? timeout : 5000;
  // new Noty({
  //   type: type,
  //   text: makeHtml(type, text),
  //   layout: 'responsive',
  //   theme: 'custom',
  //   timeout: milliseconds,
  //   animation: {
  //     open: 'animate__animated animate__fadeInUp', // Animate.css class names
  //     close: 'animate__animated animate__fadeOutUp' // Animate.css class names
  //   }
  // }).show();

  Toastify({
    text: message,
    duration: milliseconds,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    className: type
  }).showToast();
}

exports.notify = notify;
// Show or hide 'Buy' button on navbar product page

var $ = require('jquery');
var events = require('./events');

var DOM = {};
// var options = {};

function _cacheDom(element) {
  DOM.$el = $(element);
  // DOM.$button = $(element).find('.js--buy-button');
}

function _bindEvents(element) {
  events.on('buyButtonViewport', function (data) {
    if (data.contentButtonVisible) {
      DOM.$el.fadeOut();
    } else {
      DOM.$el.fadeIn();
    }
  });
}

function init(element) {
  if (element) {
    // options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

exports.init = init;

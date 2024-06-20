// Show or hide 'Buy' button on navbar product page

var $ = require('cash-dom');
var events = require('./events');

var DOM = {};

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  events.on('buyButtonViewport', function (data) {
    if (data.contentButtonVisible) {
      DOM.$el.removeClass('visible')
    } else {
      DOM.$el.addClass('visible')
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

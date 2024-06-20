// Emit event when 'Buy' button on the post's page goes out of viewport

var $ = require('cash-dom');
var events = require('./events');
var helpers = require('./helpers');

var DOM = {};
// var options = {};

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  $(window).on("scroll", function() {
    _checkContentButtonViewport();
  });
  _checkContentButtonViewport();
}

function _checkContentButtonViewport(){
  const isInViewport = helpers.isInViewport(DOM.$el);
  events.emit('buyButtonViewport', {contentButtonVisible: isInViewport});
}

// function _render(options){
// }

function init(element) {
  if (element) {
    // options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

exports.init = init;
// exports.checkContentButtonViewport = checkContentButtonViewport;
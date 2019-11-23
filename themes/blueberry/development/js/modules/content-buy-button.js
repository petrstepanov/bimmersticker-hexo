// Emit event when 'Buy' button on the post's page goes out of viewport

var $ = require('jquery');
var events = require('./events');
var helpers = require('./helpers');

var DOM = {};
// var options = {};

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  $(window).scroll(function() {
    _checkContentButtonViewport();
  });
  _checkContentButtonViewport();
}

function _checkContentButtonViewport(){
  events.emit('buyButtonViewport', {contentButtonVisible: helpers.isInViewport(DOM.$el)});
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
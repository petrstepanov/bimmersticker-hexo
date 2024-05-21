// Ajax form submission logic

var $ = window.$ = window.jQuery = require('jquery');
var kinetic = require('jquery.kinetic');

var ContainerHorizontal = function(){
  var DOM = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
  }

  function _isTouchScreen(){
    // https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
    return window.matchMedia("(pointer: coarse)").matches;
  }

  function _bindEvents(){
    // If not touchscreen device - fallback to kinetic scroll plugin
    if (!_isTouchScreen()){
      DOM.$el.css('overflow-x', 'hidden');
      DOM.$el.kinetic();
    }
  }

  function init(element){
    if (element){
      // options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };
};

module.exports = ContainerHorizontal;
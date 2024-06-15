// Ajax form submission logic
var $ = require('jquery');
var kinetic = require('jquery.kinetic');
var events = require('./events');

var ContainerHorizontal = function(){
  var DOM = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$iconTrackpad = DOM.$el.find('.js--trackpad');
    DOM.$iconMouse = DOM.$el.find('.js--mouse');
    DOM.$icons = DOM.$el.find('span');
  }

  function _bindEvents(state) {
    events.on('usingTrackpadOrMouseEvent', function(device){
      if (device === 'trackpad'){
        DOM.$icons.hide();
        DOM.$iconTrackpad.show();
      }
      else if (device === 'mouse'){
        DOM.$icons.hide();
        DOM.$iconMouse.show();

        DOM.$el.css('overflow-x', 'hidden');
        DOM.$el.kinetic();
      }
    });
  }

  function init(element, state){
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
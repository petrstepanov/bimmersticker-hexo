// Ajax form submission logic
// var $ = require('jquery');
// var events = require('../js/modules/events');
// var kinetic = window.kinetic = require('jquery.kinetic');

var DetectTrackpadMouse = function (events) {

  function _wheelListener(event){
      var delta = Math.abs(event.deltaY);
      if (delta % 1 > 0){
          // console.log("Trackpad detected");
          events.emit('usingTrackpadOrMouseEvent', 'trackpad');
      }
      else {
          // console.log("Mouse detected");
          events.emit('usingTrackpadOrMouseEvent', 'mouse');
      }
      document.removeEventListener("wheel", _wheelListener);
  }

  function _bindEvents() {
      document.addEventListener("wheel", _wheelListener);
  }

  function init() {
      _bindEvents();
  }

  return {
      init: init
  };
};

var ContainerHorizontal = function($, events, kinetic){
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

$(function() {
  // Instantiate horizontal container plugin
  $('.js--component-container-horizontal').each(function(){
    var cH = new ContainerHorizontal(window.$, window.events, window.kinetic);
    cH.init(this);
  });

  // Instantiate after ContainerHorizontal because it throws the event
  var dTM = new DetectTrackpadMouse(window.events);
  dTM.init();
});
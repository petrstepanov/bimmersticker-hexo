// Ajax form submission logic

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

var ContainerHorizontal = function($, events){
  var DOM = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$inner = DOM.$el.find('.container-horizontal-inner');
    DOM.$cards = DOM.$inner.find('.container-horizontal-card');
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
        // TODO: initialize custom kinetic plugin
      }
    });
  }

  function _render(){
    // https://stackoverflow.com/questions/7070054/javascript-shuffle-html-list-element-order
    var parentEl = DOM.$inner[0];
    for (var i = parentEl.children.length; i >= 0; i--) {
      parentEl.appendChild(parentEl.children[Math.random() * i | 0]);
    }
  }

  function init(element, state){
    if (element){
      // options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
      _render();
    }
  }

  return {
    init: init
  };
};

$(document).ready(function() {
  // Instantiate horizontal container plugin
  $('.js--component-container-horizontal').each(function(){
    var cH = new ContainerHorizontal($, window.events);
    cH.init(this);
  });

  // Instantiate after ContainerHorizontal because it throws the event
  var dTM = new DetectTrackpadMouse(window.events);
  dTM.init();
});
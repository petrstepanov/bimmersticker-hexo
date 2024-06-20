// Ajax form submission logic

var kinetic = require('jquery.kinetic');

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
        DOM.$el.kinetic();
      }
    });
  }

  function _render(){
    // $.fn.randomize = function(selector){
    //   (selector ? this.find(selector) : this).parent().each(function(){
    //       $(this).children(selector).sort(function(){
    //           return Math.random() - 0.5;
    //       }).detach().appendTo(this);
    //   });
    //   return this;
    // };
    // DOM.$cards.randomize();

    $.fn.shuffle = function() {
      var allElems = this.get(),
          getRandom = function(max) {
              return Math.floor(Math.random() * max);
          },
          shuffled = $.map(allElems, function(){
              var random = getRandom(allElems.length),
                  randEl = $(allElems[random]).clone(true)[0];
              allElems.splice(random, 1);
              return randEl;
         });
      this.each(function(i){
          $(this).replaceWith($(shuffled[i]));
      });
      return $(shuffled);
    };
    DOM.$cards.shuffle();
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

$(function() {
  // Instantiate horizontal container plugin
  $('.js--component-container-horizontal').each(function(){
    var cH = new ContainerHorizontal(window.$, window.events, kinetic);
    cH.init(this);
  });

  // Instantiate after ContainerHorizontal because it throws the event
  var dTM = new DetectTrackpadMouse(window.events);
  dTM.init();
});
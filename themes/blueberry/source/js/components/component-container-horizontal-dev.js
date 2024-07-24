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

var KineticScroll = function($){
  var DOM = {};
  var elScrollXBefore = 0;
  var eventXBefore = 0;

  var timeBefore = 0;

  const States = {
    Idle: 0,
    Moving: 1,
    Kinetic: 2
  }

  var kineticInterval;

  var state = States.Idle;

  function _cacheDom(element){
    DOM.$el = $(element);
  }

  function _bindEvents(){
    DOM.$el.on('mousedown', function(event){
      elScrollXBefore = DOM.$el.get(0).scrollLeft;
      eventXBefore = event.clientX;
      timeBefore = (new Date()).getTime();
      // if (state === States.Kinetic){
      //   // TODO: stop kinetic timeout
      //   clearInterval(kineticInterval);
      // }
      state = States.Moving;
    });

    DOM.$el.on('mousemove', function(event){
      if (state === States.Moving){
        var deltaX = eventXBefore - event.clientX;
        DOM.$el.get(0).scroll(elScrollXBefore + deltaX, 0);
      }
    });

    var doKinetic = function(event){
      if (state === States.Moving){
        state = States.Kinetic;
        var kineticDistance = eventXBefore - event.clientX;
        var kineticTime = (new Date()).getTime() - timeBefore;
        console.log("Distance " + kineticDistance);
        console.log("Time " + kineticTime);
      }
    };

    DOM.$el.on('mouseup', function(event){
      doKinetic(event);
    });

    DOM.$el.on('mouseout', function(event){
      doKinetic(event);
    });

    // DOM.$el.on("scroll", function(event){
    //   console.log(this.scrollLeft);
    // });
  }

  function init(element){
    _cacheDom(element);
    _bindEvents();
  }

  return {
    init: init
  }
}

var ContainerHorizontal = function($, events, Kinetic, Vector){
  var DOM = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$inner = DOM.$el.find('.container-horizontal-inner');
    DOM.$cards = DOM.$inner.find('.container-horizontal-card');
    DOM.$iconTrackpad = DOM.$el.find('.js--trackpad');
    DOM.$iconMouse = DOM.$el.find('.js--mouse');
    DOM.$icons = DOM.$el.find('.swipe-hint span');
  }

  function _bindEvents(state) {
    events.on('usingTrackpadOrMouseEvent', function(device){
      if (device === 'trackpad'){
        DOM.$icons.hide();
        DOM.$iconTrackpad.show();
      }
      else if (device === 'mouse'){
        DOM.$icons.hide();
        DOM.$iconMouse.show(); //asd

        DOM.$el.css('overflow-x', 'hidden');
        // Initialize custom kinetic plugin
        // ks = new KineticScroll($);
        // ks.init(DOM.$el.get(0));

        // Copied from https://www.npmjs.com/package/kinetica
        // Found plugin on npm "kinetic scroll"
        var $target = DOM.$inner.get(0);

        requestAnimationFrame(function loop (t) {
          Kinetic.notify(t)
          requestAnimationFrame(loop)
        })

        var kinetic = new Kinetic({
          el: DOM.$el.get(0),
          Vector: Vector
        })

        Kinetic.spawn(kinetic)

        var position = new Vector(0, 0)

        function scrollTo (position) {
          $target.style.transform = `translateX(${position.x}px)`
        }

        function isValidScroll (position) {
          // return position.x <= 0 && position.x > -5000 + window.innerWidth
          return position.x <= 0 && position.x > -(DOM.$inner.width()) + window.innerWidth
        }

        function scrollX (pointers) {
          if (pointers.length === 1) {
            var pointer = pointers[0]
            var next = position.add(pointer.delta)
            if (isValidScroll(next)) {
              scrollTo(next)
              position = next
            }
          }
        }

        kinetic.subscribe(scrollX)

        // Tweak picture link clicks. Interferes with Kinetic.
        DOM.$cards.find('.img-wrapper img').each(function ( index, element ){
          $(element).parent().parent().prepend(element);
        });
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
    var cH = new ContainerHorizontal($, window.events, window.kinetica, window.vectory);
    cH.init(this);
  });

  // Instantiate after ContainerHorizontal because it throws the event
  var dTM = new DetectTrackpadMouse(window.events);
  dTM.init();
});
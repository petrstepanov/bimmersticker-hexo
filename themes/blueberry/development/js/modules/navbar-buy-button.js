var NavbarBuyButton = function(){
  var DOM = {};
  // var options = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
    // DOM.$button = $(element).find('.js--buy-button');
  }

  function _bindEvents(element) {
    Events.on('buyButtonViewport', function(data){
      _render(data);
    });
  }

  function _render(data){
    if (data.contentButtonVisible){
      DOM.$el.fadeOut();
    } else {
      DOM.$el.fadeIn();
    }
  }

  function init(element) {
    if (element) {
      // options = $.extend(options, $(element).data());
      _cacheDom(element);
      _bindEvents();
      // _render();
    }
  }

  return {
    init: init
  };
};

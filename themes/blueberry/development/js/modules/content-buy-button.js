var ContentBuyButton = function(){
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
    Events.emit('buyButtonViewport', {contentButtonVisible: Helpers.isInViewport(DOM.$el)});
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

  return {
    init: init
  };
};

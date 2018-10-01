var SmoothScroll = (function(){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$links = $("body").find('a[href^="#"]').not('[href="#"]');
  }

  function _bindEvents(element) {
    DOM.$links.click(_onLinkClicked);
    // DOM.$el.on('event', 'selector', _handleEvent);
  }

  function _onLinkClicked(event){
    event.preventDefault();
    var $target = $(event.currentTarget.getAttribute('href'));
    if ($target.length){
      var offset = $target.offset().top - 30;
      if (NavbarFixer.isFixed()){
        offset -= NavbarFixer.getNavbarHeight();
      }
      $('html, body').animate({
        scrollTop: offset
      }, 500);
    }
  }

  // function _render(){
  //
  // }

  function init(element) {
    options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }

  return {
    init: init
  };
})();
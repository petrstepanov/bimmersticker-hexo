var NavbarFixer = function(){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$navbar = $(element);
  }

  function _bindEvents(element) {
    $(window).resize(function(){
      _calcNavbarHeight();
      _fixReleaseNavbar();
    });
  }

  function _calcNavbarHeight(){
    options.navbarHeight = DOM.$navbar.outerHeight();
  }

  function _fixReleaseNavbar(){
    if (window.outerWidth < options.maxFixedWidth){
      DOM.$navbar.addClass('fixed-top');
      $('body').css('margin-top', options.navbarHeight + 'px');
    }
    else {
      DOM.$navbar.removeClass('fixed-top');
      $('body').css('margin-top', 0);
    }
  }

  function _render(){
    _calcNavbarHeight();
    _fixReleaseNavbar();
  }

  function init(element) {
    if (element) {
      options = $.extend(options, $(element).data());
      _cacheDom(element);
      _bindEvents();
      _render();
    }
  }

  return {
    init: init
  };
};

// Fixes Navbar for vieport width less than a set threshold

var NavbarFixer = function(){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$navbar = $(element);
  }

  function _bindEvents(element) {
    $(window).resize(function(){
      _fixReleaseNavbar();
    });
  }

  function _fixReleaseNavbar(){
    if (_checkNeedsFixed()){
      DOM.$navbar.addClass('fixed-top');
      $('body').css('margin-top', DOM.$navbar.outerHeight() + 'px');
    } else {
      DOM.$navbar.removeClass('fixed-top');
      $('body').css('margin-top', 0);
    }
  }

  function _checkNeedsFixed(){
    if (Helpers.getViewportSize().width < options.maxFixedWidth){
      return true;
    }
    return false;
  }

  function _render(){
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

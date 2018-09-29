// Fixes Navbar for vieport width less than a set threshold

var NavbarFixer = (function(){
  var DOM = {};
  var options = {};
  var fixed = false;
  var height;

  function _cacheDom(element) {
    DOM.$navbar = $(element);
    DOM.$navbarToggler = DOM.$navbar.find('.navbar-toggler');
  }

  function _bindEvents(element) {
    $(window).resize(function(){
      _checkNavbarHeight();
      _fixReleaseNavbar();
    });
    DOM.$navbar.on('click', '.nav-link', function(){
      _collapseNavbar();
    });
  }

  function _fixReleaseNavbar(){
    if (_checkNeedsFixed()){
      DOM.$navbar.addClass('fixed-top');
      $('body').css('margin-top', getNavbarHeight() + 'px');
      fixed = true;
    } else {
      DOM.$navbar.removeClass('fixed-top');
      $('body').css('margin-top', 0);
      fixed = false;
    }
  }

  function _checkNavbarHeight(){
    _collapseNavbar();
    if (DOM.$navbarToggler.hasClass('collapsed')){
      height = DOM.$navbar.outerHeight();
    }
  }

  function _collapseNavbar(){
    if (!DOM.$navbarToggler.hasClass('collapsed')){
      DOM.$navbarToggler.click();
    }
  }

  function _checkNeedsFixed(){
    if (Helpers.getViewportSize().width < options.maxFixedWidth){
      return true;
    }
    return false;
  }

  function _render(){
    _checkNavbarHeight();
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

  function isFixed(){
    return fixed;
  }

  function getNavbarHeight(){
    return height;
  }


  return {
    init: init,
    isFixed: isFixed,
    getNavbarHeight: getNavbarHeight
  };
})();

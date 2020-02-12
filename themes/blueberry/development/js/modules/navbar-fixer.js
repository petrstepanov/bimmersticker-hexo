// Fixes Navbar for vieport width less than a set threshold

var $ = require('jquery');
var helpers = require('./helpers');

var DOM = {};
var options = {};
var fixed = false;
var height = 0;

function _cacheDom(element) {
  DOM.$navbar = $(element);
  DOM.$navbarToggler = DOM.$navbar.find('.navbar-toggler');
  DOM.$navbarCollapse = DOM.$navbar.find('.navbar-collapse');
  DOM.$iconOpen = DOM.$navbar.find('.js--icon-open');
  DOM.$iconClose = DOM.$navbar.find('.js--icon-close');
}

function _bindEvents(element) {
  $(window).resize(function () {
    _checkNavbarHeight();
    _fixReleaseNavbar();
  });
  // Close navbar when clicking outside of tha navbar
  $('body').on('click', function (event) {
    console.log("body click");
    // if click was coming not from navbar - hide navbar
    if (!$.contains(DOM.$navbar[0], event.target)){
      _collapseNavbar();
    }
  });

  // Collapse navbar after clicking on navbar link
  DOM.$navbar.on('click', '.nav-link', function(event) {
    console.log("nav-link click");
    _collapseNavbar();
  });

  // Swap navbar icons hamburger and close
  DOM.$navbarCollapse.on('show.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceOut', function(){
      DOM.$iconOpen.hide();
      DOM.$iconClose.show();
      helpers.animateCSS(DOM.$iconClose.get(0), 'rotateIn');
    });
    // DOM.$iconClose.fadeOut('fast', function(){
    //   DOM.$iconOpen.fadeIn('fast');
    // });
  });
  DOM.$navbarCollapse.on('hide.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconClose.get(0), 'rotateOut', function(){
      DOM.$iconClose.hide();
      DOM.$iconOpen.show();
      helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceIn');
    });      
    // DOM.$iconOpen.fadeOut('fast', function(){
    //   DOM.$iconClose.fadeIn('fast');
    // });
  });
}

function _fixReleaseNavbar() {
  if (_checkNeedsFixed()) {
    DOM.$navbar.addClass('fixed-top');
    $('body').css('padding-top', getNavbarHeight() + 'px');
    fixed = true;
  } else {
    DOM.$navbar.removeClass('fixed-top');
    $('body').css('padding-top', 0);
    fixed = false;
  }
}

function _checkNavbarHeight() {
  _collapseNavbar();
  if (!DOM.$navbarCollapse.hasClass('show')) {
    height = DOM.$navbar.outerHeight();
  }
}

function _collapseNavbar() {
  DOM.$navbarCollapse.collapse('hide');
}

function _checkNeedsFixed() {
  if (helpers.getViewportSize().width < options.maxFixedWidth) {
    return true;
  }
  return false;
}

function _render() {
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

function isFixed() {
  return fixed;
}

function getNavbarHeight() {
  return height;
}


exports.init = init;
exports.isFixed = isFixed;
exports.getNavbarHeight = getNavbarHeight;
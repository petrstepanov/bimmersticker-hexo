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
}

function _bindEvents(element) {
  $(window).resize(function () {
    _checkNavbarHeight();
    _fixReleaseNavbar();
  });
  DOM.$navbar.on('click', '.nav-link', function () {
    _collapseNavbar();
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
  if (DOM.$navbarCollapse.hasClass('show')) {
    DOM.$navbarToggler.click();
  }
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
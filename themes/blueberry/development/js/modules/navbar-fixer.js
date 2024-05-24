// Fixes Navbar for vieport width less than a set threshold

var $ = require('jquery');
var helpers = require('./helpers');

var DOM = {};
var options = {};

function _cacheDom(element) {
  DOM.$navbar = $(element);
  DOM.$navbarToggler = DOM.$navbar.find('.navbar-toggler');
  DOM.$navbarCollapse = DOM.$navbar.find('.navbar-collapse');
  DOM.$iconOpen = DOM.$navbar.find('.js--icon-open');
  DOM.$iconClose = DOM.$navbar.find('.js--icon-close');
}

function _bindEvents(element) {
  // Close navbar when clicking outside of tha navbar
  $('body').on('click', function (event) {
    // if click was coming not from navbar - hide navbar
    if (!$.contains(DOM.$navbar[0], event.target)){
      _collapseNavbar();
    }
  });

  // Collapse navbar after clicking on navbar link
  DOM.$navbar.on('click', '.nav-link', function(event) {
    _collapseNavbar();
  });

  // Swap navbar icons hamburger and close
  DOM.$navbarCollapse.on('show.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceOut', function(){
      DOM.$iconOpen.hide();
      DOM.$iconClose.show();
      helpers.animateCSS(DOM.$iconClose.get(0), 'rotateIn');
    });
  });
  DOM.$navbarCollapse.on('hide.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconClose.get(0), 'rotateOut', function(){
      DOM.$iconClose.hide();
      DOM.$iconOpen.show();
      helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceIn');
    });
  });
}

function _collapseNavbar() {
  DOM.$navbarCollapse.collapse('hide');
}

function init(element) {
  if (element) {
    options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

exports.init = init;
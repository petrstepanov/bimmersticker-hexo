// Fixes Navbar for vieport width less than a set threshold

var $ = require('cash-dom');
var helpers = require('./helpers');
// var events = require('./events');
// var bsCollapse = require('bootstrap/js/dist/collapse');

var DOM = {};
var options = {};
// var fixed = false;
// var height = 0;
var bsCollapse;

function _cacheDom(element) {
  DOM.$navbar = $(element);
  DOM.$navbarToggler = DOM.$navbar.find('.navbar-toggler');
  DOM.$navbarCollapse = DOM.$navbar.find('.navbar-collapse');
  DOM.$iconOpen = DOM.$navbar.find('.js--icon-open');
  DOM.$iconClose = DOM.$navbar.find('.js--icon-close');
}

function _bindEvents(element) {
  // Close navbar when clicking outside of tha navbar
  // events.on('documentClick', function (event) {
  //     _collapseNavbar();
  // });

  // Collapse navbar after clicking on navbar link
  DOM.$navbar.on('click', '.nav-link', function (event) {
    _collapseNavbar();
  });

  // DOM.$navbar.on('click', function (event) {
  //   event.stopPropagation();
  // });

  // Swap navbar icons hamburger and close
  DOM.$navbarCollapse.on('show.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceOut', function () {
      DOM.$iconOpen.hide();
      DOM.$iconClose.show();
      helpers.animateCSS(DOM.$iconClose.get(0), 'rotateIn');
    });
  });

  DOM.$navbarCollapse.on('hide.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconClose.get(0), 'rotateOut', function () {
      DOM.$iconClose.hide();
      DOM.$iconOpen.show();
      helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceIn');
    });
  });
}

function _collapseNavbar() {
  // BS5 Collapse plugin: https://stackoverflow.com/a/74738412
  // if the instance is not yet initialized then create new collapse
  if (typeof bsCollapse === "undefined") {
    let id = "#" + DOM.$navbarCollapse.attr("id");
    bsCollapse = new bsCollapse(id, {
          toggle: false
    });
  }

  bsCollapse.hide();
}

function init(element) {
  if (element) {
    options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

// function isFixed() {
//   return fixed;
// }

// function getNavbarHeight() {
//   return height;
// }


exports.init = init;
// exports.isFixed = isFixed;
// exports.getNavbarHeight = getNavbarHeight;
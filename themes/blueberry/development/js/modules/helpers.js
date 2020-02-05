// Helper module

var $ = require('jquery');

function isInViewport($el) {
  var elementTop = $el.offset().top;
  var elementBottom = elementTop + $el.outerHeight();
  var viewportTop = $(window).scrollTop();
  // If fixed navbar
  if ($('.js--navbar-blueberry.fixed-top').length) {
    viewportTop += $('.js--navbar-blueberry.fixed-top').outerHeight();
  }
  var viewportBottom = viewportTop + $(window).height();
  // return elementBottom > viewportTop && elementTop < viewportBottom;
  return elementBottom > viewportTop;
}

function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  };
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function objectifyForm(formArray) {//serialize data function
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

exports.isInViewport = isInViewport;
exports.getViewportSize = getViewportSize;
exports.offset = offset;
exports.objectifyForm = objectifyForm;

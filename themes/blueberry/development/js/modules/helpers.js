// Helper module

var $ = require('cash-dom');

function isInViewport($el) {
  var elementTop = $el.offset().top;
  var elementBottom = elementTop + $el.outerHeight();
  var viewportTop = window.scrollY; //$(window).scrollTop();
  // If fixed navbar
  if ($('.js--navbar-blueberry.fixed-top').length) {
    viewportTop += $('.js--navbar-blueberry.fixed-top').outerHeight();
  }
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
  // return elementBottom > viewportTop;
}

function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  };
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.scrollY || document.documentElement.scrollLeft,
    scrollTop = window.scrollY || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function objectifyForm(formArray) {//serialize data function
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function parseFirstLastName(string){
  var obj = {
    firstName: string,
    lastName: ""
  };

  var array = string.match(/(\S*)\s*(.*)/);
  if (array && array.length == 3){
    obj.firstName = array[1];
    obj.lastName = array[2];
  }
  return obj;
}

function animateCSS(node, animationName, callback, speed) {
  var animationSpeed = typeof speed !== 'undefined' ? speed : '500ms';
  node.style.setProperty('--animate-duration', animationSpeed);
  var prefix = 'animate__';
  node.classList.add(prefix+'animated', prefix+animationName);

  function handleAnimationEnd() {
      node.classList.remove(prefix+'animated', prefix+animationName);
      node.removeEventListener('animationend', handleAnimationEnd);
      if (typeof callback === 'function') callback();
  }

  node.addEventListener('animationend', handleAnimationEnd);
}

function getFormData($form){
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function(n, i){
      indexed_array[n['name']] = n['value'];
  });

  return indexed_array;
}

exports.isInViewport = isInViewport;
exports.getViewportSize = getViewportSize;
exports.offset = offset;
exports.objectifyForm = objectifyForm;
exports.parseFirstLastName = parseFirstLastName;
exports.animateCSS = animateCSS;
exports.getFormData = getFormData;
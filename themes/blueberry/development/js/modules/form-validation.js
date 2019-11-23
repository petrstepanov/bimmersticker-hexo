// HTML5 form validation
// https://pageclip.co/blog/2018-02-20-you-should-use-html5-form-validation.html

var $ = require('jquery');
var helpers = require('./helpers');

var DOM = {};
// var options = {};
var invalidClassName = 'invalid';

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents() {
  // Add a css class on submit when the input is invalid.
  DOM.$el[0].addEventListener('invalid', function () {
    DOM.$el[0].classList.add(invalidClassName);
    // Scroll into view if not in view
    if (!helpers.isInViewport(DOM.$el)) {
      $('html, body').animate({
        scrollTop: DOM.$el.offset().top - 200
      }, 500);
    }
  });

  // Remove the class when the input becomes valid.
  // 'input' will fire each time the user types
  DOM.$el[0].addEventListener('input', function () {
    if (DOM.$el[0].validity.valid) {
      DOM.$el[0].classList.remove(invalidClassName);
    }
  });
}

function init(element) {
  if (element) {
    // options = $.extend(options, element.dataset);
    _cacheDom(element);
    _bindEvents();
  }
}

exports.init = init;
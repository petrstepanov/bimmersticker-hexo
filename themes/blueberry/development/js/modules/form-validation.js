// HTML5 form validation
// https://pageclip.co/blog/2018-02-20-you-should-use-html5-form-validation.html

var $ = require('jquery');
var helpers = require('./helpers');

var DOM = {};

function _cacheDom(elements) {
  DOM.els = $.makeArray(elements);
}
// var options = {};
var invalidClassName = 'invalid';

function _bindEvents(elements){
  elements.forEach(function (element) {
    // Add a css class on submit when the input is invalid.
    element.addEventListener('invalid', function () {
      element.classList.add(invalidClassName);
      // If element is first in the :invalid list then scroll to top
      var currentElIndex = DOM.els.indexOf(element);
      isInvalid = function (element) {
        return $(element).is(':invalid');
      };
      var firstInvalidElIndex = DOM.els.findIndex(isInvalid);
      if (currentElIndex == firstInvalidElIndex){
        if (!helpers.isInViewport($(element))) {
          $('html, body').animate({
            scrollTop: $(element).offset().top - 150
          }, 500);
        }
      }
    });

    // Remove the class when the input becomes valid.
    // 'input' will fire each time the user types
    element.addEventListener('input', function () {
      if (element.validity.valid) {
        element.classList.remove(invalidClassName);
      }
    });
  });
}

function init(elements) {
  if (elements) {
    // options = $.extend(options, element.dataset);
    _cacheDom(elements);
    _bindEvents(elements);
  }
}

exports.init = init;
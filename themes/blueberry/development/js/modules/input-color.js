// Ajax form submission logic

const $ = require('jquery');
const getColorFriendlyName = require('named-web-colors');

var InputColor = function(){
  var DOM = {};
  // var options = {};

  function _cacheDom(element) {
    DOM.$input = $(element).find('input');
    DOM.$label = $(element).find('label');

    // Create new DOM elements
    DOM.$inputColor = $("<div>", {"class": "select-color is-Closed for-picker"});
    DOM.$inputColor.append(_createColorPillElement(DOM.$input.val()));
    DOM.$inputColor.insertAfter(DOM.$input);

    DOM.$pillColor = DOM.$inputColor.find('.select-color-pill-color');
    DOM.$pillText = DOM.$inputColor.find('.select-color-pill-text');
    DOM.$pillTextExtra = DOM.$inputColor.find('.select-color-pill-extra');
    // Hide original select
    // $invisible = $("<div>", {"class": "zero-size-invisible"});
    // $invisible.insertBefore(DOM.$input);
    // $invisible.append(DOM.$input);
    DOM.$input.hide();
  }

  function _createColorPillElement(colorValue){
    // Value can be "Black & red" - show 2 circles in the pill!
    var $pill = $("<div>", {"class": "select-color-pill"});
    $("<div>", {"class": "select-color-pill-color"}).css('background-color', colorValue).appendTo($pill);
    $("<span class='select-color-pill-text'>" + getColorFriendlyName(colorValue).name + "</span>").appendTo($pill);
    $('<span class="select-color-pill-extra">' + colorValue + '</span>').appendTo($pill);
    return $pill;
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$input.on('change', function() {
      var newColor = $(this).val();
      DOM.$pillColor.css('background-color', newColor);
      const friendlyName = getColorFriendlyName(newColor).name;
      DOM.$pillText.text(friendlyName);
      DOM.$pillTextExtra.text(newColor)
    });

    // Backward select event
    DOM.$inputColor.on('click', function(event) {
      event.stopPropagation();
      DOM.$label.click();
    });
  }

  function init(element){
    if (element){
      // options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };
};

module.exports = InputColor;
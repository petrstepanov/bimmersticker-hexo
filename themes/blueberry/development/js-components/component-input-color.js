var getColorFriendlyName = require('named-web-colors');

var InputColor = function($, getColorFriendlyName){
  var DOM = {};
  // var options = {};

  function _cacheDom(element) {
    DOM.$input = $(element);
    DOM.$label = $(element).parent().find('label[for='+ $(element).attr("id") +']');

    // Create new DOM elements
    DOM.$inputColor = $("<div>").addClass("component-select-color is-Closed for-picker");
    DOM.$inputColor.append(_createColorPillElement(DOM.$input.val()));
    DOM.$inputColor.insertAfter(DOM.$input);

    DOM.$pillColor = DOM.$inputColor.find('.select-color-pill-color');
    DOM.$pillText = DOM.$inputColor.find('.select-color-pill-text');
    DOM.$pillTextExtra = DOM.$inputColor.find('.select-color-pill-extra');

    // Hide original select
    $invisible = $("<div>").addClass("zero-size-invisible");
    $invisible.insertAfter(DOM.$input);
    $invisible.append(DOM.$input);
  }

  function _createColorPillElement(colorValue){
    // Value can be "Black & red" - show 2 circles in the pill!
    var $pill = $("<div>").addClass("select-color-pill");
    $("<div>").addClass("select-color-pill-color").css('background-color', colorValue).appendTo($pill);
    $("<span>").addClass('select-color-pill-text').text(getColorFriendlyName(colorValue).name).appendTo($pill);
    $("<span").addClass("select-color-pill-extra").html(colorValue).appendTo($pill);
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

    // Activate color picker
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

$(document).ready(function() {
  $('.js--component-input-color').each(function(){
    var inputColor = new InputColor($, getColorFriendlyName);
    inputColor.init(this);
  });
});
// Ajax form submission logic

var $ = require('jquery');

var SelectColor = function(){
  var DOM = {};
  var options = {};

  const States = {
    Open: 0,
    Closed: 1,
    Transition: 2
  }

  var state = States.Closed;

  function _createColorPillElement(colorValue){
    // Value can be "Black & red" - show 2 circles in the pill!
    var colorsArray = colorValue.split('&');
    var $pill = $("<div>", {"class": "select-color-pill", "data-value": colorValue});
    for (color of colorsArray){
      $("<div>", {"class": "select-color-pill-color " + color.toLowerCase()}).appendTo($pill);
    }
    $("<span>" + colorValue + "</span>", {"class": "select-color-pill-text"}).appendTo($pill);
    return $pill;
  }

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectColor = $("<div>", {"class": "select-color"});

    // Iterate all <option /> elements
    DOM.$options.each(function(){
      // Create color pill element
      const colorValue = $(this).attr("value");
      $pill = _createColorPillElement(colorValue);

      // Reflect selected option
      if ($(this).is(':selected')){
        $pill.addClass("selected");
      }

      DOM.$selectColor.append($pill);
    });

    // Append new widget
    DOM.$selectColor.insertAfter(DOM.$select);

    // Remember options with image
    DOM.$pills = DOM.$selectColor.find(".select-color-pill");

    // Hide original select
    $invisible = $("<div>", {"class": "zero-size-invisible"});
    $invisible.insertBefore(DOM.$select);
    $invisible.append(DOM.$select);
  }

  function _hidePillsAnimated(){
    if (state != States.Open){
      return;
    }

    // Do if only OPEN
    state = States.Transition;

    var delay = 0;
    var delayDelta = 100;

    DOM.$pills.each(function(){
      if (!$pill.hasClass("selected")){
        $pill.delay(delay).hide('fast');
      }
      delay+=delayDelta;
    });

    setTimeout(function(){
      state = States.Closed;
    }, delay);
  }

  function _showPillsAnimated(){
    if (state != States.Closed){
      return;
    }

    // Do if only CLOSED
    state = States.Transition;

    var delay = 0;
    var delayDelta = 100;

    DOM.$pills.each(function(){
      if (!$pill.hasClass("selected")){
        $pill.delay(delay).show('fast');
      }
      delay+=delayDelta;
    });

    setTimeout(function(){
      state = States.Open;
    }, delay);
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$select.on('change', function() {
      DOM.$pills.removeClass("selected");
      DOM.$selectColor.find("[data-value='" + this.value + "']").addClass("selected");

      // Hide pills with Delay
      _hidePillsAnimated();
    });

    // Backward select event
    DOM.$pills.each(function(){
      $(this).on( "click", function() {
        if (state == States.Open){
          var v = $(this).data("value");
          DOM.$select.val(v).change();
        }

        if (state === States.Open){
          _hidePillsAnimated();
        }
      });
    });

    DOM.$selectColor.on('click', function() {
      if (state === States.Closed) _showPillsAnimated();
      else if (state === States.Open) _hidePillsAnimated();
    });
  }

  function init(element){
    if (element){
      options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };
};

module.exports = SelectColor;
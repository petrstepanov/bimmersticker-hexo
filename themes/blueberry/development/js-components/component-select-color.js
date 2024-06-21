var SelectColor = function($, events){
  var DOM = {};
  const delayDelta = 100;

  const States = {
    Open: 0,
    Closed: 1,
    Transition: 2
  }

  var state = States.Closed;

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectColor = $("<div>").addClass("component-select-color is-Closed");

    // Iterate all <option /> elements
    DOM.$options.each(function(){
      // Create color pill element
      const colorValue = $(this).attr("value");
      $pill = _createColorPillElement(colorValue);

      // Reflect selected option
      if ($(this).attr("value") === DOM.$select.val()){
        $pill.addClass("selected");
      }
      else {
        $pill.addClass("pill-hidden");
      }

      // Add extra text
      if ($(this).data("extraText")){
        $('<span>').addClass("select-color-pill-extra").html($(this).data("extraText")).appendTo($pill.get(0));
      }

      // Add icon
      $('<span>').addClass("checkbox").html('✓').appendTo($pill);

      DOM.$selectColor.append($pill);
    });


    // Append new widget
    DOM.$selectColor.insertBefore(DOM.$select);

    // Remember options with image
    DOM.$pills = DOM.$selectColor.find(".select-color-pill");

    // Hide original select
    $invisible = $("<div>").addClass("zero-size-invisible");
    $invisible.insertBefore(DOM.$select);
    $invisible.append(DOM.$select);
  }

  function setState(value){
    state = value;

    // Tweak parent container class name for proper open close pill transitions
    if (value === States.Open){
      DOM.$selectColor.removeClass("is-Closed");
      DOM.$selectColor.addClass("is-Open");
    }
    else if (value === States.Closed){
      DOM.$selectColor.removeClass("is-Open");
      DOM.$selectColor.addClass("is-Closed");
    }
  }

  function _createColorPillElement(colorValue){
    // Value can be "Black & red" - show 2 circles in the pill!
    var colorsArray = colorValue.split('&');
    var $pill = $("<div>").addClass("select-color-pill").attr("data-value", colorValue);
    for (color of colorsArray){
      color = color.trim().toLowerCase().replace(' ','-');
      $("<div>").addClass("select-color-pill-color " + color).appendTo($pill.get(0));
    }
    $("<span>").addClass('select-color-pill-text').html(colorValue).appendTo($pill.get(0));
    return $pill;
  }

  function _showPillsAnimated(){
    if (state != States.Closed){
      return;
    }

    // Do if only CLOSED
    setState(States.Transition);

    var delay = 0;

    DOM.$pills.each(function(){
      if (!$(this).hasClass("selected")){
        const $pill = $(this);
        setTimeout(function(){
          $pill.removeClass('pill-hidden'); // .hide('fast');
        }, delay);
        delay+=delayDelta;
      }
    });

    setTimeout(function(){
      setState(States.Open);
    }, delay);
  }

  function _hidePillsAnimated(){
    if (state != States.Open){
      return;
    }

    // Do if only OPEN
    setState(States.Transition);

    var delay = 0;

    DOM.$pills.each(function(){
      if (!$(this).hasClass("selected")){
        const $pill = $(this);
        setTimeout(function(){
          $pill.addClass('pill-hidden'); // .hide('fast');
        }, delay);
        delay+=delayDelta;
      }
    });

    setTimeout(function(){
      setState(States.Closed);
    }, delay);
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$select.on('change', function() {
      DOM.$pills.removeClass("selected").addClass("pill-hidden");
      DOM.$pills.filter("[data-value='" + $(this).val() + "']").addClass("selected").removeClass("pill-hidden");
      DOM.$pills.filter(":not([data-value='" + $(this).val() + "'])").addClass("pill-hidden");

      // Hide pills with Delay
      _hidePillsAnimated();
    });

    // Backward select event
    DOM.$pills.each(function(){
      $(this).on('click', function(event) {
        if (state === States.Open){
          event.stopPropagation();
          var v = $(this).data("value");
          DOM.$select.val(v).trigger( "change" );
        }
      });
    });

    DOM.$selectColor.on('click', function(event) {
      event.preventDefault();

      if (state === States.Closed){
        _showPillsAnimated();
      }
      else if (state === States.Open){
        _hidePillsAnimated();
      }
    });

    events.on('documentClick', function(){
      if (state === States.Open){
        _hidePillsAnimated();
      }
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
  $('.js--component-select-color').each(function(){
    var selectColor = new SelectColor($, window.events);
    selectColor.init(this);
  });
});
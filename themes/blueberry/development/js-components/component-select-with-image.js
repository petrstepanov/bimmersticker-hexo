// Ajax form submission logic

var SelectWithImage = function($){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectWithImage = $("<div>", {"class": "component-select-with-image"});
    DOM.$options.each(function(){
      // Iterate all <option /> elements
      $optionWithImage = $("<div>", {"class": "select-with-image-item", "data-value": $(this).attr("value")});
      DOM.$selectWithImage.append($optionWithImage);
      var bgImage = $(this).data("bg-image");
      $optionWithImage.css('background-image', 'url("' + bgImage + '")');

      // Reflect selected option
      if ($(this).is(':selected')){
        $optionWithImage.addClass("selected");
      }
    });

    // Append new widget
    DOM.$selectWithImage.insertBefore(DOM.$select);

    // Remember options with image
    DOM.$optionsWithImage = DOM.$selectWithImage.find(".select-with-image-item");

    // Hide original select
    $invisible = $("<div>", {"class": "zero-size-invisible"});
    $invisible.insertBefore(DOM.$select);
    $invisible.append(DOM.$select);
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$select.on('change', function() {
      DOM.$optionsWithImage.removeClass("selected");
      DOM.$selectWithImage.find("[data-value='" + this.value + "']").addClass("selected");
    });

    // Backward select event
    DOM.$optionsWithImage.each(function(){
      $(this).on( "click", function() {
        // Set original select value
        // https://stackoverflow.com/questions/13343566/set-select-option-selected-by-value
        var v = $(this).data("value");
        DOM.$select.val(v).change();
      });
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

$(function() {
  $('.js--component-select-with-image').each(function(){
    var selectWithImage = new SelectWithImage(window.$);
    selectWithImage.init(this);
  });
});
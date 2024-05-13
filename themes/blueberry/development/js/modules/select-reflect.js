// Ajax form submission logic

var $ = require('jquery');

var SelectReflect = function(){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectReflect = $("<div>", {"class": "select-reflect"});
    DOM.$options.each(function(){
      // Iterate all <option /> elements
      $optionReflect = $("<div>", {"class": "select-reflect-item", "data-value": $(this).attr("value")});
      DOM.$selectReflect.append($optionReflect);
      var html = $(this).html() + "<span>$" + $(this).data('price') + "</span>";
      $optionReflect.html(html);

      // Reflect selected option
      if ($(this).is(':selected')){
        $optionReflect.addClass("selected");
      }
    });

    // Append new widget
    DOM.$selectReflect.insertAfter(DOM.$select);

    // Remember options with image
    DOM.$optionsReflect = DOM.$selectReflect.find(".select-reflect-item");

    // Hide original select
    $invisible = $("<div>", {"class": "zero-size-invisible"});
    $invisible.insertBefore(DOM.$select);
    $invisible.append(DOM.$select);
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$select.on('change', function() {
      DOM.$optionsReflect.removeClass("selected");
      DOM.$selectReflect.find("[data-value='" + this.value + "']").addClass("selected");
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

module.exports = SelectReflect;
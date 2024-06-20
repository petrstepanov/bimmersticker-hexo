// Ajax form submission logic

var SelectReflect = function($){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectReflect = $("<div>").addClass("component-select-reflect");
    DOM.$options.each(function(){
      // Iterate all <option /> elements
      $optionReflect = $("<div>").addClass("select-reflect-item").data("value", $(this).attr("value"));
      DOM.$selectReflect.append($optionReflect);
      var html = $(this).html()
      html = html.replace('•','<span class="d-none d-sm-inline">•</span><br class="d-inline d-sm-none" />')
      html += "<span>&dollar;" + $(this).data('price') + "</span>";
      html = html.replace('.99','⁹⁹');
      $optionReflect.html(html);

      // Reflect selected option
      if ($(this).attr("value") === DOM.$select.val()){
        $optionReflect.addClass("selected");
      }
    });

    // Append new widget
    DOM.$selectReflect.insertAfter(DOM.$select);

    // Remember options with image
    DOM.$optionsReflect = DOM.$selectReflect.find(".select-reflect-item");

    // Hide original select
    $invisible = $("<div>").addClass("zero-size-invisible");
    $invisible.insertBefore(DOM.$select);
    $invisible.append(DOM.$select);
  }

  function _bindEvents(){
    // Forward events - may not need?
    DOM.$select.on('change', function() {
      DOM.$optionsReflect.removeClass("selected");
      // TODO: test if this works!!!
      DOM.$optionsReflect.filter("[data-value='" + this.value + "']").addClass("selected");
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

$(document).ready(function() {
  $('.js--component-select-reflect').each(function(){
    var selectReflect = new SelectReflect($);
    selectReflect.init(this);
  });
});
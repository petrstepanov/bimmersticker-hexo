(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Ajax form submission logic

var SelectReflect = function($){
  var DOM = {};
  var options = {};

  function _cacheDom(element) {
    DOM.$select = $(element);
    DOM.$options = DOM.$select.find("option");

    // Create new DOM elements
    DOM.$selectReflect = $("<div>", {"class": "component-select-reflect"});
    DOM.$options.each(function(){
      // Iterate all <option /> elements
      $optionReflect = $("<div>", {"class": "select-reflect-item", "data-value": $(this).attr("value")});
      DOM.$selectReflect.append($optionReflect);
      var html = $(this).html()
      html = html.replace('•','<span class="d-none d-sm-inline">•</span><br class="d-inline d-sm-none" />')
      html += "<span>&dollar;" + $(this).data('price') + "</span>";
      html = html.replace('.99','⁹⁹');
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

$(function() {
  $('.js--component-select-reflect').each(function(){
    var selectReflect = new SelectReflect(window.$);
    selectReflect.init(this);
  });
});
},{}]},{},[1])
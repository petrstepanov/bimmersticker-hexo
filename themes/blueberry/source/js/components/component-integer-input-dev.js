(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var IntegerInput = function($){
    var DOM = {};

    function _cacheDom(element) {
        DOM.$el = $(element);
        DOM.$decreaseButton = DOM.$el.find('.js--decrease');
        DOM.$increaseButton = DOM.$el.find('.js--increase');
        DOM.$input = DOM.$el.find('.js--input');
    }

    function _bindEvents(){
        // Add a css class on submit when the input is invalid.
        DOM.$decreaseButton.click(function(){
            DOM.$input.val(parseInt(DOM.$input.val()||0)-1);
            _checkLimits();
        });
        DOM.$increaseButton.click(function(){
            DOM.$input.val(parseInt(DOM.$input.val()||0)+1);
            _checkLimits();
        });
    }

    function _checkLimits(){
        var min = parseInt(DOM.$input.attr("min"));
        var max = parseInt(DOM.$input.attr("max"));
        var value = parseInt(DOM.$input.val());
        value = value < min ? min : value;
        value = value > max ? max : value;
        DOM.$input.val(value);
        DOM.$input.trigger("change");
    }

    function init(element) {
        if (element) {
            // options = $.extend(options, element.dataset);
            _cacheDom(element);
            _bindEvents(element);
        }
    }

    return {
        init: init
    };
};

$(function() {
    $('.js--component-integer-input').each(function(){
        // 'new' operator creates object from function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
        var integerInput = new IntegerInput(window.$);
        integerInput.init(this);
      });
});
},{}]},{},[1])
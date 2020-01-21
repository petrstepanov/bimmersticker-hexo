// HTML5 form validation
// https://pageclip.co/blog/2018-02-20-you-should-use-html5-form-validation.html

var $ = require('jquery');

var IntegerInput = function(){
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

module.exports = IntegerInput;
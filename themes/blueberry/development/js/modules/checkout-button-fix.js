var $ = require('jquery');

var CheckoutButtonFix = function(){
    var DOM = {};

    function _cacheDom(){
        DOM.$suffix = $('<span class="suffix">or Credit/Debit card</span>');
    }

    function _needFix(){
        DOM.$button = $('#snipcart button[title="Checkout with PayPal"]');
        if (!DOM.$button.length){
            return false;
        }
        var suffixClass = "." + DOM.$suffix.attr('class');
        return !DOM.$button.find(suffixClass).length;
    }

    function _fixCaption(){
        if (_needFix()){
            DOM.$button.append(DOM.$suffix);
        }
    }

    function _bindEvents(){
        // Monitor if button caption needs to be changed in a loop
        setInterval(_fixCaption, 2000);
    }

    function init() {
        _cacheDom();
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = CheckoutButtonFix;
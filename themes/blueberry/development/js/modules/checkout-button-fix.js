var $ = require('jquery');

var CheckoutButtonFix = function(){
    var DOM = {};

    function _cacheDom(){
        DOM.$suffix = $('<span class="suffix">or Credit card</span>');
    }

    function _needFix(){
        DOM.$buttonCaption = $('#snipcart button[title="Checkout with PayPal"] .snipcart-payment-methods-list-item__label');
        if (!DOM.$buttonCaption.length){
            return false;
        }
        var suffixClass = "." + DOM.$suffix.attr('class');
        return !DOM.$buttonCaption.find(suffixClass).length;
    }

    function _fixCaption(){
        if (_needFix()){
            DOM.$buttonCaption.append(DOM.$suffix);
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
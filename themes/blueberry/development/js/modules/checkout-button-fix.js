var $ = require('cash-dom');

var CheckoutButtonFix = function(){
    var DOM = {};

    function _cacheDom(){
        DOM.$newLabel = $('<span class="new-label">Pay with Card • via PayPal</span>');
    }

    function _needFix(){
        DOM.$buttonPay = $('#snipcart button[title="Checkout with PayPal"]');
        if (!DOM.$buttonPay.length){
            return false;
        }
        var newLabelClass = "." + DOM.$newLabel.attr('class');
        return !DOM.$buttonPay.find(newLabelClass).length;
    }

    function _fixCaption(){
        if (_needFix()){
            DOM.$buttonPay.find('.snipcart-payment-methods-list-item__label').remove();
            DOM.$buttonPay.prepend(DOM.$newLabel.get(0));
        }

        // Tweak: disable Snipcart autocomplete
        $('.snipcart input[name="address1"]').attr('autocomplete','nope');
    }

    function _bindEvents(){
        // Monitor if button caption needs to be changed in a loop
        setInterval(_fixCaption, 500);
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
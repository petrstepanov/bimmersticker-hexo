// Petr Steanov: CORS issues - disabled.

var $ = require('jquery/dist/jquery.slim');

var SnipcartLoadOnClick = function(){

    var DOM = {};
    var loadingFlag = false;

    function _cacheDom(){
        DOM.$triggerElements = $(".snipcart-checkout, .snipcart-add-item");
        DOM.$snipcartTemplate = $('#snipcart-template');
    }

    function _bindEvents(){
        DOM.$triggerElements.on('click', function(){
            if (!loadingFlag){
                loadingFlag = true;
                DOM.$triggerEl = $(this);
                _startSpinner(DOM.$triggerEl);
                var $parent = DOM.$snipcartTemplate.parent();
                $parent.append(DOM.$snipcartTemplate.html());
            }
        });

        document.addEventListener('snipcart.ready', function(){
            Snipcart.events.on('snipcart.initialized', function() {
                _stopSpinner(DOM.$triggerEl);
                DOM.$triggerEl.click();
            });
        });
    }

    function _startSpinner($element) {
        // If cart button
        $element.addClass("store-loading");
        // If submit button
        $(document).find('form button[type=submit]').addClass("store-loading");
    }

    function _stopSpinner($element) {
        // If cart button
        $element.removeClass("store-loading");
        // If submit button
        $(document).find('form button[type=submit]').removeClass("store-loading");
    }


    function init() {
        _cacheDom();
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = SnipcartLoadOnClick;
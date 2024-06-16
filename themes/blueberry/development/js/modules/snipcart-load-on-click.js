// Petr Steanov: CORS issues - disabled.

var $ = require('jquery');

var SnipcartLoadOnClick = function(){

    var DOM = {};
    // var bsLoadingModal;
    var loadingFlag = false;

    function _cacheDom(){
        DOM.$triggerElements = $(".snipcart-checkout, .snipcart-add-item");
        // DOM.$loadingModal = $('#snipcartLoadModal');
        DOM.$snipcartTemplate = $('#snipcart-template');
    }

    function _bindEvents(){
        DOM.$triggerElements.on('click', function(){
            if (!loadingFlag){
                loadingFlag = true;
                DOM.$triggerEl = $(this);
                // bsLoadingModal = new bootstrap.Modal(DOM.$loadingModal[0]);
                // bsLoadingModal.show();
                var $parent = DOM.$snipcartTemplate.parent();
                $parent.append(DOM.$snipcartTemplate.html());
            }
        });

        document.addEventListener('snipcart.ready', function(){
            Snipcart.events.on('snipcart.initialized', function() {
                // bsLoadingModal.hide();
                DOM.$triggerEl.click();
            });
        });
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
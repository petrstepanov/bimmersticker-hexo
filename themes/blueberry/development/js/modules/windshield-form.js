var WindshieldForm = (function () {
    var DOM = {};
    // var options = {};
    var query = '?s={"size":72,"text":"#","retina":false}';
    var timeoutUpdateImages;

    function _cacheDom(element) {
        DOM.$el = $(element);
        DOM.$radioProduct = DOM.$el.find('input[name=product]');
        DOM.$fontContainer = DOM.$el.find('.js--font-container');
        DOM.$textColorContainer = DOM.$el.find('.js--text-color-container');
        DOM.$baseColorContainer = DOM.$el.find('.js--base-color-container');

        DOM.$input = DOM.$el.find('.js--text-input');
        DOM.$fontImages = DOM.$el.find('.js--font-image');
    }

    function _bindEvents(element) {
        DOM.$radioProduct.change(function () {
            _showHideFormContainers(this.value);
        });

        var that = this;
        DOM.$input.on('input', function(){
            if (timeoutUpdateImages) clearTimeout(timeoutUpdateImages);
            var text = DOM.$input.val().length ? DOM.$input.val() : "Your Banner";
            timeoutUpdateImages = setTimeout(function(){
                _updateTextImages(text);
            }, 1500);
        });
    }

    function _showHideFormContainers(product){
        switch (product) {
            case 'banner':
                DOM.$fontContainer.slideDown();
                DOM.$textColorContainer.slideDown();
                DOM.$baseColorContainer.slideUp();
                break;
            case 'sunstrip':
                DOM.$fontContainer.slideUp();
                DOM.$textColorContainer.slideUp();
                DOM.$baseColorContainer.slideDown();
                break;
            case 'cutsunstrip':
                DOM.$fontContainer.slideDown();
                DOM.$textColorContainer.slideUp();
                DOM.$baseColorContainer.slideDown();
                break;
            case 'textsunstrip':
                DOM.$fontContainer.slideDown();
                DOM.$textColorContainer.slideDown();
                DOM.$baseColorContainer.slideDown();
                break;
        }
    }

    function _updateTextImages(text){
        DOM.$fontImages.each(function(){
            var url = $(this).data().src;
            url += query.replace("#", text);
            $(this).attr('src', encodeURI(url));
        });
    }

    function _checkContentButtonViewport() {
        Events.emit('buyButtonViewport', { contentButtonVisible: Helpers.isInViewport(DOM.$el) });
    }

    // function _render(options){
    // }

    function init(element) {
        if (element) {
            // options = $.extend(options, $(element).data());
            _cacheDom(element);
            _bindEvents();
            _showHideFormContainers(DOM.$radioProduct.val());
            // _render();
        }
    }

    return {
        init: init
    };
})();
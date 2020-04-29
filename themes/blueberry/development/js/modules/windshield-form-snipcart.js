// Custom banner and sun strip form interactions

var $ = require('jquery');
var helpers = require('./helpers');
var nunjucks = require('nunjucks');
var events = require('./events');

var DOM = {};
// var options = {};
var query = '?s={"size":72,"text":"#","retina":false}';
var timeoutUpdateImages;
var timestamp = Math.floor(Date.now() / 1000);

function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$form = DOM.$el;
    DOM.$mailchimpForm = DOM.$el.find('.js--mailchimp-form');
    DOM.$radioProduct = DOM.$el.find('input[name=product]');
    DOM.$radioTextColor = DOM.$el.find('input[name=color_text]');
    DOM.$radioBaseColor = DOM.$el.find('input[name=color_base]');
    DOM.$radioFont = DOM.$el.find('input[name=font]');
    DOM.$fontContainer = DOM.$el.find('.js--font-container');
    DOM.$textColorContainer = DOM.$el.find('.js--text-color-container');
    DOM.$baseColorContainer = DOM.$el.find('.js--base-color-container');

    DOM.$input = DOM.$el.find('.js--text-input');
    DOM.$fontImages = DOM.$el.find('.js--font-image');

    // DOM.$carContainer = DOM.$el.find('.car-preview-container');
    DOM.$car = DOM.$el.find('.car-preview-container .car');

    DOM.$banner = DOM.$el.find('.banner-text');
    DOM.$sunstrip = DOM.$el.find('.sunstrip');
    DOM.$sunstripText = DOM.$el.find('.sunstrip-text');

    // Quantity control
    DOM.$inputQuantity = DOM.$el.find('input[name=quantity]');

    // Snipcart buttons
    DOM.$btnBuyBanner = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_WINDSHIELD_BANNER]');
    DOM.$btnBuySunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_WINDSHIELD_SUNSTRIP]');
    DOM.$btnBuyCutSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_WINDSHIELD_SUNSTRIP_CUT]');
    DOM.$btnBuyTextSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_WINDSHIELD_SUNSTRIP_TEXT]');
}

function _saveData(){
    // Helper parses form data to JSON
    var data = helpers.getFormData(DOM.$form);
    console.log(data);
    // Save JSON to local storage
    localStorage.setItem("dataKey", JSON.stringify(data));
}

function _loadData(){
    if (localStorage.getItem("dataKey")) {
        var data = JSON.parse(localStorage.getItem("dataKey"));
        console.log(data);
        // Update view
        if (data.product){
            DOM.$radioProduct.filter('[value="' + data.product + '"]').attr('checked', true).change();
        }
        if (data.text){
            DOM.$input.val(data.text).trigger("input");
        }
        if (data.font){
            DOM.$radioFont.filter('[value="' + data.font + '"]').attr('checked', true).change();
        }
        if (data.color_text){
            DOM.$radioTextColor.filter('[value="' + data.color_text + '"]').attr('checked', true).change();
        }
        if (data.color_base){
            DOM.$radioBaseColor.filter('[value="' + data.color_base + '"]').attr('checked', true).change();
        }
        if (data.quantity){
            DOM.$inputQuantity.val(data.quantity).change();
        }
    }
}

function _bindEvents(element) {
    DOM.$radioProduct.change(function (event) {
        _showHideFormContainers(this.value);
        _showHidePreviewElements(this.value);
        _enableDisableRadioButtons(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$input.on('input', function (event) {
        if (timeoutUpdateImages) clearTimeout(timeoutUpdateImages);
        timeoutUpdateImages = setTimeout(function () {
            _updateTextImages();
            _updateBannerFontImages();
        }, 1500);
        _updateSnipcartButtonsText(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$radioFont.change(function (event) {
        _updateBannerFontImages();
        _updateSnipcartButtonsFont(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$radioTextColor.change(function (event) {
        _updateBannerSunstripTextColors();
        _updateSnipcartButtonsTextColor(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$radioBaseColor.change(function (event) {
        _updateSunstripBaseColor();
        _updateSnipcartButtonsBaseColor(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$inputQuantity.change(function(){
        DOM.$btnBuyBanner.attr('data-item-quantity', this.value);
        DOM.$btnBuySunStrip.attr('data-item-quantity', this.value);
        DOM.$btnBuyCutSunStrip.attr('data-item-quantity', this.value);
        DOM.$btnBuyTextSunStrip.attr('data-item-quantity', this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){ _saveData(); }
    });

    DOM.$form.submit(function(event) {
        event.preventDefault();
        
        switch (DOM.$radioProduct.filter(":checked").val()) {
            case 'ST_CAR_WINDSHIELD_BANNER':
                DOM.$btnBuyBanner.click();
                break;
            case 'ST_CAR_WINDSHIELD_SUNSTRIP':
                DOM.$btnBuySunStrip.click();
                break;
            case 'ST_CAR_WINDSHIELD_SUNSTRIP_CUT':
                DOM.$btnBuyCutSunStrip.click();
                break;
            case 'ST_CAR_WINDSHIELD_SUNSTRIP_TEXT':
                DOM.$btnBuyTextSunStrip.click();
                break;
        }
    });
}

function _getBannerText() {
    return DOM.$input.val().length ? DOM.$input.val() : "Your Banner";
}

function _showHideFormContainers(product) {
    switch (product) {
        case 'ST_CAR_WINDSHIELD_BANNER':
            DOM.$input.prop("disabled", false);
            DOM.$fontContainer.slideDown();
            DOM.$textColorContainer.slideDown();
            DOM.$baseColorContainer.slideUp();
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP':
            DOM.$input.prop("disabled", true);
            DOM.$fontContainer.slideUp();
            DOM.$textColorContainer.slideUp();
            DOM.$baseColorContainer.slideDown();
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_CUT':
            DOM.$input.prop("disabled", false);
            DOM.$fontContainer.slideDown();
            DOM.$textColorContainer.slideUp();
            DOM.$baseColorContainer.slideDown();
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_TEXT':
            DOM.$input.prop("disabled", false);
            DOM.$fontContainer.slideDown();
            DOM.$textColorContainer.slideDown();
            DOM.$baseColorContainer.slideDown();
            break;
    }
}

function _getSelectedSwatch(radioName) {
    return $('input[name=' + radioName + ']:checked').parent().find('.color-swatch');
}

function _showHidePreviewElements(product) {
    switch (product) {
        case 'ST_CAR_WINDSHIELD_BANNER':
            DOM.$banner.show();
            DOM.$sunstrip.hide();
            DOM.$sunstripText.hide();
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.hide();
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_CUT':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.show();
            DOM.$sunstripText.css('background-color', '#6C6C6C');
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_TEXT':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.show();
            var color = _getSelectedSwatch('color_text').css('background-color');
            DOM.$sunstripText.css('background-color', color);
            break;
    }
}

function _enableDisableRadioButtons(product) {
    switch (product) {
        case 'ST_CAR_WINDSHIELD_BANNER':
            DOM.$radioTextColor.prop("disabled", false);
            DOM.$radioBaseColor.prop("disabled", true);
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_CUT':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'ST_CAR_WINDSHIELD_SUNSTRIP_TEXT':
            DOM.$radioTextColor.prop("disabled", false);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
    }
}

function _buildFontUrl($fontImage, text) {
    var url = $fontImage.data().src;
    url += query.replace("#", text);
    return encodeURI(url);
}

function _updateTextImages() {
    var text = _getBannerText();
    // Update text images
    DOM.$fontImages.each(function () {
        var url = _buildFontUrl($(this), text);
        $(this).attr('src', url);
    });
}

function _updateBannerFontImages() {
    var text = _getBannerText();
    // Update banner image
    var $fontImage = $('input[name=font]:checked').parent().find('img');
    var url = _buildFontUrl($fontImage, text);
    DOM.$banner.css('mask-image', 'url(' + url + ')');
    DOM.$sunstripText.css('mask-image', 'url(' + url + ')');
}

function _updateBannerSunstripTextColors() {
    var $swatch = _getSelectedSwatch('color_text');
    // Change banner text
    DOM.$banner.css('background-color', $swatch.css('background-color'));
    DOM.$banner.css('background-image', $swatch.css('background-image'));
    // Change sun strip text color
    DOM.$sunstripText.css('background-color', $swatch.css('background-color'));
    DOM.$sunstripText.css('background-image', $swatch.css('background-image'));
}

function _updateSunstripBaseColor() {
    var $swatch = _getSelectedSwatch('color_base');
    // Change sun strip base color
    DOM.$sunstrip.css('background-color', $swatch.css('background-color'));
    DOM.$sunstrip.css('background-image', $swatch.css('background-image'));
}


// Updating Snipcart buttons' attributes

function _updateSnipcartButtonsText(value){
    DOM.$btnBuyBanner.attr('data-item-custom1-value', value);
    DOM.$btnBuyCutSunStrip.attr('data-item-custom1-value', value);
    DOM.$btnBuyTextSunStrip.attr('data-item-custom1-value', value);
}

function _updateSnipcartButtonsFont(value){
    DOM.$btnBuyBanner.attr('data-item-custom2-value', value);
    DOM.$btnBuyCutSunStrip.attr('data-item-custom2-value', value);
    DOM.$btnBuyTextSunStrip.attr('data-item-custom2-value', value);
}

function _updateSnipcartButtonsTextColor(value){
    DOM.$btnBuyBanner.attr('data-item-custom3-value', value);
    DOM.$btnBuyTextSunStrip.attr('data-item-custom3-value', value);
}

function _updateSnipcartButtonsBaseColor(value){
    DOM.$btnBuySunStrip.attr('data-item-custom1-value', value);
    DOM.$btnBuyCutSunStrip.attr('data-item-custom3-value', value);
    DOM.$btnBuyTextSunStrip.attr('data-item-custom4-value', value);
}

function init(element) {
    if (element) {
        // options = $.extend(options, $(element).data());
        _cacheDom(element);
        _bindEvents();
        // _showHideFormContainers(DOM.$radioProduct.val());
        _loadData();
    }
}

exports.init = init;
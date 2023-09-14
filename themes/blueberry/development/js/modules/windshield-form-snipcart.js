// Custom banner and sun strip form interactions

var $ = require('jquery');
var helpers = require('./helpers');
// var nunjucks = require('nunjucks');
var events = require('./events');

var DOM = {};
// var options = {};
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
    DOM.$fontContainerList = DOM.$el.find('.js--font-container-list');
    DOM.$textColorContainer = DOM.$el.find('.js--text-color-container');
    DOM.$baseColorContainer = DOM.$el.find('.js--base-color-container');

    DOM.$input = DOM.$el.find('.js--text-input');
    DOM.$fontImages = DOM.$el.find('.js--font-image');
    DOM.$fontAvifs = DOM.$el.find('.js--font-avif');

    DOM.$textWidthNotice = DOM.$el.find('.js--text-width');

    DOM.$banner = DOM.$el.find('.banner-text');
    DOM.$sunstrip = DOM.$el.find('.sunstrip');
    DOM.$sunstripText = DOM.$el.find('.sunstrip-text');

    // Car/Truck selection
    DOM.$car = DOM.$el.find('.car-preview-container .car-container');
    DOM.$truck = DOM.$el.find('.car-preview-container .truck-container');
    DOM.$radioVehicleType = DOM.$el.find('input[name=pattern]');
    DOM.$noticeCar = DOM.$el.find('.js--notice-car');
    DOM.$noticeTruck = DOM.$el.find('.js--notice-truck');
    DOM.$truckExtraContainer = DOM.$el.find('.js--pattern-price-extra');

    // Quantity control
    DOM.$inputQuantity = DOM.$el.find('input[name=quantity]');

    // Snipcart buttons
    DOM.$btnBuyBanner = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_BANNER]');
    DOM.$btnBuySunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS]');
    DOM.$btnBuyCutSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS_CUT]');
    DOM.$btnBuyTextSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS_TEXT]');

    // Find elements displayed for users with JavaScript not loaded
    DOM.$noJs = DOM.$el.find('.js--nojs-only');
    DOM.$submitButton = DOM.$el.find('#submitButton');
}

function _saveData(){
    // Helper parses form data to JSON
    var data = helpers.getFormData(DOM.$form);
    // console.log(data);
    // Save JSON to local storage
    localStorage.setItem("dataKey", JSON.stringify(data));
}

function _loadData(){
    if (localStorage.getItem("dataKey")) {
        var data = JSON.parse(localStorage.getItem("dataKey"));
        // console.log(data);
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
        if (data.pattern){
            DOM.$radioVehicleType.filter('[value="' + data.pattern + '"]').attr('checked', true).change();
        }
        if (data.quantity){
            DOM.$inputQuantity.val(data.quantity).change();
        }
    }
}

function _onLoad() {
    DOM.$noJs.remove();
    DOM.$submitButton.text("Add Item to Cart");
}

function _bindEvents(element) {
    DOM.$radioProduct.change(function (event) {
        _showHideFormContainers(this.value);
        _showHidePreviewElements(this.value);
        _enableDisableRadioButtons(this.value);
        _reflectExtraTruckPrice(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$input.on('input', function (event) {

        var text = _getBannerText();

        // Check string has non-latin characters and show/hide font selection panel
        // This should happen instantly unlike the delayed request for updating font previews
        // https://stackoverflow.com/questions/147824/how-to-find-whether-a-particular-string-has-unicode-characters-esp-double-byte
        var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
        if (containsNonLatinCharacters){
            DOM.$fontContainerList.slideUp();
        }
        else {
            DOM.$fontContainerList.slideDown();
        }

        // Hack - ensure avifs are removed - they cover up actual images
        DOM.$fontAvifs.remove();

        // Loading animation - add to picture tag because image cant deal with pseudo class animation
        DOM.$fontImages.each(function () {
            $(this).parent().addClass('loading');
        });

        // Timeout for updating the font previews
        if (timeoutUpdateImages) clearTimeout(timeoutUpdateImages);
        timeoutUpdateImages = setTimeout(function () {
            // Update radio font images to reflect custom text
            var text = _getBannerText();
            var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);

            if (!containsNonLatinCharacters){
                _updateFontPreviews();
            }

            _updateBannerImage(containsNonLatinCharacters);
        }, 1500);

        _updateSnipcartButtonsText(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$radioFont.change(function (event) {
        var text = _getBannerText();
        var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
        _updateBannerImage(containsNonLatinCharacters);
        _updateSnipcartButtonsFont(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$radioTextColor.change(function (event) {
        _updateBannerSunstripTextColors();
        _updateSnipcartButtonsTextColor(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$radioBaseColor.change(function (event) {
        _updateSunstripBaseColor();
        _updateSnipcartButtonsBaseColor(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$radioVehicleType.change(function (event) {
        _updateVehicleType(this.value);
        _updateSnipcartButtonsVehicleType(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$inputQuantity.change(function (event) {
        DOM.$btnBuyBanner.attr('data-item-quantity', this.value);
        DOM.$btnBuySunStrip.attr('data-item-quantity', this.value);
        DOM.$btnBuyCutSunStrip.attr('data-item-quantity', this.value);
        DOM.$btnBuyTextSunStrip.attr('data-item-quantity', this.value);
        _saveData();
    });

    DOM.$form.submit(function(event) {
        event.preventDefault();

        switch (DOM.$radioProduct.filter(":checked").val()) {
            case 'ST_CAR_W_BANNER':
                DOM.$btnBuyBanner.click();
                break;
            case 'ST_CAR_W_SS':
                DOM.$btnBuySunStrip.click();
                break;
            case 'ST_CAR_W_SS_CUT':
                DOM.$btnBuyCutSunStrip.click();
                break;
            case 'ST_CAR_W_SS_TEXT':
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
        case 'ST_CAR_W_BANNER':
            DOM.$input.prop("disabled", false);
            DOM.$fontContainer.slideDown();
            DOM.$textColorContainer.slideDown();
            DOM.$baseColorContainer.slideUp();
            break;
        case 'ST_CAR_W_SS':
            DOM.$input.prop("disabled", true);
            DOM.$fontContainer.slideUp();
            DOM.$textColorContainer.slideUp();
            DOM.$baseColorContainer.slideDown();
            break;
        case 'ST_CAR_W_SS_CUT':
            DOM.$input.prop("disabled", false);
            DOM.$fontContainer.slideDown();
            DOM.$textColorContainer.slideUp();
            DOM.$baseColorContainer.slideDown();
            break;
        case 'ST_CAR_W_SS_TEXT':
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
        case 'ST_CAR_W_BANNER':
            DOM.$banner.show();
            DOM.$sunstrip.hide();
            DOM.$sunstripText.hide();
            DOM.$textWidthNotice.show();
            break;
        case 'ST_CAR_W_SS':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.hide();
            DOM.$textWidthNotice.hide();
            break;
        case 'ST_CAR_W_SS_CUT':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.show();
            DOM.$sunstripText.css('background-color', '#6C6C6C');
            DOM.$textWidthNotice.show();
            break;
        case 'ST_CAR_W_SS_TEXT':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.show();
            var color = _getSelectedSwatch('color_text').css('background-color');
            DOM.$sunstripText.css('background-color', color);
            DOM.$textWidthNotice.show();
            break;
    }
}

function _enableDisableRadioButtons(product) {
    switch (product) {
        case 'ST_CAR_W_BANNER':
            DOM.$radioTextColor.prop("disabled", false);
            DOM.$radioBaseColor.prop("disabled", true);
            break;
        case 'ST_CAR_W_SS':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'ST_CAR_W_SS_CUT':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'ST_CAR_W_SS_TEXT':
            DOM.$radioTextColor.prop("disabled", false);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
    }
}

function _reflectExtraTruckPrice(product){
    DOM.$truckExtraContainer.children().hide();
    const productClass= "." + product;
    DOM.$truckExtraContainer.find(productClass).show();
}

function _buildFontUrl($fontImage, text) {
    var url = $fontImage.data().src;
    var query = '{"size":72,"text":"#","retina":false}'.replace("#", text);
    return url + '?s=' + encodeURIComponent(query);
}

function _buildFontUnicodeUrl(text) {
    var url = "/font-unicode/" + encodeURIComponent(text);
    return url;
}

function _updateFontPreviews() {
    // On testing environment do nothing (no font url rewrite implemented)
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

    // Update radio font images to reflect custom text
    var text = _getBannerText();

    DOM.$fontImages.each(function () {
        var url = _buildFontUrl($(this), text);
        $(this).attr('src', url);
        $(this).parent().removeClass('loading');
        // Remove width and height set on the first page load for Google CLS improvements
        $(this).removeAttr("width");
        $(this).removeAttr("height");
    });
}

function _updateBannerImage(hasUnicode = false) {
    // On testing environment do nothing (no font url rewrite implemented)
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

    // Update car banner and sun strip images
    var text = _getBannerText();
    var url = '';
    var maskMode = '';
    if (!hasUnicode){
        var $fontImage = $('input[name=font]:checked').parent().find('img');
        url = _buildFontUrl($fontImage, text);
    } else {
        url = _buildFontUnicodeUrl(text);
        maskMode = 'luminance';
    }
    // Parentheses, white space characters, single quotes (') and double quotes ("), must be escaped with a backslash in url()
    // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
    url = url.replace(/[() '"]/g, '\\$&');

    DOM.$banner.css('mask-image', 'url(' + url + ')');
    DOM.$banner.css('-webkit-mask-image', 'url(' + url + ')');

    DOM.$sunstripText.css('mask-image', 'url(' + url + ')');
    DOM.$sunstripText.css('-webkit-mask-image', 'url(' + url + ')');

    // CSS tweaks that account on discrepancy between creativemarket.com and myfonts.net
    if (hasUnicode){
        DOM.$banner.addClass('unicode-on');
        DOM.$sunstripText.addClass('unicode-on');
    } else {
        DOM.$banner.removeClass('unicode-on');
        DOM.$sunstripText.removeClass('unicode-on');
    }
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

// Visual updates for selecting vehicle type (car/truck)
function _updateVehicleType(value) {
    // Reflect Bootstrap button appearance
    DOM.$radioVehicleType.parent().removeClass('active');
    DOM.$radioVehicleType.filter('[value='+value+']').parent().addClass('active');

    if (value == 'Regular'){
        DOM.$car.show();
        DOM.$noticeCar.show();
        DOM.$truck.hide();
        DOM.$noticeTruck.hide();
    }
    else {
        DOM.$car.hide();
        DOM.$noticeCar.hide();
        DOM.$truck.show();
        DOM.$noticeTruck.show();
    }
}

// Updating Snipcart buttons' attributes

function _updateSnipcartButtonsText(value){
    // set atribute with multiple spaces in between
    DOM.$btnBuyBanner.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
    DOM.$btnBuyCutSunStrip.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
    DOM.$btnBuyTextSunStrip.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
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

function _updateSnipcartButtonsVehicleType(value){
    DOM.$btnBuyBanner.attr('data-item-custom4-value', value);
    DOM.$btnBuySunStrip.attr('data-item-custom2-value', value);
    DOM.$btnBuyCutSunStrip.attr('data-item-custom4-value', value);
    DOM.$btnBuyTextSunStrip.attr('data-item-custom5-value', value);
}

function init(element) {
    if (element) {
        // options = $.extend(options, $(element).data());
        _cacheDom(element);
        _bindEvents();
        _onLoad();
        // _showHideFormContainers(DOM.$radioProduct.val());
        _loadData();
    }
}

exports.init = init;
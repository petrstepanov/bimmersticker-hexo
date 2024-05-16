// Custom banner and sun strip form interactions

var $ = require('jquery');
var helpers = require('./helpers');
// var nunjucks = require('nunjucks');
var events = require('./events');

var DOM = {};
// var options = {};
var timeoutUpdateHeadingImage;
var timeoutUpdateContentImage;
var timestamp = Math.floor(Date.now() / 1000);

function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$form = DOM.$el;

    DOM.$inputHeading = DOM.$el.find('#inputHeading');
    DOM.$selectHeadingFont = DOM.$el.find('#selectHeadingFont');
    DOM.$selectHeadingColor = DOM.$el.find('#selectHeadingColor');

    DOM.$textareaContent = DOM.$el.find('#textareaContent');
    DOM.$selectContentFont = DOM.$el.find('#selectContentFont');
    DOM.$selectContentColor = DOM.$el.find('#selectContentColor');

    DOM.$previewContainer = DOM.$el.find('#truck-van-preview');
    DOM.$previewHeadingContainer = DOM.$el.find('#truck-van-preview-heading');
    DOM.$previewContentContainer = DOM.$el.find('#truck-van-preview-content');

    DOM.$inputLength = DOM.$el.find('#inputLength');
    DOM.$inputHeight = DOM.$el.find('#inputHeight');

    DOM.$selectSize = DOM.$el.find('#selectSize');

    // TODO: ensure onload ruler numbers and height, area show reasonable values
    // DOM.$inputHeight = DOM.$el.find('#inputHeight');
    // DOM.$inputArea = DOM.$el.find('#inputArea');

    DOM.$inputQuantity = DOM.$el.find('#inputQuantity');

    DOM.$buttonSubmit = DOM.$el.find('#buttonSubmit');

    DOM.$buttonBuy = DOM.$el.find('.snipcart-add-item');  // Snipcart button

    // TODO: add no-js
    DOM.$noJs = DOM.$el.find('.js--nojs-only');
}

function _saveData(){
    // Helper parses form data to JSON
    var data = helpers.getFormData(DOM.$form);
    // console.log(data);
    // Save JSON to local storage
    localStorage.setItem("dataKeyVanTruck", JSON.stringify(data));
}

function _updateSubmitButtonText(){
    if (parseInt(DOM.$inputQuantity.val()) == 1){
        DOM.$buttonSubmit.text("Add Item to Cart");
        return;
    }
    DOM.$buttonSubmit.text("Add Items to Cart");
}

function _loadData(){
    if (localStorage.getItem("dataKeyVanTruck")) {
        var data = JSON.parse(localStorage.getItem("dataKeyVanTruck"));
        // console.log(data);
        // Update view
        if (data.length){
            DOM.$inputLength.val(data.length); //.change();
        }

        if (data.heading){
            DOM.$inputHeading.val(data.heading).trigger("input");
        }
        if (data.heading_font){
            DOM.$selectHeadingFont.val(data.heading_font).change();
        }
        if (data.heading_color){
            DOM.$selectHeadingColor.val(data.heading_color).change();
        }
        if (data.content){
            DOM.$textareaContent.val(data.content).trigger("input");
        }
        if (data.content_font){
            DOM.$selectContentFont.val(data.content_font).change();
        }
        if (data.content_color){
            DOM.$selectContentColor.val(data.content_color).change();
        }
        // ruler values, height and area are updated via "widget-area.js" module. Ensure it loads before this module.
        if (data.length){
            DOM.$inputLength.val(data.length).change();
        }
        if (data.quantity){
            DOM.$inputQuantity.val(data.quantity) //.change();
        }
    }
}

function _onLoad() {
    DOM.$noJs.remove();
    // If JS is enabled - snipcart will load - update button text
    _updateSubmitButtonText();
    _loadData();
}

function _bindEvents(element) {
    DOM.$inputHeading.on('input', function (event) {
        var text = _getHeadingText();

        // Timeout for updating the font previews
        if (timeoutUpdateHeadingImage) clearTimeout(timeoutUpdateHeadingImage);
        timeoutUpdateHeadingImage = setTimeout(function () {
            _updateHeadingImage();
        }, 1500);

        _updateSnipcartButtonHeadingText(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectHeadingFont.change(function (event) {
        var text = _getHeadingText();
        var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
        clearTimeout(timeoutUpdateHeadingImage);
        _updateHeadingImage(containsNonLatinCharacters);
        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonHeadingFont(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectHeadingColor.change(function (event) {
        _updateHeadingColor();
        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonHeadingColor(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$textareaContent.on('input', function (event) {
        var text = _getContentText();

        // Check string has non-latin characters and show/hide font selection panel
        // This should happen instantly unlike the delayed request for updating font previews
        // https://stackoverflow.com/questions/147824/how-to-find-whether-a-particular-string-has-unicode-characters-esp-double-byte
        var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);

        // Timeout for updating the font previews
        if (timeoutUpdateContentImage) clearTimeout(timeoutUpdateContentImage);
        timeoutUpdateContentImage = setTimeout(function () {
            _updateContentImage(containsNonLatinCharacters);
        }, 1500);

        _updateSnipcartButtonContentText(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectContentFont.change(function (event) {
        var text = _getContentText();
        var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
        clearTimeout(timeoutUpdateContentImage);
        _updateContentImage(containsNonLatinCharacters);
        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonContentFont(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectContentColor.change(function (event) {
        _updateContentColor();
        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonContentColor(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectSize.change(function (event) {
        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonSize(valueSelected);
        _saveData();
    });

    DOM.$inputQuantity.change(function (event) {
        DOM.$buttonBuy.attr('data-item-quantity', this.value);
        _updateSubmitButtonText();
        _saveData();
    });

    DOM.$form.submit(function(event) {
        event.preventDefault();

        // Hack - prevent submission if "Add to cart" is not in viewport.
        // Otherwise Snipcart side cart opens up when "Go" on the input field
        if (!helpers.isInViewport(DOM.$buttonSubmit)){
            // Iphone hide keyboard
            document.activeElement.blur();
            // Prevent submit
            return false;
        }

        DOM.$buttonBuy.click();
    });
}

function _getHeadingText() {
    return DOM.$inputHeading.val().length ? DOM.$inputHeading.val() : "Your Company Name";
}

function _getContentText() {
    return DOM.$textareaContent.val().length ? DOM.$textareaContent.val() : "+1 650 253 0000\nmy-company@email.com";
}

function _buildMyFontUrl(url, text) {
    text = encodeURIComponent(text);
    return url + '&rt=#&w=0&sc=2'.replace("#", text);
}

function _updateHeadingImage() {
    // On testing environment do nothing (no font url rewrite implemented)
    // if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

    // Update car banner and sun strip images
    var text = _getHeadingText();
    var fontId = DOM.$selectHeadingFont.find("option:selected").data("fontId");
    url = _buildMyFontUrl(fontId, text);
    // url="https://render.myfonts.net/fonts/font_rend.php?id=62d429961e1b6efde0ff607536aa5a12&rt=Ginzaw&rs=48&w=0&rbe=&sc=2&nie=true&fg=000000&bg=FFFFFF&ft=&nf=1";

    // Parentheses, white space characters, single quotes (') and double quotes ("), must be escaped with a backslash in url()
    // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
    url = url.replace(/[() '"]/g, '\\$&');

    DOM.$previewContainer.addClass("loading");
    $('<img>', {"class": "w-100 h-auto"}).on('load', function () {
        DOM.$previewHeadingContainer.empty();
        $(this).appendTo(DOM.$previewHeadingContainer);
        // TODO: throw event to update rulers, height and area field
        DOM.$previewContainer.removeClass("loading");
    }).attr({ src: url });
}

function _updateHeadingColor() {
    // var $swatch = _getSelectedSwatch('color_text');
    // Change banner text
    // DOM.$banner.css('background-color', $swatch.css('background-color'));
    // DOM.$banner.css('background-image', $swatch.css('background-image'));
    // Change sun strip text color
    // DOM.$sunstripText.css('background-color', $swatch.css('background-color'));
    // DOM.$sunstripText.css('background-image', $swatch.css('background-image'));
}

function _updateContentImage() {
}

function _updateContentColor() {
    // var $swatch = _getSelectedSwatch('color_base');
    // Change sun strip base color
    // DOM.$sunstrip.css('background-color', $swatch.css('background-color'));
    // DOM.$sunstrip.css('background-image', $swatch.css('background-image'));
}

// Updating Snipcart buttons' attributes

function _updateSnipcartButtonHeadingText(value){
    // set atribute with multiple spaces in between
    DOM.$buttonBuy.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
}

function _updateSnipcartButtonHeadingFont(value){
    DOM.$buttonBuy.attr('data-item-custom2-value', value);
}

function _updateSnipcartButtonHeadingColor(value){
    DOM.$buttonBuy.attr('data-item-custom3-value', value);
}

function _updateSnipcartButtonContentText(value){
    // set atribute with multiple spaces in between
    DOM.$buttonBuy.attr('data-item-custom4-value', value.replace(/\s/g, '\u00A0'));
}

function _updateSnipcartButtonContentFont(value){
    DOM.$buttonBuy.attr('data-item-custom5-value', value);
}

function _updateSnipcartButtonContentColor(value){
    DOM.$buttonBuy.attr('data-item-custom6-value', value);
}

function _updateSnipcartButtonSize(value){
    var length = DOM.$inputLength.val() + " in";
    var height = DOM.$inputHeight.val() + " in";
    DOM.$buttonBuy.attr('data-item-custom7-value', length);
    DOM.$buttonBuy.attr('data-item-custom8-value', height);
    DOM.$buttonBuy.attr('data-item-custom9-value', value);
}

function init(element) {
    if (element) {
        // options = $.extend(options, $(element).data());
        _cacheDom(element);
        _bindEvents();
        _onLoad();
        // _showHideFormContainers(DOM.$radioProduct.val());
    }
}

exports.init = init;
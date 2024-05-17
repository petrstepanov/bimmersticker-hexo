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

    DOM.$anchorInputBgColor = DOM.$el.find('#anchorInputBgColor');
    DOM.$inputBgColorLine = DOM.$el.find('#inputBgColorLine');
    DOM.$inputBgColor = DOM.$el.find('#inputBgColor');

    DOM.$previewContainer = DOM.$el.find('#truck-van-preview');
    DOM.$previewContainerBg = DOM.$el.find('#truck-van-preview-bg');
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
        if (data.bg_color){
            DOM.$inputBgColor.val(data.bg_color).change();
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
        clearTimeout(timeoutUpdateHeadingImage);
        _updateHeadingImage();

        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonHeadingFont(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectHeadingColor.change(function (event) {
        clearTimeout(timeoutUpdateHeadingImage);
        _updateHeadingImage();

        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonHeadingColor(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$textareaContent.on('input', function (event) {
        var text = _getContentText();

        // Timeout for updating the font previews
        if (timeoutUpdateContentImage) clearTimeout(timeoutUpdateContentImage);
        timeoutUpdateContentImage = setTimeout(function () {
            _updateContentImage();
        }, 1500);

        _updateSnipcartButtonContentText(this.value);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectContentFont.change(function (event) {
        clearTimeout(timeoutUpdateContentImage);
        _updateContentImage();

        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonContentFont(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$selectContentColor.change(function (event) {
        clearTimeout(timeoutUpdateContentImage);
        _updateContentImage();

        var valueSelected  = $(this).find("option:selected").val();
        _updateSnipcartButtonContentColor(valueSelected);
        if (event.originalEvent && event.originalEvent.isTrusted){
            // Save data only of the event was triggered with human
            _saveData();
        }
    });

    DOM.$anchorInputBgColor.click(function (event){
        event.preventDefault();
        DOM.$inputBgColor.trigger("click");
    });

    DOM.$inputBgColor.change(function (event) {
        // Reflect container background
        var valueSelected  = $(this).val();
        DOM.$previewContainerBg.css('border-color', valueSelected);
        DOM.$previewContainerBg.css('background-color', valueSelected);
        DOM.$inputBgColorLine.css('background-color', valueSelected);

        if (timeoutUpdateHeadingImage) clearTimeout(timeoutUpdateHeadingImage);
        _updateHeadingImage();
        if (timeoutUpdateContentImage) clearTimeout(timeoutUpdateContentImage);
        _updateContentImage();
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

function _buildMyFontUrl(id, text, fgColor) {
    // text = encodeURIComponent(text);
    var bgColor=DOM.$inputBgColor.val().replace('#','');
    var url = '&id=[fontId]&rt=[text]&bg=[bgColor]&fg=[fgColor]'.replace("[fontId]", id).replace("[text]", encodeURIComponent(text)).replace('[bgColor]', bgColor).replace("[fgColor]", fgColor);
    // url = encodeURIComponent(url);
    url = "/font-myfont/" + url;

    // Parentheses, white space characters, single quotes (') and double quotes ("), must be escaped with a backslash in url()
    // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
    // url = url.replace(/[() '"]/g, '\\$&');
    return url;
}

function _updateHeadingImage() {
    // On testing environment do  nothing (no font url rewrite implemented)
    // if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

    // Update car banner and sun strip images
    var text = _getHeadingText();
    var fontId = DOM.$selectHeadingFont.find("option:selected").data("fontId");
    var color = DOM.$selectHeadingColor.find("option:selected").data('hex');
    url = _buildMyFontUrl(fontId, text, color);

    DOM.$previewContainer.addClass("loading");
    $('<img>', {"class": "w-100 h-auto"}).on('load', function () {
        DOM.$previewHeadingContainer.empty();
        $(this).appendTo(DOM.$previewHeadingContainer);
        // TODO: throw event to update rulers, height and area field
        DOM.$previewContainer.removeClass("loading");
    }).attr({ src: url });
}

// function _updateHeadingColor() {
//     var hex = DOM.$selectHeadingColor.find("option:selected").data('hex');
//     // https://css-tricks.com/css-attr-function-got-nothin-custom-properties/
//     DOM.$previewHeadingContainer.css('--my-color', hex);
// }

function _updateContentImage() {
    // On testing environment do nothing (no font url rewrite implemented)
    // if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

    // Update car banner and sun strip images
    var text = _getContentText();
    var fontId = DOM.$selectContentFont.find("option:selected").data("fontId");
    var color = DOM.$selectContentColor.find("option:selected").data('hex');
    url = _buildMyFontUrl(fontId, text, color);

    // Parentheses, white space characters, single quotes (') and double quotes ("), must be escaped with a backslash in url()
    // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
    // url = url.replace(/[() '"]/g, '\\$&');

    DOM.$previewContainer.addClass("loading");
    $('<img>', {"class": "w-100 h-auto"}).on('load', function () {
        DOM.$previewContentContainer.empty();
        $(this).appendTo(DOM.$previewContentContainer);
        // TODO: throw event to update rulers, height and area field
        DOM.$previewContainer.removeClass("loading");
    }).attr({ src: url });
}

// function _updateContentColor() {
//     var hex = DOM.$selectContentColor.find("option:selected").data('hex');
//     // https://css-tricks.com/css-attr-function-got-nothin-custom-properties/
//     DOM.$previewContentContainer.css('--my-color', hex);
// }

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
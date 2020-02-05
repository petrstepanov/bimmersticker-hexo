// Custom banner and sun strip form interactions

var $ = require('jquery');
var helpers = require('./helpers');
var Mustache = require('mustache');

var DOM = {};
// var options = {};
var query = '?s={"size":72,"text":"#","retina":false}';
var timeoutUpdateImages;
var timestamp = Math.floor(Date.now() / 1000);

function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$container = DOM.$el.find('.js--container');
    DOM.$form = DOM.$el.find('.js--windshield-form');
    DOM.$orderId = DOM.$el.find('input[name=order_id]');
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
}

function _bindEvents(element) {
    DOM.$radioProduct.change(function () {
        _showHideFormContainers(this.value);
        _showHidePreviewElements(this.value);
        _enableDisableRadioButtons(this.value);
    });

    DOM.$radioTextColor.change(function () {
        _updateBannerSunstripTextColors();
    });

    DOM.$radioBaseColor.change(function () {
        _updateSunstripBaseColor();
    });

    DOM.$radioFont.change(function () {
        _updateBannerFontImages();
    });

    var that = this;
    DOM.$input.on('input', function () {
        if (timeoutUpdateImages) clearTimeout(timeoutUpdateImages);
        timeoutUpdateImages = setTimeout(function () {
            _updateTextImages();
            _updateBannerFontImages();
        }, 1500);
    });

    DOM.$form.submit(function(event) {
        event.preventDefault();
        var $form = $(this);
        $.post($form.attr("action"), $form.serialize()).then(function() {    
            _renderSuccessTemplate();
        });
    });
      
    DOM.$el.find('.js-test').click(function(event){
        _renderSuccessTemplate();
    });
    // $(window).resize(function() {
    //     _adjustCarContainerHeight();
    // });

    // Template events
    $('body').on('click', '.js-print-order', function(event) {
        event.preventDefault();
        $('#collapseOrder').collapse('show');
        window.print();
    });
}

function _renderSuccessTemplate(){
    // Create JSON from form fields
    var json = helpers.objectifyForm(DOM.$form.serializeArray());
    // Populate success template with JSON
    var template = $('#success-template').html();
    var rendered = Mustache.render(template, json);
    // Display success template
    DOM.$el.html(rendered);
    // Scroll to top
    $('html, body').animate({
        scrollTop: 0
    }, 250);
}

function _getBannerText() {
    return DOM.$input.val().length ? DOM.$input.val() : "Your Banner";
}

// function _adjustCarContainerHeight(){
//     var height = parseFloat(DOM.$car.height());
//     DOM.$carContainer.height(height);
// }

function _showHideFormContainers(product) {
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

function _getSelectedSwatch(radioName) {
    return $('input[name=' + radioName + ']:checked').parent().find('.color-swatch');
}

function _showHidePreviewElements(product) {
    switch (product) {
        case 'banner':
            DOM.$banner.show();
            DOM.$sunstrip.hide();
            DOM.$sunstripText.hide();
            break;
        case 'sunstrip':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.hide();
            break;
        case 'cutsunstrip':
            DOM.$banner.hide();
            DOM.$sunstrip.show();
            DOM.$sunstripText.show();
            DOM.$sunstripText.css('background-color', '#6C6C6C');
            break;
        case 'textsunstrip':
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
        case 'banner':
            DOM.$radioTextColor.prop("disabled", false);
            DOM.$radioBaseColor.prop("disabled", true);
            break;
        case 'sunstrip':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'cutsunstrip':
            DOM.$radioTextColor.prop("disabled", true);
            DOM.$radioBaseColor.prop("disabled", false);
            break;
        case 'textsunstrip':
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

function _render(options) {
    _showHideFormContainers(DOM.$radioProduct.val());
    DOM.$orderId.val("#BMDW" + timestamp);
    // _adjustCarContainerHeight();
}

function init(element) {
    if (element) {
        // options = $.extend(options, $(element).data());
        _cacheDom(element);
        _bindEvents();
        _render();
    }
}

exports.init = init;
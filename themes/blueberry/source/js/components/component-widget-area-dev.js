
var ComponentWidgetArea = function ($, events) {
    var DOM = {};

    function _roundOne(number) {
        return Math.round(number * 10) / 10
    }

    function _cacheDom(element) {
        DOM.$lengthInput = $('.js--widget-area-length');
        DOM.$heightInput = $('.js--widget-area-height');
        DOM.$areaInput = $('.js--widget-area-area');
        DOM.$lengthRuler = $('.js--length-ruler');
        DOM.$heightRuler = $('.js--height-ruler');
        DOM.$sizeSelect = $('.js--widget-area-select');
        DOM.$previewContainer = $('.js--widget-area-preview');
    }

    function _bindEvents() {
        DOM.$lengthInput.on("change", function () {
            _updateWidthHeightArea();
        });
        events.on('truckVanPreviewContainerSizeChanged', function (data) {
            _updateWidthHeightArea();
        });
    }

    function _updateWidthHeightArea() {
        var width = DOM.$lengthInput.val();
        // Get aspect ratio
        var ratio = DOM.$previewContainer.width() / DOM.$previewContainer.height();
        var height = width / ratio;
        var heightInteger = Math.floor(height);
        var heightDecimal = height % 1;

        var heightString = heightInteger + ' ';
        if (heightDecimal < 0.375) {
            heightString += "¼";
        }
        else if (heightDecimal < 0.625) {
            heightString += "½";
        }
        else {
            heightString += "¾";
        }
        // Set width and height to elements
        DOM.$lengthRuler.html(width);
        DOM.$heightRuler.html(heightString);
        DOM.$heightInput.val(heightString);

        var area = width * height / 12. / 12.22
        var areaRound = _roundOne(area);
        DOM.$areaInput.val(areaRound);

        if (area < 2) {
            DOM.$sizeSelect.val("S");
        }
        else if (area < 4) {
            DOM.$sizeSelect.val("M");
        }
        else if (area < 8) {
            DOM.$sizeSelect.val("L");
        }
        else {
            DOM.$sizeSelect.val("XL");
        }
        DOM.$sizeSelect.trigger('change');
    }

    function init() {
        if ($('.js--widget-area-length').length > 0) {
            _cacheDom();
            _bindEvents();
        }
    }

    return {
        init: init
    };
}

$(document).ready(function() {
    var componentWidgetArea = new ComponentWidgetArea($, window.events);
    componentWidgetArea.init();
});
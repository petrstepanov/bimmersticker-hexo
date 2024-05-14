var $ = require('jquery');

var DOM = {};

function _roundOne(number){
    return Math.round(number * 10) / 10
}

function _cacheDom(element){
    DOM.$lengthInput = $('.js--widget-area-length');
    DOM.$heightInput = $('.js--widget-area-height');
    DOM.$areaInput   = $('.js--widget-area-area');
    DOM.$lengthRuler = $('.js--length-ruler');
    DOM.$heightRuler = $('.js--height-ruler');
    DOM.$sizeSelect  = $('.js--widget-area-select');
    DOM.$previewContainer  = $('.js--widget-area-preview');
}

function _bindEvents(){
    DOM.$lengthInput.on("change", function() {
        _updateWidthHeightArea();
    });
}

function _updateWidthHeightArea(){
    var width = DOM.$lengthInput.val();
    // Get aspect ratio
    var ratio = DOM.$previewContainer.width()/DOM.$previewContainer.height();
    var height = width/ratio;
    var heightRound = _roundOne(width/ratio);
    // Set width and height to elements
    DOM.$lengthRuler.html(width);
    DOM.$heightRuler.html(heightRound);
    DOM.$heightInput.val(heightRound);

    var area = width*height/12./12.22
    var areaRound = _roundOne(area);
    DOM.$areaInput.val(areaRound);

    if (area < 2){
        DOM.$sizeSelect.val("s");
    }
    else if (area < 4){
        DOM.$sizeSelect.val("m");
    }
    else if (area < 8){
        DOM.$sizeSelect.val("l");
    }
    else {
        DOM.$sizeSelect.val("xl");
    }
    DOM.$sizeSelect.change();
}

function init(){
    if ($('.js--widget-area-length').length > 0){
        _cacheDom();
        _bindEvents();
    }
}

exports.init = init;

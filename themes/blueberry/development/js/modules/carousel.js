// Select item of a specific index in the carousel when user picked color from dropdown
var $ = require('jquery');
var events = require('./events');
var bootstrap = require('bootstrap');

var bsCarousel;

function _bindEvents(){
    events.on('colorIndexSelectedEvent', function(data){
        var index = data.index;
        if (bsCarousel === null) {
            bsCarousel = new bootstrap.Carousel('.carousel');
        }
        bsCarousel.pause();
        bsCarousel.to(index);
    });
}

function init() {
    _bindEvents();
}

exports.init = init;

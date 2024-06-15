// Select item of a specific index in the carousel when user picked color from dropdown
var $ = require('jquery');
var events = require('../js/modules/events');
var bootstrap = require('bootstrap');

var ColorCarouselSelect = function(){

    var DOM = [];
    var carousel;

    function _cacheDOM(element){
        DOM.$el = $(element);
    }

    function _initBS(){
        // Instantiate BS carousel
        // https://getbootstrap.com/docs/5.3/components/carousel/#via-javascript
        var id = "#" + DOM.$el.attr("id");
        carousel = new bootstrap.Carousel(id);
    }

    function _bindEvents(){
        events.on('colorIndexSelectedEvent', function(data){
            // Index of the image to be displayed
            var index = data.index;

            // Show correspondent image
            carousel.pause();
            carousel.to(index);
        });
    }

    function init(element) {
        if (element){
            _cacheDOM(element);
            _initBS()
            _bindEvents();
        }
    }

    return {
        init: init
    };
}

module.exports = ColorCarouselSelect;
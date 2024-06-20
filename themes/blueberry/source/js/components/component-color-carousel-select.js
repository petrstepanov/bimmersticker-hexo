(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Select item of a specific index in the carousel when user picked color from dropdown

var ColorCarouselSelect = function($, events, bootstrap){

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

$(function() {
    $('.js--component-color-carousel-select').each(function(){
        var colorCarouselSelect = new ColorCarouselSelect(window.$, window.events, window.bootstrap);
        colorCarouselSelect.init(this);
    });
});
},{}]},{},[1])
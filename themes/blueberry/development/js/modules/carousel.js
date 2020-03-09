// Select item of a specific index in the carousel when user picked color from dropdown
var $ = require('jquery');
var events = require('./events');

function _bindEvents(){
    events.on('colorIndexSelectedEvent', function(data){
        var index = data.index;
        $('.carousel').carousel('pause');
        $('.carousel').carousel(index);
    });
}

function init(element) {
    _bindEvents();
}

exports.init = init;

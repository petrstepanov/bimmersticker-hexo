var events = require('./events');

var DetectTrackpadMouse = function () {

    function _wheelListener(event){
        var delta = Math.abs(event.deltaY);
        if (delta % 1 > 0){
            // console.log("Trackpad detected");
            events.emit('usingTrackpadOrMouseEvent', 'trackpad');
        }
        else {
            // console.log("Mouse detected");
            events.emit('usingTrackpadOrMouseEvent', 'mouse');
        }
        document.removeEventListener("wheel", _wheelListener);
    }

    function _bindEvents() {
        document.addEventListener("wheel", _wheelListener);
    }

    function init() {
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = DetectTrackpadMouse;
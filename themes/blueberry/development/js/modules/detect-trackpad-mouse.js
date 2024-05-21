// Stealed from: https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript/31191250#31191250

var events = require('./events');

var DetectTrackpadMouse = function(){

    let oldTime = 0;
    let newTime = 0;
    let isTrackPad;
    let eventCount = 0;
    let eventCountStart;

    // const updateText = message => (text.textContent = message);

    const resetDetection = () => {
        oldTime = 0;
        newTime = 0;
        isTrackPad = undefined;
        eventCount = 0;
        eventCountStart = undefined;
        // updateText("Scroll here");
    };

    const detectTrackpad = evt => {
        const isTrackPadDefined = isTrackPad || typeof isTrackPad !== "undefined";

        if (isTrackPadDefined) return;

        if (eventCount === 0) {
            eventCountStart = performance.now();
        }

        eventCount++;

        if (performance.now() - eventCountStart > 66) {
            if (eventCount > 5) {
                isTrackPad = true;
                // updateText("Using trackpad");
            } else {
                isTrackPad = false;
                events.emit('usingMouseEvent');
                // updateText("Using mouse");
            }
            isTrackPadDefined = true;
            setTimeout(resetDetection, 2000);
        }
    };

    function _bindEvents(){
        document.addEventListener("wheel", detectTrackpad);
    }

    function init(){
        _bindEvents();
    }

    return {
        init: init
      };
};

module.exports = DetectTrackpadMouse;
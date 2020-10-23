var $ = require('jquery');

var FacebookLoadOnScroll = function(){

    var DOM = {};
    var isLoaded = false;

    function _bindEvents(){
        $(window).scroll(function(){
            if (!isLoaded){
                setTimeout(_loadFacebook, 3000);
                isLoaded = true;
            }
        });
    }

    function _loadFacebook(){   
        var lazyScripts = document.getElementById('lazy-scripts-facebook');

        var scripts = lazyScripts.content.querySelectorAll('script');
        for (var index = 0; index < scripts.length; index++) {
            var script = scripts[index];
            if (script.getAttribute('async') === null) {
                script.async = false;
            }
        }

        lazyScripts.parentNode.append(lazyScripts.content);
    }

    function init() {
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = FacebookLoadOnScroll;
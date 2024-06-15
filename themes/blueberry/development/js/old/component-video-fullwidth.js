var VideoFullWidth = function($){

    var DOM = {};
    var width;
    var height;

    function _cacheDom(element) {
        DOM.$video = $(element).find('video');
        width = DOM.$video.attr('width');
        height = DOM.$video.attr('height');
    }

    function _bindEvents(){
        $(window).resize(function(){
            _setVideoFullWidth();
        })
    }

    function _setVideoFullWidth(){
        var parentWidth = parseInt(DOM.$video.parent().width());

        DOM.$video.attr('width', parentWidth);
        DOM.$video.attr('height', Math.round(parentWidth/width*height));
    }

    function init(element) {
        if (element) {
            // options = $.extend(options, element.dataset);
            _cacheDom(element);
            _setVideoFullWidth();
            _bindEvents();
        }
    }

    return {
        init: init
    };
};

$(function() {
  // Make videos full width
  $('.js--component-video-fullwidth').each(function(){
    var videoFullWith = new VideoFullWidth(window.$);
    videoFullWith.init(this);
  });
});
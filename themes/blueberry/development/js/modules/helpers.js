var Helpers = (function(){

  isInViewport = function($el) {
    var elementTop = $el.offset().top;
    var elementBottom = elementTop + $el.outerHeight();
    var viewportTop = $(window).scrollTop();
    // If fixed navbar
    if ($('.js--navbar-blueberry.fixed-top').length){
      viewportTop += $('.js--navbar-blueberry.fixed-top').outerHeight();
    }
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
  };

  return {
    isInViewport: isInViewport
  };
})();

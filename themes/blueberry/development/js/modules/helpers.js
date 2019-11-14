var Helpers = (function(){

  function isInViewport($el){
    var elementTop = $el.offset().top;
    var elementBottom = elementTop + $el.outerHeight();
    var viewportTop = $(window).scrollTop();
    // If fixed navbar
    if ($('.js--navbar-blueberry.fixed-top').length){
      viewportTop += $('.js--navbar-blueberry.fixed-top').outerHeight();
    }
    var viewportBottom = viewportTop + $(window).height();
    // return elementBottom > viewportTop && elementTop < viewportBottom;
    return elementBottom > viewportTop;
  }

  function getViewportSize(){
    return {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
  }

  return {
    isInViewport: isInViewport,
    getViewportSize: getViewportSize
  };
})();

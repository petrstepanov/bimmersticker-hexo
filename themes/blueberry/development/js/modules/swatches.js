var Swatches = function(){
  var DOM = {};
  // var options = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
  }

  // function _bindEvents(element) {
  // }

  function _render(){
    var swatches = DOM.$el.text().split(", ");
    DOM.$el.html('');
    swatches.forEach(function(color){
      var $s = $('<span class="swatch ' + color + '">' + '</span>');
      DOM.$el.append($s);
      $s.popover({
        animation: false,
        placement: 'top',
        trigger: 'hover',
        content: color.charAt(0).toUpperCase() + color.slice(1),
        offset: '0, 6px'
      });
    });
  }

  function init(element) {
    if (element) {
      // options = $.extend(options, $(element).data());
      _cacheDom(element);
      // _bindEvents();
      _render();
    }
  }

  return {
    init: init
  };
};

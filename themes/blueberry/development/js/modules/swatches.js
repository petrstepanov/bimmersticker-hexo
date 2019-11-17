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
      colorClass = color.toLowerCase();
      var $s = $('<span class="swatch ' + colorClass + '">' + '</span>');
      DOM.$el.append($s);
      $s.popover({
        animation: false,
        container: 'body',
        placement: 'top',
        trigger: 'hover',
        content: color,
        offset: "0, 6"
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

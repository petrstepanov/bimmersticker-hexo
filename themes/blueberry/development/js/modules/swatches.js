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
    var html = "&nbsp;";
    swatches.forEach(function(swatch){
      html += '<span class="swatch ' + swatch + '">' + '</span>';
    });
    DOM.$el.html(html);
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
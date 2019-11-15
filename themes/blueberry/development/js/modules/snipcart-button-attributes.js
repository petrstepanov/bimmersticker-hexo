var SnipcartButtonAttributes = (function () {
  var DOM = {};

  function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$inputs = DOM.$el.find('select, input');
    DOM.$button = DOM.$el.find('.snipcart-add-item');
  }

  function _bindEvents(element) {
    DOM.$inputs.on('change, input', function () {
      var i = DOM.$inputs.index(this) + 1;
      var customAttrName = 'item-custom' + i + '-value';
      // DOM.$button.data(customAttrName, $(this).val());
      DOM.$button.attr('data-' + customAttrName, $(this).val());
    });
  }

  function init(element) {
    if (element) {
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };
})();

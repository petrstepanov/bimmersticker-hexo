var SnipcartButtonAttributes = (function () {
  var DOM = {};

  function _cacheDom(element) {
    DOM.$form = $(element);
    DOM.$inputs = DOM.$form.find('select, input');
    DOM.$snipcartButton = DOM.$form.find('.snipcart-add-item');
  }

  function _bindEvents(element) {
    DOM.$inputs.on('change, input', function () {
      var i = DOM.$inputs.index(this) + 1;
      var customAttrName = 'item-custom' + i + '-value';
      // DOM.$button.data(customAttrName, $(this).val());
      DOM.$snipcartButton.attr('data-' + customAttrName, $(this).val());
    });

    DOM.$form.on('submit', function(event){
      event.preventDefault();
      DOM.$snipcartButton.click();
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

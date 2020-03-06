// Interactions between product form and Snipcart Buy button:
// changing variation options, updating price

var $ = require('jquery');
var DOM = {};

function _cacheDom(element) {
  DOM.$form = $(element);
  DOM.$inputs = DOM.$form.find('select, input');
  DOM.$selects = DOM.$form.find('select');
  DOM.$snipcartButton = DOM.$form.find('.js--snipcart-add-item');
  DOM.$submitButtons = $(document).find('.js--product-submit');
}

function _bindEvents(element) {
  DOM.$inputs.on('change, input', function () {
    var i = DOM.$inputs.index(this) + 1;
    var customAttrName = 'item-custom' + i + '-value';
    // DOM.$button.data(customAttrName, $(this).val());
    DOM.$snipcartButton.attr('data-' + customAttrName, $(this).val());
  });

  // Update price on button when selecting variations with extra price
  DOM.$selects.on('change', function () {
    var extraTotal = 0;
    DOM.$selects.each(function () {
      var $option = $(this).find('option:selected');
      if (typeof $option.data().extra !== 'undefined') {
        extraTotal += parseFloat($option.data().extra);
      }
    });
    DOM.$submitButtons.each(function () {
      var price = parseFloat($(this).data().basePrice);
      price += extraTotal;
      var baseCaption = $(this).data().baseCaption;
      $(this).html(baseCaption + '$' + price.toString());
    });
  });

  DOM.$form.on('submit', function (event) {
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

exports.init = init;
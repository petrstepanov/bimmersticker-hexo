// Interactions between product form and Snipcart Buy button:
// changing variation options, updating price

var $ = require('jquery');
var DOM = {};
var events = require('./events')

function _cacheDom(element) {
  DOM.$form = $(element);
  DOM.$inputsAndSelects = DOM.$form.find('select, input');
  DOM.$selects = DOM.$form.find('select');
  DOM.$selectColor = DOM.$form.find('select#color')
  DOM.$snipcartButton = DOM.$form.find('.js--snipcart-add-item');
  DOM.$submitButtons = $(document).find('.js--product-submit');
}

function _bindEvents(element) {
  DOM.$inputsAndSelects.on('change input', function () {
    var i = DOM.$inputsAndSelects.index(this) + 1;
    var customAttrName = 'item-custom' + i + '-value';
    // DOM.$button.data(customAttrName, $(this).val());
    DOM.$snipcartButton.attr('data-' + customAttrName, $(this).val());
  });

  // Update price on button when selecting variations with extra price
  DOM.$selects.on('change', function () {
    // Calculate total extra price
    var extraTotal = 0;
    DOM.$selects.each(function () {
      var $option = $(this).find('option:selected');
      if (typeof $option.data().extra !== 'undefined') {
        extraTotal += parseFloat($option.data().extra);
      }
    });
    // Reflect total in the submit button
    DOM.$submitButtons.each(function () {
      var price = parseFloat($(this).data().basePrice);
      price += extraTotal;
      var baseCaption = $(this).data().baseCaption;
      $(this).html(baseCaption + '$' + price.toFixed(2).toString());
    });
  });

  // Throw event about selecting specific color in the dropdown
  DOM.$selectColor.on('change', function () {
    var $options = $(this).find('option');
    var option = $(this).find('option:selected').get(0);
    var selectedIndex = $options.index(option);
    if (selectedIndex >= 0){
      events.emit('colorIndexSelectedEvent', {index: selectedIndex});
    }
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
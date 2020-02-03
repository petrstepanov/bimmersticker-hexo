// Ajax form submission logic

var $ = require('jquery');
var events = require('./events');
var notificationCenter = require('./notification-center');

var FormAjaxSubmit = function(){
  var DOM = {};
  var options = {
    dataType: 'json',
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
  };

  function _cacheDom(element) {
    DOM.$form = $(element);
    DOM.$submitButton = DOM.$form.find('[type=submit]');
  }

  function _bindEvents(){
    DOM.$form.on('submit', function(event) {
      // Prevent regular submit
      event.preventDefault();

      // Disable submit button
      DOM.$submitButton.addClass("atom-submit-button loading");
      DOM.$submitButton.prop("disabled", true);

      $.ajax({
        url:      DOM.$form.attr('action'),
        type:     DOM.$form.attr('method'),
        data:     DOM.$form.serialize(),
        dataType: options.dataType,
        success:  _onSuccess,
        error:    _onError
      });
    });
  }

  function _onSuccess(data){
    // If no redirect just show notification
    if (options.successNotification){
      notificationCenter.notify('success', options.successNotification);
    }
    // Run callback
    if (options.successEvent){
      events.emit(options.successEvent, data);
    }
    // Enable submit button
    DOM.$submitButton.prop("disabled", false);
    DOM.$submitButton.removeClass("loading");
    // Reset form fields
    DOM.$form.trigger('reset');
  }

  function _onError(xhr, error) {
      notificationCenter.notify('error', error.toString());
      // Enable submit button
      DOM.$submitButton.prop("disabled", false);
      DOM.$submitButton.removeClass("loading");
  }

  function init(element){
    if (element){
      options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }
};

module.exports = FormAjaxSubmit;
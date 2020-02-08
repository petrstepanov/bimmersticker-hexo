// Ajax form submission logic

var $ = require('jquery');
var events = require('./events');
var notificationCenter = require('./notification-center');

var FormAjaxSubmit = function(){
  var DOM = {};
  var options = {
    dataType: 'json' // default for FormCarry, Netlify, Mailchimp
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
      DOM.$submitButton.addClass("loading");
      DOM.$submitButton.prop("disabled", true);

      // All forms with cross-domain actions are posted via jsonp (FormCarry, Netlify, Mailchimp)
      // Try success: callback?
      $.ajax({
        type:     DOM.$form.attr('method'),
        url:      DOM.$form.attr('action'),
        data:     DOM.$form.serialize(),
        dataType: options.dataType
      }).done(function(data){
        // Mailchimp responds with data.result = 'error' and data.msg="..."
        // FormCarry responds with Object { code: 200, status: "success", title: "Thank You!", message: "We received your submission", referer: "http://localhost:4000/" }
        var error = data.result == 'error' || data.status == 'error';
        var message = data.msg || data.message;

        if (error){
          if (data.msg){
            notificationCenter.notify('error', message);
          }
        }
        else {
          // data-success-notofication overrides success server message
          if (options.successNotification){
            notificationCenter.notify('success', options.successNotification);
          } else if (message){
            notificationCenter.notify('success', message);
          }
          // Throw event
          if (options.successEvent){
            events.emit(options.successEvent, data);
          }
          // Reset form fields
          DOM.$form.trigger('reset');          
        }
        // Enable submit button
        DOM.$submitButton.prop("disabled", false);
        DOM.$submitButton.removeClass("loading");
      });
    });
  }

  function init(element){
    if (element){
      options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };  
};

module.exports = FormAjaxSubmit;
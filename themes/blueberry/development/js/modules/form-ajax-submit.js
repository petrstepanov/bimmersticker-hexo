// Ajax form submission logic

var $ = require('jquery');
var events = require('./events');
var notificationCenter = require('./notification-center');

var FormAjaxSubmit = function(){
  var DOM = {};
  var options = {
    dataType: 'html', // default for Netlify, but FormCarry and Mailchimp need 'json' (jsonp);
    contentType: 'application/x-www-form-urlencoded'
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

      // However, for forms with files we need to change it to "multipart/form-data"

      // Default contentType in jQuery's ajax() is 'application/x-www-form-urlencoded; charset=UTF-8'
      // (see ajax() manual). Terefore we dont have to specify it.

      // By default we use jQuery's serialize() to create URL-encoded form string
      var data = DOM.$form.serialize();

      // However, if form contains file field, it must be 
      if (DOM.$form.find('file').length){
        // See: https://docs.netlify.com/forms/setup/#file-uploads
        // This was not tested yet. Because Netlify has 10 MB monthly upload limit!
        options.contentType = 'multipart/form-data';
        var formData = new FormData(DOM.$form[0]);
        data = new URLSearchParams(formData).toString();
      }

      // Do not provirde dataType in ajax() because it has intelligent guess!
      // dataType (default: Intelligent Guess (xml, json, script, or html)

      // Unfortunately for Mailchimp we need jsonp, therefore manually provdedata type
      // Determine dataType
      if (DOM.$form.attr('action') !== 'undefined' && DOM.$form.attr('action').includes('subscribe')){
        options.dataType = 'json';
      }

      $.ajax({
        type:        DOM.$form.attr('method'),
        url:         DOM.$form.attr('action'),
        data:        DOM.$form.serialize(),
        dataType:    options.dataType,
        contentType: options.contentType
      }).done(function(data){
        // Mailchimp responds with data.result = 'error' and data.msg="..."
        // FormCarry responds with Object { code: 200, status: "success", title: "Thank You!", message: "We received your submission", referer: "http://localhost:4000/" }
        // Netlify responds with HTML...
        var error = data.result == 'error' || data.status == 'error';
        var message = data.msg || data.message;

        if (error){
          if (data.msg){
            notificationCenter.notify('error', message);
            return;
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
      })
      .fail(function(data) {
        notificationCenter.notify('error', 'Unknown error occured!');
      })
      .always(function() {
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
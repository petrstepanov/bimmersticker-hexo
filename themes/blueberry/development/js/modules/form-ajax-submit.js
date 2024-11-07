// Ajax form submission logic for Netlify forms

var $ = require('jquery');
var events = require('./events');
var notificationCenter = require('./notification-center');

var FormAjaxSubmit = function(){
  var DOM = {};

  var options = {
    successNotification: "Form submitted successfully!"
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

      // https://docs.netlify.com/forms/setup/#submit-javascript-rendered-forms-with-ajax

      // Copmpose fetch request
      var fetchOptions = {
        method: "POST"
      };

      if (DOM.$form.find('[type="file"]').length == 0){
        // No file field
        fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
        const myForm = DOM.$form[0];
        const formData = new FormData(myForm);
        fetchOptions.body = new URLSearchParams(formData).toString()
      }
      else {
        // Form contains file field
        fetchOptions.body = new FormData(event.target);
      }

      fetch("/", fetchOptions)
        .then(() => {
          // Show success notification
          notificationCenter.notify('success', options.successNotification);

          // Throw event
          if (options.successEvent){
            events.emit(options.successEvent, data);
          }

          // Enable submit button
          DOM.$submitButton.prop("disabled", false);
          DOM.$submitButton.removeClass("loading");
        })
        .catch(error => {
          notificationCenter.notify('error', error);
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
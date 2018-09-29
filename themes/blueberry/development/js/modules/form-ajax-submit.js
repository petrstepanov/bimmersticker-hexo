var FormAjaxSubmit = function(){
  var DOM = {};
  var options = {};

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
        data    : DOM.$form.serialize(),
        success : _onSuccess,
        error   : _onError
      });
    });
  }

  function _onSuccess(data){
    if (options.successRedirectUrl && options.successRedirectUrl != ""){
      // If redirect show notification after page reload
      if (options.successNotification){
        NotificationCenter.doNotifyAfterPageReload('success', options.successNotification);
      }
      window.location.href = options.successRedirectUrl;
    } else {
      // If no redirect just show notification
      if (options.successNotification){
        NotificationCenter.doNotify('success', options.successNotification);
      }
      // Run callback
      if (options.successEvent){
        Events.emit(options.successEvent, data);
      }
      // Enable submit button
      DOM.$submitButton.prop("disabled", false);
      DOM.$submitButton.removeClass("loading");
    }
  }

  function _onError(xhr, error) {
     NotificationCenter.doNotify('error', error.toString());
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

  return {
    init: init
  };
};

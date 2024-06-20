// Hide Bootstrap dialog that contains mailchimp form

var FormInsideModal = function($, events){
  var DOM = {};

  function _cacheDom(element) {
    DOM.$dialog = $(element);
  }

  function _bindEvents() {
    events.on('formSuccessEvent', function (data) {
      DOM.$dialog.modal('hide');
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
  }
}

$(function() {
  $('.js--init-form-inside-modal').each(function(){
    var formInsideModal = new FormInsideModal(window.$, window.events);
    formInsideModal.init(this);
  });
});
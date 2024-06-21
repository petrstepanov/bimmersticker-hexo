var $ = require('cash-dom');
var bootstrap = require('bootstrap');
var helpers = require('./helpers');

var id = 0;

// Type is bootstrap background color class:
// https://getbootstrap.com/docs/5.3/components/toasts/#color-schemes

// primary secondary success danger warning info light dark

function notify(type, message, timeout) {
  var milliseconds = typeof timeout !== 'undefined' ? timeout : 5000;

  // Create toast element (cash collection)
  var template = $('#toast-template').html();
  var data = {
    type:    type,
    message: message,
    id:      "toast-" + id
  };
  var toastHTML = helpers.renderTemplate(template, data);

  // Append toast HTML to container
  var $toastContainer = $('#toast-container');
  $(toastHTML).appendTo($toastContainer.get(0));

  // Obtain toast element
  $toast = $('#toast-'+id);

  // Hook up BS javascript and show
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance($toast.get(0));
  toastBootstrap.show({delay: milliseconds});

  // Delete toast element after hiding
  $toast.get(0).addEventListener('hidden.bs.toast', function(){
    $(this).remove();
  });

  // Increment id
  id++;
}

exports.notify = notify;
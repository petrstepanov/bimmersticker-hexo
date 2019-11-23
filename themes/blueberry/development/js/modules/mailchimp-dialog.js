// Hide Bootstrap dialog that contains mailchimp form

var $ = require('jquery');
var events = require('./events');

var DOM = {};

function _cacheDom(element) {
  DOM.$dialog = $(element);
}

function _bindEvents() {
  events.on('mailchimpSuccessEvent', function (data) {
    DOM.$dialog.modal('hide');
  });
}

function init(element) {
  if (element) {
    _cacheDom(element);
    _bindEvents();
  }
}

exports.init = init;
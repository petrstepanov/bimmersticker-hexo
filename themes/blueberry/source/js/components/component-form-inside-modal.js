(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}]},{},[1])
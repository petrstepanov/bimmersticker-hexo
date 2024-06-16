// Sticks element in viewport for screen width larger than provided
// var stickyKit = require('sticky-kit');

var $ = require('jquery');
var helpers = require('./helpers');

var DOM = {};
var options = {};
var isStuck = false;

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  $(window).resize(function () {
    _stickReleaseContainer();
  });
}

function _stickReleaseContainer() {
  if (_checkNeedsSticky()) {
    if (!isStuck) {
      DOM.$el.stick_in_parent({
        // offset_top: 1
      });
      isStuck = true;
    }
    $(document.body).trigger("sticky_kit:recalc");
  } else {
    if (isStuck) {
      DOM.$el.trigger("sticky_kit:detach");
      isStuck = false;
    }
  }
}

function _checkNeedsSticky() {
  if (helpers.getViewportSize().width >= options.viewportThreshold) {
    return true;
  }
  return false;
}

function _render() {
  _stickReleaseContainer();
}

function init(element) {
  if (element) {
    options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    _render();
  }
}

exports.init = init;

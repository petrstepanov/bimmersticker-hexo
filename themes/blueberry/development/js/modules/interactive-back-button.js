var $ = require('cash-dom');
var cookies = require('js-cookie');

var DOM = {};

function _cacheDom() {
  DOM.$template = $('#int-back-button');
  DOM.$container = $('#back-link-container');
  DOM.$currentBackLink = $('#ejs-back-link');
}

function _renderBackLink(){
  var rendered = DOM.$template.html();
  DOM.$currentBackLink.remove();
  DOM.$container.html(rendered);
}

function init() {
  // var previousHref = Cookies.get('previousUrl');
  // var currentHref = window.location.href;
  _cacheDom();

  // If page was loaded before then back button acts like back button
  if (!cookies.get('wasOnSite')){
    // If previous url saved in cookies is different from current - navigate there
    _renderBackLink();
  }

  // var date = new Date();
  // date.setTime(date.getTime() + (5 * 60 * 1000)); // 5 minute expiration
  // Expires: takes number of days; 5 minutes is 5/24*60 ~ 0.003 of a day
  // Cookies.set('pageLoaded', window.location.href, { expires: 0.003, sameSite: 'strict' });
  cookies.set('wasOnSite', 'true', { expires: 0.003, sameSite: 'strict' });
}

exports.init = init;
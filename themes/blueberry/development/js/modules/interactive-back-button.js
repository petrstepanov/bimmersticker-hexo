var $ = require('jquery');
var Cookies = require('js-cookie');

var DOM = {};

function _cacheDom(element) {
  DOM.$link = $(element);
  DOM.$label = DOM.$link.find(".js--label");
}

function _renderBackLink(){
  // Attach click handler
  DOM.$link.click(function(event) {
    event.preventDefault();
    window.history.back();
  });

  // Set label
  DOM.$label.html("Go back");

  // Make label visible
  DOM.$label.css("visibility", "visible"); 
}

function init(element) {
  var previousHref = Cookies.get('previousUrl');
  var currentHref = window.location.href;


  if (element) {  
    _cacheDom(element);

    // If page was loaded before then back button acts like back button
    if (Cookies.get('pageLoaded')){
      // If previous url saved in cookies is different from current - navigate there
      _renderBackLink();    
    }
  }

  var date = new Date();
  date.setTime(date.getTime() + (5 * 60 * 1000)); // 5 minute expiration 
  Cookies.set('pageLoaded', window.location.href, { expires: date });
}

exports.init = init;
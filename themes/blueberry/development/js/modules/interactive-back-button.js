// Filtering cards on the main page

var $ = require('jquery');
var Cookies = require('js-cookie');

var DOM = {};

function _cacheDom(element) {
  DOM.$link = $(element);
  DOM.$label = DOM.$link.find(".js--label");
}

function _render(){
  DOM.$link.attr("href", Cookies.get('previousUrl'));
  DOM.$label.html("Go back");

  // Make back link visible
  DOM.$label.css("visibility", "visible");
}

function init(element) {
  if (element) {  
    // If saved previous URL change "<- Browse all stickers" to "<- Go Back"
    if (Cookies.get('previousUrl')){
      _cacheDom(element);
      _render();    
    }
  }

  // Store previous url for 10 minutes
  var date = new Date();
  date.setTime(date.getTime() + (10 * 60 * 1000));
  Cookies.set('previousUrl', window.location.href, { expires: date });  // expires after 10 minutes  
}

exports.init = init;
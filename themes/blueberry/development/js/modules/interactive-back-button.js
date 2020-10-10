var $ = require('jquery');
var Cookies = require('js-cookie');

var DOM = {};

function _cacheDom(element) {
  DOM.$link = $(element);
  DOM.$label = DOM.$link.find(".js--label");
}

function _renderBackFromCookies(){
  DOM.$link.attr("href", Cookies.get('previousUrl'));
  DOM.$label.html("Go back");
}

function init(element) {
  var previousHref = Cookies.get('previousUrl');
  var currentHref = window.location.href;


  if (element) {  
    _cacheDom(element);

    // Two scenarios of changing the Back buton behaviour
    if (Cookies.get('previousUrl') && Cookies.get('previousUrl') != window.location.href){
      // If previous url saved in cookies is different from current - navigate there
      _renderBackFromCookies();    
    }

    // Make back link visible
    DOM.$label.css("visibility", "visible"); 
  }

  var date = new Date();
  date.setTime(date.getTime() + (10 * 60 * 1000));
  Cookies.set('previousUrl', window.location.href, { expires: date });  // expires after 10 minutes  
}

exports.init = init;
// Smooth scrolling to anchor target

var $ = require('jquery');
var navbarFixer = require('./navbar-fixer');

var DOM = {};
var options = {};

function _cacheDom(element) {
  DOM.$links = $('a[href^="#"]:not([href="#"],[href^="#carousel"])');
}

function _bindEvents() {
  DOM.$links.click(function(event){
    _onLinkClicked(event);
  });
}

function _onLinkClicked(event){
  event.preventDefault();
  var $target = $(event.currentTarget.getAttribute('href'));
  if ($target.length){
    var offset = $target.offset().top - 30;
    // Account on the navbar fixed height (equals to body padding)
    offset -= parseInt($('body').css('padding-top'));
    $('html, body').animate({
      scrollTop: offset
    }, 500);
  }
}

// function _render(){
//
// }

function init(element) {
  options = $.extend(options, $(element).data());
  _cacheDom(element);
  _bindEvents();
  // _render();
}

exports.init = init;
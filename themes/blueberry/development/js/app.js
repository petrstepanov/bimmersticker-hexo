// Originally $ is required by `kinetic` in container-horizontal.
// However with introduction of component specific css,
// I moved some of the scripts to globals

// Globals used in the components' inline scripts
var $ = window.$ = require('cash-dom');  // 1237 lines;
var bootstrap = window.bootstrap = require('bootstrap'); //  6317 lines
var events = window.events = require('./modules/events');

var helpers = window.helpers = require('./modules/helpers');
var notificationCenter = window.notificationCenter = require('./modules/notification-center');
var getColorFriendlyName = window.getColorFriendlyName = require('named-web-colors');

// Locals for this Browserify entry point
var autosize = require('autosize');  // 363 lines
var AOS = require('aos'); //  // 6 lines?
var navbarCollapse = require('./modules/navbar-collapse');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
var FormAjaxSubmit = require('./modules/form-ajax-submit');
var CheckoutButtonFix = require('./modules/checkout-button-fix');
var InteractiveBackButton = require('./modules/interactive-back-button');
var autovalid = require('./modules/autovalid');
var GCR = require('./modules/gcr');
var SnipcartLoadOnClick = require('./modules/snipcart-load-on-click');

$(document).ready(function() {
  // document.addEventListener("DOMContentLoaded", function() {
  snipcartLoadOnClick = new SnipcartLoadOnClick();
  snipcartLoadOnClick.init();

  InteractiveBackButton.init();
  navbarCollapse.init(document.querySelector('.js--init-navbar-collapse'));

  // navbarBuyButton inits first - listens to event
  navbarBuyButton.init(document.querySelector('.js--init-navbar-buy-button'));
  // contentBuyButton inits second - fires event
  contentBuyButton.init(document.querySelector('.js--init-content-buy-button'));

  // Its almost on every page so its here
  document.querySelectorAll('.js--init-ajax-submit').forEach(function(element, index) {
    var formAjaxSubmit = new FormAjaxSubmit();
    formAjaxSubmit.init(element);
  });

  // Autosize textareas
  autosize(document.querySelectorAll('.js--init-autosize'));

  // Fix checkout button caption
  var checkoutButtonFix = new CheckoutButtonFix();
  checkoutButtonFix.init();

  // Viewport animations
  AOS.init({
    useClassNames: true,
    animatedClassName: 'animate__animated'
  });

  // Automatic pills selection
  var hashtag = window.location.hash;
  if (hashtag!='') {
    var pill = document.querySelectorAll('.nav-pills ' + hashtag);
    if (pill.length > 0){
      const bsTab = new bootstrap.Tab(hashtag);
      bsTab.show();
    }
  }

  // Automatic HTML5 validation that is not :invalid at the page load
  // https://codepilotsf.medium.com/html5-form-validation-the-easy-way-8e457049bf04
  // Manually converted to Browserify syntax
  autovalid.autovalid();

  //
  // Helper event to close other widgets
  document.onclick = function(){
    events.emit('documentClick');
  }

  // Google Customer Reviews
  var gcr = new GCR();
  gcr.init();
  // Export GCR to be accessed by Vue
  // https://www.mattburkedev.com/export-a-global-to-the-window-object-with-browserify/
  // window.gcr = gcr;
  // This worked with Browserify and sourcemaps in dev mode
  // https://stackoverflow.com/questions/38104715/browserify-global-variable-is-not-found-in-the-browser
  window['gcr'] = gcr;
});

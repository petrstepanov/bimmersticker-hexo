// Originally $ is required by `kinetic` in container-horizontal.
// However with introduction of component specific css,
// I moved some of the scripts to globals

var $ = window.$ = window.jQuery = require('jquery');
var bootstrap = window.bootstrap = require('bootstrap');
var helpers = window.helpers = require('./modules/helpers');
var events = window.events = require('./modules/events');
var kinetic = window.kinetic = require('jquery.kinetic');

var autosize = require('autosize');
var AOS = require('aos');

var navbarCollapse = require('./modules/navbar-collapse');
var snipcartForm = require('./modules/snipcart-form');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
// var postsFilter = require('./modules/posts-filter');
var formInsideDialog = require('./modules/form-inside-dialog');
// var formValidation = require('./modules/form-validation');
var FormAjaxSubmit = require('./modules/form-ajax-submit');
var InputColor = require('./modules/input-color');
var CheckoutButtonFix = require('./modules/checkout-button-fix');
var InteractiveBackButton = require('./modules/interactive-back-button');
var autovalid = require('./modules/autovalid');

// Google Customer Reviews
// Export GCR to be accessed by Vue
// https://www.mattburkedev.com/export-a-global-to-the-window-object-with-browserify/
// gcr.init();
var gcr = require('./modules/gcr');
gcr.init();
// window.gcr = gcr; // Not works

// This worked with Browserify and sourcemaps in dev mode
// https://stackoverflow.com/questions/38104715/browserify-global-variable-is-not-found-in-the-browser
window['gcr'] = gcr;

$(function() {
  // Interactive Back Button
  InteractiveBackButton.init();
  navbarCollapse.init(document.querySelector('.js--init-navbar-collapse'));
  contentBuyButton.init(document.querySelector('.js--init-content-buy-button'));
  navbarBuyButton.init(document.querySelector('.js--init-navbar-buy-button'));
  formInsideDialog.init(document.querySelector('.js--init-form-inside-dialog'));

  $('.js--init-ajax-submit').each(function(){
    var formAjaxSubmit = new FormAjaxSubmit();
    formAjaxSubmit.init(this);
  });

  // Autosize textareas
  autosize(document.querySelectorAll('.js--init-autosize'));

  // Bootstrap's popovers
  $('[data-toggle="popover"]').each(function (){
    const popover = new bootstrap.Popover($(this)[0]);
  });

  // Fix checkout button caption
  var checkoutButtonFix = new CheckoutButtonFix();
  checkoutButtonFix.init();

  snipcartForm.init(document.querySelector('.js--init-snipcart-form'));

  $('.js--init-input-color').each(function(){
    var inputColor = new InputColor();
    inputColor.init(this);
  });

  // Viewport animations
  AOS.init({
    useClassNames: true,
    animatedClassName: 'animate__animated'
  });

  // Automatic pills selection
  if ($('.nav-pills').length > 0) {
    var hashtag = window.location.hash;
    if (hashtag!='') {
        $(hashtag).tab('show');
    }
  }

  // Automatic HTML5 validation that is not :invalid at the page load
  // https://codepilotsf.medium.com/html5-form-validation-the-easy-way-8e457049bf04
  // Manually converted to Browserify syntax
  autovalid.autovalid();

  // Helper event to close other widgets
  $(document).on('click', function(){
    events.emit('documentClick');
  });
});

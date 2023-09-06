var $ = require('jquery');
var bootstrap = require('bootstrap');
var autosize = require('autosize');
var AOS = require('aos');

var navbarFixer = require('./modules/navbar-fixer');
// var smoothScroll = require('./modules/smooth-scroll');
// var windshieldForm = require('./modules/windshield-form');
var windshieldFormSnipcart = require('./modules/windshield-form-snipcart');
var snipcartForm = require('./modules/snipcart-form');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
// var stickyContainer = require('./modules/sticky-container');
var swatches = require('./modules/swatches');
var postsFilter = require('./modules/posts-filter');
var formInsideDialog = require('./modules/form-inside-dialog');
var formValidation = require('./modules/form-validation');
var FormAjaxSubmit = require('./modules/form-ajax-submit');
var IntegerInput = require('./modules/integer-input');
var CheckoutButtonFix = require('./modules/checkout-button-fix');
var Carousel = require('./modules/carousel');
var VideoFullWidth = require('./modules/video');
// var FacebookLoadOnScroll = require('./modules/facebook-load-on-scroll');
var InteractiveBackButton = require('./modules/interactive-back-button');

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
  // Handler for .ready() called.

  // Interactive Back Button
  InteractiveBackButton.init(document.querySelector('.js--init-back-button'));
    
  navbarFixer.init(document.querySelector('.js--init-navbar-fixer'));
  // smoothScroll.init();
  // windshieldForm.init(document.querySelector('.js--init-windshield-container'));
  windshieldFormSnipcart.init(document.querySelector('.js--windshield-form-snipcart'));
  snipcartForm.init(document.querySelector('.js--init-snipcart-form'));
  contentBuyButton.init(document.querySelector('.js--init-content-buy-button'));
  navbarBuyButton.init(document.querySelector('.js--init-navbar-buy-button'));
  // stickyContainer.init(document.querySelector('.js--init-sticky-container'));
  swatches.init(document.querySelector('.js--init-swatches'));
  postsFilter.init(document.querySelector('.js--init-posts-filter'));
  formInsideDialog.init(document.querySelector('.js--init-form-inside-dialog'));
  formValidation.init(document.querySelectorAll('form input, form select, form textarea'));

  $('.js--init-integer-input').each(function(){
    // 'new' operator creates object from function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
    var integerInput = new IntegerInput();
    integerInput.init(this);
  });

  $('.js--init-ajax-submit').each(function(){
    var formAjaxSubmit = new FormAjaxSubmit();
    formAjaxSubmit.init(this);
  });

  // Autosize textareas
  autosize(document.querySelectorAll('.js--init-autosize'));

  // Bootstrap's popovers
  $('[data-toggle="popover"]').popover();

  // Connect color dropdowns and carousels
  Carousel.init();

  // Fix checkout button caption
  var checkoutButtonFix = new CheckoutButtonFix();
  checkoutButtonFix.init();

  // Make videos full width
  $('video').each(function(){
    var videoFullWith = new VideoFullWidth();
    videoFullWith.init(this);
  });
 
  // Load Messenger when start scrolling
  // var facebookLoadOnScroll = new FacebookLoadOnScroll();
  // facebookLoadOnScroll.init();

  // Viewport animations
  AOS.init({
    useClassNames: true,
    animatedClassName: 'animate__animated'
  });

  // Automatic pills selection
  if ($('.nav-pills').length > 0) {
    var hashtag = window.location.hash;
    if (hashtag!='') {
        //$('.nav-tabs > li').removeClass('active');
        //$('.nav-tabs > li > a[href="'+hashtag+'"]').parent('li').addClass('active');
        //$('.tab-content > div').removeClass('active');
        //$(hashtag).addClass('active');
        $(hashtag).tab('show');
    }
  }

});

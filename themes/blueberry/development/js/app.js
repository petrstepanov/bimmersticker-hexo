var $ = require('jquery');
var bootstrap = require('bootstrap');
var autosize = require('autosize');
var AOS = require('aos');

var events = require('./modules/events');

var navbarFixer = require('./modules/navbar-fixer');
// var smoothScroll = require('./modules/smooth-scroll');

var windshieldForm = require('./modules/windshield-form-snipcart'); // require('./modules/windshield-form');
var truckVanForm = require('./modules/truck-van-form');
var snipcartForm = require('./modules/snipcart-form');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
// var stickyContainer = require('./modules/sticky-container');
var swatches = require('./modules/swatches');
var postsFilter = require('./modules/posts-filter');
var formInsideDialog = require('./modules/form-inside-dialog');
// var formValidation = require('./modules/form-validation');
var FormAjaxSubmit = require('./modules/form-ajax-submit');
var SelectWithImage = require('./modules/select-with-image');
var SelectReflect = require('./modules/select-reflect');
var SelectColor = require('./modules/select-color');
var InputColor = require('./modules/input-color');
var IntegerInput = require('./modules/integer-input');
var CheckoutButtonFix = require('./modules/checkout-button-fix');
var Carousel = require('./modules/carousel');
var WidgetArea = require('./modules/widget-area');
var VideoFullWidth = require('./modules/video');
// var FacebookLoadOnScroll = require('./modules/facebook-load-on-scroll');
var InteractiveBackButton = require('./modules/interactive-back-button');
var autovalid = require('./modules/autovalid');
var ContainerHorizontal = require('./modules/container-horizontal');
var DetectTrackpadMouse = require('./modules/detect-trackpad-mouse');
var DarkMode = require('./modules/dark-mode');
// var TouchEmulator = require('hammer-touchemulator');

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
  DarkMode.init();
  // Handler for .ready() called.

  // Interactive Back Button
  // InteractiveBackButton.init(document.querySelector('.js--init-back-button'));
  InteractiveBackButton.init();

  navbarFixer.init(document.querySelector('.js--init-navbar-fixer'));
  // smoothScroll.init();
  // windshieldForm.init(document.querySelector('.js--init-windshield-container'));

  windshieldForm.init(document.querySelector('.js--windshield-form-snipcart'));
  contentBuyButton.init(document.querySelector('.js--init-content-buy-button'));
  navbarBuyButton.init(document.querySelector('.js--init-navbar-buy-button'));
  // stickyContainer.init(document.querySelector('.js--init-sticky-container'));
  swatches.init(document.querySelector('.js--init-swatches'));
  postsFilter.init(document.querySelector('.js--init-posts-filter'));
  formInsideDialog.init(document.querySelector('.js--init-form-inside-dialog'));

  // Truck van page area calculation
  $('.js--init-select-with-image').each(function(){
    var selectWithImage = new SelectWithImage();
    selectWithImage.init(this);
  });

  $('.js--init-select-reflect').each(function(){
    var selectReflect = new SelectReflect();
    selectReflect.init(this);
  });

  $('.js--init-select-color').each(function(){
    var selectColor = new SelectColor();
    selectColor.init(this);
  });

  WidgetArea.init();
  truckVanForm.init(document.querySelector('.js--truck-van-form'));

  // Completely moved to HTML5 validation
  // formValidation.init(document.querySelectorAll('form input, form select, form textarea'));

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
  $('[data-toggle="popover"]').each(function (){
    const popover = new bootstrap.Popover($(this)[0]);
  });

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
        //$('.nav-tabs > li').removeClass('active');
        //$('.nav-tabs > li > a[href="'+hashtag+'"]').parent('li').addClass('active');
        //$('.tab-content > div').removeClass('active');
        //$(hashtag).addClass('active');
        $(hashtag).tab('show');
    }
  }

  // Automatic HTML5 validation that is not :invalid at the page load
  // https://codepilotsf.medium.com/html5-form-validation-the-easy-way-8e457049bf04
  // Manually converted to Browserify syntax
  autovalid.autovalid();

  $('.js--container-horizontal').each(function(){
    var cH = new ContainerHorizontal();
    cH.init(this);
  });
  var dTM = new DetectTrackpadMouse()
  dTM.init();

  // Helper event to close other widgets
  $(document).on('click', function(){
    events.emit('documentClick');
  });

});

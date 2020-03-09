var $ = require('jquery');
var bootstrap = require('bootstrap');
var autosize = require('autosize');

var navbarFixer = require('./modules/navbar-fixer');
var smoothScroll = require('./modules/smooth-scroll');
// var windshieldForm = require('./modules/windshield-form');
var windshieldFormSnipcart = require('./modules/windshield-form-snipcart');
var snipcartForm = require('./modules/snipcart-form');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
var stickyContainer = require('./modules/sticky-container');
var swatches = require('./modules/swatches');
var postsFilter = require('./modules/posts-filter');
var formInsideDialog = require('./modules/form-inside-dialog');
var formValidation = require('./modules/form-validation');
var FormAjaxSubmit = require('./modules/form-ajax-submit');
var IntegerInput = require('./modules/integer-input');
var Carousel = require ('./modules/carousel');

$(document).ready(function(){
  navbarFixer.init(document.querySelector('.js--init-navbar-fixer'));
  smoothScroll.init();
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
});

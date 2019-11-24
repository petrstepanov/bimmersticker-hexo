var $ = require('jquery');
var bootstrap = require('bootstrap');
var autosize = require('autosize');

var navbarFixer = require('./modules/navbar-fixer');
var smoothScroll = require('./modules/smooth-scroll');
var windshieldForm = require('./modules/windshield-form');
var snipcartButton = require('./modules/snipcart-form');
var contentBuyButton = require('./modules/content-buy-button');
var navbarBuyButton = require('./modules/navbar-buy-button');
var stickyContainer = require('./modules/sticky-container');
var swatches = require('./modules/swatches');
var postsFilter = require('./modules/posts-filter');
var mailchimpDialog = require('./modules/mailchimp-dialog');
var formValidation = require('./modules/form-validation');
var formAjaxSubmit = require('./modules/form-ajax-submit');

$(document).ready(function(){
  navbarFixer.init(document.querySelector('.js--init-navbar-fixer'));
  smoothScroll.init();
  windshieldForm.init(document.querySelector('.js--init-windshield-form'));
  snipcartButton.init(document.querySelector('.js--init-snipcart-form'));
  contentBuyButton.init(document.querySelector('.js--init-content-buy-button'));
  navbarBuyButton.init(document.querySelector('.js--init-navbar-buy-button'));
  // stickyContainer.init(document.querySelector('.js--init-sticky-container'));
  swatches.init(document.querySelector('.js--init-swatches'));
  postsFilter.init(document.querySelector('.js--init-posts-filter'));
  mailchimpDialog.init(document.querySelector('.js--init-mailchimp-dialog'));

  $('form input, form select, form textarea').each(function(){
    // var formValidation = new FormValidation();
    formValidation.init(this);
  });

  $('.js--init-ajax-submit').each(function(){
    // var formAjaxSubmit = new FormAjaxSubmit();
    formAjaxSubmit.init(this);
  });

  // Autosize textareas
  autosize(document.querySelectorAll('.js--init-autosize'));

  // Bootstrap's popovers
  $('[data-toggle="popover"]').popover();
});

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./modules/autovalid":2,"./modules/checkout-button-fix":3,"./modules/content-buy-button":4,"./modules/events":5,"./modules/form-ajax-submit":6,"./modules/gcr":7,"./modules/helpers":8,"./modules/interactive-back-button":9,"./modules/navbar-buy-button":10,"./modules/navbar-collapse":11,"./modules/notification-center":12,"./modules/snipcart-load-on-click":13,"aos":15,"autosize":16,"bootstrap":17,"cash-dom":18,"named-web-colors":21}],2:[function(require,module,exports){
function autovalid(options = {}) {
    const scope = options.scope || document;
    // const fields = scope.querySelectorAll("input, select, textarea");
    const fields = scope.querySelectorAll("input, textarea");
    const wrappingForm = fields.length ? fields[0].closest("form") : {};

    // Add event listeners for each field
    fields.forEach((field) => {
        field.addEventListener("invalid", (e) => {
            if (options.preventDefault) e.preventDefault();
            markInvalid(field);
        });

        field.addEventListener("input", () => {
            if (field.validity.valid) {
                markValid(field);
            }
        });

        field.addEventListener("blur", () => {
            field.checkValidity() ? markValid(field) : markInvalid(field);
        });
    });

    function markInvalid(field) {
        field.classList.add("invalid");
        const wrappingFieldset = field.closest("fieldset");
        if (wrappingFieldset) wrappingFieldset.classList.add("invalid");
        if (wrappingForm) wrappingForm.classList.add("invalid");
    }

    function markValid(field) {
        field.classList.remove("invalid");
        const wrappingFieldset = field.closest("fieldset");
        if (wrappingFieldset) wrappingFieldset.classList.remove("invalid");
        if (scope.querySelectorAll(":invalid").length < 1) {
            wrappingForm.classList.remove("invalid");
        }
    }
}

exports.autovalid = autovalid;

},{}],3:[function(require,module,exports){
var $ = require('cash-dom');

var CheckoutButtonFix = function(){
    var DOM = {};

    function _cacheDom(){
        DOM.$newLabel = $('<span class="new-label">Pay with Card • via PayPal</span>');
    }

    function _needFix(){
        DOM.$buttonPay = $('#snipcart button[title="Checkout with PayPal"]');
        if (!DOM.$buttonPay.length){
            return false;
        }
        var newLabelClass = "." + DOM.$newLabel.attr('class');
        return !DOM.$buttonPay.find(newLabelClass).length;
    }

    function _fixCaption(){
        if (_needFix()){
            DOM.$buttonPay.find('.snipcart-payment-methods-list-item__label').remove();
            DOM.$buttonPay.prepend(DOM.$newLabel.get(0));
        }

        // Tweak: disable Snipcart autocomplete
        $('.snipcart input[name="address1"]').attr('autocomplete','nope');
    }

    function _bindEvents(){
        // Monitor if button caption needs to be changed in a loop
        setInterval(_fixCaption, 500);
    }

    function init() {
        _cacheDom();
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = CheckoutButtonFix;
},{"cash-dom":18}],4:[function(require,module,exports){
// Emit event when 'Buy' button on the post's page goes out of viewport

var $ = require('cash-dom');
var events = require('./events');
var helpers = require('./helpers');

var DOM = {};
// var options = {};

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  $(window).on("scroll", function() {
    _checkContentButtonViewport();
  });
  _checkContentButtonViewport();
}

function _checkContentButtonViewport(){
  const isInViewport = helpers.isInViewport(DOM.$el);
  events.emit('buyButtonViewport', {contentButtonVisible: isInViewport});
}

// function _render(options){
// }

function init(element) {
  if (element) {
    // options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

exports.init = init;
// exports.checkContentButtonViewport = checkContentButtonViewport;
},{"./events":5,"./helpers":8,"cash-dom":18}],5:[function(require,module,exports){
// Simple event bus
// https://gist.github.com/learncodeacademy/777349747d8382bfb722

var events = {};

function on(eventName, fn) {
  events[eventName] = events[eventName] || [];
  events[eventName].push(fn);
}

function off(eventName, fn) {
  if (events[eventName]) {
    for (var i = 0; i < events[eventName].length; i++) {
      if (events[eventName][i] === fn) {
        events[eventName].splice(i, 1);
        break;
      }
    }
  }
}

function emit(eventName, data) {
  if (events[eventName]) {
    events[eventName].forEach(function (fn) {
      fn(data);
    });
  }
}

exports.on = on;
exports.off = off;
exports.emit = emit;
},{}],6:[function(require,module,exports){
// Ajax form submission logic

var $ = require('cash-dom');
var events = require('./events');
var notificationCenter = require('./notification-center');

var FormAjaxSubmit = function(){
  var DOM = {};
  var options = {
    dataType: 'html', // default for Netlify, but FormCarry and Mailchimp need 'json' (jsonp);
    contentType: 'application/x-www-form-urlencoded'
  };

  function _cacheDom(element) {
    DOM.$form = $(element);
    DOM.$submitButton = DOM.$form.find('[type=submit]');
  }

  function _bindEvents(){
    DOM.$form.on('submit', function(event) {
      // Prevent regular submit
      event.preventDefault();

      // Disable submit button
      DOM.$submitButton.addClass("loading");
      DOM.$submitButton.prop("disabled", true);

      // All forms with cross-domain actions are posted via jsonp (FormCarry, Netlify, Mailchimp)
      // Try success: callback?

      // However, for forms with files we need to change it to "multipart/form-data"

      // Default contentType in jQuery's ajax() is 'application/x-www-form-urlencoded; charset=UTF-8'
      // (see ajax() manual). Terefore we dont have to specify it.

      // By default we use jQuery's serialize() to create URL-encoded form string
      var data = DOM.$form.serialize();

      // However, if form contains file field, it must be
      if (DOM.$form.find('file').length){
        // See: https://docs.netlify.com/forms/setup/#file-uploads
        // This was not tested yet. Because Netlify has 10 MB monthly upload limit!
        options.contentType = 'multipart/form-data';
        var formData = new FormData(DOM.$form[0]);
        data = new URLSearchParams(formData).toString();
      }

      // For Mailchimp we need jsonp, therefore Mailchimp form has data-data-type="json"

      $.ajax({
        type:        DOM.$form.attr('method'),
        url:         DOM.$form.attr('action'),
        data:        DOM.$form.serialize(),
        dataType:    options.dataType,
        contentType: options.contentType
      }).done(function(data){
        // Mailchimp responds with data.result = 'error' and data.msg="..."
        // FormCarry responds with Object { code: 200, status: "success", title: "Thank You!", message: "We received your submission", referer: "http://localhost:4000/" }
        // Netlify responds with HTML...
        var error = data.result == 'error' || data.status == 'error';
        var message = data.msg || data.message;

        if (error){
          if (data.msg){
            notificationCenter.notify('danger', message);
            return;
          }
        }
        else {
          // data-success-notofication overrides success server message
          if (options.successNotification){
            notificationCenter.notify('success', options.successNotification);
          } else if (message){
            notificationCenter.notify('success', message);
          }
          // Throw event
          if (options.successEvent){
            events.emit(options.successEvent, data);
          }
          // Reset form fields
          DOM.$form.trigger('reset');
        }
      })
      .fail(function(data) {
        notificationCenter.notify('danger', 'Unknown error occured!');
      })
      .always(function() {
        // Enable submit button
        DOM.$submitButton.prop("disabled", false);
        DOM.$submitButton.removeClass("loading");
      });
    });
  }

  function init(element){
    if (element){
      options = $.extend(options, element.dataset);
      _cacheDom(element);
      _bindEvents();
    }
  }

  return {
    init: init
  };
};

module.exports = FormAjaxSubmit;
},{"./events":5,"./notification-center":12,"cash-dom":18}],7:[function(require,module,exports){
var $ = require('cash-dom');
// Moved from Nunjucks (7000 lines) to simple function:
// https://stackoverflow.com/a/50545691/
// var nunjucks = require('nunjucks'); // 7291 Lines
var helpers = require('./helpers');

var GCR = function(){
    var DOM = {};

    function renderGoogleCustomerReviews(invoiceNumber, email, country) {
        // alert(invoiceNumber + " " + email + " " + country);

        // TODO: calculate estimated delivery date here
        // Not in json{}
        var deliveryDays = country.localeCompare("US")?21:7;
        var today = new Date();
        var deliveryDate = new Date();
        deliveryDate.setDate(today.getDate() + deliveryDays);

        // for Google 'deliveryDate' should have 4 digits for year,
        // 2 digits for day and 2 digits for month ONLY: YYYY-MM-DD

        var year = 1900+deliveryDate.getYear();
        var yearString = ""+year;
        var month = deliveryDate.getMonth() + 1;
        var monthString = (month < 10) ? "0"+month : month;
        var day = deliveryDate.getDate();
        var dayString = (day < 10) ? "0"+day : day;
        var deliveryDateString = yearString + "-" + monthString + "-" + dayString;
        // Populate success template with JSON
        var json = {
            'merchantID': 143612887,
            'invoiceNumber': invoiceNumber,
            'email': email,
            'country': country,
            'deliveryDate': deliveryDateString
        };
        // nunjucks.configure({ autoescape: true });
        var template = DOM.$template.html();
        // Screw nunjucks - 7000 lines!
        var rendered = helpers.renderTemplate(template, json);

        // Display GCR
        $('#gcr-container').empty();
        $('#gcr-container').html(rendered);
    }

    function init() {
        DOM.$template = $('#gcr-template');
        DOM.$container = $('#gcr-container');
    }

    return {
        init: init,
        renderGoogleCustomerReviews: renderGoogleCustomerReviews
    };
};

module.exports = GCR;
},{"./helpers":8,"cash-dom":18}],8:[function(require,module,exports){
// Helper module

var formSerialize = require('form-serialize');
var $ = require('cash-dom');

function isInViewport($el) {
  var elementTop = $el.offset().top;
  var elementBottom = elementTop + $el.outerHeight();
  var viewportTop = window.scrollY; //$(window).scrollTop();
  // If fixed navbar
  if ($('.js--navbar-blueberry.fixed-top').length) {
    viewportTop += $('.js--navbar-blueberry.fixed-top').outerHeight();
  }
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
  // return elementBottom > viewportTop;
}

function renderTemplate(template, data) {
  const pattern = /{{\s*(\w+?)\s*}}/g; // {{property}}
  return template.replace(pattern, (_, token) => data[token] || '');
}

function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  };
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.scrollY || document.documentElement.scrollLeft,
    scrollTop = window.scrollY || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function objectifyForm(formArray) {//serialize data function
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function parseFirstLastName(string){
  var obj = {
    firstName: string,
    lastName: ""
  };

  var array = string.match(/(\S*)\s*(.*)/);
  if (array && array.length == 3){
    obj.firstName = array[1];
    obj.lastName = array[2];
  }
  return obj;
}

function animateCSS(node, animationName, callback, speed) {
  var animationSpeed = typeof speed !== 'undefined' ? speed : '500ms';
  node.style.setProperty('--animate-duration', animationSpeed);
  var prefix = 'animate__';
  node.classList.add(prefix+'animated', prefix+animationName);

  function handleAnimationEnd() {
      node.classList.remove(prefix+'animated', prefix+animationName);
      node.removeEventListener('animationend', handleAnimationEnd);
      if (typeof callback === 'function') callback();
  }

  node.addEventListener('animationend', handleAnimationEnd);
}

function getFormData($form){
  var indexed_array = formSerialize($form.get(0), { hash: true });
  return indexed_array;
}

exports.isInViewport = isInViewport;
exports.getViewportSize = getViewportSize;
exports.offset = offset;
exports.objectifyForm = objectifyForm;
exports.parseFirstLastName = parseFirstLastName;
exports.animateCSS = animateCSS;
exports.getFormData = getFormData;
exports.renderTemplate = renderTemplate;
},{"cash-dom":18,"form-serialize":19}],9:[function(require,module,exports){
var $ = require('cash-dom');
var cookies = require('js-cookie');

var DOM = {};

function _cacheDom() {
  DOM.$template = $('#int-back-button');
  DOM.$container = $('#back-link-container');
  DOM.$currentBackLink = $('#ejs-back-link');
}

function _renderBackLink(){
  var rendered = DOM.$template.html();
  DOM.$currentBackLink.remove();
  DOM.$container.html(rendered);
}

function init() {
  // var previousHref = Cookies.get('previousUrl');
  // var currentHref = window.location.href;
  _cacheDom();

  // If page was loaded before then back button acts like back button
  if (!cookies.get('wasOnSite')){
    // If previous url saved in cookies is different from current - navigate there
    _renderBackLink();
  }

  // var date = new Date();
  // date.setTime(date.getTime() + (5 * 60 * 1000)); // 5 minute expiration
  // Expires: takes number of days; 5 minutes is 5/24*60 ~ 0.003 of a day
  // Cookies.set('pageLoaded', window.location.href, { expires: 0.003, sameSite: 'strict' });
  cookies.set('wasOnSite', 'true', { expires: 0.003, sameSite: 'strict' });
}

exports.init = init;
},{"cash-dom":18,"js-cookie":20}],10:[function(require,module,exports){
// Show or hide 'Buy' button on navbar product page

var $ = require('cash-dom');
var events = require('./events');

var DOM = {};

function _cacheDom(element) {
  DOM.$el = $(element);
}

function _bindEvents(element) {
  events.on('buyButtonViewport', function (data) {
    if (data.contentButtonVisible) {
      DOM.$el.removeClass('visible')
    } else {
      DOM.$el.addClass('visible')
    }
  });
}

function init(element) {
  if (element) {
    // options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

exports.init = init;

},{"./events":5,"cash-dom":18}],11:[function(require,module,exports){
// Fixes Navbar for vieport width less than a set threshold

var $ = require('cash-dom');
var helpers = require('./helpers');
// var events = require('./events');
// var bsCollapse = require('bootstrap/js/dist/collapse');

var DOM = {};
var options = {};
// var fixed = false;
// var height = 0;
var bsCollapse;

function _cacheDom(element) {
  DOM.$navbar = $(element);
  DOM.$navbarToggler = DOM.$navbar.find('.navbar-toggler');
  DOM.$navbarCollapse = DOM.$navbar.find('.navbar-collapse');
  DOM.$iconOpen = DOM.$navbar.find('.js--icon-open');
  DOM.$iconClose = DOM.$navbar.find('.js--icon-close');
}

function _bindEvents(element) {
  // Close navbar when clicking outside of tha navbar
  // events.on('documentClick', function (event) {
  //     _collapseNavbar();
  // });

  // Collapse navbar after clicking on navbar link
  DOM.$navbar.on('click', '.nav-link', function (event) {
    _collapseNavbar();
  });

  // DOM.$navbar.on('click', function (event) {
  //   event.stopPropagation();
  // });

  // Swap navbar icons hamburger and close
  DOM.$navbarCollapse.on('show.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceOut', function () {
      DOM.$iconOpen.hide();
      DOM.$iconClose.show();
      helpers.animateCSS(DOM.$iconClose.get(0), 'rotateIn');
    });
  });

  DOM.$navbarCollapse.on('hide.bs.collapse', function () {
    helpers.animateCSS(DOM.$iconClose.get(0), 'rotateOut', function () {
      DOM.$iconClose.hide();
      DOM.$iconOpen.show();
      helpers.animateCSS(DOM.$iconOpen.get(0), 'bounceIn');
    });
  });
}

function _collapseNavbar() {
  // BS5 Collapse plugin: https://stackoverflow.com/a/74738412
  // if the instance is not yet initialized then create new collapse
  if (typeof bsCollapse === "undefined") {
    let id = "#" + DOM.$navbarCollapse.attr("id");
    bsCollapse = new bsCollapse(id, {
          toggle: false
    });
  }

  bsCollapse.hide();
}

function init(element) {
  if (element) {
    options = $.extend(options, $(element).data());
    _cacheDom(element);
    _bindEvents();
    // _render();
  }
}

// function isFixed() {
//   return fixed;
// }

// function getNavbarHeight() {
//   return height;
// }


exports.init = init;
// exports.isFixed = isFixed;
// exports.getNavbarHeight = getNavbarHeight;
},{"./helpers":8,"cash-dom":18}],12:[function(require,module,exports){
var $ = require('cash-dom');
var bootstrap = require('bootstrap');
var helpers = require('./helpers');

var id = 0;

// Type is bootstrap background color class:
// https://getbootstrap.com/docs/5.3/components/toasts/#color-schemes

// primary secondary success danger warning info light dark

function notify(type, message, timeout) {
  var milliseconds = typeof timeout !== 'undefined' ? timeout : 5000;

  // Create toast element (cash collection)
  var template = $('#toast-template').html();
  var data = {
    type:    type,
    message: message,
    id:      "toast-" + id
  };
  var toastHTML = helpers.renderTemplate(template, data);

  // Append toast HTML to container
  var $toastContainer = $('#toast-container');
  $(toastHTML).appendTo($toastContainer.get(0));

  // Obtain toast element
  $toast = $('#toast-'+id);

  // Hook up BS javascript and show
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance($toast.get(0));
  toastBootstrap.show({delay: milliseconds});

  // Delete toast element after hiding
  $toast.get(0).addEventListener('hidden.bs.toast', function(){
    $(this).remove();
  });

  // Increment id
  id++;
}

exports.notify = notify;
},{"./helpers":8,"bootstrap":17,"cash-dom":18}],13:[function(require,module,exports){
// Petr Steanov: CORS issues - disabled.

var $ = require('cash-dom');

var SnipcartLoadOnClick = function(){

    var DOM = {};
    var loadingFlag = false;

    function _cacheDom(){
        DOM.$triggerElements = $(".snipcart-checkout, .snipcart-add-item");
        DOM.$snipcartTemplate = $('#snipcart-template');
    }

    function _bindEvents(){
        DOM.$triggerElements.on('click', function(){
            if (!loadingFlag){
                loadingFlag = true;
                DOM.$triggerEl = $(this);
                _startSpinner(DOM.$triggerEl);
                var $parent = DOM.$snipcartTemplate.parent();
                $parent.append(DOM.$snipcartTemplate.html());
            }
        });

        document.addEventListener('snipcart.ready', function(){
            Snipcart.events.on('snipcart.initialized', function() {
                _stopSpinner(DOM.$triggerEl);
                DOM.$triggerEl.get(0).click();
            });
        });
    }

    function _startSpinner($element) {
        // If cart button
        $element.addClass("store-loading");
        // If submit button
        $(document).find('form button[type=submit]').addClass("store-loading");
    }

    function _stopSpinner($element) {
        // If cart button
        $element.removeClass("store-loading");
        // If submit button
        $(document).find('form button[type=submit]').removeClass("store-loading");
    }


    function init() {
        _cacheDom();
        _bindEvents();
    }

    return {
        init: init
    };
};

module.exports = SnipcartLoadOnClick;
},{"cash-dom":18}],14:[function(require,module,exports){
/**
 * @popperjs/core v2.11.8 - MIT License
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getUAString() {
  var uaData = navigator.userAgentData;

  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function (item) {
      return item.brand + "/" + item.version;
    }).join(' ');
  }

  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }

  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }

  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  var _ref = isElement(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;

  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x: x,
    y: y
  };
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === void 0) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start = 'start';
var end = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();

    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function getBasePlacement(placement) {
  return placement.split('-')[0];
}

function getVariation(placement) {
  return placement.split('-')[1];
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref) {
        var name = _ref.name,
            _ref$options = _ref.options,
            options = _ref$options === void 0 ? {} : _ref$options,
            effect = _ref.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}

var passive = {
  passive: true
};

function effect$2(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


var eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect$2,
  data: {}
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x,
      y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }, getWindow(popper)) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$1(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


var applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$1,
  requires: ['computeStyles']
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

var hash$1 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$1[matched];
  });
}

var hash = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash[matched];
  });
}

function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement(placement);

    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


var flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


var arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


var hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
var createPopper$1 = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers$1
}); // eslint-disable-next-line import/no-unused-modules

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

exports.applyStyles = applyStyles$1;
exports.arrow = arrow$1;
exports.computeStyles = computeStyles$1;
exports.createPopper = createPopper;
exports.createPopperLite = createPopper$1;
exports.defaultModifiers = defaultModifiers;
exports.detectOverflow = detectOverflow;
exports.eventListeners = eventListeners;
exports.flip = flip$1;
exports.hide = hide$1;
exports.offset = offset$1;
exports.popperGenerator = popperGenerator;
exports.popperOffsets = popperOffsets$1;
exports.preventOverflow = preventOverflow$1;


},{}],15:[function(require,module,exports){
(function (global){(function (){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.AOS=t()}(this,function(){"use strict";var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t="Expected a function",n=NaN,o="[object Symbol]",i=/^\s+|\s+$/g,a=/^[-+]0x[0-9a-f]+$/i,r=/^0b[01]+$/i,c=/^0o[0-7]+$/i,s=parseInt,u="object"==typeof e&&e&&e.Object===Object&&e,d="object"==typeof self&&self&&self.Object===Object&&self,l=u||d||Function("return this")(),f=Object.prototype.toString,m=Math.max,p=Math.min,b=function(){return l.Date.now()};function v(e,n,o){var i,a,r,c,s,u,d=0,l=!1,f=!1,v=!0;if("function"!=typeof e)throw new TypeError(t);function y(t){var n=i,o=a;return i=a=void 0,d=t,c=e.apply(o,n)}function h(e){var t=e-u;return void 0===u||t>=n||t<0||f&&e-d>=r}function k(){var e=b();if(h(e))return x(e);s=setTimeout(k,function(e){var t=n-(e-u);return f?p(t,r-(e-d)):t}(e))}function x(e){return s=void 0,v&&i?y(e):(i=a=void 0,c)}function O(){var e=b(),t=h(e);if(i=arguments,a=this,u=e,t){if(void 0===s)return function(e){return d=e,s=setTimeout(k,n),l?y(e):c}(u);if(f)return s=setTimeout(k,n),y(u)}return void 0===s&&(s=setTimeout(k,n)),c}return n=w(n)||0,g(o)&&(l=!!o.leading,r=(f="maxWait"in o)?m(w(o.maxWait)||0,n):r,v="trailing"in o?!!o.trailing:v),O.cancel=function(){void 0!==s&&clearTimeout(s),d=0,i=u=a=s=void 0},O.flush=function(){return void 0===s?c:x(b())},O}function g(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}function w(e){if("number"==typeof e)return e;if(function(e){return"symbol"==typeof e||function(e){return!!e&&"object"==typeof e}(e)&&f.call(e)==o}(e))return n;if(g(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=g(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(i,"");var u=r.test(e);return u||c.test(e)?s(e.slice(2),u?2:8):a.test(e)?n:+e}var y=function(e,n,o){var i=!0,a=!0;if("function"!=typeof e)throw new TypeError(t);return g(o)&&(i="leading"in o?!!o.leading:i,a="trailing"in o?!!o.trailing:a),v(e,n,{leading:i,maxWait:n,trailing:a})},h="Expected a function",k=NaN,x="[object Symbol]",O=/^\s+|\s+$/g,j=/^[-+]0x[0-9a-f]+$/i,E=/^0b[01]+$/i,N=/^0o[0-7]+$/i,z=parseInt,C="object"==typeof e&&e&&e.Object===Object&&e,A="object"==typeof self&&self&&self.Object===Object&&self,q=C||A||Function("return this")(),L=Object.prototype.toString,T=Math.max,M=Math.min,S=function(){return q.Date.now()};function D(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}function H(e){if("number"==typeof e)return e;if(function(e){return"symbol"==typeof e||function(e){return!!e&&"object"==typeof e}(e)&&L.call(e)==x}(e))return k;if(D(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=D(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(O,"");var n=E.test(e);return n||N.test(e)?z(e.slice(2),n?2:8):j.test(e)?k:+e}var $=function(e,t,n){var o,i,a,r,c,s,u=0,d=!1,l=!1,f=!0;if("function"!=typeof e)throw new TypeError(h);function m(t){var n=o,a=i;return o=i=void 0,u=t,r=e.apply(a,n)}function p(e){var n=e-s;return void 0===s||n>=t||n<0||l&&e-u>=a}function b(){var e=S();if(p(e))return v(e);c=setTimeout(b,function(e){var n=t-(e-s);return l?M(n,a-(e-u)):n}(e))}function v(e){return c=void 0,f&&o?m(e):(o=i=void 0,r)}function g(){var e=S(),n=p(e);if(o=arguments,i=this,s=e,n){if(void 0===c)return function(e){return u=e,c=setTimeout(b,t),d?m(e):r}(s);if(l)return c=setTimeout(b,t),m(s)}return void 0===c&&(c=setTimeout(b,t)),r}return t=H(t)||0,D(n)&&(d=!!n.leading,a=(l="maxWait"in n)?T(H(n.maxWait)||0,t):a,f="trailing"in n?!!n.trailing:f),g.cancel=function(){void 0!==c&&clearTimeout(c),u=0,o=s=i=c=void 0},g.flush=function(){return void 0===c?r:v(S())},g},W=function(){};function P(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),n=Array.prototype.slice.call(e.removedNodes);if(function e(t){var n=void 0,o=void 0;for(n=0;n<t.length;n+=1){if((o=t[n]).dataset&&o.dataset.aos)return!0;if(o.children&&e(o.children))return!0}return!1}(t.concat(n)))return W()})}function Y(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}var _={isSupported:function(){return!!Y()},ready:function(e,t){var n=window.document,o=new(Y())(P);W=t,o.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}},B=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},F=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),I=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},K=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,G=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,J=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,Q=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;function R(){return navigator.userAgent||navigator.vendor||window.opera||""}var U=new(function(){function e(){B(this,e)}return F(e,[{key:"phone",value:function(){var e=R();return!(!K.test(e)&&!G.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=R();return!(!J.test(e)&&!Q.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}},{key:"ie11",value:function(){return"-ms-scroll-limit"in document.documentElement.style&&"-ms-ime-align"in document.documentElement.style}}]),e}()),V=function(e,t){var n=void 0;return U.ie11()?(n=document.createEvent("CustomEvent")).initCustomEvent(e,!0,!0,{detail:t}):n=new CustomEvent(e,{detail:t}),document.dispatchEvent(n)},X=function(e){return e.forEach(function(e,t){return function(e,t){var n=e.options,o=e.position,i=e.node,a=(e.data,function(){e.animated&&(function(e,t){t&&t.forEach(function(t){return e.classList.remove(t)})}(i,n.animatedClassNames),V("aos:out",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!1)});n.mirror&&t>=o.out&&!n.once?a():t>=o.in?e.animated||(function(e,t){t&&t.forEach(function(t){return e.classList.add(t)})}(i,n.animatedClassNames),V("aos:in",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!0):e.animated&&!n.once&&a()}(e,window.pageYOffset)})},Z=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:n,left:t}},ee=function(e,t,n){var o=e.getAttribute("data-aos-"+t);if(void 0!==o){if("true"===o)return!0;if("false"===o)return!1}return o||n},te=function(e,t){return e.forEach(function(e,n){var o=ee(e.node,"mirror",t.mirror),i=ee(e.node,"once",t.once),a=ee(e.node,"id"),r=t.useClassNames&&e.node.getAttribute("data-aos"),c=[t.animatedClassName].concat(r?r.split(" "):[]).filter(function(e){return"string"==typeof e});t.initClassName&&e.node.classList.add(t.initClassName),e.position={in:function(e,t,n){var o=window.innerHeight,i=ee(e,"anchor"),a=ee(e,"anchor-placement"),r=Number(ee(e,"offset",a?0:t)),c=a||n,s=e;i&&document.querySelectorAll(i)&&(s=document.querySelectorAll(i)[0]);var u=Z(s).top-o;switch(c){case"top-bottom":break;case"center-bottom":u+=s.offsetHeight/2;break;case"bottom-bottom":u+=s.offsetHeight;break;case"top-center":u+=o/2;break;case"center-center":u+=o/2+s.offsetHeight/2;break;case"bottom-center":u+=o/2+s.offsetHeight;break;case"top-top":u+=o;break;case"bottom-top":u+=o+s.offsetHeight;break;case"center-top":u+=o+s.offsetHeight/2}return u+r}(e.node,t.offset,t.anchorPlacement),out:o&&function(e,t){window.innerHeight;var n=ee(e,"anchor"),o=ee(e,"offset",t),i=e;return n&&document.querySelectorAll(n)&&(i=document.querySelectorAll(n)[0]),Z(i).top+i.offsetHeight-o}(e.node,t.offset)},e.options={once:i,mirror:o,animatedClassNames:c,id:a}}),e},ne=function(){var e=document.querySelectorAll("[data-aos]");return Array.prototype.map.call(e,function(e){return{node:e}})},oe=[],ie=!1,ae={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,mirror:!1,anchorPlacement:"top-bottom",startEvent:"DOMContentLoaded",animatedClassName:"aos-animate",initClassName:"aos-init",useClassNames:!1,disableMutationObserver:!1,throttleDelay:99,debounceDelay:50},re=function(){return document.all&&!window.atob},ce=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&(ie=!0),ie&&(oe=te(oe,ae),X(oe),window.addEventListener("scroll",y(function(){X(oe,ae.once)},ae.throttleDelay)))},se=function(){if(oe=ne(),de(ae.disable)||re())return ue();ce()},ue=function(){oe.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay"),ae.initClassName&&e.node.classList.remove(ae.initClassName),ae.animatedClassName&&e.node.classList.remove(ae.animatedClassName)})},de=function(e){return!0===e||"mobile"===e&&U.mobile()||"phone"===e&&U.phone()||"tablet"===e&&U.tablet()||"function"==typeof e&&!0===e()};return{init:function(e){return ae=I(ae,e),oe=ne(),ae.disableMutationObserver||_.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),ae.disableMutationObserver=!0),ae.disableMutationObserver||_.ready("[data-aos]",se),de(ae.disable)||re()?ue():(document.querySelector("body").setAttribute("data-aos-easing",ae.easing),document.querySelector("body").setAttribute("data-aos-duration",ae.duration),document.querySelector("body").setAttribute("data-aos-delay",ae.delay),-1===["DOMContentLoaded","load"].indexOf(ae.startEvent)?document.addEventListener(ae.startEvent,function(){ce(!0)}):window.addEventListener("load",function(){ce(!0)}),"DOMContentLoaded"===ae.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1&&ce(!0),window.addEventListener("resize",$(ce,ae.debounceDelay,!0)),window.addEventListener("orientationchange",$(ce,ae.debounceDelay,!0)),oe)},refresh:ce,refreshHard:se}});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.autosize = factory());
}(this, (function () {
	var map = typeof Map === "function" ? new Map() : function () {
	  var keys = [];
	  var values = [];
	  return {
	    has: function has(key) {
	      return keys.indexOf(key) > -1;
	    },
	    get: function get(key) {
	      return values[keys.indexOf(key)];
	    },
	    set: function set(key, value) {
	      if (keys.indexOf(key) === -1) {
	        keys.push(key);
	        values.push(value);
	      }
	    },
	    "delete": function _delete(key) {
	      var index = keys.indexOf(key);

	      if (index > -1) {
	        keys.splice(index, 1);
	        values.splice(index, 1);
	      }
	    }
	  };
	}();

	var createEvent = function createEvent(name) {
	  return new Event(name, {
	    bubbles: true
	  });
	};

	try {
	  new Event('test');
	} catch (e) {
	  // IE does not support `new Event()`
	  createEvent = function createEvent(name) {
	    var evt = document.createEvent('Event');
	    evt.initEvent(name, true, false);
	    return evt;
	  };
	}

	function assign(ta) {
	  if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;
	  var heightOffset = null;
	  var clientWidth = null;
	  var cachedHeight = null;

	  function init() {
	    var style = window.getComputedStyle(ta, null);

	    if (style.resize === 'vertical') {
	      ta.style.resize = 'none';
	    } else if (style.resize === 'both') {
	      ta.style.resize = 'horizontal';
	    }

	    if (style.boxSizing === 'content-box') {
	      heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
	    } else {
	      heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
	    } // Fix when a textarea is not on document body and heightOffset is Not a Number


	    if (isNaN(heightOffset)) {
	      heightOffset = 0;
	    }

	    update();
	  }

	  function changeOverflow(value) {
	    {
	      // Chrome/Safari-specific fix:
	      // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
	      // made available by removing the scrollbar. The following forces the necessary text reflow.
	      var width = ta.style.width;
	      ta.style.width = '0px'; // Force reflow:
	      /* jshint ignore:end */

	      ta.style.width = width;
	    }
	    ta.style.overflowY = value;
	  }

	  function bookmarkOverflows(el) {
	    var arr = [];

	    while (el && el.parentNode && el.parentNode instanceof Element) {
	      if (el.parentNode.scrollTop) {
	        el.parentNode.style.scrollBehavior = 'auto';
	        arr.push([el.parentNode, el.parentNode.scrollTop]);
	      }

	      el = el.parentNode;
	    }

	    return function () {
	      return arr.forEach(function (_ref) {
	        var node = _ref[0],
	            scrollTop = _ref[1];
	        node.scrollTop = scrollTop;
	        node.style.scrollBehavior = null;
	      });
	    };
	  }

	  function resize() {
	    if (ta.scrollHeight === 0) {
	      // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
	      return;
	    } // remove smooth scroll & prevent scroll-position jumping by restoring original scroll position


	    var restoreOverflows = bookmarkOverflows(ta);
	    ta.style.height = '';
	    ta.style.height = ta.scrollHeight + heightOffset + 'px'; // used to check if an update is actually necessary on window.resize

	    clientWidth = ta.clientWidth;
	    restoreOverflows();
	  }

	  function update() {
	    resize();
	    var styleHeight = Math.round(parseFloat(ta.style.height));
	    var computed = window.getComputedStyle(ta, null); // Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box

	    var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight; // The actual height not matching the style height (set via the resize method) indicates that
	    // the max-height has been exceeded, in which case the overflow should be allowed.

	    if (actualHeight < styleHeight) {
	      if (computed.overflowY === 'hidden') {
	        changeOverflow('scroll');
	        resize();
	        actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
	      }
	    } else {
	      // Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
	      if (computed.overflowY !== 'hidden') {
	        changeOverflow('hidden');
	        resize();
	        actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
	      }
	    }

	    if (cachedHeight !== actualHeight) {
	      cachedHeight = actualHeight;
	      var evt = createEvent('autosize:resized');

	      try {
	        ta.dispatchEvent(evt);
	      } catch (err) {// Firefox will throw an error on dispatchEvent for a detached element
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=889376
	      }
	    }
	  }

	  var pageResize = function pageResize() {
	    if (ta.clientWidth !== clientWidth) {
	      update();
	    }
	  };

	  var destroy = function (style) {
	    window.removeEventListener('resize', pageResize, false);
	    ta.removeEventListener('input', update, false);
	    ta.removeEventListener('keyup', update, false);
	    ta.removeEventListener('autosize:destroy', destroy, false);
	    ta.removeEventListener('autosize:update', update, false);
	    Object.keys(style).forEach(function (key) {
	      ta.style[key] = style[key];
	    });
	    map["delete"](ta);
	  }.bind(ta, {
	    height: ta.style.height,
	    resize: ta.style.resize,
	    overflowY: ta.style.overflowY,
	    overflowX: ta.style.overflowX,
	    wordWrap: ta.style.wordWrap
	  });

	  ta.addEventListener('autosize:destroy', destroy, false); // IE9 does not fire onpropertychange or oninput for deletions,
	  // so binding to onkeyup to catch most of those events.
	  // There is no way that I know of to detect something like 'cut' in IE9.

	  if ('onpropertychange' in ta && 'oninput' in ta) {
	    ta.addEventListener('keyup', update, false);
	  }

	  window.addEventListener('resize', pageResize, false);
	  ta.addEventListener('input', update, false);
	  ta.addEventListener('autosize:update', update, false);
	  ta.style.overflowX = 'hidden';
	  ta.style.wordWrap = 'break-word';
	  map.set(ta, {
	    destroy: destroy,
	    update: update
	  });
	  init();
	}

	function destroy(ta) {
	  var methods = map.get(ta);

	  if (methods) {
	    methods.destroy();
	  }
	}

	function update(ta) {
	  var methods = map.get(ta);

	  if (methods) {
	    methods.update();
	  }
	}

	var autosize = null; // Do nothing in Node.js environment and IE8 (or lower)

	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
	  autosize = function autosize(el) {
	    return el;
	  };

	  autosize.destroy = function (el) {
	    return el;
	  };

	  autosize.update = function (el) {
	    return el;
	  };
	} else {
	  autosize = function autosize(el, options) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], function (x) {
	        return assign(x);
	      });
	    }

	    return el;
	  };

	  autosize.destroy = function (el) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], destroy);
	    }

	    return el;
	  };

	  autosize.update = function (el) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], update);
	    }

	    return el;
	  };
	}

	var autosize$1 = autosize;

	return autosize$1;

})));

},{}],17:[function(require,module,exports){
/*!
  * Bootstrap v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@popperjs/core')) :
  typeof define === 'function' && define.amd ? define(['@popperjs/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory(global.Popper));
})(this, (function (Popper) { 'use strict';

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const Popper__namespace = /*#__PURE__*/_interopNamespaceDefault(Popper);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * Constants
   */

  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }
      const instanceMap = elementMap.get(element);

      // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);

      // free up element references if there are no instances left for an element
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend';

  /**
   * Properly escape IDs selectors to handle weird IDs
   * @param {string} selector
   * @returns {string}
   */
  const parseSelector = selector => {
    if (selector && window.CSS && window.CSS.escape) {
      // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };

  // Shout-out Angus Croll (https://goo.gl/pxwQGp)
  const toType = object => {
    if (object === null || object === undefined) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };

  /**
   * Public Util API
   */

  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    }

    // Get transition-duration of the element
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);

    // Return 0 if element or transition duration is not found
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }

    // If multiple durations are defined, take the first
    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  const isElement = object => {
    if (!object || typeof object !== 'object') {
      return false;
    }
    if (typeof object.jquery !== 'undefined') {
      object = object[0];
    }
    return typeof object.nodeType !== 'undefined';
  };
  const getElement = object => {
    // it's a jQuery object or a node element
    if (isElement(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === 'string' && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
    // Handle `details` element as its content may falsie appear visible when it is closed
    const closedDetails = element.closest('details:not([open])');
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest('summary');
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains('disabled')) {
      return true;
    }
    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }
    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };
  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    }

    // Can find the shadow root otherwise it'll return the document
    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }

    // when we don't find a shadow root
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  const noop = () => {};

  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */
  const reflow = element => {
    element.offsetHeight; // eslint-disable-line no-unused-expressions
  };
  const getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return window.jQuery;
    }
    return null;
  };
  const DOMContentLoadedCallbacks = [];
  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          for (const callback of DOMContentLoadedCallbacks) {
            callback();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  const isRTL = () => document.documentElement.dir === 'rtl';
  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === 'function' ? possibleCallback(...args) : defaultValue;
  };
  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */
  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);

    // if the element does not exist in the list return an element
    // depending on the direction and if cycle is allowed
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage
  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

  /**
   * Private methods
   */

  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });
      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }
      return fn.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, {
            delegateTarget: target
          });
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn);
          }
          return fn.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === 'string';
    // TODO: tooltip passes `false` instead of selector, so we need to check
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

    // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
    if (originalTypeEvent in customEvents) {
      const wrapFunction = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn.delegationSelector = isDelegated ? handler : null;
    fn.callable = callable;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn) {
      return;
    }
    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }
  const EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith('.');
      if (typeof callable !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, {
        bubbles,
        cancelable: true
      }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === '' || value === 'null') {
      return null;
    }
    if (typeof value !== 'string') {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Class definition
   */

  class Config {
    // Getters
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      return config;
    }
    _mergeConfigObj(config, element) {
      const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

      return {
        ...this.constructor.Default,
        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
        ...(isElement(element) ? Manipulator.getDataAttributes(element) : {}),
        ...(typeof config === 'object' ? config : {})
      };
    }
    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config[property];
        const valueType = isElement(value) ? 'element' : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const VERSION = '5.3.3';

  /**
   * Class definition
   */

  class BaseComponent extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    // Public
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }

    // Static
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');
    if (!selector || selector === '#') {
      let hrefAttribute = element.getAttribute('href');

      // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273
      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
        return null;
      }

      // Just in case some CMS puts out a full URL with the anchor appended
      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    }
    return selector ? selector.split(',').map(sel => parseSelector(sel)).join(',') : null;
  };
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);

      // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$f = 'alert';
  const DATA_KEY$a = 'bs.alert';
  const EVENT_KEY$b = `.${DATA_KEY$a}`;
  const EVENT_CLOSE = `close${EVENT_KEY$b}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';

  /**
   * Class definition
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    }

    // Public
    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }

    // Private
    _destroyElement() {
      this._element.remove();
      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Alert, 'close');

  /**
   * jQuery
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$e = 'button';
  const DATA_KEY$9 = 'bs.button';
  const EVENT_KEY$a = `.${DATA_KEY$9}`;
  const DATA_API_KEY$6 = '.data-api';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;

  /**
   * Class definition
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    }

    // Public
    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);
        if (config === 'toggle') {
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/swipe.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$d = 'swipe';
  const EVENT_KEY$9 = '.bs.swipe';
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SWIPE_THRESHOLD = 40;
  const Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  const DefaultType$c = {
    endCallback: '(function|null)',
    leftCallback: '(function|null)',
    rightCallback: '(function|null)'
  };

  /**
   * Class definition
   */

  class Swipe extends Config {
    constructor(element, config) {
      super();
      this._element = element;
      if (!element || !Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }

    // Getters
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }

    // Public
    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    }

    // Private
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }

    // Static
    static isSupported() {
      return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$c = 'carousel';
  const DATA_KEY$8 = 'bs.carousel';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const ARROW_LEFT_KEY$1 = 'ArrowLeft';
  const ARROW_RIGHT_KEY$1 = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  const EVENT_SLID = `slid${EVENT_KEY$8}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  const Default$b = {
    interval: 5000,
    keyboard: true,
    pause: 'hover',
    ride: false,
    touch: true,
    wrap: true
  };
  const DefaultType$b = {
    interval: '(number|boolean)',
    // TODO:v6 remove boolean support
    keyboard: 'boolean',
    pause: '(string|boolean)',
    ride: '(boolean|string)',
    touch: 'boolean',
    wrap: 'boolean'
  };

  /**
   * Class definition
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }

    // Getters
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }

    // Public
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      // FIXME TODO use `document.visibilityState`
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
      }
      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== 'hover') {
          return;
        }

        // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling

        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute('aria-current');
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute('aria-current', 'true');
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = eventName => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        // TODO: change tests that use empty divs to avoid this check
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order) {
      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Carousel.getOrCreateInstance(this, config);
        if (typeof config === 'number') {
          data.to(config);
          return;
        }
        if (typeof config === 'string') {
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute('data-bs-slide-to');
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$b = 'collapse';
  const DATA_KEY$7 = 'bs.collapse';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$4 = '.data-api';
  const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  const Default$a = {
    parent: null,
    toggle: true
  };
  const DefaultType$a = {
    parent: '(null|element)',
    toggle: 'boolean'
  };

  /**
   * Class definition
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }

    // Getters
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }

    // Public
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];

      // find active children
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };
      this._element.style[dimension] = '';
      this._queueCallback(complete, this._element, true);
    }
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }

    // Private
    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle); // Coerce string values
      config.parent = getElement(config.parent);
      return config;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      // remove children if greater depth
      return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute('aria-expanded', isOpen);
      }
    }

    // Static
    static jQueryInterface(config) {
      const _config = {};
      if (typeof config === 'string' && /show|hide/.test(config)) {
        _config.toggle = false;
      }
      return this.each(function () {
        const data = Collapse.getOrCreateInstance(this, _config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Collapse);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$a = 'dropdown';
  const DATA_KEY$6 = 'bs.dropdown';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const TAB_KEY$1 = 'Tab';
  const ARROW_UP_KEY$1 = 'ArrowUp';
  const ARROW_DOWN_KEY$1 = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

  const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
  const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR = '.navbar';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const PLACEMENT_TOPCENTER = 'top';
  const PLACEMENT_BOTTOMCENTER = 'bottom';
  const Default$9 = {
    autoClose: true,
    boundary: 'clippingParents',
    display: 'dynamic',
    offset: [0, 2],
    popperConfig: null,
    reference: 'toggle'
  };
  const DefaultType$9 = {
    autoClose: '(boolean|string)',
    boundary: '(string|element)',
    display: 'string',
    offset: '(array|string|function)',
    popperConfig: '(null|object|function)',
    reference: '(string|element|object)'
  };

  /**
   * Class definition
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode; // dropdown wrapper
      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }

    // Getters
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }

    // Public
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      this._element.focus();
      this._element.setAttribute('aria-expanded', true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }

    // Private
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute('aria-expanded', 'false');
      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }
    _getConfig(config) {
      config = super._getConfig(config);
      if (typeof config.reference === 'object' && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config;
    }
    _createPopper() {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
      }
      let referenceElement = this._element;
      if (this._config.reference === 'parent') {
        referenceElement = this._parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }

      // We need to trim the value because custom properties can also include spaces
      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      };

      // Disable Popper if we have a static display or Dropdown is in Navbar
      if (this._inNavbar || this._config.display === 'static') {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // TODO: v6 remove
        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
      if (!items.length) {
        return;
      }

      // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = Dropdown.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
          continue;
        }

        // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
        if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = {
          relatedTarget: context._element
        };
        if (event.type === 'click') {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      // If not an UP | DOWN | ESCAPE key => not a dropdown command
      // If input/textarea && if key is other than ESCAPE => not a dropdown command

      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();

      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = Dropdown.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        // else is escape and we check if it is shown
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$9 = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$5 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  const Default$8 = {
    className: 'modal-backdrop',
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: 'body' // give the choice to place backdrop under different elements
  };
  const DefaultType$8 = {
    className: 'string',
    clickCallback: '(function|null)',
    isAnimated: 'boolean',
    isVisible: 'boolean',
    rootElement: '(element|string)'
  };

  /**
   * Class definition
   */

  class Backdrop extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    // Getters
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }

    // Public
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }

    // Private
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config) {
      // use getElement() with the default "body" to get a fresh Element on each instantiation
      config.rootElement = getElement(config.rootElement);
      return config;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$8 = 'focustrap';
  const DATA_KEY$5 = 'bs.focustrap';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';
  const Default$7 = {
    autofocus: true,
    trapElement: null // The element to trap focus inside of
  };
  const DefaultType$7 = {
    autofocus: 'boolean',
    trapElement: 'element'
  };

  /**
   * Class definition
   */

  class FocusTrap extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    // Getters
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }

    // Public
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop
      EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    }

    // Private
    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';
  const PROPERTY_PADDING = 'padding-right';
  const PROPERTY_MARGIN = 'margin-right';

  /**
   * Class definition
   */

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    // Public
    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      // give padding to element to balance the hidden scrollbar width
      this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, 'overflow');
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }

    // Private
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');
      this._element.style.overflow = 'hidden';
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        // We only want to remove the property if the value is `null`; the value can also be zero
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$7 = 'modal';
  const DATA_KEY$4 = 'bs.modal';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const DATA_API_KEY$2 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  const Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  const DefaultType$6 = {
    backdrop: '(boolean|string)',
    focus: 'boolean',
    keyboard: 'boolean'
  };

  /**
   * Class definition
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler.off(window, EVENT_KEY$4);
      EventHandler.off(this._dialog, EVENT_KEY$4);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }

    // Private
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      // try to append dynamic modal
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
        // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === 'static') {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', true);
      this._element.removeAttribute('aria-modal');
      this._element.removeAttribute('role');
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      // return if the following background transition hasn't yet completed
      if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = 'hidden';
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }

    /**
     * The following methods are used to handle overflowing modals
     */

    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? 'paddingLeft' : 'paddingRight';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? 'paddingRight' : 'paddingLeft';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    }

    // Static
    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler.one(target, EVENT_SHOW$4, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });

    // avoid conflict when clicking modal toggler while another one is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);

  /**
   * jQuery
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$6 = 'offcanvas';
  const DATA_KEY$3 = 'bs.offcanvas';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const DATA_API_KEY$1 = '.data-api';
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const ESCAPE_KEY = 'Escape';
  const CLASS_NAME_SHOW$3 = 'show';
  const CLASS_NAME_SHOWING$1 = 'showing';
  const CLASS_NAME_HIDING = 'hiding';
  const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    scroll: 'boolean'
  };

  /**
   * Class definition
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('role');
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }

    // Private
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === 'static') {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };

      // 'static' option will be translated to true, and booleans will keep their value
      const isVisible = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    });

    // avoid conflict when clicking a toggler of an offcanvas, while another is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }
    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
      if (getComputedStyle(element).position !== 'fixed') {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);

  /**
   * jQuery
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  // js-docs-start allow-list
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  // js-docs-end allow-list

  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);

  /**
   * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
   * contexts.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
   */
  // eslint-disable-next-line unicorn/better-regex
  const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }

    // Check if a regular expression validates the attribute.
    return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === 'function') {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/template-factory.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$5 = 'TemplateFactory';
  const Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: '',
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: '<div></div>'
  };
  const DefaultType$4 = {
    allowList: 'object',
    content: 'object',
    extraClass: '(string|function)',
    html: 'boolean',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    template: 'string'
  };
  const DefaultContentType = {
    entry: '(string|element|function|null)',
    selector: '(string|element)'
  };

  /**
   * Class definition
   */

  class TemplateFactory extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    }

    // Getters
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }

    // Public
    getContent() {
      return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = {
        ...this._config.content,
        ...content
      };
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement('div');
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(' '));
      }
      return template;
    }

    // Private
    _typeCheckConfig(config) {
      super._typeCheckConfig(config);
      this._checkContent(config.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = '';
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$4 = 'tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$2 = 'show';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.bs.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  const EVENT_HIDE$2 = 'hide';
  const EVENT_HIDDEN$2 = 'hidden';
  const EVENT_SHOW$2 = 'show';
  const EVENT_SHOWN$2 = 'shown';
  const EVENT_INSERTED = 'inserted';
  const EVENT_CLICK$1 = 'click';
  const EVENT_FOCUSIN$1 = 'focusin';
  const EVENT_FOCUSOUT$1 = 'focusout';
  const EVENT_MOUSEENTER = 'mouseenter';
  const EVENT_MOUSELEAVE = 'mouseleave';
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: 'clippingParents',
    container: false,
    customClass: '',
    delay: 0,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    html: false,
    offset: [0, 6],
    placement: 'top',
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    title: '',
    trigger: 'hover focus'
  };
  const DefaultType$3 = {
    allowList: 'object',
    animation: 'boolean',
    boundary: '(string|element)',
    container: '(string|element|boolean)',
    customClass: '(string|function)',
    delay: '(number|object)',
    fallbackPlacements: 'array',
    html: 'boolean',
    offset: '(array|string|function)',
    placement: '(string|function)',
    popperConfig: '(null|object|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    selector: '(string|boolean)',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string'
  };

  /**
   * Class definition
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
      }
      super(element, config);

      // Private
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;

      // Protected
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }

    // Getters
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }

    // Public
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      this._activeTrigger.click = !this._activeTrigger.click;
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute('data-bs-original-title')) {
        this._element.setAttribute('title', this._element.getAttribute('data-bs-original-title'));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }

      // TODO: v6 remove this or make it optional
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
      const {
        container
      } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null; // it is a trick to support manual triggering

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute('aria-describedby');
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }

    // Protected
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();

      // TODO: remove this check in v6
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      // TODO: v6 the following can be achieved with CSS only
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute('id', tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({
          ...this._config,
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-bs-original-title');
    }

    // Private
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'preSetPlacement',
          enabled: true,
          phase: 'beforeMain',
          fn: data => {
            // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
            // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
            this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
          }
        }]
      };
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _setListeners() {
      const triggers = this._config.trigger.split(' ');
      for (const trigger of triggers) {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute('title');
      if (!title) {
        return;
      }
      if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
        this._element.setAttribute('aria-label', title);
      }
      this._element.setAttribute('data-bs-original-title', title); // DO NOT USE IT. Is only for backwards compatibility
      this._element.removeAttribute('title');
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config = {
        ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);
      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }
      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }
      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }
      return config;
    }
    _getDelegateConfig() {
      const config = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config[key] = value;
        }
      }
      config.selector = false;
      config.trigger = 'manual';

      // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`
      return config;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$3 = 'popover';
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  const Default$2 = {
    ...Tooltip.Default,
    content: '',
    offset: [0, 8],
    placement: 'right',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
    trigger: 'click'
  };
  const DefaultType$2 = {
    ...Tooltip.DefaultType,
    content: '(null|string|element|function)'
  };

  /**
   * Class definition
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }

    // Overrides
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }

    // Private
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$2 = 'scrollspy';
  const DATA_KEY$2 = 'bs.scrollspy';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  const EVENT_CLICK = `click${EVENT_KEY$2}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_TARGET_LINKS = '[href]';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: '0px 0px -25%',
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  const DefaultType$1 = {
    offset: '(number|null)',
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: 'string',
    smoothScroll: 'boolean',
    target: 'element',
    threshold: 'array'
  };

  /**
   * Class definition
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element, config);

      // this._element is the observablesContainer and config.target the menu links wrapper
      this._targetLinks = new Map();
      this._observableSections = new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh(); // initialize
    }

    // Getters
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }

    // Public
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
      config.target = getElement(config.target) || document.body;

      // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
      if (typeof config.threshold === 'string') {
        config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
      }
      return config;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }

      // unregister any previous listeners
      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: 'smooth'
            });
            return;
          }

          // Chrome 60 doesn't support `scrollTo`
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver(entries => this._observerCallback(entries), options);
    }

    // The logic of selection
    _observerCallback(entries) {
      const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
      const activate = entry => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        // if we are scrolling down, pick the bigger offsetTop
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
          if (!parentScrollTop) {
            return;
          }
          continue;
        }

        // if we are scrolling up, pick the smallest offsetTop
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = new Map();
      this._observableSections = new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        // ensure that the anchor has an id and is not disabled
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);

        // ensure that the observableSection exists & is visible
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }
    _activateParents(target) {
      // Activate dropdown parents
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'bs.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const HOME_KEY = 'Home';
  const END_KEY = 'End';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const CLASS_DROPDOWN = 'dropdown';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
  const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  const SELECTOR_OUTER = '.nav-item, .list-group-item';
  const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // TODO: could only be `tab` in v6
  const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;

  /**
   * Class definition
   */

  class Tab extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
        // TODO: should throw exception in v6
        // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
      }

      // Set up initial aria attributes
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
    }

    // Getters
    static get NAME() {
      return NAME$1;
    }

    // Public
    show() {
      // Shows this elem and deactivate the active sibling if exists
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }

      // Search for active tab on same parent to deactivate it
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }

    // Private
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element)); // Search and activate/show the proper section

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute('tabindex');
        element.setAttribute('aria-selected', true);
        this._toggleDropDown(element, true);
        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element)); // Search and deactivate the shown section too

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute('aria-selected', false);
        element.setAttribute('tabindex', '-1');
        this._toggleDropDown(element, false);
        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
      event.preventDefault();
      const children = this._getChildren().filter(element => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      // collection of inner elements
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find(child => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, 'role', 'tablist');
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute('aria-selected', isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
      }
      if (!isActive) {
        child.setAttribute('tabindex', '-1');
      }
      this._setAttributeIfNotExists(child, 'role', 'tab');

      // set attributes to the related panel too
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, 'role', 'tabpanel');
      if (child.id) {
        this._setAttributeIfNotExists(target, 'aria-labelledby', `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element = SelectorEngine.findOne(selector, outerElem);
        if (element) {
          element.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute('aria-expanded', open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }

    // Try to get the inner element (usually the .nav-link)
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }

    // Try to get the outer element (usually the .nav-item)
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab.getOrCreateInstance(this).show();
  });

  /**
   * Initialize on focus
   */
  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'toast';
  const DATA_KEY = 'bs.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility
  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };

  /**
   * Class definition
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }

    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }

    // Public
    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler.trigger(this._element, EVENT_SHOWN);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }

    // Private

    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          {
            this._hasMouseInteraction = isInteracting;
            break;
          }
        case 'focusin':
        case 'focusout':
          {
            this._hasKeyboardInteraction = isInteracting;
            break;
          }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Toast);

  /**
   * jQuery
   */

  defineJQueryPlugin(Toast);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap index.umd.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const index_umd = {
    Alert,
    Button,
    Carousel,
    Collapse,
    Dropdown,
    Modal,
    Offcanvas,
    Popover,
    ScrollSpy,
    Tab,
    Toast,
    Tooltip
  };

  return index_umd;

}));


},{"@popperjs/core":14}],18:[function(require,module,exports){
(function(){
"use strict";
var doc = document;
var win = window;
var docEle = doc.documentElement;
var createElement = doc.createElement.bind(doc);
var div = createElement('div');
var table = createElement('table');
var tbody = createElement('tbody');
var tr = createElement('tr');
var isArray = Array.isArray, ArrayPrototype = Array.prototype;
var concat = ArrayPrototype.concat, filter = ArrayPrototype.filter, indexOf = ArrayPrototype.indexOf, map = ArrayPrototype.map, push = ArrayPrototype.push, slice = ArrayPrototype.slice, some = ArrayPrototype.some, splice = ArrayPrototype.splice;
var idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
var classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
var htmlRe = /<.+>/;
var tagRe = /^\w+$/;
// @require ./variables.ts
function find(selector, context) {
    var isFragment = isDocumentFragment(context);
    return !selector || (!isFragment && !isDocument(context) && !isElement(context))
        ? []
        : !isFragment && classRe.test(selector)
            ? context.getElementsByClassName(selector.slice(1).replace(/\\/g, ''))
            : !isFragment && tagRe.test(selector)
                ? context.getElementsByTagName(selector)
                : context.querySelectorAll(selector);
}
// @require ./find.ts
// @require ./variables.ts
var Cash = /** @class */ (function () {
    function Cash(selector, context) {
        if (!selector)
            return;
        if (isCash(selector))
            return selector;
        var eles = selector;
        if (isString(selector)) {
            var ctx = context || doc;
            eles = idRe.test(selector) && isDocument(ctx)
                ? ctx.getElementById(selector.slice(1).replace(/\\/g, ''))
                : htmlRe.test(selector)
                    ? parseHTML(selector)
                    : isCash(ctx)
                        ? ctx.find(selector)
                        : isString(ctx)
                            ? cash(ctx).find(selector)
                            : find(selector, ctx);
            if (!eles)
                return;
        }
        else if (isFunction(selector)) {
            return this.ready(selector); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality
        }
        if (eles.nodeType || eles === win)
            eles = [eles];
        this.length = eles.length;
        for (var i = 0, l = this.length; i < l; i++) {
            this[i] = eles[i];
        }
    }
    Cash.prototype.init = function (selector, context) {
        return new Cash(selector, context);
    };
    return Cash;
}());
var fn = Cash.prototype;
var cash = fn.init;
cash.fn = cash.prototype = fn; // Ensuring that `cash () instanceof cash`
fn.length = 0;
fn.splice = splice; // Ensuring a cash collection gets printed as array-like in Chrome's devtools
if (typeof Symbol === 'function') { // Ensuring a cash collection is iterable
    fn[Symbol['iterator']] = ArrayPrototype[Symbol['iterator']];
}
function isCash(value) {
    return value instanceof Cash;
}
function isWindow(value) {
    return !!value && value === value.window;
}
function isDocument(value) {
    return !!value && value.nodeType === 9;
}
function isDocumentFragment(value) {
    return !!value && value.nodeType === 11;
}
function isElement(value) {
    return !!value && value.nodeType === 1;
}
function isText(value) {
    return !!value && value.nodeType === 3;
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
function isUndefined(value) {
    return value === undefined;
}
function isNull(value) {
    return value === null;
}
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
function isPlainObject(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    var proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}
cash.isWindow = isWindow;
cash.isFunction = isFunction;
cash.isArray = isArray;
cash.isNumeric = isNumeric;
cash.isPlainObject = isPlainObject;
function each(arr, callback, _reverse) {
    if (_reverse) {
        var i = arr.length;
        while (i--) {
            if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
        }
    }
    else if (isPlainObject(arr)) {
        var keys = Object.keys(arr);
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            if (callback.call(arr[key], key, arr[key]) === false)
                return arr;
        }
    }
    else {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
        }
    }
    return arr;
}
cash.each = each;
fn.each = function (callback) {
    return each(this, callback);
};
fn.empty = function () {
    return this.each(function (i, ele) {
        while (ele.firstChild) {
            ele.removeChild(ele.firstChild);
        }
    });
};
function extend() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var deep = isBoolean(sources[0]) ? sources.shift() : false;
    var target = sources.shift();
    var length = sources.length;
    if (!target)
        return {};
    if (!length)
        return extend(deep, cash, target);
    for (var i = 0; i < length; i++) {
        var source = sources[i];
        for (var key in source) {
            if (deep && (isArray(source[key]) || isPlainObject(source[key]))) {
                if (!target[key] || target[key].constructor !== source[key].constructor)
                    target[key] = new source[key].constructor();
                extend(deep, target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
}
cash.extend = extend;
fn.extend = function (plugins) {
    return extend(fn, plugins);
};
// @require ./type_checking.ts
var splitValuesRe = /\S+/g;
function getSplitValues(str) {
    return isString(str) ? str.match(splitValuesRe) || [] : [];
}
fn.toggleClass = function (cls, force) {
    var classes = getSplitValues(cls);
    var isForce = !isUndefined(force);
    return this.each(function (i, ele) {
        if (!isElement(ele))
            return;
        each(classes, function (i, c) {
            if (isForce) {
                force ? ele.classList.add(c) : ele.classList.remove(c);
            }
            else {
                ele.classList.toggle(c);
            }
        });
    });
};
fn.addClass = function (cls) {
    return this.toggleClass(cls, true);
};
fn.removeAttr = function (attr) {
    var attrs = getSplitValues(attr);
    return this.each(function (i, ele) {
        if (!isElement(ele))
            return;
        each(attrs, function (i, a) {
            ele.removeAttribute(a);
        });
    });
};
function attr(attr, value) {
    if (!attr)
        return;
    if (isString(attr)) {
        if (arguments.length < 2) {
            if (!this[0] || !isElement(this[0]))
                return;
            var value_1 = this[0].getAttribute(attr);
            return isNull(value_1) ? undefined : value_1;
        }
        if (isUndefined(value))
            return this;
        if (isNull(value))
            return this.removeAttr(attr);
        return this.each(function (i, ele) {
            if (!isElement(ele))
                return;
            ele.setAttribute(attr, value);
        });
    }
    for (var key in attr) {
        this.attr(key, attr[key]);
    }
    return this;
}
fn.attr = attr;
fn.removeClass = function (cls) {
    if (arguments.length)
        return this.toggleClass(cls, false);
    return this.attr('class', '');
};
fn.hasClass = function (cls) {
    return !!cls && some.call(this, function (ele) { return isElement(ele) && ele.classList.contains(cls); });
};
fn.get = function (index) {
    if (isUndefined(index))
        return slice.call(this);
    index = Number(index);
    return this[index < 0 ? index + this.length : index];
};
fn.eq = function (index) {
    return cash(this.get(index));
};
fn.first = function () {
    return this.eq(0);
};
fn.last = function () {
    return this.eq(-1);
};
function text(text) {
    if (isUndefined(text)) {
        return this.get().map(function (ele) { return isElement(ele) || isText(ele) ? ele.textContent : ''; }).join('');
    }
    return this.each(function (i, ele) {
        if (!isElement(ele))
            return;
        ele.textContent = text;
    });
}
fn.text = text;
// @require core/type_checking.ts
// @require core/variables.ts
function computeStyle(ele, prop, isVariable) {
    if (!isElement(ele))
        return;
    var style = win.getComputedStyle(ele, null);
    return isVariable ? style.getPropertyValue(prop) || undefined : style[prop] || ele.style[prop];
}
// @require ./compute_style.ts
function computeStyleInt(ele, prop) {
    return parseInt(computeStyle(ele, prop), 10) || 0;
}
// @require css/helpers/compute_style_int.ts
function getExtraSpace(ele, xAxis) {
    return computeStyleInt(ele, "border".concat(xAxis ? 'Left' : 'Top', "Width")) + computeStyleInt(ele, "padding".concat(xAxis ? 'Left' : 'Top')) + computeStyleInt(ele, "padding".concat(xAxis ? 'Right' : 'Bottom')) + computeStyleInt(ele, "border".concat(xAxis ? 'Right' : 'Bottom', "Width"));
}
// @require css/helpers/compute_style.ts
var defaultDisplay = {};
function getDefaultDisplay(tagName) {
    if (defaultDisplay[tagName])
        return defaultDisplay[tagName];
    var ele = createElement(tagName);
    doc.body.insertBefore(ele, null);
    var display = computeStyle(ele, 'display');
    doc.body.removeChild(ele);
    return defaultDisplay[tagName] = display !== 'none' ? display : 'block';
}
// @require css/helpers/compute_style.ts
function isHidden(ele) {
    return computeStyle(ele, 'display') === 'none';
}
// @require ./cash.ts
function matches(ele, selector) {
    var matches = ele && (ele['matches'] || ele['webkitMatchesSelector'] || ele['msMatchesSelector']);
    return !!matches && !!selector && matches.call(ele, selector);
}
// @require ./matches.ts
// @require ./type_checking.ts
function getCompareFunction(comparator) {
    return isString(comparator)
        ? function (i, ele) { return matches(ele, comparator); }
        : isFunction(comparator)
            ? comparator
            : isCash(comparator)
                ? function (i, ele) { return comparator.is(ele); }
                : !comparator
                    ? function () { return false; }
                    : function (i, ele) { return ele === comparator; };
}
fn.filter = function (comparator) {
    var compare = getCompareFunction(comparator);
    return cash(filter.call(this, function (ele, i) { return compare.call(ele, i, ele); }));
};
// @require collection/filter.ts
function filtered(collection, comparator) {
    return !comparator ? collection : collection.filter(comparator);
}
fn.detach = function (comparator) {
    filtered(this, comparator).each(function (i, ele) {
        if (ele.parentNode) {
            ele.parentNode.removeChild(ele);
        }
    });
    return this;
};
var fragmentRe = /^\s*<(\w+)[^>]*>/;
var singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
var containers = {
    '*': div,
    tr: tbody,
    td: tr,
    th: tr,
    thead: table,
    tbody: table,
    tfoot: table
};
//TODO: Create elements inside a document fragment, in order to prevent inline event handlers from firing
//TODO: Ensure the created elements have the fragment as their parent instead of null, this also ensures we can deal with detatched nodes more reliably
function parseHTML(html) {
    if (!isString(html))
        return [];
    if (singleTagRe.test(html))
        return [createElement(RegExp.$1)];
    var fragment = fragmentRe.test(html) && RegExp.$1;
    var container = containers[fragment] || containers['*'];
    container.innerHTML = html;
    return cash(container.childNodes).detach().get();
}
cash.parseHTML = parseHTML;
fn.has = function (selector) {
    var comparator = isString(selector)
        ? function (i, ele) { return find(selector, ele).length; }
        : function (i, ele) { return ele.contains(selector); };
    return this.filter(comparator);
};
fn.not = function (comparator) {
    var compare = getCompareFunction(comparator);
    return this.filter(function (i, ele) { return (!isString(comparator) || isElement(ele)) && !compare.call(ele, i, ele); });
};
function pluck(arr, prop, deep, until) {
    var plucked = [];
    var isCallback = isFunction(prop);
    var compare = until && getCompareFunction(until);
    for (var i = 0, l = arr.length; i < l; i++) {
        if (isCallback) {
            var val_1 = prop(arr[i]);
            if (val_1.length)
                push.apply(plucked, val_1);
        }
        else {
            var val_2 = arr[i][prop];
            while (val_2 != null) {
                if (until && compare(-1, val_2))
                    break;
                plucked.push(val_2);
                val_2 = deep ? val_2[prop] : null;
            }
        }
    }
    return plucked;
}
// @require core/pluck.ts
// @require core/variables.ts
function getValue(ele) {
    if (ele.multiple && ele.options)
        return pluck(filter.call(ele.options, function (option) { return option.selected && !option.disabled && !option.parentNode.disabled; }), 'value');
    return ele.value || '';
}
function val(value) {
    if (!arguments.length)
        return this[0] && getValue(this[0]);
    return this.each(function (i, ele) {
        var isSelect = ele.multiple && ele.options;
        if (isSelect || checkableRe.test(ele.type)) {
            var eleValue_1 = isArray(value) ? map.call(value, String) : (isNull(value) ? [] : [String(value)]);
            if (isSelect) {
                each(ele.options, function (i, option) {
                    option.selected = eleValue_1.indexOf(option.value) >= 0;
                }, true);
            }
            else {
                ele.checked = eleValue_1.indexOf(ele.value) >= 0;
            }
        }
        else {
            ele.value = isUndefined(value) || isNull(value) ? '' : value;
        }
    });
}
fn.val = val;
fn.is = function (comparator) {
    var compare = getCompareFunction(comparator);
    return some.call(this, function (ele, i) { return compare.call(ele, i, ele); });
};
cash.guid = 1;
function unique(arr) {
    return arr.length > 1 ? filter.call(arr, function (item, index, self) { return indexOf.call(self, item) === index; }) : arr;
}
cash.unique = unique;
fn.add = function (selector, context) {
    return cash(unique(this.get().concat(cash(selector, context).get())));
};
fn.children = function (comparator) {
    return filtered(cash(unique(pluck(this, function (ele) { return ele.children; }))), comparator);
};
fn.parent = function (comparator) {
    return filtered(cash(unique(pluck(this, 'parentNode'))), comparator);
};
fn.index = function (selector) {
    var child = selector ? cash(selector)[0] : this[0];
    var collection = selector ? this : cash(child).parent().children();
    return indexOf.call(collection, child);
};
fn.closest = function (comparator) {
    var filtered = this.filter(comparator);
    if (filtered.length)
        return filtered;
    var $parent = this.parent();
    if (!$parent.length)
        return filtered;
    return $parent.closest(comparator);
};
fn.siblings = function (comparator) {
    return filtered(cash(unique(pluck(this, function (ele) { return cash(ele).parent().children().not(ele); }))), comparator);
};
fn.find = function (selector) {
    return cash(unique(pluck(this, function (ele) { return find(selector, ele); })));
};
// @require core/variables.ts
// @require collection/filter.ts
// @require traversal/find.ts
var HTMLCDATARe = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
var scriptTypeRe = /^$|^module$|\/(java|ecma)script/i;
var scriptAttributes = ['type', 'src', 'nonce', 'noModule'];
function evalScripts(node, doc) {
    var collection = cash(node);
    collection.filter('script').add(collection.find('script')).each(function (i, ele) {
        if (scriptTypeRe.test(ele.type) && docEle.contains(ele)) { // The script type is supported // The element is attached to the DOM // Using `documentElement` for broader browser support
            var script_1 = createElement('script');
            script_1.text = ele.textContent.replace(HTMLCDATARe, '');
            each(scriptAttributes, function (i, attr) {
                if (ele[attr])
                    script_1[attr] = ele[attr];
            });
            doc.head.insertBefore(script_1, null);
            doc.head.removeChild(script_1);
        }
    });
}
// @require ./eval_scripts.ts
function insertElement(anchor, target, left, inside, evaluate) {
    if (inside) { // prepend/append
        anchor.insertBefore(target, left ? anchor.firstChild : null);
    }
    else { // before/after
        if (anchor.nodeName === 'HTML') {
            anchor.parentNode.replaceChild(target, anchor);
        }
        else {
            anchor.parentNode.insertBefore(target, left ? anchor : anchor.nextSibling);
        }
    }
    if (evaluate) {
        evalScripts(target, anchor.ownerDocument);
    }
}
// @require ./insert_element.ts
function insertSelectors(selectors, anchors, inverse, left, inside, reverseLoop1, reverseLoop2, reverseLoop3) {
    each(selectors, function (si, selector) {
        each(cash(selector), function (ti, target) {
            each(cash(anchors), function (ai, anchor) {
                var anchorFinal = inverse ? target : anchor;
                var targetFinal = inverse ? anchor : target;
                var indexFinal = inverse ? ti : ai;
                insertElement(anchorFinal, !indexFinal ? targetFinal : targetFinal.cloneNode(true), left, inside, !indexFinal);
            }, reverseLoop3);
        }, reverseLoop2);
    }, reverseLoop1);
    return anchors;
}
fn.after = function () {
    return insertSelectors(arguments, this, false, false, false, true, true);
};
fn.append = function () {
    return insertSelectors(arguments, this, false, false, true);
};
function html(html) {
    if (!arguments.length)
        return this[0] && this[0].innerHTML;
    if (isUndefined(html))
        return this;
    var hasScript = /<script[\s>]/.test(html);
    return this.each(function (i, ele) {
        if (!isElement(ele))
            return;
        if (hasScript) {
            cash(ele).empty().append(html);
        }
        else {
            ele.innerHTML = html;
        }
    });
}
fn.html = html;
fn.appendTo = function (selector) {
    return insertSelectors(arguments, this, true, false, true);
};
fn.wrapInner = function (selector) {
    return this.each(function (i, ele) {
        var $ele = cash(ele);
        var contents = $ele.contents();
        contents.length ? contents.wrapAll(selector) : $ele.append(selector);
    });
};
fn.before = function () {
    return insertSelectors(arguments, this, false, true);
};
fn.wrapAll = function (selector) {
    var structure = cash(selector);
    var wrapper = structure[0];
    while (wrapper.children.length)
        wrapper = wrapper.firstElementChild;
    this.first().before(structure);
    return this.appendTo(wrapper);
};
fn.wrap = function (selector) {
    return this.each(function (i, ele) {
        var wrapper = cash(selector)[0];
        cash(ele).wrapAll(!i ? wrapper : wrapper.cloneNode(true));
    });
};
fn.insertAfter = function (selector) {
    return insertSelectors(arguments, this, true, false, false, false, false, true);
};
fn.insertBefore = function (selector) {
    return insertSelectors(arguments, this, true, true);
};
fn.prepend = function () {
    return insertSelectors(arguments, this, false, true, true, true, true);
};
fn.prependTo = function (selector) {
    return insertSelectors(arguments, this, true, true, true, false, false, true);
};
fn.contents = function () {
    return cash(unique(pluck(this, function (ele) { return ele.tagName === 'IFRAME' ? [ele.contentDocument] : (ele.tagName === 'TEMPLATE' ? ele.content.childNodes : ele.childNodes); })));
};
fn.next = function (comparator, _all, _until) {
    return filtered(cash(unique(pluck(this, 'nextElementSibling', _all, _until))), comparator);
};
fn.nextAll = function (comparator) {
    return this.next(comparator, true);
};
fn.nextUntil = function (until, comparator) {
    return this.next(comparator, true, until);
};
fn.parents = function (comparator, _until) {
    return filtered(cash(unique(pluck(this, 'parentElement', true, _until))), comparator);
};
fn.parentsUntil = function (until, comparator) {
    return this.parents(comparator, until);
};
fn.prev = function (comparator, _all, _until) {
    return filtered(cash(unique(pluck(this, 'previousElementSibling', _all, _until))), comparator);
};
fn.prevAll = function (comparator) {
    return this.prev(comparator, true);
};
fn.prevUntil = function (until, comparator) {
    return this.prev(comparator, true, until);
};
fn.map = function (callback) {
    return cash(concat.apply([], map.call(this, function (ele, i) { return callback.call(ele, i, ele); })));
};
fn.clone = function () {
    return this.map(function (i, ele) { return ele.cloneNode(true); });
};
fn.offsetParent = function () {
    return this.map(function (i, ele) {
        var offsetParent = ele.offsetParent;
        while (offsetParent && computeStyle(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docEle;
    });
};
fn.slice = function (start, end) {
    return cash(slice.call(this, start, end));
};
// @require ./cash.ts
var dashAlphaRe = /-([a-z])/g;
function camelCase(str) {
    return str.replace(dashAlphaRe, function (match, letter) { return letter.toUpperCase(); });
}
fn.ready = function (callback) {
    var cb = function () { return setTimeout(callback, 0, cash); };
    if (doc.readyState !== 'loading') {
        cb();
    }
    else {
        doc.addEventListener('DOMContentLoaded', cb);
    }
    return this;
};
fn.unwrap = function () {
    this.parent().each(function (i, ele) {
        if (ele.tagName === 'BODY')
            return;
        var $ele = cash(ele);
        $ele.replaceWith($ele.children());
    });
    return this;
};
fn.offset = function () {
    var ele = this[0];
    if (!ele)
        return;
    var rect = ele.getBoundingClientRect();
    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
    };
};
fn.position = function () {
    var ele = this[0];
    if (!ele)
        return;
    var isFixed = (computeStyle(ele, 'position') === 'fixed');
    var offset = isFixed ? ele.getBoundingClientRect() : this.offset();
    if (!isFixed) {
        var doc_1 = ele.ownerDocument;
        var offsetParent = ele.offsetParent || doc_1.documentElement;
        while ((offsetParent === doc_1.body || offsetParent === doc_1.documentElement) && computeStyle(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.parentNode;
        }
        if (offsetParent !== ele && isElement(offsetParent)) {
            var parentOffset = cash(offsetParent).offset();
            offset.top -= parentOffset.top + computeStyleInt(offsetParent, 'borderTopWidth');
            offset.left -= parentOffset.left + computeStyleInt(offsetParent, 'borderLeftWidth');
        }
    }
    return {
        top: offset.top - computeStyleInt(ele, 'marginTop'),
        left: offset.left - computeStyleInt(ele, 'marginLeft')
    };
};
var propMap = {
    /* GENERAL */
    class: 'className',
    contenteditable: 'contentEditable',
    /* LABEL */
    for: 'htmlFor',
    /* INPUT */
    readonly: 'readOnly',
    maxlength: 'maxLength',
    tabindex: 'tabIndex',
    /* TABLE */
    colspan: 'colSpan',
    rowspan: 'rowSpan',
    /* IMAGE */
    usemap: 'useMap'
};
fn.prop = function (prop, value) {
    if (!prop)
        return;
    if (isString(prop)) {
        prop = propMap[prop] || prop;
        if (arguments.length < 2)
            return this[0] && this[0][prop];
        return this.each(function (i, ele) { ele[prop] = value; });
    }
    for (var key in prop) {
        this.prop(key, prop[key]);
    }
    return this;
};
fn.removeProp = function (prop) {
    return this.each(function (i, ele) { delete ele[propMap[prop] || prop]; });
};
var cssVariableRe = /^--/;
// @require ./variables.ts
function isCSSVariable(prop) {
    return cssVariableRe.test(prop);
}
// @require core/camel_case.ts
// @require core/cash.ts
// @require core/each.ts
// @require core/variables.ts
// @require ./is_css_variable.ts
var prefixedProps = {};
var style = div.style;
var vendorsPrefixes = ['webkit', 'moz', 'ms'];
function getPrefixedProp(prop, isVariable) {
    if (isVariable === void 0) { isVariable = isCSSVariable(prop); }
    if (isVariable)
        return prop;
    if (!prefixedProps[prop]) {
        var propCC = camelCase(prop);
        var propUC = "".concat(propCC[0].toUpperCase()).concat(propCC.slice(1));
        var props = ("".concat(propCC, " ").concat(vendorsPrefixes.join("".concat(propUC, " "))).concat(propUC)).split(' ');
        each(props, function (i, p) {
            if (p in style) {
                prefixedProps[prop] = p;
                return false;
            }
        });
    }
    return prefixedProps[prop];
}
// @require core/type_checking.ts
// @require ./is_css_variable.ts
var numericProps = {
    animationIterationCount: true,
    columnCount: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    gridArea: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnStart: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowStart: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true
};
function getSuffixedValue(prop, value, isVariable) {
    if (isVariable === void 0) { isVariable = isCSSVariable(prop); }
    return !isVariable && !numericProps[prop] && isNumeric(value) ? "".concat(value, "px") : value;
}
function css(prop, value) {
    if (isString(prop)) {
        var isVariable_1 = isCSSVariable(prop);
        prop = getPrefixedProp(prop, isVariable_1);
        if (arguments.length < 2)
            return this[0] && computeStyle(this[0], prop, isVariable_1);
        if (!prop)
            return this;
        value = getSuffixedValue(prop, value, isVariable_1);
        return this.each(function (i, ele) {
            if (!isElement(ele))
                return;
            if (isVariable_1) {
                ele.style.setProperty(prop, value);
            }
            else {
                ele.style[prop] = value;
            }
        });
    }
    for (var key in prop) {
        this.css(key, prop[key]);
    }
    return this;
}
;
fn.css = css;
function attempt(fn, arg) {
    try {
        return fn(arg);
    }
    catch (_a) {
        return arg;
    }
}
// @require core/attempt.ts
// @require core/camel_case.ts
var JSONStringRe = /^\s+|\s+$/;
function getData(ele, key) {
    var value = ele.dataset[key] || ele.dataset[camelCase(key)];
    if (JSONStringRe.test(value))
        return value;
    return attempt(JSON.parse, value);
}
// @require core/attempt.ts
// @require core/camel_case.ts
function setData(ele, key, value) {
    value = attempt(JSON.stringify, value);
    ele.dataset[camelCase(key)] = value;
}
function data(name, value) {
    if (!name) {
        if (!this[0])
            return;
        var datas = {};
        for (var key in this[0].dataset) {
            datas[key] = getData(this[0], key);
        }
        return datas;
    }
    if (isString(name)) {
        if (arguments.length < 2)
            return this[0] && getData(this[0], name);
        if (isUndefined(value))
            return this;
        return this.each(function (i, ele) { setData(ele, name, value); });
    }
    for (var key in name) {
        this.data(key, name[key]);
    }
    return this;
}
fn.data = data;
function getDocumentDimension(doc, dimension) {
    var docEle = doc.documentElement;
    return Math.max(doc.body["scroll".concat(dimension)], docEle["scroll".concat(dimension)], doc.body["offset".concat(dimension)], docEle["offset".concat(dimension)], docEle["client".concat(dimension)]);
}
each([true, false], function (i, outer) {
    each(['Width', 'Height'], function (i, prop) {
        var name = "".concat(outer ? 'outer' : 'inner').concat(prop);
        fn[name] = function (includeMargins) {
            if (!this[0])
                return;
            if (isWindow(this[0]))
                return outer ? this[0]["inner".concat(prop)] : this[0].document.documentElement["client".concat(prop)];
            if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
            return this[0]["".concat(outer ? 'offset' : 'client').concat(prop)] + (includeMargins && outer ? computeStyleInt(this[0], "margin".concat(i ? 'Top' : 'Left')) + computeStyleInt(this[0], "margin".concat(i ? 'Bottom' : 'Right')) : 0);
        };
    });
});
each(['Width', 'Height'], function (index, prop) {
    var propLC = prop.toLowerCase();
    fn[propLC] = function (value) {
        if (!this[0])
            return isUndefined(value) ? undefined : this;
        if (!arguments.length) {
            if (isWindow(this[0]))
                return this[0].document.documentElement["client".concat(prop)];
            if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
            return this[0].getBoundingClientRect()[propLC] - getExtraSpace(this[0], !index);
        }
        var valueNumber = parseInt(value, 10);
        return this.each(function (i, ele) {
            if (!isElement(ele))
                return;
            var boxSizing = computeStyle(ele, 'boxSizing');
            ele.style[propLC] = getSuffixedValue(propLC, valueNumber + (boxSizing === 'border-box' ? getExtraSpace(ele, !index) : 0));
        });
    };
});
var displayProperty = '___cd';
fn.toggle = function (force) {
    return this.each(function (i, ele) {
        if (!isElement(ele))
            return;
        var hidden = isHidden(ele);
        var show = isUndefined(force) ? hidden : force;
        if (show) {
            ele.style.display = ele[displayProperty] || '';
            if (isHidden(ele)) {
                ele.style.display = getDefaultDisplay(ele.tagName);
            }
        }
        else if (!hidden) {
            ele[displayProperty] = computeStyle(ele, 'display');
            ele.style.display = 'none';
        }
    });
};
fn.hide = function () {
    return this.toggle(false);
};
fn.show = function () {
    return this.toggle(true);
};
var eventsNamespace = '___ce';
var eventsNamespacesSeparator = '.';
var eventsFocus = { focus: 'focusin', blur: 'focusout' };
var eventsHover = { mouseenter: 'mouseover', mouseleave: 'mouseout' };
var eventsMouseRe = /^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;
// @require ./variables.ts
function getEventNameBubbling(name) {
    return eventsHover[name] || eventsFocus[name] || name;
}
// @require ./variables.ts
function parseEventName(eventName) {
    var parts = eventName.split(eventsNamespacesSeparator);
    return [parts[0], parts.slice(1).sort()]; // [name, namespace[]]
}
fn.trigger = function (event, data) {
    if (isString(event)) {
        var _a = parseEventName(event), nameOriginal = _a[0], namespaces = _a[1];
        var name_1 = getEventNameBubbling(nameOriginal);
        if (!name_1)
            return this;
        var type = eventsMouseRe.test(name_1) ? 'MouseEvents' : 'HTMLEvents';
        event = doc.createEvent(type);
        event.initEvent(name_1, true, true);
        event.namespace = namespaces.join(eventsNamespacesSeparator);
        event.___ot = nameOriginal;
    }
    event.___td = data;
    var isEventFocus = (event.___ot in eventsFocus);
    return this.each(function (i, ele) {
        if (isEventFocus && isFunction(ele[event.___ot])) {
            ele["___i".concat(event.type)] = true; // Ensuring the native event is ignored
            ele[event.___ot]();
            ele["___i".concat(event.type)] = false; // Ensuring the custom event is not ignored
        }
        ele.dispatchEvent(event);
    });
};
// @require ./variables.ts
function getEventsCache(ele) {
    return ele[eventsNamespace] = (ele[eventsNamespace] || {});
}
// @require core/guid.ts
// @require events/helpers/get_events_cache.ts
function addEvent(ele, name, namespaces, selector, callback) {
    var eventCache = getEventsCache(ele);
    eventCache[name] = (eventCache[name] || []);
    eventCache[name].push([namespaces, selector, callback]);
    ele.addEventListener(name, callback);
}
function hasNamespaces(ns1, ns2) {
    return !ns2 || !some.call(ns2, function (ns) { return ns1.indexOf(ns) < 0; });
}
// @require ./get_events_cache.ts
// @require ./has_namespaces.ts
// @require ./parse_event_name.ts
function removeEvent(ele, name, namespaces, selector, callback) {
    var cache = getEventsCache(ele);
    if (!name) {
        for (name in cache) {
            removeEvent(ele, name, namespaces, selector, callback);
        }
    }
    else if (cache[name]) {
        cache[name] = cache[name].filter(function (_a) {
            var ns = _a[0], sel = _a[1], cb = _a[2];
            if ((callback && cb.guid !== callback.guid) || !hasNamespaces(ns, namespaces) || (selector && selector !== sel))
                return true;
            ele.removeEventListener(name, cb);
        });
    }
}
fn.off = function (eventFullName, selector, callback) {
    var _this = this;
    if (isUndefined(eventFullName)) {
        this.each(function (i, ele) {
            if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
            removeEvent(ele);
        });
    }
    else if (!isString(eventFullName)) {
        for (var key in eventFullName) {
            this.off(key, eventFullName[key]);
        }
    }
    else {
        if (isFunction(selector)) {
            callback = selector;
            selector = '';
        }
        each(getSplitValues(eventFullName), function (i, eventFullName) {
            var _a = parseEventName(eventFullName), nameOriginal = _a[0], namespaces = _a[1];
            var name = getEventNameBubbling(nameOriginal);
            _this.each(function (i, ele) {
                if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                    return;
                removeEvent(ele, name, namespaces, selector, callback);
            });
        });
    }
    return this;
};
fn.remove = function (comparator) {
    filtered(this, comparator).detach().off();
    return this;
};
fn.replaceWith = function (selector) {
    return this.before(selector).remove();
};
fn.replaceAll = function (selector) {
    cash(selector).replaceWith(this);
    return this;
};
function on(eventFullName, selector, data, callback, _one) {
    var _this = this;
    if (!isString(eventFullName)) {
        for (var key in eventFullName) {
            this.on(key, selector, data, eventFullName[key], _one);
        }
        return this;
    }
    if (!isString(selector)) {
        if (isUndefined(selector) || isNull(selector)) {
            selector = '';
        }
        else if (isUndefined(data)) {
            data = selector;
            selector = '';
        }
        else {
            callback = data;
            data = selector;
            selector = '';
        }
    }
    if (!isFunction(callback)) {
        callback = data;
        data = undefined;
    }
    if (!callback)
        return this;
    each(getSplitValues(eventFullName), function (i, eventFullName) {
        var _a = parseEventName(eventFullName), nameOriginal = _a[0], namespaces = _a[1];
        var name = getEventNameBubbling(nameOriginal);
        var isEventHover = (nameOriginal in eventsHover);
        var isEventFocus = (nameOriginal in eventsFocus);
        if (!name)
            return;
        _this.each(function (i, ele) {
            if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
            var finalCallback = function (event) {
                if (event.target["___i".concat(event.type)])
                    return event.stopImmediatePropagation(); // Ignoring native event in favor of the upcoming custom one
                if (event.namespace && !hasNamespaces(namespaces, event.namespace.split(eventsNamespacesSeparator)))
                    return;
                if (!selector && ((isEventFocus && (event.target !== ele || event.___ot === name)) || (isEventHover && event.relatedTarget && ele.contains(event.relatedTarget))))
                    return;
                var thisArg = ele;
                if (selector) {
                    var target = event.target;
                    while (!matches(target, selector)) {
                        if (target === ele)
                            return;
                        target = target.parentNode;
                        if (!target)
                            return;
                    }
                    thisArg = target;
                }
                Object.defineProperty(event, 'currentTarget', {
                    configurable: true,
                    get: function () {
                        return thisArg;
                    }
                });
                Object.defineProperty(event, 'delegateTarget', {
                    configurable: true,
                    get: function () {
                        return ele;
                    }
                });
                Object.defineProperty(event, 'data', {
                    configurable: true,
                    get: function () {
                        return data;
                    }
                });
                var returnValue = callback.call(thisArg, event, event.___td);
                if (_one) {
                    removeEvent(ele, name, namespaces, selector, finalCallback);
                }
                if (returnValue === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            finalCallback.guid = callback.guid = (callback.guid || cash.guid++);
            addEvent(ele, name, namespaces, selector, finalCallback);
        });
    });
    return this;
}
fn.on = on;
function one(eventFullName, selector, data, callback) {
    return this.on(eventFullName, selector, data, callback, true);
}
;
fn.one = one;
var queryEncodeCRLFRe = /\r?\n/g;
function queryEncode(prop, value) {
    return "&".concat(encodeURIComponent(prop), "=").concat(encodeURIComponent(value.replace(queryEncodeCRLFRe, '\r\n')));
}
var skippableRe = /file|reset|submit|button|image/i;
var checkableRe = /radio|checkbox/i;
fn.serialize = function () {
    var query = '';
    this.each(function (i, ele) {
        each(ele.elements || [ele], function (i, ele) {
            if (ele.disabled || !ele.name || ele.tagName === 'FIELDSET' || skippableRe.test(ele.type) || (checkableRe.test(ele.type) && !ele.checked))
                return;
            var value = getValue(ele);
            if (!isUndefined(value)) {
                var values = isArray(value) ? value : [value];
                each(values, function (i, value) {
                    query += queryEncode(ele.name, value);
                });
            }
        });
    });
    return query.slice(1);
};
// @require core/types.ts
// @require core/cash.ts
// @require core/type_checking.ts
// @require core/variables.ts
// @require core/each.ts
// @require core/extend.ts
// @require core/find.ts
// @require core/get_compare_function.ts
// @require core/get_split_values.ts
// @require core/guid.ts
// @require core/parse_html.ts
// @require core/unique.ts
// @require attributes/add_class.ts
// @require attributes/attr.ts
// @require attributes/has_class.ts
// @require attributes/prop.ts
// @require attributes/remove_attr.ts
// @require attributes/remove_class.ts
// @require attributes/remove_prop.ts
// @require attributes/toggle_class.ts
// @require collection/add.ts
// @require collection/each.ts
// @require collection/eq.ts
// @require collection/filter.ts
// @require collection/first.ts
// @require collection/get.ts
// @require collection/index.ts
// @require collection/last.ts
// @require collection/map.ts
// @require collection/slice.ts
// @require css/css.ts
// @require data/data.ts
// @require dimensions/inner_outer.ts
// @require dimensions/normal.ts
// @require effects/hide.ts
// @require effects/show.ts
// @require effects/toggle.ts
// @require events/off.ts
// @require events/on.ts
// @require events/one.ts
// @require events/ready.ts
// @require events/trigger.ts
// @require forms/serialize.ts
// @require forms/val.ts
// @require manipulation/after.ts
// @require manipulation/append.ts
// @require manipulation/append_to.ts
// @require manipulation/before.ts
// @require manipulation/clone.ts
// @require manipulation/detach.ts
// @require manipulation/empty.ts
// @require manipulation/html.ts
// @require manipulation/insert_after.ts
// @require manipulation/insert_before.ts
// @require manipulation/prepend.ts
// @require manipulation/prepend_to.ts
// @require manipulation/remove.ts
// @require manipulation/replace_all.ts
// @require manipulation/replace_with.ts
// @require manipulation/text.ts
// @require manipulation/unwrap.ts
// @require manipulation/wrap.ts
// @require manipulation/wrap_all.ts
// @require manipulation/wrap_inner.ts
// @require offset/offset.ts
// @require offset/offset_parent.ts
// @require offset/position.ts
// @require traversal/children.ts
// @require traversal/closest.ts
// @require traversal/contents.ts
// @require traversal/find.ts
// @require traversal/has.ts
// @require traversal/is.ts
// @require traversal/next.ts
// @require traversal/next_all.ts
// @require traversal/next_until.ts
// @require traversal/not.ts
// @require traversal/parent.ts
// @require traversal/parents.ts
// @require traversal/parents_until.ts
// @require traversal/prev.ts
// @require traversal/prev_all.ts
// @require traversal/prev_until.ts
// @require traversal/siblings.ts
// @no-require extras/get_script.ts
// @no-require extras/shorthands.ts
// @require methods.ts
if (typeof exports !== 'undefined') { // Node.js
    module.exports = cash;
}
else { // Browser
    win['cash'] = win['$'] = cash;
}
})();
},{}],19:[function(require,module,exports){
// get successful control from form and assemble into object
// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

// types which indicate a submit action and are not successful controls
// these will be ignored
var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

// node names which could be successful controls
var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

// Matches bracket notation.
var brackets = /(\[[^\[\]]*\])/g;

// serializes form fields
// @param form MUST be an HTMLForm element
// @param options is an optional argument to configure the serialization. Default output
// with no options specified is a url encoded string
//    - hash: [true | false] Configure the output type. If true, the output will
//    be a js object.
//    - serializer: [function] Optional serializer function to override the default one.
//    The function takes 3 arguments (result, key, value) and should return new result
//    hash and url encoded str serializers are provided with this module
//    - disabled: [true | false]. If true serialize disabled fields.
//    - empty: [true | false]. If true serialize empty fields
function serialize(form, options) {
    if (typeof options != 'object') {
        options = { hash: !!options };
    }
    else if (options.hash === undefined) {
        options.hash = true;
    }

    var result = (options.hash) ? {} : '';
    var serializer = options.serializer || ((options.hash) ? hash_serializer : str_serialize);

    var elements = form && form.elements ? form.elements : [];

    //Object store each radio and set if it's empty or not
    var radio_store = Object.create(null);

    for (var i=0 ; i<elements.length ; ++i) {
        var element = elements[i];

        // ingore disabled fields
        if ((!options.disabled && element.disabled) || !element.name) {
            continue;
        }
        // ignore anyhting that is not considered a success field
        if (!k_r_success_contrls.test(element.nodeName) ||
            k_r_submitter.test(element.type)) {
            continue;
        }

        var key = element.name;
        var val = element.value;

        // we can't just use element.value for checkboxes cause some browsers lie to us
        // they say "on" for value when the box isn't checked
        if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
            val = undefined;
        }

        // If we want empty elements
        if (options.empty) {
            // for checkbox
            if (element.type === 'checkbox' && !element.checked) {
                val = '';
            }

            // for radio
            if (element.type === 'radio') {
                if (!radio_store[element.name] && !element.checked) {
                    radio_store[element.name] = false;
                }
                else if (element.checked) {
                    radio_store[element.name] = true;
                }
            }

            // if options empty is true, continue only if its radio
            if (val == undefined && element.type == 'radio') {
                continue;
            }
        }
        else {
            // value-less fields are ignored unless options.empty is true
            if (!val) {
                continue;
            }
        }

        // multi select boxes
        if (element.type === 'select-multiple') {
            val = [];

            var selectOptions = element.options;
            var isSelectedOptions = false;
            for (var j=0 ; j<selectOptions.length ; ++j) {
                var option = selectOptions[j];
                var allowedEmpty = options.empty && !option.value;
                var hasValue = (option.value || allowedEmpty);
                if (option.selected && hasValue) {
                    isSelectedOptions = true;

                    // If using a hash serializer be sure to add the
                    // correct notation for an array in the multi-select
                    // context. Here the name attribute on the select element
                    // might be missing the trailing bracket pair. Both names
                    // "foo" and "foo[]" should be arrays.
                    if (options.hash && key.slice(key.length - 2) !== '[]') {
                        result = serializer(result, key + '[]', option.value);
                    }
                    else {
                        result = serializer(result, key, option.value);
                    }
                }
            }

            // Serialize if no selected options and options.empty is true
            if (!isSelectedOptions && options.empty) {
                result = serializer(result, key, '');
            }

            continue;
        }

        result = serializer(result, key, val);
    }

    // Check for all empty radio buttons and serialize them with key=""
    if (options.empty) {
        for (var key in radio_store) {
            if (!radio_store[key]) {
                result = serializer(result, key, '');
            }
        }
    }

    return result;
}

function parse_keys(string) {
    var keys = [];
    var prefix = /^([^\[\]]*)/;
    var children = new RegExp(brackets);
    var match = prefix.exec(string);

    if (match[1]) {
        keys.push(match[1]);
    }

    while ((match = children.exec(string)) !== null) {
        keys.push(match[1]);
    }

    return keys;
}

function hash_assign(result, keys, value) {
    if (keys.length === 0) {
        result = value;
        return result;
    }

    var key = keys.shift();
    var between = key.match(/^\[(.+?)\]$/);

    if (key === '[]') {
        result = result || [];

        if (Array.isArray(result)) {
            result.push(hash_assign(null, keys, value));
        }
        else {
            // This might be the result of bad name attributes like "[][foo]",
            // in this case the original `result` object will already be
            // assigned to an object literal. Rather than coerce the object to
            // an array, or cause an exception the attribute "_values" is
            // assigned as an array.
            result._values = result._values || [];
            result._values.push(hash_assign(null, keys, value));
        }

        return result;
    }

    // Key is an attribute name and can be assigned directly.
    if (!between) {
        result[key] = hash_assign(result[key], keys, value);
    }
    else {
        var string = between[1];
        // +var converts the variable into a number
        // better than parseInt because it doesn't truncate away trailing
        // letters and actually fails if whole thing is not a number
        var index = +string;

        // If the characters between the brackets is not a number it is an
        // attribute name and can be assigned directly.
        if (isNaN(index)) {
            result = result || {};
            result[string] = hash_assign(result[string], keys, value);
        }
        else {
            result = result || [];
            result[index] = hash_assign(result[index], keys, value);
        }
    }

    return result;
}

// Object/hash encoding serializer.
function hash_serializer(result, key, value) {
    var matches = key.match(brackets);

    // Has brackets? Use the recursive assignment function to walk the keys,
    // construct any missing objects in the result tree and make the assignment
    // at the end of the chain.
    if (matches) {
        var keys = parse_keys(key);
        hash_assign(result, keys, value);
    }
    else {
        // Non bracket notation can make assignments directly.
        var existing = result[key];

        // If the value has been assigned already (for instance when a radio and
        // a checkbox have the same name attribute) convert the previous value
        // into an array before pushing into it.
        //
        // NOTE: If this requirement were removed all hash creation and
        // assignment could go through `hash_assign`.
        if (existing) {
            if (!Array.isArray(existing)) {
                result[key] = [ existing ];
            }

            result[key].push(value);
        }
        else {
            result[key] = value;
        }
    }

    return result;
}

// urlform encoding serializer
function str_serialize(result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value);

    // spaces should be '+' rather than '%20'.
    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
}

module.exports = serialize;

},{}],20:[function(require,module,exports){
/*! js-cookie v3.0.5 | MIT */
;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
    var current = global.Cookies;
    var exports = global.Cookies = factory();
    exports.noConflict = function () { global.Cookies = current; return exports; };
  })());
})(this, (function () { 'use strict';

  /* eslint-disable no-var */
  function assign (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      )
    }
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init (converter, defaultAttributes) {
    function set (name, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      name = encodeURIComponent(name)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie =
        name + '=' + converter.write(value, name) + stringifiedAttributes)
    }

    function get (name) {
      if (typeof document === 'undefined' || (arguments.length && !name)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');

        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);

          if (name === found) {
            break
          }
        } catch (e) {}
      }

      return name ? jar[name] : jar
    }

    return Object.create(
      {
        set,
        get,
        remove: function (name, attributes) {
          set(
            name,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }

  var api = init(defaultConverter, { path: '/' });
  /* eslint-enable no-var */

  return api;

}));

},{}],21:[function(require,module,exports){
/*!
 * named-web-colors v1.4.2
 * https://github.com/davidfq/named-web-colors
 */
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("getColorName", [], factory);
	else if(typeof exports === 'object')
		exports["getColorName"] = factory();
	else
		root["getColorName"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ getColorName)\n/* harmony export */ });\n/* harmony import */ var color_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! color-string */ \"./node_modules/color-string/index.js\");\n/* harmony import */ var color_string__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(color_string__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _data_curated_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../data/curated.json */ \"./data/curated.json\");\n/* harmony import */ var _data_web_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../data/web.json */ \"./data/web.json\");\n/* harmony import */ var _data_werner_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../data/werner.json */ \"./data/werner.json\");\n\n\n\n\nvar WHITE = color_string__WEBPACK_IMPORTED_MODULE_0___default().get('#fff');\nvar BLACK = color_string__WEBPACK_IMPORTED_MODULE_0___default().get('#000');\n/**\n * Describes a matched color.\n *\n * @typedef {Object} ColorOutput\n * @property {string} name - The name of the matched color, e.g., 'red'\n * @property {string} hex - Hex color code e.g., '#FF0'\n * @property {string} rgb - RGB definition (or RGBA for colors with alpha channel).\n * @property {string} css - CSS custom property alike definition, e.g.\n *  `--color-prussian-blue: #004162`\n * @property {number} distance - Calculated distance between input and matched color.\n */\n\n/**\n * Square root of sum of the squares of the differences in values\n * [red, green, blue, opacity]\n *\n * @param {Array} color1\n * @param {Array} color2\n * @return {Number}\n */\n\nvar euclideanDistance = function euclideanDistance(color1, color2) {\n  return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));\n};\n\nvar MAX_DISTANCE = euclideanDistance(WHITE.value, BLACK.value);\n/**\n * Combines foreground and background colors.\n * ref: https://en.wikipedia.org/wiki/Transparency_%28graphic%29\n *\n * @param {Array} foreground - [red, green, blue, alpha]\n * @param {Array} background - [red, green, blue, alpha]\n * @return {Array} - [red, green, blue, alpha=1]\n */\n\nvar blend = function blend(foreground, background) {\n  var opacity = foreground[3];\n  return [(1 - opacity) * background[0] + opacity * foreground[0], (1 - opacity) * background[1] + opacity * foreground[1], (1 - opacity) * background[2] + opacity * foreground[2], 1];\n};\n/**\n * Calculates color distance based on whether first param color input has\n * alpha channel or not.\n *\n * @param {Array} color1\n * @param {Array} color2\n * @return {number}\n */\n\n\nvar comparativeDistance = function comparativeDistance(color1, color2) {\n  if (color1[3] === 1 && color2[3] === 1) {\n    // solid colors: use basic Euclidean distance algorithm\n    return euclideanDistance(color1, color2);\n  } else {\n    // alpha channel: combine input color with white and black backgrounds\n    // and comparte distances\n    var withWhite = euclideanDistance(blend(color1, WHITE.value), color2);\n    var withBlack = euclideanDistance(blend(color1, BLACK.value), color2);\n    return withWhite <= withBlack ? withWhite : withBlack;\n  }\n};\n/**\n * Transform color name to web-safe slug.\n *\n * @param {string} string\n * @return {string}\n */\n\n\nvar slugify = function slugify() {\n  var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';\n  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';\n  return string.trim().split('').reduce(function (memo, char) {\n    return memo + char.replace(/'/, '').replace(/\\s/, separator);\n  }, '').toLocaleLowerCase();\n};\n/**\n * Simple RGB comparation method.\n *\n * @param {Array} color1\n * @param {Array} color2\n * @param {boolean} ignoreAlphaChannel\n */\n\n\nvar compareRGB = function compareRGB(color1, color2) {\n  var ignoreAlphaChannel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n  var result = false;\n\n  if (color1.length === 4 && color2.length === 4) {\n    result = color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];\n    result = ignoreAlphaChannel ? result : color1[3] === color2[3];\n  }\n\n  return result;\n};\n/**\n * Build output color object spec.\n *\n * @param {string} name - resolved color name\n * @param {string} hex - Hex color code\n * @param {Object} colorInput\n * @param {number} distance\n * @param {boolean} ignoreAlphaChannel\n * @return {ColorOutput}\n */\n\n\nvar buildColorOutput = function buildColorOutput(name, hex, colorInput, distance, ignoreAlphaChannel) {\n  var alpha = Number(colorInput.value[3]).toFixed(2);\n  var slug = slugify(name);\n  var result = {\n    name: name,\n    distance: distance\n  };\n\n  if (ignoreAlphaChannel) {\n    result.hex = \"#\".concat(hex);\n    result.css = \"--color-\".concat(slug, \": \").concat(result.hex);\n  } else {\n    // use HEX code from input directly as none of the curated colors have\n    // alpha channel defined; test\n    result.hex = color_string__WEBPACK_IMPORTED_MODULE_0___default().to.hex(colorInput.value); // normalize alpha suffix\n\n    var alphaSuffix = '';\n\n    if (alpha > 0 && alpha < 1) {\n      alphaSuffix = \"-\".concat(Math.round(alpha * 100));\n    }\n\n    result.css = \"--color-\".concat(slug).concat(alphaSuffix, \": \").concat(result.hex);\n  } // double check final result; `color-string` don't support HSL input\n  // transforms to HEX (when input contains decimals, @see tests),\n  // so `result.hex` may not be valid at this point\n\n\n  if (color_string__WEBPACK_IMPORTED_MODULE_0___default().get(result.hex) !== null) {\n    var rgb = color_string__WEBPACK_IMPORTED_MODULE_0___default().get(result.hex).value; // round alpha value\n\n    var rgbAlpha = Number.parseFloat(Number(rgb[3]).toFixed(2));\n    result.rgb = color_string__WEBPACK_IMPORTED_MODULE_0___default().to.rgb([rgb[0], rgb[1], rgb[2], rgbAlpha]);\n  } else {\n    result = undefined;\n  }\n\n  return result;\n};\n/**\n * Main function to find the closest color among \"colors\" list.\n *\n * @param {string} code - color code: Hex, RGB or HSL\n * @param {Object} colors - color list: keys are Hex codes and values are color names\n * @param {boolean} ignoreAlphaChannel - whether to ignore alpha channel on input\n */\n\n\nvar getColor = function getColor(code, colors) {\n  var ignoreAlphaChannel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n  var colorInput = color_string__WEBPACK_IMPORTED_MODULE_0___default().get(code);\n  var colorKeys = Object.keys(colors);\n  var colorKeyMatch;\n  var distance = MAX_DISTANCE;\n  var result;\n\n  if (colorInput !== null) {\n    // check if there's an exact match (it only happens with solid colors)\n    if (!ignoreAlphaChannel) {\n      colorKeyMatch = colorKeys.find(function (key) {\n        var color = color_string__WEBPACK_IMPORTED_MODULE_0___default().get(\"#\".concat(key));\n        return compareRGB(color.value, colorInput.value, true);\n      });\n    }\n\n    if (colorKeyMatch !== undefined) {\n      distance = 0;\n    }\n\n    if (distance > 0) {\n      // let's find the closest one\n      var calculateDistance = ignoreAlphaChannel ? comparativeDistance : euclideanDistance;\n      colorKeys.forEach(function (key) {\n        var colorCandidate = color_string__WEBPACK_IMPORTED_MODULE_0___default().get(\"#\".concat(key));\n        var tmpDistance = calculateDistance(colorInput.value, colorCandidate.value);\n\n        if (tmpDistance < distance) {\n          colorKeyMatch = key;\n          distance = tmpDistance;\n        }\n      });\n    }\n  }\n\n  if (colorKeyMatch !== undefined) {\n    result = buildColorOutput(colors[colorKeyMatch], colorKeyMatch, colorInput, distance, ignoreAlphaChannel);\n  }\n\n  return result;\n};\n\nfunction getColorName(code) {\n  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n  var colors = Object.assign({}, _data_web_json__WEBPACK_IMPORTED_MODULE_2__, _data_curated_json__WEBPACK_IMPORTED_MODULE_1__);\n\n  if (options.list && options.list === 'web') {\n    colors = _data_web_json__WEBPACK_IMPORTED_MODULE_2__;\n  } else if (options.list && options.list === 'werner') {\n    colors = _data_werner_json__WEBPACK_IMPORTED_MODULE_3__;\n  }\n\n  return getColor(code, colors, options.ignoreAlphaChannel);\n}\n\n//# sourceURL=webpack://getColorName/./src/index.js?");

/***/ }),

/***/ "./node_modules/color-name/index.js":
/*!******************************************!*\
  !*** ./node_modules/color-name/index.js ***!
  \******************************************/
/***/ ((module) => {

"use strict";
eval("\r\n\r\nmodule.exports = {\r\n\t\"aliceblue\": [240, 248, 255],\r\n\t\"antiquewhite\": [250, 235, 215],\r\n\t\"aqua\": [0, 255, 255],\r\n\t\"aquamarine\": [127, 255, 212],\r\n\t\"azure\": [240, 255, 255],\r\n\t\"beige\": [245, 245, 220],\r\n\t\"bisque\": [255, 228, 196],\r\n\t\"black\": [0, 0, 0],\r\n\t\"blanchedalmond\": [255, 235, 205],\r\n\t\"blue\": [0, 0, 255],\r\n\t\"blueviolet\": [138, 43, 226],\r\n\t\"brown\": [165, 42, 42],\r\n\t\"burlywood\": [222, 184, 135],\r\n\t\"cadetblue\": [95, 158, 160],\r\n\t\"chartreuse\": [127, 255, 0],\r\n\t\"chocolate\": [210, 105, 30],\r\n\t\"coral\": [255, 127, 80],\r\n\t\"cornflowerblue\": [100, 149, 237],\r\n\t\"cornsilk\": [255, 248, 220],\r\n\t\"crimson\": [220, 20, 60],\r\n\t\"cyan\": [0, 255, 255],\r\n\t\"darkblue\": [0, 0, 139],\r\n\t\"darkcyan\": [0, 139, 139],\r\n\t\"darkgoldenrod\": [184, 134, 11],\r\n\t\"darkgray\": [169, 169, 169],\r\n\t\"darkgreen\": [0, 100, 0],\r\n\t\"darkgrey\": [169, 169, 169],\r\n\t\"darkkhaki\": [189, 183, 107],\r\n\t\"darkmagenta\": [139, 0, 139],\r\n\t\"darkolivegreen\": [85, 107, 47],\r\n\t\"darkorange\": [255, 140, 0],\r\n\t\"darkorchid\": [153, 50, 204],\r\n\t\"darkred\": [139, 0, 0],\r\n\t\"darksalmon\": [233, 150, 122],\r\n\t\"darkseagreen\": [143, 188, 143],\r\n\t\"darkslateblue\": [72, 61, 139],\r\n\t\"darkslategray\": [47, 79, 79],\r\n\t\"darkslategrey\": [47, 79, 79],\r\n\t\"darkturquoise\": [0, 206, 209],\r\n\t\"darkviolet\": [148, 0, 211],\r\n\t\"deeppink\": [255, 20, 147],\r\n\t\"deepskyblue\": [0, 191, 255],\r\n\t\"dimgray\": [105, 105, 105],\r\n\t\"dimgrey\": [105, 105, 105],\r\n\t\"dodgerblue\": [30, 144, 255],\r\n\t\"firebrick\": [178, 34, 34],\r\n\t\"floralwhite\": [255, 250, 240],\r\n\t\"forestgreen\": [34, 139, 34],\r\n\t\"fuchsia\": [255, 0, 255],\r\n\t\"gainsboro\": [220, 220, 220],\r\n\t\"ghostwhite\": [248, 248, 255],\r\n\t\"gold\": [255, 215, 0],\r\n\t\"goldenrod\": [218, 165, 32],\r\n\t\"gray\": [128, 128, 128],\r\n\t\"green\": [0, 128, 0],\r\n\t\"greenyellow\": [173, 255, 47],\r\n\t\"grey\": [128, 128, 128],\r\n\t\"honeydew\": [240, 255, 240],\r\n\t\"hotpink\": [255, 105, 180],\r\n\t\"indianred\": [205, 92, 92],\r\n\t\"indigo\": [75, 0, 130],\r\n\t\"ivory\": [255, 255, 240],\r\n\t\"khaki\": [240, 230, 140],\r\n\t\"lavender\": [230, 230, 250],\r\n\t\"lavenderblush\": [255, 240, 245],\r\n\t\"lawngreen\": [124, 252, 0],\r\n\t\"lemonchiffon\": [255, 250, 205],\r\n\t\"lightblue\": [173, 216, 230],\r\n\t\"lightcoral\": [240, 128, 128],\r\n\t\"lightcyan\": [224, 255, 255],\r\n\t\"lightgoldenrodyellow\": [250, 250, 210],\r\n\t\"lightgray\": [211, 211, 211],\r\n\t\"lightgreen\": [144, 238, 144],\r\n\t\"lightgrey\": [211, 211, 211],\r\n\t\"lightpink\": [255, 182, 193],\r\n\t\"lightsalmon\": [255, 160, 122],\r\n\t\"lightseagreen\": [32, 178, 170],\r\n\t\"lightskyblue\": [135, 206, 250],\r\n\t\"lightslategray\": [119, 136, 153],\r\n\t\"lightslategrey\": [119, 136, 153],\r\n\t\"lightsteelblue\": [176, 196, 222],\r\n\t\"lightyellow\": [255, 255, 224],\r\n\t\"lime\": [0, 255, 0],\r\n\t\"limegreen\": [50, 205, 50],\r\n\t\"linen\": [250, 240, 230],\r\n\t\"magenta\": [255, 0, 255],\r\n\t\"maroon\": [128, 0, 0],\r\n\t\"mediumaquamarine\": [102, 205, 170],\r\n\t\"mediumblue\": [0, 0, 205],\r\n\t\"mediumorchid\": [186, 85, 211],\r\n\t\"mediumpurple\": [147, 112, 219],\r\n\t\"mediumseagreen\": [60, 179, 113],\r\n\t\"mediumslateblue\": [123, 104, 238],\r\n\t\"mediumspringgreen\": [0, 250, 154],\r\n\t\"mediumturquoise\": [72, 209, 204],\r\n\t\"mediumvioletred\": [199, 21, 133],\r\n\t\"midnightblue\": [25, 25, 112],\r\n\t\"mintcream\": [245, 255, 250],\r\n\t\"mistyrose\": [255, 228, 225],\r\n\t\"moccasin\": [255, 228, 181],\r\n\t\"navajowhite\": [255, 222, 173],\r\n\t\"navy\": [0, 0, 128],\r\n\t\"oldlace\": [253, 245, 230],\r\n\t\"olive\": [128, 128, 0],\r\n\t\"olivedrab\": [107, 142, 35],\r\n\t\"orange\": [255, 165, 0],\r\n\t\"orangered\": [255, 69, 0],\r\n\t\"orchid\": [218, 112, 214],\r\n\t\"palegoldenrod\": [238, 232, 170],\r\n\t\"palegreen\": [152, 251, 152],\r\n\t\"paleturquoise\": [175, 238, 238],\r\n\t\"palevioletred\": [219, 112, 147],\r\n\t\"papayawhip\": [255, 239, 213],\r\n\t\"peachpuff\": [255, 218, 185],\r\n\t\"peru\": [205, 133, 63],\r\n\t\"pink\": [255, 192, 203],\r\n\t\"plum\": [221, 160, 221],\r\n\t\"powderblue\": [176, 224, 230],\r\n\t\"purple\": [128, 0, 128],\r\n\t\"rebeccapurple\": [102, 51, 153],\r\n\t\"red\": [255, 0, 0],\r\n\t\"rosybrown\": [188, 143, 143],\r\n\t\"royalblue\": [65, 105, 225],\r\n\t\"saddlebrown\": [139, 69, 19],\r\n\t\"salmon\": [250, 128, 114],\r\n\t\"sandybrown\": [244, 164, 96],\r\n\t\"seagreen\": [46, 139, 87],\r\n\t\"seashell\": [255, 245, 238],\r\n\t\"sienna\": [160, 82, 45],\r\n\t\"silver\": [192, 192, 192],\r\n\t\"skyblue\": [135, 206, 235],\r\n\t\"slateblue\": [106, 90, 205],\r\n\t\"slategray\": [112, 128, 144],\r\n\t\"slategrey\": [112, 128, 144],\r\n\t\"snow\": [255, 250, 250],\r\n\t\"springgreen\": [0, 255, 127],\r\n\t\"steelblue\": [70, 130, 180],\r\n\t\"tan\": [210, 180, 140],\r\n\t\"teal\": [0, 128, 128],\r\n\t\"thistle\": [216, 191, 216],\r\n\t\"tomato\": [255, 99, 71],\r\n\t\"turquoise\": [64, 224, 208],\r\n\t\"violet\": [238, 130, 238],\r\n\t\"wheat\": [245, 222, 179],\r\n\t\"white\": [255, 255, 255],\r\n\t\"whitesmoke\": [245, 245, 245],\r\n\t\"yellow\": [255, 255, 0],\r\n\t\"yellowgreen\": [154, 205, 50]\r\n};\r\n\n\n//# sourceURL=webpack://getColorName/./node_modules/color-name/index.js?");

/***/ }),

/***/ "./node_modules/color-string/index.js":
/*!********************************************!*\
  !*** ./node_modules/color-string/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/* MIT license */\nvar colorNames = __webpack_require__(/*! color-name */ \"./node_modules/color-name/index.js\");\nvar swizzle = __webpack_require__(/*! simple-swizzle */ \"./node_modules/simple-swizzle/index.js\");\nvar hasOwnProperty = Object.hasOwnProperty;\n\nvar reverseNames = {};\n\n// create a list of reverse color names\nfor (var name in colorNames) {\n\tif (hasOwnProperty.call(colorNames, name)) {\n\t\treverseNames[colorNames[name]] = name;\n\t}\n}\n\nvar cs = module.exports = {\n\tto: {},\n\tget: {}\n};\n\ncs.get = function (string) {\n\tvar prefix = string.substring(0, 3).toLowerCase();\n\tvar val;\n\tvar model;\n\tswitch (prefix) {\n\t\tcase 'hsl':\n\t\t\tval = cs.get.hsl(string);\n\t\t\tmodel = 'hsl';\n\t\t\tbreak;\n\t\tcase 'hwb':\n\t\t\tval = cs.get.hwb(string);\n\t\t\tmodel = 'hwb';\n\t\t\tbreak;\n\t\tdefault:\n\t\t\tval = cs.get.rgb(string);\n\t\t\tmodel = 'rgb';\n\t\t\tbreak;\n\t}\n\n\tif (!val) {\n\t\treturn null;\n\t}\n\n\treturn {model: model, value: val};\n};\n\ncs.get.rgb = function (string) {\n\tif (!string) {\n\t\treturn null;\n\t}\n\n\tvar abbr = /^#([a-f0-9]{3,4})$/i;\n\tvar hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;\n\tvar rgba = /^rgba?\\(\\s*([+-]?\\d+)(?=[\\s,])\\s*(?:,\\s*)?([+-]?\\d+)(?=[\\s,])\\s*(?:,\\s*)?([+-]?\\d+)\\s*(?:[,|\\/]\\s*([+-]?[\\d\\.]+)(%?)\\s*)?\\)$/;\n\tvar per = /^rgba?\\(\\s*([+-]?[\\d\\.]+)\\%\\s*,?\\s*([+-]?[\\d\\.]+)\\%\\s*,?\\s*([+-]?[\\d\\.]+)\\%\\s*(?:[,|\\/]\\s*([+-]?[\\d\\.]+)(%?)\\s*)?\\)$/;\n\tvar keyword = /^(\\w+)$/;\n\n\tvar rgb = [0, 0, 0, 1];\n\tvar match;\n\tvar i;\n\tvar hexAlpha;\n\n\tif (match = string.match(hex)) {\n\t\thexAlpha = match[2];\n\t\tmatch = match[1];\n\n\t\tfor (i = 0; i < 3; i++) {\n\t\t\t// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19\n\t\t\tvar i2 = i * 2;\n\t\t\trgb[i] = parseInt(match.slice(i2, i2 + 2), 16);\n\t\t}\n\n\t\tif (hexAlpha) {\n\t\t\trgb[3] = parseInt(hexAlpha, 16) / 255;\n\t\t}\n\t} else if (match = string.match(abbr)) {\n\t\tmatch = match[1];\n\t\thexAlpha = match[3];\n\n\t\tfor (i = 0; i < 3; i++) {\n\t\t\trgb[i] = parseInt(match[i] + match[i], 16);\n\t\t}\n\n\t\tif (hexAlpha) {\n\t\t\trgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;\n\t\t}\n\t} else if (match = string.match(rgba)) {\n\t\tfor (i = 0; i < 3; i++) {\n\t\t\trgb[i] = parseInt(match[i + 1], 0);\n\t\t}\n\n\t\tif (match[4]) {\n\t\t\tif (match[5]) {\n\t\t\t\trgb[3] = parseFloat(match[4]) * 0.01;\n\t\t\t} else {\n\t\t\t\trgb[3] = parseFloat(match[4]);\n\t\t\t}\n\t\t}\n\t} else if (match = string.match(per)) {\n\t\tfor (i = 0; i < 3; i++) {\n\t\t\trgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);\n\t\t}\n\n\t\tif (match[4]) {\n\t\t\tif (match[5]) {\n\t\t\t\trgb[3] = parseFloat(match[4]) * 0.01;\n\t\t\t} else {\n\t\t\t\trgb[3] = parseFloat(match[4]);\n\t\t\t}\n\t\t}\n\t} else if (match = string.match(keyword)) {\n\t\tif (match[1] === 'transparent') {\n\t\t\treturn [0, 0, 0, 0];\n\t\t}\n\n\t\tif (!hasOwnProperty.call(colorNames, match[1])) {\n\t\t\treturn null;\n\t\t}\n\n\t\trgb = colorNames[match[1]];\n\t\trgb[3] = 1;\n\n\t\treturn rgb;\n\t} else {\n\t\treturn null;\n\t}\n\n\tfor (i = 0; i < 3; i++) {\n\t\trgb[i] = clamp(rgb[i], 0, 255);\n\t}\n\trgb[3] = clamp(rgb[3], 0, 1);\n\n\treturn rgb;\n};\n\ncs.get.hsl = function (string) {\n\tif (!string) {\n\t\treturn null;\n\t}\n\n\tvar hsl = /^hsla?\\(\\s*([+-]?(?:\\d{0,3}\\.)?\\d+)(?:deg)?\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*(?:[,|\\/]\\s*([+-]?(?=\\.\\d|\\d)(?:0|[1-9]\\d*)?(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)\\s*)?\\)$/;\n\tvar match = string.match(hsl);\n\n\tif (match) {\n\t\tvar alpha = parseFloat(match[4]);\n\t\tvar h = ((parseFloat(match[1]) % 360) + 360) % 360;\n\t\tvar s = clamp(parseFloat(match[2]), 0, 100);\n\t\tvar l = clamp(parseFloat(match[3]), 0, 100);\n\t\tvar a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);\n\n\t\treturn [h, s, l, a];\n\t}\n\n\treturn null;\n};\n\ncs.get.hwb = function (string) {\n\tif (!string) {\n\t\treturn null;\n\t}\n\n\tvar hwb = /^hwb\\(\\s*([+-]?\\d{0,3}(?:\\.\\d+)?)(?:deg)?\\s*,\\s*([+-]?[\\d\\.]+)%\\s*,\\s*([+-]?[\\d\\.]+)%\\s*(?:,\\s*([+-]?(?=\\.\\d|\\d)(?:0|[1-9]\\d*)?(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)\\s*)?\\)$/;\n\tvar match = string.match(hwb);\n\n\tif (match) {\n\t\tvar alpha = parseFloat(match[4]);\n\t\tvar h = ((parseFloat(match[1]) % 360) + 360) % 360;\n\t\tvar w = clamp(parseFloat(match[2]), 0, 100);\n\t\tvar b = clamp(parseFloat(match[3]), 0, 100);\n\t\tvar a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);\n\t\treturn [h, w, b, a];\n\t}\n\n\treturn null;\n};\n\ncs.to.hex = function () {\n\tvar rgba = swizzle(arguments);\n\n\treturn (\n\t\t'#' +\n\t\thexDouble(rgba[0]) +\n\t\thexDouble(rgba[1]) +\n\t\thexDouble(rgba[2]) +\n\t\t(rgba[3] < 1\n\t\t\t? (hexDouble(Math.round(rgba[3] * 255)))\n\t\t\t: '')\n\t);\n};\n\ncs.to.rgb = function () {\n\tvar rgba = swizzle(arguments);\n\n\treturn rgba.length < 4 || rgba[3] === 1\n\t\t? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'\n\t\t: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';\n};\n\ncs.to.rgb.percent = function () {\n\tvar rgba = swizzle(arguments);\n\n\tvar r = Math.round(rgba[0] / 255 * 100);\n\tvar g = Math.round(rgba[1] / 255 * 100);\n\tvar b = Math.round(rgba[2] / 255 * 100);\n\n\treturn rgba.length < 4 || rgba[3] === 1\n\t\t? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'\n\t\t: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';\n};\n\ncs.to.hsl = function () {\n\tvar hsla = swizzle(arguments);\n\treturn hsla.length < 4 || hsla[3] === 1\n\t\t? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'\n\t\t: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';\n};\n\n// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax\n// (hwb have alpha optional & 1 is default value)\ncs.to.hwb = function () {\n\tvar hwba = swizzle(arguments);\n\n\tvar a = '';\n\tif (hwba.length >= 4 && hwba[3] !== 1) {\n\t\ta = ', ' + hwba[3];\n\t}\n\n\treturn 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';\n};\n\ncs.to.keyword = function (rgb) {\n\treturn reverseNames[rgb.slice(0, 3)];\n};\n\n// helpers\nfunction clamp(num, min, max) {\n\treturn Math.min(Math.max(min, num), max);\n}\n\nfunction hexDouble(num) {\n\tvar str = Math.round(num).toString(16).toUpperCase();\n\treturn (str.length < 2) ? '0' + str : str;\n}\n\n\n//# sourceURL=webpack://getColorName/./node_modules/color-string/index.js?");

/***/ }),

/***/ "./node_modules/is-arrayish/index.js":
/*!*******************************************!*\
  !*** ./node_modules/is-arrayish/index.js ***!
  \*******************************************/
/***/ ((module) => {

eval("module.exports = function isArrayish(obj) {\n\tif (!obj || typeof obj === 'string') {\n\t\treturn false;\n\t}\n\n\treturn obj instanceof Array || Array.isArray(obj) ||\n\t\t(obj.length >= 0 && (obj.splice instanceof Function ||\n\t\t\t(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));\n};\n\n\n//# sourceURL=webpack://getColorName/./node_modules/is-arrayish/index.js?");

/***/ }),

/***/ "./node_modules/simple-swizzle/index.js":
/*!**********************************************!*\
  !*** ./node_modules/simple-swizzle/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar isArrayish = __webpack_require__(/*! is-arrayish */ \"./node_modules/is-arrayish/index.js\");\n\nvar concat = Array.prototype.concat;\nvar slice = Array.prototype.slice;\n\nvar swizzle = module.exports = function swizzle(args) {\n\tvar results = [];\n\n\tfor (var i = 0, len = args.length; i < len; i++) {\n\t\tvar arg = args[i];\n\n\t\tif (isArrayish(arg)) {\n\t\t\t// http://jsperf.com/javascript-array-concat-vs-push/98\n\t\t\tresults = concat.call(results, slice.call(arg));\n\t\t} else {\n\t\t\tresults.push(arg);\n\t\t}\n\t}\n\n\treturn results;\n};\n\nswizzle.wrap = function (fn) {\n\treturn function () {\n\t\treturn fn(swizzle(arguments));\n\t};\n};\n\n\n//# sourceURL=webpack://getColorName/./node_modules/simple-swizzle/index.js?");

/***/ }),

/***/ "./data/curated.json":
/*!***************************!*\
  !*** ./data/curated.json ***!
  \***************************/
/***/ ((module) => {

"use strict";
eval("module.exports = JSON.parse('{\"101405\":\"Green Waterloo\",\"105852\":\"Eden\",\"123447\":\"Elephant\",\"130000\":\"Diesel\",\"140600\":\"Nero\",\"161928\":\"Mirage\",\"163222\":\"Celtic\",\"163531\":\"Gable Green\",\"175579\":\"Chathams Blue\",\"193751\":\"Nile Blue\",\"204852\":\"Blue Dianne\",\"220878\":\"Deep Blue\",\"233418\":\"Mallard\",\"251607\":\"Graphite\",\"251706\":\"Cannon Black\",\"260368\":\"Paua\",\"261105\":\"Wood Bark\",\"261414\":\"Gondola\",\"262335\":\"Steel Gray\",\"292130\":\"Bastille\",\"292319\":\"Zeus\",\"292937\":\"Charade\",\"300529\":\"Melanzane\",\"314459\":\"Pickled Bluewood\",\"323232\":\"Mine Shaft\",\"341515\":\"Tamarind\",\"350036\":\"Mardi Gras\",\"353542\":\"Tuna\",\"363050\":\"Martinique\",\"363534\":\"Tuatara\",\"368716\":\"La Palma\",\"373021\":\"Birch\",\"377475\":\"Oracle\",\"380474\":\"Blue Diamond\",\"383533\":\"Dune\",\"384555\":\"Oxford Blue\",\"384910\":\"Clover\",\"394851\":\"Limed Spruce\",\"396413\":\"Dell\",\"401801\":\"Brown Pod\",\"405169\":\"Fiord\",\"410056\":\"Ripe Plum\",\"412010\":\"Deep Oak\",\"414257\":\"Gun Powder\",\"420303\":\"Burnt Maroon\",\"423921\":\"Lisbon Brown\",\"427977\":\"Faded Jade\",\"431560\":\"Scarlet Gum\",\"433120\":\"Iroko\",\"444954\":\"Mako\",\"454936\":\"Kelp\",\"462425\":\"Crater Brown\",\"465945\":\"Gray Asparagus\",\"480404\":\"Rustic Red\",\"480607\":\"Bulgarian Rose\",\"480656\":\"Clairvoyant\",\"483131\":\"Woody Brown\",\"492615\":\"Brown Derby\",\"495400\":\"Verdun Green\",\"496679\":\"Blue Bayoux\",\"497183\":\"Bismark\",\"504351\":\"Mortar\",\"507096\":\"Kashmir Blue\",\"507672\":\"Cutty Sark\",\"514649\":\"Emperor\",\"533455\":\"Voodoo\",\"534491\":\"Victoria\",\"541012\":\"Heath\",\"544333\":\"Judge Gray\",\"549019\":\"Vida Loca\",\"578363\":\"Spring Leaves\",\"585562\":\"Scarpa Flow\",\"587156\":\"Cactus\",\"592804\":\"Brown Bramble\",\"593737\":\"Congo Brown\",\"594433\":\"Millbrook\",\"604913\":\"Horses Neck\",\"612718\":\"Espresso\",\"614051\":\"Eggplant\",\"625119\":\"West Coast\",\"626649\":\"Finch\",\"646077\":\"Dolphin\",\"646463\":\"Storm Dust\",\"657220\":\"Fern Frond\",\"660045\":\"Pompadour\",\"661010\":\"Dark Tan\",\"676662\":\"Ironside Gray\",\"678975\":\"Viridian Green\",\"683600\":\"Nutmeg Wood Finish\",\"685558\":\"Zambezi\",\"692545\":\"Tawny Port\",\"704214\":\"Sepia\",\"706555\":\"Coffee\",\"714693\":\"Affair\",\"716338\":\"Yellow Metal\",\"717486\":\"Storm Gray\",\"718080\":\"Sirocco\",\"737829\":\"Crete\",\"738678\":\"Xanadu\",\"748881\":\"Blue Smoke\",\"749378\":\"Laurel\",\"778120\":\"Pacifika\",\"780109\":\"Japanese Maple\",\"796878\":\"Old Lavender\",\"796989\":\"Rum\",\"801818\":\"Falu Red\",\"803790\":\"Vivid Violet\",\"817377\":\"Empress\",\"819885\":\"Spanish Green\",\"828685\":\"Gunsmoke\",\"831923\":\"Merlot\",\"837050\":\"Shadow\",\"858470\":\"Bandicoot\",\"860111\":\"Red Devil\",\"868974\":\"Bitter\",\"871550\":\"Disco\",\"885342\":\"Spicy Mix\",\"886221\":\"Kumera\",\"888387\":\"Suva Gray\",\"893456\":\"Camelot\",\"893843\":\"Solid Pink\",\"894367\":\"Cannon Pink\",\"900020\":\"Burgundy\",\"907874\":\"Hemp\",\"924321\":\"Cumin\",\"928573\":\"Stonewall\",\"928590\":\"Venus\",\"944747\":\"Copper Rust\",\"948771\":\"Arrowtown\",\"950015\":\"Scarlett\",\"956387\":\"Strikemaster\",\"959396\":\"Mountain Mist\",\"960018\":\"Carmine\",\"967059\":\"Leather\",\"990066\":\"Fresh Eggplant\",\"991199\":\"Violet Eggplant\",\"991613\":\"Tamarillo\",\"996666\":\"Copper Rose\",\"FFFFB4\":\"Portafino\",\"FFFF99\":\"Pale Canary\",\"FFFF66\":\"Laser Lemon\",\"FFFEFD\":\"Romance\",\"FFFEF6\":\"Black White\",\"FFFEF0\":\"Rice Cake\",\"FFFEEC\":\"Apricot White\",\"FFFEE1\":\"Half and Half\",\"FFFDF4\":\"Quarter Pearl Lusta\",\"FFFDF3\":\"Orchid White\",\"FFFDE8\":\"Travertine\",\"FFFDE6\":\"Chilean Heath\",\"FFFDD0\":\"Cream\",\"FFFCEE\":\"Island Spice\",\"FFFCEA\":\"Buttery White\",\"FFFC99\":\"Witch Haze\",\"FFFBF9\":\"Soapstone\",\"FFFBDC\":\"Scotch Mist\",\"FFFAF4\":\"Bridal Heath\",\"FFF9E6\":\"Early Dawn\",\"FFF9E2\":\"Gin Fizz\",\"FFF8D1\":\"Baja White\",\"FFF6F5\":\"Rose White\",\"FFF6DF\":\"Varden\",\"FFF6D4\":\"Milk Punch\",\"FFF5F3\":\"Sauvignon\",\"FFF4F3\":\"Chablis\",\"FFF4E8\":\"Serenade\",\"FFF4E0\":\"Sazerac\",\"FFF4DD\":\"Egg Sour\",\"FFF4CE\":\"Barley White\",\"FFF46E\":\"Paris Daisy\",\"FFF3F1\":\"Chardon\",\"FFF39D\":\"Picasso\",\"FFF1F9\":\"Tutu\",\"FFF1EE\":\"Forget Me Not\",\"FFF1D8\":\"Pink Lady\",\"FFF1B5\":\"Buttermilk\",\"FFF14F\":\"Gorse\",\"FFF0DB\":\"Peach Cream\",\"FFEFEC\":\"Fair Pink\",\"FFEFC1\":\"Egg White\",\"FFEFA1\":\"Vis Vis\",\"FFEED8\":\"Derby\",\"FFEDBC\":\"Colonial White\",\"FFEC13\":\"Broom\",\"FFEAD4\":\"Karry\",\"FFEAC8\":\"Sandy Beach\",\"FFE772\":\"Kournikova\",\"FFE6C7\":\"Tequila\",\"FFE5B4\":\"Peach\",\"FFE5A0\":\"Cream Brulee\",\"FFE2C5\":\"Negroni\",\"FFE1F2\":\"Pale Rose\",\"FFE1DF\":\"Pippin\",\"FFDEB3\":\"Frangipani\",\"FFDDF4\":\"Pink Lace\",\"FFDDCF\":\"Watusi\",\"FFDDCD\":\"Tuft Bush\",\"FFDDAF\":\"Caramel\",\"FFDCD6\":\"Peach Schnapps\",\"FFDB58\":\"Mustard\",\"FFD8D9\":\"Cosmos\",\"FFD800\":\"School bus Yellow\",\"FFD38C\":\"Grandis\",\"FFD2B7\":\"Romantic\",\"FFD1DC\":\"Pastel Pink\",\"FFCD8C\":\"Chardonnay\",\"FFCC99\":\"Peach Orange\",\"FFCC5C\":\"Golden Tainoi\",\"FFCC33\":\"Sunglow\",\"FFCBA4\":\"Flesh\",\"FFC901\":\"Supernova\",\"FFC3C0\":\"Your Pink\",\"FFC0A8\":\"Wax Flower\",\"FFBF00\":\"Amber\",\"FFBD5F\":\"Koromiko\",\"FFBA00\":\"Selective Yellow\",\"FFB97B\":\"Macaroni and Cheese\",\"FFB7D5\":\"Cotton Candy\",\"FFB555\":\"Texas Rose\",\"FFB31F\":\"My Sin\",\"FFB1B3\":\"Sundown\",\"FFB0AC\":\"Cornflower Lilac\",\"FFAE42\":\"Yellow Orange\",\"FFAB81\":\"Hit Pink\",\"FFA6C9\":\"Carnation Pink\",\"FFA194\":\"Mona Lisa\",\"FFA000\":\"Orange Peel\",\"FF9E2C\":\"Sunshade\",\"FF9980\":\"Vivid Tangerine\",\"FF9966\":\"Atomic Tangerine\",\"FF9933\":\"Neon Carrot\",\"FF91A4\":\"Pink Salmon\",\"FF910F\":\"West Side\",\"FF9000\":\"Pizazz\",\"FF7F00\":\"Flush Orange\",\"FF7D07\":\"Flamenco\",\"FF7518\":\"Pumpkin\",\"FF7034\":\"Burning Orange\",\"FF6FFF\":\"Blush Pink\",\"FF6B53\":\"Persimmon\",\"FF681F\":\"Orange\",\"FF66FF\":\"Pink Flamingo\",\"FF6600\":\"Blaze Orange\",\"FF6037\":\"Outrageous Orange\",\"FF4F00\":\"International Orange\",\"FF4D00\":\"Vermilion\",\"FF4040\":\"Coral Red\",\"FF3F34\":\"Red Orange\",\"FF355E\":\"Radical Red\",\"FF33CC\":\"Razzle Dazzle Rose\",\"FF3399\":\"Wild Strawberry\",\"FF2400\":\"Scarlet\",\"FF00CC\":\"Purple Pizzazz\",\"FF007F\":\"Rose\",\"FEFCED\":\"Orange White\",\"FEF9E3\":\"Off Yellow\",\"FEF8FF\":\"White Pointer\",\"FEF8E2\":\"Solitaire\",\"FEF7DE\":\"Half Dutch White\",\"FEF5F1\":\"Provincial Pink\",\"FEF4F8\":\"Wisp Pink\",\"FEF4DB\":\"Half Spanish White\",\"FEF4CC\":\"Pipi\",\"FEF3D8\":\"Bleach White\",\"FEF2C7\":\"Beeswax\",\"FEF0EC\":\"Bridesmaid\",\"FEEFCE\":\"Oasis\",\"FEEBF3\":\"Remy\",\"FEE5AC\":\"Cape Honey\",\"FEDB8D\":\"Salomie\",\"FED85D\":\"Dandelion\",\"FED33C\":\"Bright Sun\",\"FEBAAD\":\"Melon\",\"FEA904\":\"Yellow Sea\",\"FE9D04\":\"California\",\"FE6F5E\":\"Bittersweet\",\"FE4C40\":\"Sunset Orange\",\"FE28A2\":\"Persian Rose\",\"FDFFD5\":\"Cumulus\",\"FDFEB8\":\"Pale Prim\",\"FDF7AD\":\"Drover\",\"FDF6D3\":\"Half Colonial White\",\"FDE910\":\"Lemon\",\"FDE295\":\"Golden Glow\",\"FDE1DC\":\"Cinderella\",\"FDD7E4\":\"Pig Pink\",\"FDD5B1\":\"Light Apricot\",\"FD9FA2\":\"Sweet Pink\",\"FD7C07\":\"Sorbus\",\"FD7B33\":\"Crusta\",\"FD5B78\":\"Wild Watermelon\",\"FD0E35\":\"Torch Red\",\"FCFFF9\":\"Ceramic\",\"FCFFE7\":\"China Ivory\",\"FCFEDA\":\"Moon Glow\",\"FCFBF3\":\"Bianca\",\"FCF8F7\":\"Vista White\",\"FCF4DC\":\"Pearl Lusta\",\"FCF4D0\":\"Double Pearl Lusta\",\"FCDA98\":\"Cherokee\",\"FCD917\":\"Candlelight\",\"FCC01E\":\"Lightning Yellow\",\"FC9C1D\":\"Tree Poppy\",\"FC80A5\":\"Tickle Me Pink\",\"FC0FC0\":\"Shocking Pink\",\"FBFFBA\":\"Shalimar\",\"FBF9F9\":\"Hint of Red\",\"FBEC5D\":\"Candy Corn\",\"FBEA8C\":\"Sweet Corn\",\"FBE96C\":\"Festival\",\"FBE870\":\"Marigold Yellow\",\"FBE7B2\":\"Banana Mania\",\"FBCEB1\":\"Apricot Peach\",\"FBCCE7\":\"Classic Rose\",\"FBBEDA\":\"Cupid\",\"FBB2A3\":\"Rose Bud\",\"FBAED2\":\"Lavender Pink\",\"FBAC13\":\"Sun\",\"FBA129\":\"Sea Buckthorn\",\"FBA0E3\":\"Lavender Rose\",\"FB8989\":\"Geraldine\",\"FB607F\":\"Brink Pink\",\"FAFFA4\":\"Milan\",\"FAFDE4\":\"Hint of Yellow\",\"FAFAFA\":\"Alabaster\",\"FAF7D6\":\"Citrine White\",\"FAF3F0\":\"Fantasy\",\"FAECCC\":\"Champagne\",\"FAEAB9\":\"Astra\",\"FAE600\":\"Turbo\",\"FADFAD\":\"Peach Yellow\",\"FAD3A2\":\"Corvette\",\"FA9D5A\":\"Tan Hide\",\"FA7814\":\"Ecstasy\",\"F9FFF6\":\"Sugar Cane\",\"F9FF8B\":\"Dolly\",\"F9F8E4\":\"Rum Swizzle\",\"F9EAF3\":\"Amour\",\"F9E663\":\"Portica\",\"F9E4BC\":\"Dairy Cream\",\"F9E0ED\":\"Carousel Pink\",\"F9BF58\":\"Saffron Mango\",\"F95A61\":\"Carnation\",\"F8FDD3\":\"Mimosa\",\"F8FACD\":\"Corn Field\",\"F8F99C\":\"Texas\",\"F8F8F7\":\"Desert Storm\",\"F8F7FC\":\"White Lilac\",\"F8F7DC\":\"Coconut Cream\",\"F8F6F1\":\"Spring Wood\",\"F8F4FF\":\"Magnolia\",\"F8F0E8\":\"White Linen\",\"F8E4BF\":\"Givry\",\"F8DD5C\":\"Energy Yellow\",\"F8DB9D\":\"Marzipan\",\"F8D9E9\":\"Cherub\",\"F8C3DF\":\"Chantilly\",\"F8B853\":\"Casablanca\",\"F7FAF7\":\"Snow Drift\",\"F7F5FA\":\"Whisper\",\"F7F2E1\":\"Quarter Spanish White\",\"F7DBE6\":\"We Peep\",\"F7C8DA\":\"Azalea\",\"F7B668\":\"Rajah\",\"F77FBE\":\"Persian Pink\",\"F77703\":\"Chilean Fire\",\"F7468A\":\"Violet Red\",\"F6FFDC\":\"Spring Sun\",\"F6F7F7\":\"Black Haze\",\"F6F0E6\":\"Merino\",\"F6A4C9\":\"Illusion\",\"F653A6\":\"Brilliant Rose\",\"F64A8A\":\"French Rose\",\"F5FFBE\":\"Australian Mint\",\"F5FB3D\":\"Golden Fizz\",\"F5F3E5\":\"Ecru White\",\"F5EDEF\":\"Soft Peach\",\"F5E9D3\":\"Albescent White\",\"F5E7E2\":\"Pot Pourri\",\"F5E7A2\":\"Sandwisp\",\"F5D5A0\":\"Maize\",\"F5C999\":\"Manhattan\",\"F5C85C\":\"Cream Can\",\"F57584\":\"Froly\",\"F4F8FF\":\"Zircon\",\"F4F4F4\":\"Wild Sand\",\"F4F2EE\":\"Pampas\",\"F4EBD3\":\"Janna\",\"F4D81C\":\"Ripe Lemon\",\"F4C430\":\"Saffron\",\"F400A1\":\"Hollywood Cerise\",\"F3FFD8\":\"Carla\",\"F3FBD4\":\"Orinoco\",\"F3FB62\":\"Canary\",\"F3EDCF\":\"Wheatfield\",\"F3E9E5\":\"Dawn Pink\",\"F3E7BB\":\"Sidecar\",\"F3D9DF\":\"Vanilla Ice\",\"F3D69D\":\"New Orleans\",\"F3AD16\":\"Buttercup\",\"F34723\":\"Pomegranate\",\"F2FAFA\":\"Black Squeeze\",\"F2F2F2\":\"Concrete\",\"F2C3B2\":\"Mandys Pink\",\"F28500\":\"Tangerine\",\"F2552A\":\"Flamingo\",\"F1FFC8\":\"Chiffon\",\"F1FFAD\":\"Tidal\",\"F1F7F2\":\"Saltpan\",\"F1F1F1\":\"Seashell\",\"F1EEC1\":\"Mint Julep\",\"F1E9FF\":\"Blue Chalk\",\"F1E9D2\":\"Parchment\",\"F1E788\":\"Sahara Sand\",\"F19BAB\":\"Wewak\",\"F18200\":\"Gold Drop\",\"F0FCEA\":\"Feta\",\"F0EEFF\":\"Titan White\",\"F0EEFD\":\"Selago\",\"F0E2EC\":\"Prim\",\"F0DC82\":\"Buff\",\"F0DB7D\":\"Golden Sand\",\"F0D52D\":\"Golden Dream\",\"F091A9\":\"Mauvelous\",\"EFF2F3\":\"Porcelain\",\"EFEFEF\":\"Gallery\",\"EF863F\":\"Jaffa\",\"EEFFE2\":\"Rice Flower\",\"EEFF9A\":\"Jonquil\",\"EEFDFF\":\"Twilight Blue\",\"EEF6F7\":\"Catskill White\",\"EEF4DE\":\"Loafer\",\"EEF3C3\":\"Tusk\",\"EEF0F3\":\"Athens Gray\",\"EEF0C8\":\"Tahuna Sands\",\"EEEF78\":\"Manz\",\"EEEEE8\":\"Cararra\",\"EEE3AD\":\"Double Colonial White\",\"EEDEDA\":\"Bizarre\",\"EEDC82\":\"Flax\",\"EED9C4\":\"Almond\",\"EED794\":\"Chalky\",\"EEC1BE\":\"Beauty Bush\",\"EDFC84\":\"Honeysuckle\",\"EDF9F1\":\"Narvik\",\"EDF6FF\":\"Zumthor\",\"EDF5F5\":\"Aqua Haze\",\"EDF5DD\":\"Frost\",\"EDEA99\":\"Primrose\",\"EDDCB1\":\"Chamois\",\"EDCDAB\":\"Pancho\",\"EDC9AF\":\"Desert Sand\",\"EDB381\":\"Tacao\",\"ED989E\":\"Sea Pink\",\"ED9121\":\"Carrot Orange\",\"ED7A1C\":\"Tango\",\"ED0A3F\":\"Red Ribbon\",\"ECF245\":\"Starship\",\"ECEBCE\":\"Aths Special\",\"ECEBBD\":\"Fall Green\",\"ECE090\":\"Wild Rice\",\"ECCDB9\":\"Just Right\",\"ECC7EE\":\"French Lilac\",\"ECC54E\":\"Ronchi\",\"ECA927\":\"Fuel Yellow\",\"EBC2AF\":\"Zinnwaldite\",\"EB9373\":\"Apricot\",\"EAFFFE\":\"Dew\",\"EAF9F5\":\"Aqua Spring\",\"EAF6FF\":\"Solitude\",\"EAF6EE\":\"Panache\",\"EAE8D4\":\"White Rock\",\"EADAB8\":\"Raffia\",\"EAC674\":\"Rob Roy\",\"EAB33B\":\"Tulip Tree\",\"EAAE69\":\"Porsche\",\"EA88A8\":\"Carissma\",\"E9FFFD\":\"Clear Day\",\"E9F8ED\":\"Ottoman\",\"E9E3E3\":\"Ebb\",\"E9D75A\":\"Confetti\",\"E9CECD\":\"Oyster Pink\",\"E97C07\":\"Tahiti Gold\",\"E97451\":\"Burnt Sienna\",\"E96E00\":\"Clementine\",\"E8F5F2\":\"Aqua Squeeze\",\"E8F2EB\":\"Gin\",\"E8F1D4\":\"Chrome White\",\"E8EBE0\":\"Green White\",\"E8E0D5\":\"Pearl Bush\",\"E8B9B3\":\"Shilo\",\"E89928\":\"Fire Bush\",\"E7FEFF\":\"Bubbles\",\"E7F8FF\":\"Lily White\",\"E7ECE6\":\"Gray Nurse\",\"E7CD8C\":\"Putty\",\"E7BF05\":\"Corn\",\"E7BCB4\":\"Rose Fog\",\"E79FC4\":\"Kobi\",\"E79F8C\":\"Tonys Pink\",\"E7730A\":\"Christine\",\"E77200\":\"Mango Tango\",\"E6FFFF\":\"Tranquil\",\"E6FFE9\":\"Hint of Green\",\"E6F8F3\":\"Off Green\",\"E6F2EA\":\"Harp\",\"E6E4D4\":\"Satin Linen\",\"E6D7B9\":\"Double Spanish White\",\"E6BEA5\":\"Cashmere\",\"E6BE8A\":\"Gold Sand\",\"E64E03\":\"Trinidad\",\"E5F9F6\":\"Polar\",\"E5E5E5\":\"Mercury\",\"E5E0E1\":\"Bon Jour\",\"E5D8AF\":\"Hampton\",\"E5D7BD\":\"Stark White\",\"E5CCC9\":\"Dust Storm\",\"E5841B\":\"Zest\",\"E52B50\":\"Amaranth\",\"E4FFD1\":\"Snow Flurry\",\"E4F6E7\":\"Frostee\",\"E4D69B\":\"Zombie\",\"E4D5B7\":\"Grain Brown\",\"E4D422\":\"Sunflower\",\"E4D1C0\":\"Bone\",\"E4CFDE\":\"Twilight\",\"E4C2D5\":\"Melanie\",\"E49B0F\":\"Gamboge\",\"E47698\":\"Deep Blush\",\"E3F988\":\"Mindaro\",\"E3F5E1\":\"Peppermint\",\"E3BEBE\":\"Cavern Pink\",\"E34234\":\"Cinnabar\",\"E32636\":\"Alizarin Crimson\",\"E30B5C\":\"Razzmatazz\",\"E2F3EC\":\"Apple Green\",\"E2EBED\":\"Mystic\",\"E2D8ED\":\"Snuff\",\"E29CD2\":\"Light Orchid\",\"E29418\":\"Dixie\",\"E292C0\":\"Shocking\",\"E28913\":\"Golden Bell\",\"E2725B\":\"Terracotta\",\"E25465\":\"Mandy\",\"E1F6E8\":\"Tara\",\"E1EAD4\":\"Kidnapper\",\"E1E6D6\":\"Periglacial Blue\",\"E1C0C8\":\"Pink Flare\",\"E1BC64\":\"Equator\",\"E16865\":\"Sunglo\",\"E0C095\":\"Calico\",\"E0B974\":\"Harvest Gold\",\"E0B646\":\"Anzac\",\"E0B0FF\":\"Mauve\",\"DFFF00\":\"Chartreuse Yellow\",\"DFECDA\":\"Willow Brook\",\"DFCFDB\":\"Lola\",\"DFCD6F\":\"Chenin\",\"DFBE6F\":\"Apache\",\"DF73FF\":\"Heliotrope\",\"DEF5FF\":\"Pattens Blue\",\"DEE5C0\":\"Beryl Green\",\"DED717\":\"Barberry\",\"DED4A4\":\"Sapling\",\"DECBC6\":\"Wafer\",\"DEC196\":\"Brandy\",\"DEBA13\":\"Gold Tips\",\"DEA681\":\"Tumbleweed\",\"DE6360\":\"Roman\",\"DE3163\":\"Cerise Red\",\"DDF9F1\":\"White Ice\",\"DDD6D5\":\"Swiss Coffee\",\"DCF0EA\":\"Swans Down\",\"DCEDB4\":\"Caper\",\"DCDDCC\":\"Moon Mist\",\"DCD9D2\":\"Westar\",\"DCD747\":\"Wattle\",\"DCB4BC\":\"Blossom\",\"DCB20C\":\"Galliano\",\"DC4333\":\"Punch\",\"DBFFF8\":\"Frosted Mint\",\"DBDBDB\":\"Alto\",\"DB995E\":\"Di Serria\",\"DB9690\":\"Petite Orchid\",\"DB5079\":\"Cranberry\",\"DAFAFF\":\"Oyster Bay\",\"DAF4F0\":\"Iceberg\",\"DAECD6\":\"Zanah\",\"DA8A67\":\"Copperfield\",\"DA6A41\":\"Red Damask\",\"DA6304\":\"Bamboo\",\"DA5B38\":\"Flame Pea\",\"DA3287\":\"Cerise\",\"D9F7FF\":\"Mabel\",\"D9E4F5\":\"Link Water\",\"D9DCC1\":\"Tana\",\"D9D6CF\":\"Timberwolf\",\"D9B99B\":\"Cameo\",\"D99376\":\"Burning Sand\",\"D94972\":\"Cabaret\",\"D8FCFA\":\"Foam\",\"D8C2D5\":\"Maverick\",\"D87C63\":\"Japonica\",\"D84437\":\"Valencia\",\"D7D0FF\":\"Fog\",\"D7C498\":\"Pavlova\",\"D7837F\":\"New York Pink\",\"D6FFDB\":\"Snowy Mint\",\"D6D6D1\":\"Quill Gray\",\"D6CEF6\":\"Moon Raker\",\"D6C562\":\"Tacha\",\"D69188\":\"My Pink\",\"D5F6E3\":\"Granny Apple\",\"D5D195\":\"Winter Hazel\",\"D59A6F\":\"Whiskey\",\"D591A4\":\"Can Can\",\"D54600\":\"Grenadier\",\"D4E2FC\":\"Hawkes Blue\",\"D4DFE2\":\"Geyser\",\"D4D7D9\":\"Iron\",\"D4CD16\":\"Bird Flower\",\"D4C4A8\":\"Akaroa\",\"D4BF8D\":\"Straw\",\"D4B6AF\":\"Clam Shell\",\"D47494\":\"Charm\",\"D3CDC5\":\"Swirl\",\"D3CBBA\":\"Sisal\",\"D2F8B0\":\"Gossip\",\"D2F6DE\":\"Blue Romance\",\"D2DA97\":\"Deco\",\"D29EAA\":\"Careys Pink\",\"D27D46\":\"Raw Sienna\",\"D1E231\":\"Pear\",\"D1D2DD\":\"Mischka\",\"D1D2CA\":\"Celeste\",\"D1C6B4\":\"Soft Amber\",\"D1BEA8\":\"Vanilla\",\"D18F1B\":\"Geebung\",\"D0F0C0\":\"Tea Green\",\"D0C0E5\":\"Prelude\",\"D0BEF8\":\"Perfume\",\"D07D12\":\"Meteor\",\"D06DA1\":\"Hopbush\",\"D05F04\":\"Red Stage\",\"CFFAF4\":\"Scandal\",\"CFF9F3\":\"Humming Bird\",\"CFE5D2\":\"Surf Crest\",\"CFDCCF\":\"Tasman\",\"CFB53B\":\"Old Gold\",\"CFA39D\":\"Eunry\",\"CEC7A7\":\"Chino\",\"CEC291\":\"Yuma\",\"CEBABA\":\"Cold Turkey\",\"CEB98F\":\"Sorrell Brown\",\"CDF4FF\":\"Onahau\",\"CD8429\":\"Brandy Punch\",\"CD5700\":\"Tenn\",\"CCFF00\":\"Electric Lime\",\"CCCCFF\":\"Periwinkle\",\"CCCAA8\":\"Thistle Green\",\"CC8899\":\"Puce\",\"CC7722\":\"Ochre\",\"CC5500\":\"Burnt Orange\",\"CC3333\":\"Persian Red\",\"CBDBD6\":\"Nebula\",\"CBD3B0\":\"Green Mist\",\"CBCAB6\":\"Foggy Gray\",\"CB8FA9\":\"Viola\",\"CAE6DA\":\"Skeptic\",\"CAE00D\":\"Bitter Lemon\",\"CADCD4\":\"Paris White\",\"CABB48\":\"Turmeric\",\"CA3435\":\"Flush Mahogany\",\"C9FFE5\":\"Aero Blue\",\"C9FFA2\":\"Reef\",\"C9D9D2\":\"Conch\",\"C9C0BB\":\"Silver Rust\",\"C9B93B\":\"Earls Green\",\"C9B35B\":\"Sundance\",\"C9B29B\":\"Rodeo Dust\",\"C9A0DC\":\"Light Wisteria\",\"C99415\":\"Pizza\",\"C96323\":\"Piper\",\"C8E3D7\":\"Edgewater\",\"C8B568\":\"Laser\",\"C8AABF\":\"Lily\",\"C8A528\":\"Hokey Pokey\",\"C8A2C8\":\"Lilac\",\"C88A65\":\"Antique Brass\",\"C7DDE5\":\"Botticelli\",\"C7CD90\":\"Pine Glade\",\"C7C9D5\":\"Ghost\",\"C7C4BF\":\"Cloud\",\"C7C1FF\":\"Melrose\",\"C7BCA2\":\"Coral Reef\",\"C7031E\":\"Monza\",\"C6E610\":\"Las Palmas\",\"C6C8BD\":\"Kangaroo\",\"C6C3B5\":\"Ash\",\"C6A84B\":\"Roti\",\"C69191\":\"Oriental Pink\",\"C6726B\":\"Contessa\",\"C62D42\":\"Brick Red\",\"C5E17A\":\"Yellow Green\",\"C5DBCA\":\"Sea Mist\",\"C5994B\":\"Tussock\",\"C59922\":\"Nugget\",\"C54B8C\":\"Mulberry\",\"C4F4EB\":\"Mint Tulip\",\"C4D0B0\":\"Coriander\",\"C4C4BC\":\"Mist Gray\",\"C45719\":\"Orange Roughy\",\"C45655\":\"Fuzzy Wuzzy Brown\",\"C41E3A\":\"Cardinal\",\"C3DDF9\":\"Tropical Blue\",\"C3D1D1\":\"Tiara\",\"C3CDE6\":\"Periwinkle Gray\",\"C3C3BD\":\"Gray Nickel\",\"C3BFC1\":\"Pale Slate\",\"C3B091\":\"Indian Khaki\",\"C32148\":\"Maroon Flush\",\"C2E8E5\":\"Jagged Ice\",\"C2CAC4\":\"Pumice\",\"C2BDB6\":\"Cotton Seed\",\"C2955D\":\"Twine\",\"C26B03\":\"Indochine\",\"C1F07C\":\"Sulu\",\"C1D7B0\":\"Sprout\",\"C1BECD\":\"Gray Suit\",\"C1BAB0\":\"Tea\",\"C1B7A4\":\"Bison Hide\",\"C1A004\":\"Buddha Gold\",\"C154C1\":\"Fuchsia Pink\",\"C1440E\":\"Tia Maria\",\"C0D8B6\":\"Pixie Green\",\"C0D3B9\":\"Pale Leaf\",\"C08081\":\"Old Rose\",\"C04737\":\"Mojo\",\"C02B18\":\"Thunderbird\",\"BFDBE2\":\"Ziggurat\",\"BFC921\":\"Key Lime Pie\",\"BFC1C2\":\"Silver Sand\",\"BFBED8\":\"Blue Haze\",\"BFB8B0\":\"Tide\",\"BF5500\":\"Rose of Sharon\",\"BEDE0D\":\"Fuego\",\"BEB5B7\":\"Pink Swan\",\"BEA6C3\":\"London Hue\",\"BDEDFD\":\"French Pass\",\"BDC9CE\":\"Loblolly\",\"BDC8B3\":\"Clay Ash\",\"BDBDC6\":\"French Gray\",\"BDBBD7\":\"Lavender Gray\",\"BDB3C7\":\"Chatelle\",\"BDB2A1\":\"Malta\",\"BDB1A8\":\"Silk\",\"BD978E\":\"Quicksand\",\"BD5E2E\":\"Tuscany\",\"BCC9C2\":\"Powder Ash\",\"BBD7C1\":\"Surf\",\"BBD009\":\"Rio Grande\",\"BB8983\":\"Brandy Rose\",\"BB3385\":\"Medium Red Violet\",\"BAEEF9\":\"Charlotte\",\"BAC7C9\":\"Submarine\",\"BAB1A2\":\"Nomad\",\"BA7F03\":\"Pirate Gold\",\"BA6F1E\":\"Bourbon\",\"BA450C\":\"Rock Spray\",\"BA0101\":\"Guardsman Red\",\"B9C8AC\":\"Rainee\",\"B9C46A\":\"Wild Willow\",\"B98D28\":\"Marigold\",\"B95140\":\"Crail\",\"B94E48\":\"Chestnut\",\"B8E0F9\":\"Sail\",\"B8C25D\":\"Celery\",\"B8C1B1\":\"Green Spring\",\"B8B56A\":\"Gimblet\",\"B87333\":\"Copper\",\"B81104\":\"Milano Red\",\"B7F0BE\":\"Madang\",\"B7C3D0\":\"Heather\",\"B7B1B1\":\"Nobel\",\"B7A458\":\"Husk\",\"B7A214\":\"Sahara\",\"B78E5C\":\"Muddy Waters\",\"B7410E\":\"Rust\",\"B6D3BF\":\"Gum Leaf\",\"B6D1EA\":\"Spindle\",\"B6BAA4\":\"Eagle\",\"B6B095\":\"Heathered Gray\",\"B69D98\":\"Thatch\",\"B6316C\":\"Hibiscus\",\"B5ECDF\":\"Cruise\",\"B5D2CE\":\"Jet Stream\",\"B5B35C\":\"Olive Green\",\"B5A27F\":\"Mongoose\",\"B57281\":\"Turkish Rose\",\"B4CFD3\":\"Jungle Mist\",\"B44668\":\"Blush\",\"B43332\":\"Well Read\",\"B3C110\":\"La Rioja\",\"B3AF95\":\"Taupe Gray\",\"B38007\":\"Hot Toddy\",\"B35213\":\"Fiery Orange\",\"B32D29\":\"Tall Poppy\",\"B2A1EA\":\"Biloba Flower\",\"B20931\":\"Shiraz\",\"B1F4E7\":\"Ice Cold\",\"B1E2C1\":\"Fringy Flower\",\"B19461\":\"Teak\",\"B16D52\":\"Santa Fe\",\"B1610B\":\"Pumpkin Skin\",\"B14A0B\":\"Vesuvius\",\"B10000\":\"Bright Red\",\"B0E313\":\"Inch Worm\",\"B09A95\":\"Del Rio\",\"B06608\":\"Mai Tai\",\"B05E81\":\"Tapestry\",\"B05D54\":\"Matrix\",\"B04C6A\":\"Cadillac\",\"AFBDD9\":\"Pigeon Post\",\"AFB1B8\":\"Bombay\",\"AFA09E\":\"Martini\",\"AF9F1C\":\"Lucky\",\"AF8F2C\":\"Alpine\",\"AF8751\":\"Driftwood\",\"AF593E\":\"Brown Rust\",\"AF4D43\":\"Apple Blossom\",\"AF4035\":\"Medium Carmine\",\"AE809E\":\"Bouquet\",\"AE6020\":\"Desert\",\"AE4560\":\"Hippie Pink\",\"ADE6C4\":\"Padua\",\"ADDFAD\":\"Moss Green\",\"ADBED1\":\"Casper\",\"AD781B\":\"Mandalay\",\"ACE1AF\":\"Celadon\",\"ACDD4D\":\"Conifer\",\"ACCBB1\":\"Spring Rain\",\"ACB78E\":\"Swamp Green\",\"ACACAC\":\"Silver Chalice\",\"ACA59F\":\"Cloudy\",\"ACA586\":\"Hillary\",\"ACA494\":\"Napa\",\"AC9E22\":\"Lemon Ginger\",\"AC91CE\":\"East Side\",\"AC8A56\":\"Limed Oak\",\"ABA196\":\"Bronco\",\"ABA0D9\":\"Cold Purple\",\"AB917A\":\"Sandrift\",\"AB3472\":\"Royal Heath\",\"AB0563\":\"Lipstick\",\"AAF0D1\":\"Magic Mint\",\"AAD6E6\":\"Regent St Blue\",\"AAABB7\":\"Spun Pearl\",\"AAA9CD\":\"Logan\",\"AAA5A9\":\"Shady Lady\",\"AA8D6F\":\"Sandal\",\"AA8B5B\":\"Muesli\",\"AA4203\":\"Fire\",\"AA375A\":\"Night Shadz\",\"A9C6C2\":\"Opal\",\"A9BEF2\":\"Perano\",\"A9BDBF\":\"Tower Gray\",\"A9B497\":\"Schist\",\"A9ACB6\":\"Aluminium\",\"A9A491\":\"Gray Olive\",\"A8E3BD\":\"Chinook\",\"A8BD9F\":\"Norway\",\"A8AF8E\":\"Locust\",\"A8AE9C\":\"Bud\",\"A8A589\":\"Tallow\",\"A899E6\":\"Dull Lavender\",\"A8989B\":\"Dusty Gray\",\"A86B6B\":\"Coral Tree\",\"A86515\":\"Reno Sand\",\"A85307\":\"Rich Gold\",\"A7882C\":\"Luxor Gold\",\"A72525\":\"Mexican Red\",\"A6A29A\":\"Dawn\",\"A69279\":\"Donkey Brown\",\"A68B5B\":\"Barley Corn\",\"A65529\":\"Paarl\",\"A62F20\":\"Roof Terracotta\",\"A5CB0C\":\"Bahia\",\"A59B91\":\"Zorba\",\"A50B5E\":\"Jazzberry Jam\",\"A4AF6E\":\"Green Smoke\",\"A4A6D3\":\"Wistful\",\"A4A49D\":\"Delta\",\"A3E3ED\":\"Blizzard Blue\",\"A397B4\":\"Amethyst Smoke\",\"A3807B\":\"Pharlap\",\"A2AEAB\":\"Edward\",\"A2AAB3\":\"Gray Chateau\",\"A26645\":\"Cape Palliser\",\"A23B6C\":\"Rouge\",\"A2006D\":\"Flirt\",\"A1E9DE\":\"Water Leaf\",\"A1DAD7\":\"Aqua Island\",\"A1C50A\":\"Citrus\",\"A1ADB5\":\"Hit Gray\",\"A1750D\":\"Buttered Rum\",\"A02712\":\"Tabasco\",\"9FDD8C\":\"Feijoa\",\"9FD7D3\":\"Sinbad\",\"9FA0B1\":\"Santas Gray\",\"9F9F9C\":\"Star Dust\",\"9F821C\":\"Reef Gold\",\"9F381D\":\"Cognac\",\"9EDEE0\":\"Morning Glory\",\"9EB1CD\":\"Rock Blue\",\"9EA91F\":\"Citron\",\"9EA587\":\"Sage\",\"9E5B40\":\"Sepia Skin\",\"9E5302\":\"Chelsea Gem\",\"9DE5FF\":\"Anakiwa\",\"9DE093\":\"Granny Smith Apple\",\"9DC209\":\"Pistachio\",\"9DACB7\":\"Gull Gray\",\"9D5616\":\"Hawaiian Tan\",\"9C3336\":\"Stiletto\",\"9B9E8F\":\"Lemon Grass\",\"9B4703\":\"Oregon\",\"9AC2B8\":\"Shadow Green\",\"9AB973\":\"Olivine\",\"9A9577\":\"Gurkha\",\"9A6E61\":\"Toast\",\"9A3820\":\"Prairie Sand\",\"9999CC\":\"Blue Bell\",\"997A8D\":\"Mountbatten Pink\",\"9966CC\":\"Amethyst\",\"991B07\":\"Totem Pole\",\"98FF98\":\"Mint Green\",\"988D77\":\"Pale Oyster\",\"98811B\":\"Hacienda\",\"98777B\":\"Bazaar\",\"9874D3\":\"Lilac Bush\",\"983D61\":\"Vin Rouge\",\"97CD2D\":\"Atlantis\",\"9771B5\":\"Wisteria\",\"97605D\":\"Au Chico\",\"96BBAB\":\"Summer Green\",\"96A8A1\":\"Pewter\",\"967BB6\":\"Lavender Purple\",\"9678B6\":\"Purple Mountain\\'s Majesty \",\"93DFB8\":\"Algae Green\",\"93CCEA\":\"Cornflower\",\"926F5B\":\"Beaver\",\"92000A\":\"Sangria\",\"908D39\":\"Sycamore\",\"907B71\":\"Almond Frost\",\"901E1E\":\"Old Brick\",\"8FD6B4\":\"Vista Blue\",\"8F8176\":\"Squirrel\",\"8F4B0E\":\"Korma\",\"8F3E33\":\"El Salva\",\"8F021C\":\"Pohutukawa\",\"8EABC1\":\"Nepal\",\"8E8190\":\"Mamba\",\"8E775E\":\"Domino\",\"8E6F70\":\"Opium\",\"8E4D1E\":\"Rope\",\"8E0000\":\"Red Berry\",\"8DA8CC\":\"Polo Blue\",\"8D90A1\":\"Manatee\",\"8D8974\":\"Granite Green\",\"8D7662\":\"Cement\",\"8D3F3F\":\"Tosca\",\"8D3D38\":\"Sanguine Brown\",\"8D0226\":\"Paprika\",\"8C6495\":\"Trendy Pink\",\"8C5738\":\"Potters Clay\",\"8C472F\":\"Mule Fawn\",\"8C055E\":\"Cardinal Pink\",\"8BE6D8\":\"Riptide\",\"8BA9A5\":\"Cascade\",\"8BA690\":\"Envy\",\"8B9FEE\":\"Portage\",\"8B9C90\":\"Mantle\",\"8B8680\":\"Natural Gray\",\"8B847E\":\"Schooner\",\"8B8470\":\"Olive Haze\",\"8B6B0B\":\"Corn Harvest\",\"8B0723\":\"Monarch\",\"8B00FF\":\"Electric Violet\",\"8AB9F1\":\"Jordy Blue\",\"8A8F8A\":\"Stack\",\"8A8389\":\"Monsoon\",\"8A8360\":\"Clay Creek\",\"8A73D6\":\"True V\",\"8A3324\":\"Burnt Umber\",\"897D6D\":\"Makara\",\"888D65\":\"Avocado\",\"87AB39\":\"Sushi\",\"878D91\":\"Oslo Gray\",\"877C7B\":\"Hurricane\",\"87756E\":\"Americano\",\"86949F\":\"Regent Gray\",\"86560A\":\"Rusty Nail\",\"864D1E\":\"Bull Shot\",\"86483C\":\"Ironstone\",\"863C3C\":\"Lotus\",\"85C4CC\":\"Half Baked\",\"859FAF\":\"Bali Hai\",\"8581D9\":\"Chetwode Blue\",\"84A0A0\":\"Granny Smith\",\"83D0C6\":\"Monte Carlo\",\"83AA5D\":\"Chelsea Cucumber\",\"828F72\":\"Battleship Gray\",\"826F65\":\"Sand Dune\",\"816E71\":\"Spicy Pink\",\"81422C\":\"Nutmeg\",\"80CCEA\":\"Seagull\",\"80B3C4\":\"Glacier\",\"80B3AE\":\"Gulf Stream\",\"807E79\":\"Friar Gray\",\"80461B\":\"Russet\",\"80341F\":\"Red Robin\",\"800B47\":\"Rose Bud Cherry\",\"7F76D3\":\"Moody Blue\",\"7F7589\":\"Mobster\",\"7F626D\":\"Falcon\",\"7F3A02\":\"Peru Tan\",\"7F1734\":\"Claret\",\"7E3A15\":\"Copper Canyon\",\"7DD8C6\":\"Bermuda\",\"7DC8F7\":\"Malibu\",\"7DA98D\":\"Bay Leaf\",\"7D2C14\":\"Pueblo\",\"7CB7BB\":\"Neptune\",\"7CB0A1\":\"Acapulco\",\"7CA1A6\":\"Gumbo\",\"7C881A\":\"Trendy Green\",\"7C7B82\":\"Jumbo\",\"7C7B7A\":\"Concord\",\"7C778A\":\"Topaz\",\"7C7631\":\"Pesto\",\"7C1C05\":\"Kenyan Copper\",\"7BA05B\":\"Asparagus\",\"7B9F80\":\"Amulet\",\"7B8265\":\"Flax Smoke\",\"7B7C94\":\"Waterloo \",\"7B7874\":\"Tapa\",\"7B6608\":\"Yukon Gold\",\"7B3F00\":\"Cinnamon\",\"7B3801\":\"Red Beech\",\"7AC488\":\"De York\",\"7A89B8\":\"Wild Blue Yonder\",\"7A7A7A\":\"Boulder\",\"7A58C1\":\"Fuchsia Blue\",\"7A013A\":\"Siren\",\"79DEEC\":\"Spray\",\"796D62\":\"Sandstone\",\"796A78\":\"Fedora\",\"795D4C\":\"Roman Coffee\",\"78A39C\":\"Sea Nymph\",\"788BBA\":\"Ship Cove\",\"788A25\":\"Wasabi\",\"78866B\":\"Camouflage Green\",\"782F16\":\"Peanut\",\"782D19\":\"Mocha\",\"77DD77\":\"Pastel Green\",\"779E86\":\"Oxley\",\"776F61\":\"Pablo\",\"773F1A\":\"Walnut\",\"771F1F\":\"Crown of Thorns\",\"770F05\":\"Dark Burgundy\",\"76BD17\":\"Lima\",\"7666C6\":\"Blue Marguerite\",\"76395D\":\"Cosmic\",\"7563A8\":\"Deluge\",\"755A57\":\"Russett\",\"74C365\":\"Mantis\",\"747D83\":\"Rolling Stone\",\"747D63\":\"Limed Ash\",\"74640D\":\"Spicy Mustard\",\"736D58\":\"Crocodile\",\"736C9F\":\"Kimberly\",\"734A12\":\"Raw Umber\",\"731E8F\":\"Seance\",\"727B89\":\"Raven\",\"726D4E\":\"Go Ben\",\"724A2F\":\"Old Copper\",\"72010F\":\"Venetian Red\",\"71D9E2\":\"Aquamarine Blue\",\"716E10\":\"Olivetone\",\"716B56\":\"Peat\",\"715D47\":\"Tobacco Brown\",\"714AB2\":\"Studio\",\"71291D\":\"Metallic Copper\",\"711A00\":\"Cedar Wood Finish\",\"704F50\":\"Ferra\",\"704A07\":\"Antique Bronze\",\"701C1C\":\"Persian Plum\",\"6FD0C5\":\"Downy\",\"6F9D02\":\"Limeade\",\"6F8E63\":\"Highland\",\"6F6A61\":\"Flint\",\"6F440C\":\"Cafe Royale\",\"6E7783\":\"Pale Sky\",\"6E6D57\":\"Kokoda\",\"6E4B26\":\"Dallas\",\"6E4826\":\"Pickled Bean\",\"6E1D14\":\"Moccaccino\",\"6E0902\":\"Red Oxide\",\"6D92A1\":\"Gothic\",\"6D9292\":\"Juniper\",\"6D6C6C\":\"Dove Gray\",\"6D5E54\":\"Pine Cone\",\"6D0101\":\"Lonestar\",\"6CDAE7\":\"Turquoise Blue\",\"6C3082\":\"Eminence\",\"6B8BA2\":\"Bermuda Gray\",\"6B5755\":\"Dorado\",\"6B4E31\":\"Shingle Fawn\",\"6B3FA0\":\"Royal Purple\",\"6B2A14\":\"Hairy Heath\",\"6A6051\":\"Soya Bean\",\"6A5D1B\":\"Himalaya\",\"6A442E\":\"Spice\",\"697E9A\":\"Lynch\",\"695F62\":\"Scorpion\",\"692D54\":\"Finn\",\"685E6E\":\"Salt Box\",\"67A712\":\"Christi\",\"675FA6\":\"Scampi\",\"67032D\":\"Black Rose\",\"66FF66\":\"Screamin\\' Green\",\"66FF00\":\"Bright Green\",\"66B58F\":\"Silver Tree\",\"66023C\":\"Tyrian Purple\",\"65869F\":\"Hoki\",\"65745D\":\"Willow Grove\",\"652DC1\":\"Purple Heart\",\"651A14\":\"Cherrywood\",\"65000B\":\"Rosewood\",\"64CCDB\":\"Viking\",\"646E75\":\"Nevada\",\"646A54\":\"Siam\",\"63B76C\":\"Fern\",\"639A8F\":\"Patina\",\"624E9A\":\"Butterfly Bush\",\"623F2D\":\"Quincy\",\"622F30\":\"Buccaneer\",\"61845F\":\"Glade Green\",\"615D30\":\"Costa del Sol\",\"6093D1\":\"Danube\",\"606E68\":\"Corduroy\",\"605B73\":\"Smoky\",\"5FB3AC\":\"Tradewind\",\"5FA777\":\"Aqua Forest\",\"5F6672\":\"Shuttle Gray\",\"5F5F6E\":\"Mid Gray\",\"5F3D26\":\"Irish Coffee\",\"5E5D3B\":\"Hemlock\",\"5E483E\":\"Kabul\",\"5DA19F\":\"Breaker Bay\",\"5D7747\":\"Dingley\",\"5D5E37\":\"Verdigris\",\"5D5C58\":\"Chicago\",\"5D4C51\":\"Don Juan\",\"5D1E0F\":\"Redwood\",\"5C5D75\":\"Comet\",\"5C2E01\":\"Carnaby Tan\",\"5C0536\":\"Mulberry Wood\",\"5C0120\":\"Bordeaux\",\"5B3013\":\"Jambalaya\",\"5A87A0\":\"Horizon\",\"5A6E9C\":\"Waikawa Gray\",\"591D35\":\"Wine Berry\",\"589AAF\":\"Hippie Blue\",\"56B4BE\":\"Fountain Blue\",\"5590D9\":\"Havelock Blue\",\"556D56\":\"Finlandia\",\"555B10\":\"Saratoga\",\"55280C\":\"Cioccolato\",\"54534D\":\"Fuscous Gray\",\"53824B\":\"Hippie Green\",\"523C94\":\"Gigas\",\"520C17\":\"Maroon Oak\",\"52001F\":\"Castro\",\"51808F\":\"Smalt Blue\",\"517C66\":\"Como\",\"516E3D\":\"Chalet Green\",\"50C878\":\"Emerald\",\"4FA83D\":\"Apple\",\"4F9D5D\":\"Fruit Salad\",\"4F7942\":\"Fern Green\",\"4F69C6\":\"Indigo\",\"4F2398\":\"Daisy Bush\",\"4F1C70\":\"Honey Flower\",\"4EABD1\":\"Shakespeare\",\"4E7F9E\":\"Wedgewood\",\"4E6649\":\"Axolotl\",\"4E4562\":\"Mulled Wine\",\"4E420C\":\"Bronze Olive\",\"4E3B41\":\"Matterhorn\",\"4E2A5A\":\"Bossanova\",\"4E0606\":\"Mahogany\",\"4D5328\":\"Woodland\",\"4D400F\":\"Bronzetone\",\"4D3D14\":\"Punga\",\"4D3833\":\"Rock\",\"4D282E\":\"Livid Brown\",\"4D282D\":\"Cowboy\",\"4D1E01\":\"Indian Tan\",\"4D0A18\":\"Cab Sav\",\"4D0135\":\"Blackberry\",\"4C4F56\":\"Abbey\",\"4C3024\":\"Saddle\",\"4B5D52\":\"Nandor\",\"4A4E5A\":\"Trout\",\"4A444B\":\"Gravel\",\"4A4244\":\"Tundora\",\"4A3C30\":\"Mondo\",\"4A3004\":\"Deep Bronze\",\"4A2A04\":\"Bracken\",\"49371B\":\"Metallic Bronze\",\"49170C\":\"Van Cleef\",\"483C32\":\"Taupe\",\"481C1C\":\"Cocoa Bean\",\"460B41\":\"Loulou\",\"45B1E8\":\"Picton Blue\",\"456CAC\":\"San Marino\",\"441D00\":\"Morocco Brown\",\"44012D\":\"Barossa\",\"436A0D\":\"Green Leaf\",\"434C59\":\"River Bed\",\"433E37\":\"Armadillo\",\"41AA78\":\"Ocean Green\",\"414C7D\":\"East Bay\",\"413C37\":\"Merlin\",\"411F10\":\"Paco\",\"40A860\":\"Chateau Green\",\"40826D\":\"Viridian\",\"403D19\":\"Thatch Green\",\"403B38\":\"Masala\",\"40291D\":\"Cork\",\"3FFF00\":\"Harlequin\",\"3FC1AA\":\"Puerto Rico\",\"3F5D53\":\"Mineral Green\",\"3F583B\":\"Tom Thumb\",\"3F4C3A\":\"Cabbage Pont\",\"3F307F\":\"Minsk\",\"3F3002\":\"Madras\",\"3F2500\":\"Cola\",\"3F2109\":\"Bronze\",\"3EABBF\":\"Pelorous\",\"3E3A44\":\"Ship Gray\",\"3E2C1C\":\"Black Marlin\",\"3E2B23\":\"English Walnut\",\"3E1C14\":\"Cedar\",\"3E0480\":\"Kingfisher Daisy\",\"3D7D52\":\"Goblin\",\"3D2B1F\":\"Bistre\",\"3D0C02\":\"Bean  \",\"3C493A\":\"Lunar Green\",\"3C4443\":\"Cape Cod\",\"3C4151\":\"Bright Gray\",\"3C3910\":\"Camouflage\",\"3C2005\":\"Dark Ebony\",\"3C1F76\":\"Meteorite\",\"3C1206\":\"Rebel\",\"3C0878\":\"Windsor\",\"3B91B4\":\"Boston Blue\",\"3B7A57\":\"Amazon\",\"3B2820\":\"Treehouse\",\"3B1F1F\":\"Jon\",\"3B0910\":\"Aubergine\",\"3B000B\":\"Temptress\",\"3AB09E\":\"Keppel\",\"3A6A47\":\"Killarney\",\"3A686C\":\"William\",\"3A2A6A\":\"Jacarta\",\"3A2010\":\"Sambuca\",\"3A0020\":\"Toledo\",\"381A51\":\"Grape\",\"37290E\":\"Brown Tumbleweed\",\"371D09\":\"Clinker\",\"36747D\":\"Ming\",\"363C0D\":\"Waiouru\",\"354E8C\":\"Chambray\",\"350E57\":\"Jagger\",\"350E42\":\"Valentino\",\"33CC99\":\"Shamrock\",\"33292F\":\"Thunder\",\"33036B\":\"Christalle\",\"327DA0\":\"Astral\",\"327C14\":\"Bilbao\",\"325D52\":\"Stromboli\",\"32293A\":\"Blackcurrant\",\"32127A\":\"Persian Indigo\",\"317D82\":\"Paradiso\",\"31728D\":\"Calypso\",\"315BA1\":\"Azure\",\"311C17\":\"Eclipse\",\"30D5C8\":\"Turquoise\",\"304B6A\":\"San Juan\",\"302A0F\":\"Woodrush\",\"301F1E\":\"Cocoa Brown\",\"2F6168\":\"Casal\",\"2F5A57\":\"Spectra\",\"2F519E\":\"Sapphire\",\"2F3CB3\":\"Governor Bay\",\"2F270E\":\"Onion\",\"2EBFD4\":\"Scooter\",\"2E3F62\":\"Rhino\",\"2E3222\":\"Rangitoto\",\"2E1905\":\"Jacko Bean\",\"2E0329\":\"Jacaranda\",\"2D569B\":\"St Tropaz\",\"2D383A\":\"Outer Space\",\"2D2510\":\"Mikado\",\"2C8C84\":\"Lochinvar\",\"2C2133\":\"Bleached Cedar\",\"2C1632\":\"Revolver\",\"2C0E8C\":\"Blue Gem\",\"2B3228\":\"Heavy Metal\",\"2B194F\":\"Valhalla\",\"2B0202\":\"Sepia Black\",\"2A52BE\":\"Cerulean Blue\",\"2A380B\":\"Turtle Green\",\"2A2630\":\"Baltic Sea\",\"2A140E\":\"Coffee Bean\",\"2A0359\":\"Cherry Pie\",\"29AB87\":\"Jungle Green\",\"297B9A\":\"Jelly Bean\",\"290C5E\":\"Violent Violet\",\"286ACD\":\"Mariner\",\"283A77\":\"Astronaut\",\"281E15\":\"Oil\",\"278A5B\":\"Eucalyptus\",\"27504B\":\"Plantation\",\"273A81\":\"Bay of Many\",\"26283B\":\"Ebony Clay\",\"26056A\":\"Paris M\",\"2596D1\":\"Curious Blue\",\"25311C\":\"Green Kelp\",\"25272C\":\"Shark\",\"251F4F\":\"Port Gore\",\"24500F\":\"Green House\",\"242E16\":\"Black Olive\",\"242A1D\":\"Log Cabin\",\"240C02\":\"Kilamanjaro\",\"240A40\":\"Violet\",\"211A0E\":\"Eternity\",\"202E54\":\"Cloud Burst\",\"20208D\":\"Jacksons Purple\",\"1FC2C2\":\"Java\",\"1F120F\":\"Night Rider\",\"1E9AB0\":\"Eastern Blue\",\"1E433C\":\"Te Papa Green\",\"1E385B\":\"Cello\",\"1E1708\":\"El Paso\",\"1E1609\":\"Karaka\",\"1E0F04\":\"Creole\",\"1D6142\":\"Green Pea\",\"1C7C7D\":\"Elm\",\"1C402E\":\"Everglade\",\"1C39BB\":\"Persian Blue\",\"1C1E13\":\"Rangoon Green\",\"1C1208\":\"Crowshead\",\"1B659D\":\"Matisse\",\"1B3162\":\"Biscay\",\"1B2F11\":\"Seaweed\",\"1B1404\":\"Acadia\",\"1B127B\":\"Deep Koamaru\",\"1B1035\":\"Haiti\",\"1B0245\":\"Tolopea\",\"1AB385\":\"Mountain Meadow\",\"1A1A68\":\"Lucky Point\",\"1959A8\":\"Fun Blue\",\"19330E\":\"Palm Leaf\",\"18587A\":\"Blumine\",\"182D09\":\"Deep Forest Green\",\"171F04\":\"Pine Tree\",\"16322C\":\"Timber Green\",\"162A40\":\"Big Stone\",\"161D10\":\"Hunter Green\",\"15736B\":\"Genoa\",\"1560BD\":\"Denim\",\"151F4C\":\"Bunting\",\"1450AA\":\"Tory Blue\",\"134F19\":\"Parsley\",\"13264D\":\"Blue Zodiac\",\"130A06\":\"Asphalt\",\"126B40\":\"Jewel\",\"120A8F\":\"Ultramarine\",\"110C6C\":\"Arapawa\",\"10121D\":\"Vulcan\",\"0F2D9E\":\"Torea Bay\",\"0E2A30\":\"Firefly\",\"0E0E18\":\"Cinder\",\"0D2E1C\":\"Bush\",\"0D1C19\":\"Aztec\",\"0D1117\":\"Bunker\",\"0D0332\":\"Black Rock\",\"0C8990\":\"Blue Chill\",\"0C7A79\":\"Surfie Green\",\"0C1911\":\"Racing Green\",\"0C0D0F\":\"Woodsmoke\",\"0C0B1D\":\"Ebony\",\"0BDA51\":\"Malachite\",\"0B6207\":\"San Felix\",\"0B1304\":\"Black Forest\",\"0B1107\":\"Gordons Green\",\"0B0F08\":\"Marshland\",\"0B0B0B\":\"Cod Gray\",\"0A6F75\":\"Atoll\",\"0A6906\":\"Japanese Laurel\",\"0A480D\":\"Dark Fern\",\"0A001C\":\"Black Russian\",\"097F4B\":\"Salem\",\"095859\":\"Deep Sea Green\",\"093624\":\"Bottle Green\",\"09255D\":\"Madison\",\"09230F\":\"Palm Green\",\"092256\":\"Downriver\",\"08E8DE\":\"Bright Turquoise\",\"088370\":\"Elf Green\",\"082567\":\"Deep Sapphire\",\"081910\":\"Black Bean\",\"080110\":\"Jaguar\",\"073A50\":\"Tarawera\",\"06A189\":\"Niagara\",\"069B81\":\"Gossamer\",\"063537\":\"Tiber\",\"062A78\":\"Catalina Blue\",\"056F57\":\"Watercourse\",\"055989\":\"Venice Blue\",\"051657\":\"Gulf Blue\",\"051040\":\"Deep Cove\",\"044259\":\"Teal Blue\",\"044022\":\"Zuccini\",\"042E4C\":\"Blue Whale\",\"041322\":\"Black Pearl\",\"041004\":\"Midnight Moss\",\"036A6E\":\"Mosque\",\"032B52\":\"Green Vogue\",\"03163C\":\"Tangaroa\",\"02A4D3\":\"Cerulean\",\"02866F\":\"Observatory\",\"026395\":\"Bahama Blue\",\"024E46\":\"Evening Sea\",\"02478E\":\"Congress Blue\",\"02402C\":\"Sherwood Green\",\"022D15\":\"English Holly\",\"01A368\":\"Green Haze\",\"01826B\":\"Deep Sea\",\"017987\":\"Blue Lagoon\",\"01796F\":\"Pine Green\",\"016D39\":\"Fun Green\",\"016162\":\"Blue Stone\",\"015E85\":\"Orient\",\"014B43\":\"Aqua Deep\",\"013F6A\":\"Regal Blue\",\"013E62\":\"Astronaut Blue\",\"01371A\":\"County Green\",\"01361C\":\"Cardin Green\",\"012731\":\"Daintree\",\"011D13\":\"Holly\",\"011635\":\"Midnight\",\"010D1A\":\"Blue Charcoal\",\"00CCCC\":\"Robin\\'s Egg Blue \",\"00CC99\":\"Caribbean Green\",\"00A86B\":\"Jade\",\"00A693\":\"Persian Green\",\"009DC4\":\"Pacific Blue\",\"0095B6\":\"Bondi Blue\",\"007FFF\":\"Azure Radiance\",\"007EC7\":\"Lochmara\",\"007BA7\":\"Deep Cerulean\",\"0076A3\":\"Allports\",\"00755E\":\"Tropical Rain Forest\",\"0066FF\":\"Blue Ribbon\",\"0066CC\":\"Science Blue\",\"00581A\":\"Camarone\",\"0056A7\":\"Endeavour\",\"004950\":\"Sherpa Blue\",\"004816\":\"Crusoe\",\"0047AB\":\"Cobalt\",\"004620\":\"Kaitoke Green\",\"003E40\":\"Cyprus\",\"003532\":\"Deep Teal\",\"003399\":\"Smalt\",\"003153\":\"Prussian Blue\",\"002FA7\":\"International Klein Blue\",\"002E20\":\"Burnham\",\"002900\":\"Deep Fir\",\"002387\":\"Resolution Blue\",\"001B1C\":\"Swamp\",\"000741\":\"Stratos\"}');\n\n//# sourceURL=webpack://getColorName/./data/curated.json?");

/***/ }),

/***/ "./data/web.json":
/*!***********************!*\
  !*** ./data/web.json ***!
  \***********************/
/***/ ((module) => {

"use strict";
eval("module.exports = JSON.parse('{\"191970\":\"Midnight Blue\",\"663399\":\"Rebecca Purple\",\"696969\":\"Dim Gray\",\"708090\":\"Slate Gray\",\"778899\":\"Light Slate Gray\",\"800000\":\"Maroon\",\"800080\":\"Purple\",\"808000\":\"Olive\",\"808080\":\"Gray\",\"FFFFFF\":\"White\",\"FFFFF0\":\"Ivory\",\"FFFFE0\":\"Light Yellow\",\"FFFF00\":\"Yellow\",\"FFFAFA\":\"Snow\",\"FFFAF0\":\"Floral White\",\"FFFACD\":\"Lemon Chiffon\",\"FFF8DC\":\"Corn Silk\",\"FFF5EE\":\"Seashell\",\"FFF0F5\":\"Lavender blush\",\"FFEFD5\":\"Papaya Whip\",\"FFEBCD\":\"Blanched Almond\",\"FFE4E1\":\"Misty Rose\",\"FFE4C4\":\"Bisque\",\"FFE4B5\":\"Moccasin\",\"FFDEAD\":\"Navajo White\",\"FFDAB9\":\"Peach Puff\",\"FFD700\":\"Gold\",\"FFC0CB\":\"Pink\",\"FFB6C1\":\"Light Pink\",\"FFA500\":\"Orange\",\"FFA07A\":\"Light Salmon\",\"FF8C00\":\"Dark Orange\",\"FF7F50\":\"Coral\",\"FF69B4\":\"Hot Pink\",\"FF6347\":\"Tomato\",\"FF4500\":\"Orange Red\",\"FF1493\":\"Deep Pink\",\"FF00FF\":\"Fuchsia / Magenta\",\"FF0000\":\"Red\",\"FDF5E6\":\"Old Lace\",\"FAFAD2\":\"Light Goldenrod Yellow\",\"FAF0E6\":\"Linen\",\"FAEBD7\":\"Antique White\",\"FA8072\":\"Salmon\",\"F8F8FF\":\"Ghost White\",\"F5FFFA\":\"Mint Cream\",\"F5F5F5\":\"White Smoke\",\"F5F5DC\":\"Beige\",\"F5DEB3\":\"Wheat\",\"F4A460\":\"Sandy brown\",\"F0FFFF\":\"Azure\",\"F0FFF0\":\"Honeydew\",\"F0F8FF\":\"Alice Blue\",\"F0E68C\":\"Khaki\",\"F08080\":\"Light Coral\",\"EEE8AA\":\"Pale Goldenrod\",\"EE82EE\":\"Violet\",\"E9967A\":\"Dark Salmon\",\"E6E6FA\":\"Lavender\",\"E0FFFF\":\"Light Cyan\",\"DEB887\":\"Burly Wood\",\"DDA0DD\":\"Plum\",\"DCDCDC\":\"Gainsboro\",\"DC143C\":\"Crimson\",\"DB7093\":\"Pale Violet Red\",\"DAA520\":\"Goldenrod\",\"DA70D6\":\"Orchid\",\"D8BFD8\":\"Thistle\",\"D3D3D3\":\"Light Gray\",\"D2B48C\":\"Tan\",\"D2691E\":\"Chocolate\",\"CD853F\":\"Peru\",\"CD5C5C\":\"Indian Red\",\"C71585\":\"Medium Violet Red\",\"C0C0C0\":\"Silver\",\"BDB76B\":\"Dark Khaki\",\"BC8F8F\":\"Rosy Brown\",\"BA55D3\":\"Medium Orchid\",\"B8860B\":\"Dark Goldenrod\",\"B22222\":\"Fire Brick\",\"B0E0E6\":\"Powder Blue\",\"B0C4DE\":\"Light Steel Blue\",\"AFEEEE\":\"Pale Turquoise\",\"ADFF2F\":\"Green Yellow\",\"ADD8E6\":\"Light Blue\",\"A9A9A9\":\"Dark Gray\",\"A0522D\":\"Sienna\",\"9ACD32\":\"Yellow Green\",\"9932CC\":\"Dark Orchid\",\"98FB98\":\"Pale Green\",\"9400D3\":\"Dark Violet\",\"9370DB\":\"Medium Purple\",\"90EE90\":\"Light Green\",\"8FBC8F\":\"Dark Sea Green\",\"8B4513\":\"Saddle Brown\",\"8B008B\":\"Dark Magenta\",\"8B0000\":\"Dark Red\",\"8A2BE2\":\"Blue Violet\",\"87CEFA\":\"Light Sky Blue\",\"87CEEB\":\"Sky Blue\",\"7FFFD4\":\"Aquamarine\",\"7FFF00\":\"Chartreuse\",\"7CFC00\":\"Lawn Green\",\"7B68EE\":\"Medium Slate Blue\",\"6B8E23\":\"Olive Drab\",\"6A5ACD\":\"Slate Blue\",\"66CDAA\":\"Medium Aquamarine\",\"6495ED\":\"Cornflower Blue\",\"5F9EA0\":\"Cadet Blue\",\"556B2F\":\"Dark Olive Green\",\"4B0082\":\"Indigo\",\"48D1CC\":\"Medium Turquoise\",\"483D8B\":\"Dark Slate Blue\",\"4682B4\":\"Steel Blue\",\"4169E1\":\"Royal Blue\",\"40E0D0\":\"Turquoise\",\"3CB371\":\"Medium Sea Green\",\"32CD32\":\"Lime Green\",\"2F4F4F\":\"Dark Slate Gray\",\"2E8B57\":\"Sea Green\",\"228B22\":\"Forest Green\",\"20B2AA\":\"Light Sea Green\",\"1E90FF\":\"Dodger Blue\",\"00FFFF\":\"Aqua / Cyan\",\"00FF7F\":\"Spring Green\",\"00FF00\":\"Lime\",\"00FA9A\":\"Medium Spring Green\",\"00CED1\":\"Dark Turquoise\",\"00BFFF\":\"Deep Sky Blue\",\"008B8B\":\"Dark Cyan\",\"008080\":\"Teal\",\"008000\":\"Green\",\"006400\":\"Dark Green\",\"0000FF\":\"Blue\",\"0000CD\":\"Medium Blue\",\"00008B\":\"Dark Blue\",\"000080\":\"Navy\",\"000000\":\"Black\"}');\n\n//# sourceURL=webpack://getColorName/./data/web.json?");

/***/ }),

/***/ "./data/werner.json":
/*!**************************!*\
  !*** ./data/werner.json ***!
  \**************************/
/***/ ((module) => {

"use strict";
eval("module.exports = JSON.parse('{\"252024\":\"Ink Black\",\"383867\":\"China Blue\",\"423937\":\"Pitch or Brownish Black\",\"433635\":\"Reddish Black\",\"454445\":\"Greenish Black\",\"463759\":\"Plum Purple\",\"533552\":\"Auricula Purple\",\"555152\":\"Greyish Black\",\"612741\":\"Purplish Red\",\"613936\":\"Umber Brown\",\"711518\":\"Arterial Blood Red\",\"766051\":\"Clove Brown\",\"864735\":\"Deep Orange-coloured Brown\",\"946943\":\"Yellowish Brown\",\"F1E9CD\":\"Snow White\",\"F2E7CF\":\"Reddish White\",\"ECE6D0\":\"Purplish White\",\"F2EACC\":\"Yellowish White\",\"F3E9CA\":\"Orange coloured White\",\"F2EBCD\":\"Greenish White\",\"E6E1C9\":\"Skimmed milk White\",\"E2DDC6\":\"Greyish White\",\"CBC8B7\":\"Ash Grey\",\"BFBBB0\":\"Smoke Grey\",\"BEBEB3\":\"French Grey\",\"B7B5AC\":\"Pearl Grey\",\"BAB191\":\"Yellowish Grey\",\"9C9D9A\":\"Bluish Grey\",\"8A8D84\":\"Greenish Grey\",\"5B5C61\":\"Blackish Grey\",\"413F44\":\"Bluish Black\",\"241F20\":\"Velvet Black\",\"281F3F\":\"Scotch Blue\",\"1C1949\":\"Prussian Blue\",\"4F638D\":\"Indigo Blue\",\"5C6B8F\":\"Azure Blue\",\"657ABB\":\"Ultramarine Blue\",\"6F88AF\":\"Flax-Flower Blue\",\"7994B5\":\"Berlin Blue\",\"6FB5A8\":\"Verditter Blue\",\"719BA2\":\"Greenish Blue\",\"8AA1A6\":\"Greyish Blue\",\"D0D5D3\":\"Bluish Lilac Purple\",\"8590AE\":\"Bluish Purple\",\"3A2F52\":\"Violet Purple\",\"39334A\":\"Pansy Purple\",\"6C6D94\":\"Campanula Purple\",\"584C77\":\"Imperial Purple\",\"BFBAC0\":\"Red Lilac Purple\",\"77747F\":\"Lavender Purple\",\"4A475C\":\"Pale Blackish Purple\",\"B8BFAF\":\"Celadine Green\",\"B2B599\":\"Mountain Green\",\"979C84\":\"Leek Green\",\"5D6161\":\"Blackish Green\",\"61AC86\":\"Verdigris Green\",\"A4B6A7\":\"Bluish Green\",\"ADBA98\":\"Apple Green\",\"93B778\":\"Emerald Green\",\"7D8C55\":\"Grass Green\",\"33431E\":\"Duck Green\",\"7C8635\":\"Sap Green\",\"8E9849\":\"Pistachio Green\",\"C2C190\":\"Asparagus Green\",\"67765B\":\"Olive Green\",\"AB924B\":\"Oil Green\",\"C8C76F\":\"Siskin Green\",\"CCC050\":\"Sulphur Yellow\",\"EBDD99\":\"Primrose Yellow\",\"AB9649\":\"Wax Yellow\",\"DBC364\":\"Lemon Yellow\",\"E6D058\":\"Gamboge Yellow\",\"EAD665\":\"Kings Yellow\",\"D09B2C\":\"Saffron Yellow\",\"A36629\":\"Gallstone Yellow\",\"A77D35\":\"Honey Yellow\",\"F0D696\":\"Straw Yellow\",\"D7C485\":\"Wine Yellow\",\"F1D28C\":\"Sienna Yellow\",\"EFCC83\":\"Ochre Yellow\",\"F3DAA7\":\"Cream Yellow\",\"DFA837\":\"Dutch Orange\",\"EBBC71\":\"Buff Orange\",\"D17C3F\":\"Orpiment Orange\",\"92462F\":\"Brownish Orange\",\"BE7249\":\"Reddish Orange\",\"BB603C\":\"Deep Reddish Orange\",\"C76B4A\":\"Tile Red\",\"A75536\":\"Hyacinth Red\",\"B63E36\":\"Scarlet Red\",\"B5493A\":\"Vermilion Red\",\"CD6D57\":\"Aurora Red\",\"E9C49D\":\"Flesh Red\",\"EEDAC3\":\"Rose Red\",\"EECFBF\":\"Peach Blossom Red\",\"CE536B\":\"Carmine Red\",\"B74A70\":\"Lake Red\",\"B7757C\":\"Crimson Red\",\"7A4848\":\"Cochineal Red\",\"3F3033\":\"Veinous Blood Red\",\"8D746F\":\"Brownish Purple Red\",\"4D3635\":\"Chocolate Red\",\"6E3B31\":\"Brownish Red\",\"553D3A\":\"Deep Reddish Brown\",\"7A4B3A\":\"Chestnut Brown\",\"C39E6D\":\"Wood Brown\",\"513E32\":\"Liver Brown\",\"8B7859\":\"Hair Brown\",\"9B856B\":\"Broccoli Brown\",\"453B32\":\"Blackish Brown\"}');\n\n//# sourceURL=webpack://getColorName/./data/werner.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	__webpack_exports__ = __webpack_exports__["default"];
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXZlbG9wbWVudC9qcy9hcHAuanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL2F1dG92YWxpZC5qcyIsImRldmVsb3BtZW50L2pzL21vZHVsZXMvY2hlY2tvdXQtYnV0dG9uLWZpeC5qcyIsImRldmVsb3BtZW50L2pzL21vZHVsZXMvY29udGVudC1idXktYnV0dG9uLmpzIiwiZGV2ZWxvcG1lbnQvanMvbW9kdWxlcy9ldmVudHMuanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL2Zvcm0tYWpheC1zdWJtaXQuanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL2djci5qcyIsImRldmVsb3BtZW50L2pzL21vZHVsZXMvaGVscGVycy5qcyIsImRldmVsb3BtZW50L2pzL21vZHVsZXMvaW50ZXJhY3RpdmUtYmFjay1idXR0b24uanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL25hdmJhci1idXktYnV0dG9uLmpzIiwiZGV2ZWxvcG1lbnQvanMvbW9kdWxlcy9uYXZiYXItY29sbGFwc2UuanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL25vdGlmaWNhdGlvbi1jZW50ZXIuanMiLCJkZXZlbG9wbWVudC9qcy9tb2R1bGVzL3NuaXBjYXJ0LWxvYWQtb24tY2xpY2suanMiLCJub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvZGlzdC9janMvcG9wcGVyLmpzIiwibm9kZV9tb2R1bGVzL2Fvcy9kaXN0L2Fvcy5qcyIsIm5vZGVfbW9kdWxlcy9hdXRvc2l6ZS9kaXN0L2F1dG9zaXplLmpzIiwibm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9kaXN0L2pzL2Jvb3RzdHJhcC5qcyIsIm5vZGVfbW9kdWxlcy9jYXNoLWRvbS9kaXN0L2Nhc2guanMiLCJub2RlX21vZHVsZXMvZm9ybS1zZXJpYWxpemUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL2Rpc3QvanMuY29va2llLmpzIiwibm9kZV9tb2R1bGVzL25hbWVkLXdlYi1jb2xvcnMvbGliL25hbWVkLXdlYi1jb2xvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzeERBO0FBQ0E7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5NElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBPcmlnaW5hbGx5ICQgaXMgcmVxdWlyZWQgYnkgYGtpbmV0aWNgIGluIGNvbnRhaW5lci1ob3Jpem9udGFsLlxuLy8gSG93ZXZlciB3aXRoIGludHJvZHVjdGlvbiBvZiBjb21wb25lbnQgc3BlY2lmaWMgY3NzLFxuLy8gSSBtb3ZlZCBzb21lIG9mIHRoZSBzY3JpcHRzIHRvIGdsb2JhbHNcblxuLy8gR2xvYmFscyB1c2VkIGluIHRoZSBjb21wb25lbnRzJyBpbmxpbmUgc2NyaXB0c1xudmFyICQgPSB3aW5kb3cuJCA9IHJlcXVpcmUoJ2Nhc2gtZG9tJyk7ICAvLyAxMjM3IGxpbmVzO1xudmFyIGJvb3RzdHJhcCA9IHdpbmRvdy5ib290c3RyYXAgPSByZXF1aXJlKCdib290c3RyYXAnKTsgLy8gIDYzMTcgbGluZXNcbnZhciBldmVudHMgPSB3aW5kb3cuZXZlbnRzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2V2ZW50cycpO1xuXG52YXIgaGVscGVycyA9IHdpbmRvdy5oZWxwZXJzID0gcmVxdWlyZSgnLi9tb2R1bGVzL2hlbHBlcnMnKTtcbnZhciBub3RpZmljYXRpb25DZW50ZXIgPSB3aW5kb3cubm90aWZpY2F0aW9uQ2VudGVyID0gcmVxdWlyZSgnLi9tb2R1bGVzL25vdGlmaWNhdGlvbi1jZW50ZXInKTtcbnZhciBnZXRDb2xvckZyaWVuZGx5TmFtZSA9IHdpbmRvdy5nZXRDb2xvckZyaWVuZGx5TmFtZSA9IHJlcXVpcmUoJ25hbWVkLXdlYi1jb2xvcnMnKTtcblxuLy8gTG9jYWxzIGZvciB0aGlzIEJyb3dzZXJpZnkgZW50cnkgcG9pbnRcbnZhciBhdXRvc2l6ZSA9IHJlcXVpcmUoJ2F1dG9zaXplJyk7ICAvLyAzNjMgbGluZXNcbnZhciBBT1MgPSByZXF1aXJlKCdhb3MnKTsgLy8gIC8vIDYgbGluZXM/XG52YXIgbmF2YmFyQ29sbGFwc2UgPSByZXF1aXJlKCcuL21vZHVsZXMvbmF2YmFyLWNvbGxhcHNlJyk7XG52YXIgY29udGVudEJ1eUJ1dHRvbiA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250ZW50LWJ1eS1idXR0b24nKTtcbnZhciBuYXZiYXJCdXlCdXR0b24gPSByZXF1aXJlKCcuL21vZHVsZXMvbmF2YmFyLWJ1eS1idXR0b24nKTtcbnZhciBGb3JtQWpheFN1Ym1pdCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9mb3JtLWFqYXgtc3VibWl0Jyk7XG52YXIgQ2hlY2tvdXRCdXR0b25GaXggPSByZXF1aXJlKCcuL21vZHVsZXMvY2hlY2tvdXQtYnV0dG9uLWZpeCcpO1xudmFyIEludGVyYWN0aXZlQmFja0J1dHRvbiA9IHJlcXVpcmUoJy4vbW9kdWxlcy9pbnRlcmFjdGl2ZS1iYWNrLWJ1dHRvbicpO1xudmFyIGF1dG92YWxpZCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9hdXRvdmFsaWQnKTtcbnZhciBHQ1IgPSByZXF1aXJlKCcuL21vZHVsZXMvZ2NyJyk7XG52YXIgU25pcGNhcnRMb2FkT25DbGljayA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zbmlwY2FydC1sb2FkLW9uLWNsaWNrJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcbiAgc25pcGNhcnRMb2FkT25DbGljayA9IG5ldyBTbmlwY2FydExvYWRPbkNsaWNrKCk7XG4gIHNuaXBjYXJ0TG9hZE9uQ2xpY2suaW5pdCgpO1xuXG4gIEludGVyYWN0aXZlQmFja0J1dHRvbi5pbml0KCk7XG4gIG5hdmJhckNvbGxhcHNlLmluaXQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbml0LW5hdmJhci1jb2xsYXBzZScpKTtcblxuICAvLyBuYXZiYXJCdXlCdXR0b24gaW5pdHMgZmlyc3QgLSBsaXN0ZW5zIHRvIGV2ZW50XG4gIG5hdmJhckJ1eUJ1dHRvbi5pbml0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW5pdC1uYXZiYXItYnV5LWJ1dHRvbicpKTtcbiAgLy8gY29udGVudEJ1eUJ1dHRvbiBpbml0cyBzZWNvbmQgLSBmaXJlcyBldmVudFxuICBjb250ZW50QnV5QnV0dG9uLmluaXQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbml0LWNvbnRlbnQtYnV5LWJ1dHRvbicpKTtcblxuICAvLyBJdHMgYWxtb3N0IG9uIGV2ZXJ5IHBhZ2Ugc28gaXRzIGhlcmVcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1pbml0LWFqYXgtc3VibWl0JykuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xuICAgIHZhciBmb3JtQWpheFN1Ym1pdCA9IG5ldyBGb3JtQWpheFN1Ym1pdCgpO1xuICAgIGZvcm1BamF4U3VibWl0LmluaXQoZWxlbWVudCk7XG4gIH0pO1xuXG4gIC8vIEF1dG9zaXplIHRleHRhcmVhc1xuICBhdXRvc2l6ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWluaXQtYXV0b3NpemUnKSk7XG5cbiAgLy8gRml4IGNoZWNrb3V0IGJ1dHRvbiBjYXB0aW9uXG4gIHZhciBjaGVja291dEJ1dHRvbkZpeCA9IG5ldyBDaGVja291dEJ1dHRvbkZpeCgpO1xuICBjaGVja291dEJ1dHRvbkZpeC5pbml0KCk7XG5cbiAgLy8gVmlld3BvcnQgYW5pbWF0aW9uc1xuICBBT1MuaW5pdCh7XG4gICAgdXNlQ2xhc3NOYW1lczogdHJ1ZSxcbiAgICBhbmltYXRlZENsYXNzTmFtZTogJ2FuaW1hdGVfX2FuaW1hdGVkJ1xuICB9KTtcblxuICAvLyBBdXRvbWF0aWMgcGlsbHMgc2VsZWN0aW9uXG4gIHZhciBoYXNodGFnID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gIGlmIChoYXNodGFnIT0nJykge1xuICAgIHZhciBwaWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdi1waWxscyAnICsgaGFzaHRhZyk7XG4gICAgaWYgKHBpbGwubGVuZ3RoID4gMCl7XG4gICAgICBjb25zdCBic1RhYiA9IG5ldyBib290c3RyYXAuVGFiKGhhc2h0YWcpO1xuICAgICAgYnNUYWIuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG9tYXRpYyBIVE1MNSB2YWxpZGF0aW9uIHRoYXQgaXMgbm90IDppbnZhbGlkIGF0IHRoZSBwYWdlIGxvYWRcbiAgLy8gaHR0cHM6Ly9jb2RlcGlsb3RzZi5tZWRpdW0uY29tL2h0bWw1LWZvcm0tdmFsaWRhdGlvbi10aGUtZWFzeS13YXktOGU0NTcwNDliZjA0XG4gIC8vIE1hbnVhbGx5IGNvbnZlcnRlZCB0byBCcm93c2VyaWZ5IHN5bnRheFxuICBhdXRvdmFsaWQuYXV0b3ZhbGlkKCk7XG5cbiAgLy9cbiAgLy8gSGVscGVyIGV2ZW50IHRvIGNsb3NlIG90aGVyIHdpZGdldHNcbiAgZG9jdW1lbnQub25jbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgZXZlbnRzLmVtaXQoJ2RvY3VtZW50Q2xpY2snKTtcbiAgfVxuXG4gIC8vIEdvb2dsZSBDdXN0b21lciBSZXZpZXdzXG4gIHZhciBnY3IgPSBuZXcgR0NSKCk7XG4gIGdjci5pbml0KCk7XG4gIC8vIEV4cG9ydCBHQ1IgdG8gYmUgYWNjZXNzZWQgYnkgVnVlXG4gIC8vIGh0dHBzOi8vd3d3Lm1hdHRidXJrZWRldi5jb20vZXhwb3J0LWEtZ2xvYmFsLXRvLXRoZS13aW5kb3ctb2JqZWN0LXdpdGgtYnJvd3NlcmlmeS9cbiAgLy8gd2luZG93LmdjciA9IGdjcjtcbiAgLy8gVGhpcyB3b3JrZWQgd2l0aCBCcm93c2VyaWZ5IGFuZCBzb3VyY2VtYXBzIGluIGRldiBtb2RlXG4gIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4MTA0NzE1L2Jyb3dzZXJpZnktZ2xvYmFsLXZhcmlhYmxlLWlzLW5vdC1mb3VuZC1pbi10aGUtYnJvd3NlclxuICB3aW5kb3dbJ2djciddID0gZ2NyO1xufSk7XG4iLCJmdW5jdGlvbiBhdXRvdmFsaWQob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgc2NvcGUgPSBvcHRpb25zLnNjb3BlIHx8IGRvY3VtZW50O1xuICAgIC8vIGNvbnN0IGZpZWxkcyA9IHNjb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYVwiKTtcbiAgICBjb25zdCBmaWVsZHMgPSBzY29wZS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHRleHRhcmVhXCIpO1xuICAgIGNvbnN0IHdyYXBwaW5nRm9ybSA9IGZpZWxkcy5sZW5ndGggPyBmaWVsZHNbMF0uY2xvc2VzdChcImZvcm1cIikgOiB7fTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGVhY2ggZmllbGRcbiAgICBmaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgICAgZmllbGQuYWRkRXZlbnRMaXN0ZW5lcihcImludmFsaWRcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBtYXJrSW52YWxpZChmaWVsZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmllbGQudmFsaWRpdHkudmFsaWQpIHtcbiAgICAgICAgICAgICAgICBtYXJrVmFsaWQoZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoKSA9PiB7XG4gICAgICAgICAgICBmaWVsZC5jaGVja1ZhbGlkaXR5KCkgPyBtYXJrVmFsaWQoZmllbGQpIDogbWFya0ludmFsaWQoZmllbGQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG1hcmtJbnZhbGlkKGZpZWxkKSB7XG4gICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoXCJpbnZhbGlkXCIpO1xuICAgICAgICBjb25zdCB3cmFwcGluZ0ZpZWxkc2V0ID0gZmllbGQuY2xvc2VzdChcImZpZWxkc2V0XCIpO1xuICAgICAgICBpZiAod3JhcHBpbmdGaWVsZHNldCkgd3JhcHBpbmdGaWVsZHNldC5jbGFzc0xpc3QuYWRkKFwiaW52YWxpZFwiKTtcbiAgICAgICAgaWYgKHdyYXBwaW5nRm9ybSkgd3JhcHBpbmdGb3JtLmNsYXNzTGlzdC5hZGQoXCJpbnZhbGlkXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcmtWYWxpZChmaWVsZCkge1xuICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKFwiaW52YWxpZFwiKTtcbiAgICAgICAgY29uc3Qgd3JhcHBpbmdGaWVsZHNldCA9IGZpZWxkLmNsb3Nlc3QoXCJmaWVsZHNldFwiKTtcbiAgICAgICAgaWYgKHdyYXBwaW5nRmllbGRzZXQpIHdyYXBwaW5nRmllbGRzZXQuY2xhc3NMaXN0LnJlbW92ZShcImludmFsaWRcIik7XG4gICAgICAgIGlmIChzY29wZS5xdWVyeVNlbGVjdG9yQWxsKFwiOmludmFsaWRcIikubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgd3JhcHBpbmdGb3JtLmNsYXNzTGlzdC5yZW1vdmUoXCJpbnZhbGlkXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLmF1dG92YWxpZCA9IGF1dG92YWxpZDtcbiIsInZhciAkID0gcmVxdWlyZSgnY2FzaC1kb20nKTtcblxudmFyIENoZWNrb3V0QnV0dG9uRml4ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgRE9NID0ge307XG5cbiAgICBmdW5jdGlvbiBfY2FjaGVEb20oKXtcbiAgICAgICAgRE9NLiRuZXdMYWJlbCA9ICQoJzxzcGFuIGNsYXNzPVwibmV3LWxhYmVsXCI+UGF5IHdpdGggQ2FyZCDigKIgdmlhIFBheVBhbDwvc3Bhbj4nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbmVlZEZpeCgpe1xuICAgICAgICBET00uJGJ1dHRvblBheSA9ICQoJyNzbmlwY2FydCBidXR0b25bdGl0bGU9XCJDaGVja291dCB3aXRoIFBheVBhbFwiXScpO1xuICAgICAgICBpZiAoIURPTS4kYnV0dG9uUGF5Lmxlbmd0aCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld0xhYmVsQ2xhc3MgPSBcIi5cIiArIERPTS4kbmV3TGFiZWwuYXR0cignY2xhc3MnKTtcbiAgICAgICAgcmV0dXJuICFET00uJGJ1dHRvblBheS5maW5kKG5ld0xhYmVsQ2xhc3MpLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZml4Q2FwdGlvbigpe1xuICAgICAgICBpZiAoX25lZWRGaXgoKSl7XG4gICAgICAgICAgICBET00uJGJ1dHRvblBheS5maW5kKCcuc25pcGNhcnQtcGF5bWVudC1tZXRob2RzLWxpc3QtaXRlbV9fbGFiZWwnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIERPTS4kYnV0dG9uUGF5LnByZXBlbmQoRE9NLiRuZXdMYWJlbC5nZXQoMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHdlYWs6IGRpc2FibGUgU25pcGNhcnQgYXV0b2NvbXBsZXRlXG4gICAgICAgICQoJy5zbmlwY2FydCBpbnB1dFtuYW1lPVwiYWRkcmVzczFcIl0nKS5hdHRyKCdhdXRvY29tcGxldGUnLCdub3BlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2JpbmRFdmVudHMoKXtcbiAgICAgICAgLy8gTW9uaXRvciBpZiBidXR0b24gY2FwdGlvbiBuZWVkcyB0byBiZSBjaGFuZ2VkIGluIGEgbG9vcFxuICAgICAgICBzZXRJbnRlcnZhbChfZml4Q2FwdGlvbiwgNTAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBfY2FjaGVEb20oKTtcbiAgICAgICAgX2JpbmRFdmVudHMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tvdXRCdXR0b25GaXg7IiwiLy8gRW1pdCBldmVudCB3aGVuICdCdXknIGJ1dHRvbiBvbiB0aGUgcG9zdCdzIHBhZ2UgZ29lcyBvdXQgb2Ygdmlld3BvcnRcblxudmFyICQgPSByZXF1aXJlKCdjYXNoLWRvbScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG52YXIgRE9NID0ge307XG4vLyB2YXIgb3B0aW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBfY2FjaGVEb20oZWxlbWVudCkge1xuICBET00uJGVsID0gJChlbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gX2JpbmRFdmVudHMoZWxlbWVudCkge1xuICAkKHdpbmRvdykub24oXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgX2NoZWNrQ29udGVudEJ1dHRvblZpZXdwb3J0KCk7XG4gIH0pO1xuICBfY2hlY2tDb250ZW50QnV0dG9uVmlld3BvcnQoKTtcbn1cblxuZnVuY3Rpb24gX2NoZWNrQ29udGVudEJ1dHRvblZpZXdwb3J0KCl7XG4gIGNvbnN0IGlzSW5WaWV3cG9ydCA9IGhlbHBlcnMuaXNJblZpZXdwb3J0KERPTS4kZWwpO1xuICBldmVudHMuZW1pdCgnYnV5QnV0dG9uVmlld3BvcnQnLCB7Y29udGVudEJ1dHRvblZpc2libGU6IGlzSW5WaWV3cG9ydH0pO1xufVxuXG4vLyBmdW5jdGlvbiBfcmVuZGVyKG9wdGlvbnMpe1xuLy8gfVxuXG5mdW5jdGlvbiBpbml0KGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQpIHtcbiAgICAvLyBvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucywgJChlbGVtZW50KS5kYXRhKCkpO1xuICAgIF9jYWNoZURvbShlbGVtZW50KTtcbiAgICBfYmluZEV2ZW50cygpO1xuICAgIC8vIF9yZW5kZXIoKTtcbiAgfVxufVxuXG5leHBvcnRzLmluaXQgPSBpbml0O1xuLy8gZXhwb3J0cy5jaGVja0NvbnRlbnRCdXR0b25WaWV3cG9ydCA9IGNoZWNrQ29udGVudEJ1dHRvblZpZXdwb3J0OyIsIi8vIFNpbXBsZSBldmVudCBidXNcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2xlYXJuY29kZWFjYWRlbXkvNzc3MzQ5NzQ3ZDgzODJiZmI3MjJcblxudmFyIGV2ZW50cyA9IHt9O1xuXG5mdW5jdGlvbiBvbihldmVudE5hbWUsIGZuKSB7XG4gIGV2ZW50c1tldmVudE5hbWVdID0gZXZlbnRzW2V2ZW50TmFtZV0gfHwgW107XG4gIGV2ZW50c1tldmVudE5hbWVdLnB1c2goZm4pO1xufVxuXG5mdW5jdGlvbiBvZmYoZXZlbnROYW1lLCBmbikge1xuICBpZiAoZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50c1tldmVudE5hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZXZlbnRzW2V2ZW50TmFtZV1baV0gPT09IGZuKSB7XG4gICAgICAgIGV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XG4gIGlmIChldmVudHNbZXZlbnROYW1lXSkge1xuICAgIGV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICBmbihkYXRhKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnRzLm9uID0gb247XG5leHBvcnRzLm9mZiA9IG9mZjtcbmV4cG9ydHMuZW1pdCA9IGVtaXQ7IiwiLy8gQWpheCBmb3JtIHN1Ym1pc3Npb24gbG9naWNcblxudmFyICQgPSByZXF1aXJlKCdjYXNoLWRvbScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgbm90aWZpY2F0aW9uQ2VudGVyID0gcmVxdWlyZSgnLi9ub3RpZmljYXRpb24tY2VudGVyJyk7XG5cbnZhciBGb3JtQWpheFN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBET00gPSB7fTtcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgZGF0YVR5cGU6ICdodG1sJywgLy8gZGVmYXVsdCBmb3IgTmV0bGlmeSwgYnV0IEZvcm1DYXJyeSBhbmQgTWFpbGNoaW1wIG5lZWQgJ2pzb24nIChqc29ucCk7XG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG4gIH07XG5cbiAgZnVuY3Rpb24gX2NhY2hlRG9tKGVsZW1lbnQpIHtcbiAgICBET00uJGZvcm0gPSAkKGVsZW1lbnQpO1xuICAgIERPTS4kc3VibWl0QnV0dG9uID0gRE9NLiRmb3JtLmZpbmQoJ1t0eXBlPXN1Ym1pdF0nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9iaW5kRXZlbnRzKCl7XG4gICAgRE9NLiRmb3JtLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgLy8gUHJldmVudCByZWd1bGFyIHN1Ym1pdFxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gRGlzYWJsZSBzdWJtaXQgYnV0dG9uXG4gICAgICBET00uJHN1Ym1pdEJ1dHRvbi5hZGRDbGFzcyhcImxvYWRpbmdcIik7XG4gICAgICBET00uJHN1Ym1pdEJ1dHRvbi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG5cbiAgICAgIC8vIEFsbCBmb3JtcyB3aXRoIGNyb3NzLWRvbWFpbiBhY3Rpb25zIGFyZSBwb3N0ZWQgdmlhIGpzb25wIChGb3JtQ2FycnksIE5ldGxpZnksIE1haWxjaGltcClcbiAgICAgIC8vIFRyeSBzdWNjZXNzOiBjYWxsYmFjaz9cblxuICAgICAgLy8gSG93ZXZlciwgZm9yIGZvcm1zIHdpdGggZmlsZXMgd2UgbmVlZCB0byBjaGFuZ2UgaXQgdG8gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcblxuICAgICAgLy8gRGVmYXVsdCBjb250ZW50VHlwZSBpbiBqUXVlcnkncyBhamF4KCkgaXMgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCdcbiAgICAgIC8vIChzZWUgYWpheCgpIG1hbnVhbCkuIFRlcmVmb3JlIHdlIGRvbnQgaGF2ZSB0byBzcGVjaWZ5IGl0LlxuXG4gICAgICAvLyBCeSBkZWZhdWx0IHdlIHVzZSBqUXVlcnkncyBzZXJpYWxpemUoKSB0byBjcmVhdGUgVVJMLWVuY29kZWQgZm9ybSBzdHJpbmdcbiAgICAgIHZhciBkYXRhID0gRE9NLiRmb3JtLnNlcmlhbGl6ZSgpO1xuXG4gICAgICAvLyBIb3dldmVyLCBpZiBmb3JtIGNvbnRhaW5zIGZpbGUgZmllbGQsIGl0IG11c3QgYmVcbiAgICAgIGlmIChET00uJGZvcm0uZmluZCgnZmlsZScpLmxlbmd0aCl7XG4gICAgICAgIC8vIFNlZTogaHR0cHM6Ly9kb2NzLm5ldGxpZnkuY29tL2Zvcm1zL3NldHVwLyNmaWxlLXVwbG9hZHNcbiAgICAgICAgLy8gVGhpcyB3YXMgbm90IHRlc3RlZCB5ZXQuIEJlY2F1c2UgTmV0bGlmeSBoYXMgMTAgTUIgbW9udGhseSB1cGxvYWQgbGltaXQhXG4gICAgICAgIG9wdGlvbnMuY29udGVudFR5cGUgPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc7XG4gICAgICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShET00uJGZvcm1bMF0pO1xuICAgICAgICBkYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSkudG9TdHJpbmcoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIE1haWxjaGltcCB3ZSBuZWVkIGpzb25wLCB0aGVyZWZvcmUgTWFpbGNoaW1wIGZvcm0gaGFzIGRhdGEtZGF0YS10eXBlPVwianNvblwiXG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6ICAgICAgICBET00uJGZvcm0uYXR0cignbWV0aG9kJyksXG4gICAgICAgIHVybDogICAgICAgICBET00uJGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICAgIGRhdGE6ICAgICAgICBET00uJGZvcm0uc2VyaWFsaXplKCksXG4gICAgICAgIGRhdGFUeXBlOiAgICBvcHRpb25zLmRhdGFUeXBlLFxuICAgICAgICBjb250ZW50VHlwZTogb3B0aW9ucy5jb250ZW50VHlwZVxuICAgICAgfSkuZG9uZShmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgLy8gTWFpbGNoaW1wIHJlc3BvbmRzIHdpdGggZGF0YS5yZXN1bHQgPSAnZXJyb3InIGFuZCBkYXRhLm1zZz1cIi4uLlwiXG4gICAgICAgIC8vIEZvcm1DYXJyeSByZXNwb25kcyB3aXRoIE9iamVjdCB7IGNvZGU6IDIwMCwgc3RhdHVzOiBcInN1Y2Nlc3NcIiwgdGl0bGU6IFwiVGhhbmsgWW91IVwiLCBtZXNzYWdlOiBcIldlIHJlY2VpdmVkIHlvdXIgc3VibWlzc2lvblwiLCByZWZlcmVyOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NDAwMC9cIiB9XG4gICAgICAgIC8vIE5ldGxpZnkgcmVzcG9uZHMgd2l0aCBIVE1MLi4uXG4gICAgICAgIHZhciBlcnJvciA9IGRhdGEucmVzdWx0ID09ICdlcnJvcicgfHwgZGF0YS5zdGF0dXMgPT0gJ2Vycm9yJztcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBkYXRhLm1zZyB8fCBkYXRhLm1lc3NhZ2U7XG5cbiAgICAgICAgaWYgKGVycm9yKXtcbiAgICAgICAgICBpZiAoZGF0YS5tc2cpe1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2VudGVyLm5vdGlmeSgnZGFuZ2VyJywgbWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGRhdGEtc3VjY2Vzcy1ub3RvZmljYXRpb24gb3ZlcnJpZGVzIHN1Y2Nlc3Mgc2VydmVyIG1lc3NhZ2VcbiAgICAgICAgICBpZiAob3B0aW9ucy5zdWNjZXNzTm90aWZpY2F0aW9uKXtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNlbnRlci5ub3RpZnkoJ3N1Y2Nlc3MnLCBvcHRpb25zLnN1Y2Nlc3NOb3RpZmljYXRpb24pO1xuICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZSl7XG4gICAgICAgICAgICBub3RpZmljYXRpb25DZW50ZXIubm90aWZ5KCdzdWNjZXNzJywgbWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFRocm93IGV2ZW50XG4gICAgICAgICAgaWYgKG9wdGlvbnMuc3VjY2Vzc0V2ZW50KXtcbiAgICAgICAgICAgIGV2ZW50cy5lbWl0KG9wdGlvbnMuc3VjY2Vzc0V2ZW50LCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVzZXQgZm9ybSBmaWVsZHNcbiAgICAgICAgICBET00uJGZvcm0udHJpZ2dlcigncmVzZXQnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5mYWlsKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uQ2VudGVyLm5vdGlmeSgnZGFuZ2VyJywgJ1Vua25vd24gZXJyb3Igb2NjdXJlZCEnKTtcbiAgICAgIH0pXG4gICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBFbmFibGUgc3VibWl0IGJ1dHRvblxuICAgICAgICBET00uJHN1Ym1pdEJ1dHRvbi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICBET00uJHN1Ym1pdEJ1dHRvbi5yZW1vdmVDbGFzcyhcImxvYWRpbmdcIik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZWxlbWVudCl7XG4gICAgaWYgKGVsZW1lbnQpe1xuICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKG9wdGlvbnMsIGVsZW1lbnQuZGF0YXNldCk7XG4gICAgICBfY2FjaGVEb20oZWxlbWVudCk7XG4gICAgICBfYmluZEV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtQWpheFN1Ym1pdDsiLCJ2YXIgJCA9IHJlcXVpcmUoJ2Nhc2gtZG9tJyk7XG4vLyBNb3ZlZCBmcm9tIE51bmp1Y2tzICg3MDAwIGxpbmVzKSB0byBzaW1wbGUgZnVuY3Rpb246XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTA1NDU2OTEvXG4vLyB2YXIgbnVuanVja3MgPSByZXF1aXJlKCdudW5qdWNrcycpOyAvLyA3MjkxIExpbmVzXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG52YXIgR0NSID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgRE9NID0ge307XG5cbiAgICBmdW5jdGlvbiByZW5kZXJHb29nbGVDdXN0b21lclJldmlld3MoaW52b2ljZU51bWJlciwgZW1haWwsIGNvdW50cnkpIHtcbiAgICAgICAgLy8gYWxlcnQoaW52b2ljZU51bWJlciArIFwiIFwiICsgZW1haWwgKyBcIiBcIiArIGNvdW50cnkpO1xuXG4gICAgICAgIC8vIFRPRE86IGNhbGN1bGF0ZSBlc3RpbWF0ZWQgZGVsaXZlcnkgZGF0ZSBoZXJlXG4gICAgICAgIC8vIE5vdCBpbiBqc29ue31cbiAgICAgICAgdmFyIGRlbGl2ZXJ5RGF5cyA9IGNvdW50cnkubG9jYWxlQ29tcGFyZShcIlVTXCIpPzIxOjc7XG4gICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBkZWxpdmVyeURhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkZWxpdmVyeURhdGUuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBkZWxpdmVyeURheXMpO1xuXG4gICAgICAgIC8vIGZvciBHb29nbGUgJ2RlbGl2ZXJ5RGF0ZScgc2hvdWxkIGhhdmUgNCBkaWdpdHMgZm9yIHllYXIsXG4gICAgICAgIC8vIDIgZGlnaXRzIGZvciBkYXkgYW5kIDIgZGlnaXRzIGZvciBtb250aCBPTkxZOiBZWVlZLU1NLUREXG5cbiAgICAgICAgdmFyIHllYXIgPSAxOTAwK2RlbGl2ZXJ5RGF0ZS5nZXRZZWFyKCk7XG4gICAgICAgIHZhciB5ZWFyU3RyaW5nID0gXCJcIit5ZWFyO1xuICAgICAgICB2YXIgbW9udGggPSBkZWxpdmVyeURhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgIHZhciBtb250aFN0cmluZyA9IChtb250aCA8IDEwKSA/IFwiMFwiK21vbnRoIDogbW9udGg7XG4gICAgICAgIHZhciBkYXkgPSBkZWxpdmVyeURhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICB2YXIgZGF5U3RyaW5nID0gKGRheSA8IDEwKSA/IFwiMFwiK2RheSA6IGRheTtcbiAgICAgICAgdmFyIGRlbGl2ZXJ5RGF0ZVN0cmluZyA9IHllYXJTdHJpbmcgKyBcIi1cIiArIG1vbnRoU3RyaW5nICsgXCItXCIgKyBkYXlTdHJpbmc7XG4gICAgICAgIC8vIFBvcHVsYXRlIHN1Y2Nlc3MgdGVtcGxhdGUgd2l0aCBKU09OXG4gICAgICAgIHZhciBqc29uID0ge1xuICAgICAgICAgICAgJ21lcmNoYW50SUQnOiAxNDM2MTI4ODcsXG4gICAgICAgICAgICAnaW52b2ljZU51bWJlcic6IGludm9pY2VOdW1iZXIsXG4gICAgICAgICAgICAnZW1haWwnOiBlbWFpbCxcbiAgICAgICAgICAgICdjb3VudHJ5JzogY291bnRyeSxcbiAgICAgICAgICAgICdkZWxpdmVyeURhdGUnOiBkZWxpdmVyeURhdGVTdHJpbmdcbiAgICAgICAgfTtcbiAgICAgICAgLy8gbnVuanVja3MuY29uZmlndXJlKHsgYXV0b2VzY2FwZTogdHJ1ZSB9KTtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gRE9NLiR0ZW1wbGF0ZS5odG1sKCk7XG4gICAgICAgIC8vIFNjcmV3IG51bmp1Y2tzIC0gNzAwMCBsaW5lcyFcbiAgICAgICAgdmFyIHJlbmRlcmVkID0gaGVscGVycy5yZW5kZXJUZW1wbGF0ZSh0ZW1wbGF0ZSwganNvbik7XG5cbiAgICAgICAgLy8gRGlzcGxheSBHQ1JcbiAgICAgICAgJCgnI2djci1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAkKCcjZ2NyLWNvbnRhaW5lcicpLmh0bWwocmVuZGVyZWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIERPTS4kdGVtcGxhdGUgPSAkKCcjZ2NyLXRlbXBsYXRlJyk7XG4gICAgICAgIERPTS4kY29udGFpbmVyID0gJCgnI2djci1jb250YWluZXInKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICByZW5kZXJHb29nbGVDdXN0b21lclJldmlld3M6IHJlbmRlckdvb2dsZUN1c3RvbWVyUmV2aWV3c1xuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdDUjsiLCIvLyBIZWxwZXIgbW9kdWxlXG5cbnZhciBmb3JtU2VyaWFsaXplID0gcmVxdWlyZSgnZm9ybS1zZXJpYWxpemUnKTtcbnZhciAkID0gcmVxdWlyZSgnY2FzaC1kb20nKTtcblxuZnVuY3Rpb24gaXNJblZpZXdwb3J0KCRlbCkge1xuICB2YXIgZWxlbWVudFRvcCA9ICRlbC5vZmZzZXQoKS50b3A7XG4gIHZhciBlbGVtZW50Qm90dG9tID0gZWxlbWVudFRvcCArICRlbC5vdXRlckhlaWdodCgpO1xuICB2YXIgdmlld3BvcnRUb3AgPSB3aW5kb3cuc2Nyb2xsWTsgLy8kKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gIC8vIElmIGZpeGVkIG5hdmJhclxuICBpZiAoJCgnLmpzLS1uYXZiYXItYmx1ZWJlcnJ5LmZpeGVkLXRvcCcpLmxlbmd0aCkge1xuICAgIHZpZXdwb3J0VG9wICs9ICQoJy5qcy0tbmF2YmFyLWJsdWViZXJyeS5maXhlZC10b3AnKS5vdXRlckhlaWdodCgpO1xuICB9XG4gIHZhciB2aWV3cG9ydEJvdHRvbSA9IHZpZXdwb3J0VG9wICsgJCh3aW5kb3cpLmhlaWdodCgpO1xuICByZXR1cm4gZWxlbWVudEJvdHRvbSA+IHZpZXdwb3J0VG9wICYmIGVsZW1lbnRUb3AgPCB2aWV3cG9ydEJvdHRvbTtcbiAgLy8gcmV0dXJuIGVsZW1lbnRCb3R0b20gPiB2aWV3cG9ydFRvcDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGVtcGxhdGUodGVtcGxhdGUsIGRhdGEpIHtcbiAgY29uc3QgcGF0dGVybiA9IC97e1xccyooXFx3Kz8pXFxzKn19L2c7IC8vIHt7cHJvcGVydHl9fVxuICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZShwYXR0ZXJuLCAoXywgdG9rZW4pID0+IGRhdGFbdG9rZW5dIHx8ICcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0Vmlld3BvcnRTaXplKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApLFxuICAgIGhlaWdodDogTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApXG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChlbCkge1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgIHNjcm9sbExlZnQgPSB3aW5kb3cuc2Nyb2xsWSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3AgPSB3aW5kb3cuc2Nyb2xsWSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICByZXR1cm4geyB0b3A6IHJlY3QudG9wICsgc2Nyb2xsVG9wLCBsZWZ0OiByZWN0LmxlZnQgKyBzY3JvbGxMZWZ0IH07XG59XG5cbmZ1bmN0aW9uIG9iamVjdGlmeUZvcm0oZm9ybUFycmF5KSB7Ly9zZXJpYWxpemUgZGF0YSBmdW5jdGlvblxuICB2YXIgcmV0dXJuQXJyYXkgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtQXJyYXkubGVuZ3RoOyBpKyspe1xuICAgIHJldHVybkFycmF5W2Zvcm1BcnJheVtpXVsnbmFtZSddXSA9IGZvcm1BcnJheVtpXVsndmFsdWUnXTtcbiAgfVxuICByZXR1cm4gcmV0dXJuQXJyYXk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRmlyc3RMYXN0TmFtZShzdHJpbmcpe1xuICB2YXIgb2JqID0ge1xuICAgIGZpcnN0TmFtZTogc3RyaW5nLFxuICAgIGxhc3ROYW1lOiBcIlwiXG4gIH07XG5cbiAgdmFyIGFycmF5ID0gc3RyaW5nLm1hdGNoKC8oXFxTKilcXHMqKC4qKS8pO1xuICBpZiAoYXJyYXkgJiYgYXJyYXkubGVuZ3RoID09IDMpe1xuICAgIG9iai5maXJzdE5hbWUgPSBhcnJheVsxXTtcbiAgICBvYmoubGFzdE5hbWUgPSBhcnJheVsyXTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBhbmltYXRlQ1NTKG5vZGUsIGFuaW1hdGlvbk5hbWUsIGNhbGxiYWNrLCBzcGVlZCkge1xuICB2YXIgYW5pbWF0aW9uU3BlZWQgPSB0eXBlb2Ygc3BlZWQgIT09ICd1bmRlZmluZWQnID8gc3BlZWQgOiAnNTAwbXMnO1xuICBub2RlLnN0eWxlLnNldFByb3BlcnR5KCctLWFuaW1hdGUtZHVyYXRpb24nLCBhbmltYXRpb25TcGVlZCk7XG4gIHZhciBwcmVmaXggPSAnYW5pbWF0ZV9fJztcbiAgbm9kZS5jbGFzc0xpc3QuYWRkKHByZWZpeCsnYW5pbWF0ZWQnLCBwcmVmaXgrYW5pbWF0aW9uTmFtZSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlQW5pbWF0aW9uRW5kKCkge1xuICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKHByZWZpeCsnYW5pbWF0ZWQnLCBwcmVmaXgrYW5pbWF0aW9uTmFtZSk7XG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIGhhbmRsZUFuaW1hdGlvbkVuZCk7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuICB9XG5cbiAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdhbmltYXRpb25lbmQnLCBoYW5kbGVBbmltYXRpb25FbmQpO1xufVxuXG5mdW5jdGlvbiBnZXRGb3JtRGF0YSgkZm9ybSl7XG4gIHZhciBpbmRleGVkX2FycmF5ID0gZm9ybVNlcmlhbGl6ZSgkZm9ybS5nZXQoMCksIHsgaGFzaDogdHJ1ZSB9KTtcbiAgcmV0dXJuIGluZGV4ZWRfYXJyYXk7XG59XG5cbmV4cG9ydHMuaXNJblZpZXdwb3J0ID0gaXNJblZpZXdwb3J0O1xuZXhwb3J0cy5nZXRWaWV3cG9ydFNpemUgPSBnZXRWaWV3cG9ydFNpemU7XG5leHBvcnRzLm9mZnNldCA9IG9mZnNldDtcbmV4cG9ydHMub2JqZWN0aWZ5Rm9ybSA9IG9iamVjdGlmeUZvcm07XG5leHBvcnRzLnBhcnNlRmlyc3RMYXN0TmFtZSA9IHBhcnNlRmlyc3RMYXN0TmFtZTtcbmV4cG9ydHMuYW5pbWF0ZUNTUyA9IGFuaW1hdGVDU1M7XG5leHBvcnRzLmdldEZvcm1EYXRhID0gZ2V0Rm9ybURhdGE7XG5leHBvcnRzLnJlbmRlclRlbXBsYXRlID0gcmVuZGVyVGVtcGxhdGU7IiwidmFyICQgPSByZXF1aXJlKCdjYXNoLWRvbScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCdqcy1jb29raWUnKTtcblxudmFyIERPTSA9IHt9O1xuXG5mdW5jdGlvbiBfY2FjaGVEb20oKSB7XG4gIERPTS4kdGVtcGxhdGUgPSAkKCcjaW50LWJhY2stYnV0dG9uJyk7XG4gIERPTS4kY29udGFpbmVyID0gJCgnI2JhY2stbGluay1jb250YWluZXInKTtcbiAgRE9NLiRjdXJyZW50QmFja0xpbmsgPSAkKCcjZWpzLWJhY2stbGluaycpO1xufVxuXG5mdW5jdGlvbiBfcmVuZGVyQmFja0xpbmsoKXtcbiAgdmFyIHJlbmRlcmVkID0gRE9NLiR0ZW1wbGF0ZS5odG1sKCk7XG4gIERPTS4kY3VycmVudEJhY2tMaW5rLnJlbW92ZSgpO1xuICBET00uJGNvbnRhaW5lci5odG1sKHJlbmRlcmVkKTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgLy8gdmFyIHByZXZpb3VzSHJlZiA9IENvb2tpZXMuZ2V0KCdwcmV2aW91c1VybCcpO1xuICAvLyB2YXIgY3VycmVudEhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgX2NhY2hlRG9tKCk7XG5cbiAgLy8gSWYgcGFnZSB3YXMgbG9hZGVkIGJlZm9yZSB0aGVuIGJhY2sgYnV0dG9uIGFjdHMgbGlrZSBiYWNrIGJ1dHRvblxuICBpZiAoIWNvb2tpZXMuZ2V0KCd3YXNPblNpdGUnKSl7XG4gICAgLy8gSWYgcHJldmlvdXMgdXJsIHNhdmVkIGluIGNvb2tpZXMgaXMgZGlmZmVyZW50IGZyb20gY3VycmVudCAtIG5hdmlnYXRlIHRoZXJlXG4gICAgX3JlbmRlckJhY2tMaW5rKCk7XG4gIH1cblxuICAvLyB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIC8vIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArICg1ICogNjAgKiAxMDAwKSk7IC8vIDUgbWludXRlIGV4cGlyYXRpb25cbiAgLy8gRXhwaXJlczogdGFrZXMgbnVtYmVyIG9mIGRheXM7IDUgbWludXRlcyBpcyA1LzI0KjYwIH4gMC4wMDMgb2YgYSBkYXlcbiAgLy8gQ29va2llcy5zZXQoJ3BhZ2VMb2FkZWQnLCB3aW5kb3cubG9jYXRpb24uaHJlZiwgeyBleHBpcmVzOiAwLjAwMywgc2FtZVNpdGU6ICdzdHJpY3QnIH0pO1xuICBjb29raWVzLnNldCgnd2FzT25TaXRlJywgJ3RydWUnLCB7IGV4cGlyZXM6IDAuMDAzLCBzYW1lU2l0ZTogJ3N0cmljdCcgfSk7XG59XG5cbmV4cG9ydHMuaW5pdCA9IGluaXQ7IiwiLy8gU2hvdyBvciBoaWRlICdCdXknIGJ1dHRvbiBvbiBuYXZiYXIgcHJvZHVjdCBwYWdlXG5cbnZhciAkID0gcmVxdWlyZSgnY2FzaC1kb20nKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xuXG52YXIgRE9NID0ge307XG5cbmZ1bmN0aW9uIF9jYWNoZURvbShlbGVtZW50KSB7XG4gIERPTS4kZWwgPSAkKGVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiBfYmluZEV2ZW50cyhlbGVtZW50KSB7XG4gIGV2ZW50cy5vbignYnV5QnV0dG9uVmlld3BvcnQnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmIChkYXRhLmNvbnRlbnRCdXR0b25WaXNpYmxlKSB7XG4gICAgICBET00uJGVsLnJlbW92ZUNsYXNzKCd2aXNpYmxlJylcbiAgICB9IGVsc2Uge1xuICAgICAgRE9NLiRlbC5hZGRDbGFzcygndmlzaWJsZScpXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50KSB7XG4gICAgLy8gb3B0aW9ucyA9ICQuZXh0ZW5kKG9wdGlvbnMsICQoZWxlbWVudCkuZGF0YSgpKTtcbiAgICBfY2FjaGVEb20oZWxlbWVudCk7XG4gICAgX2JpbmRFdmVudHMoKTtcbiAgICAvLyBfcmVuZGVyKCk7XG4gIH1cbn1cblxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIi8vIEZpeGVzIE5hdmJhciBmb3IgdmllcG9ydCB3aWR0aCBsZXNzIHRoYW4gYSBzZXQgdGhyZXNob2xkXG5cbnZhciAkID0gcmVxdWlyZSgnY2FzaC1kb20nKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG4vLyB2YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcbi8vIHZhciBic0NvbGxhcHNlID0gcmVxdWlyZSgnYm9vdHN0cmFwL2pzL2Rpc3QvY29sbGFwc2UnKTtcblxudmFyIERPTSA9IHt9O1xudmFyIG9wdGlvbnMgPSB7fTtcbi8vIHZhciBmaXhlZCA9IGZhbHNlO1xuLy8gdmFyIGhlaWdodCA9IDA7XG52YXIgYnNDb2xsYXBzZTtcblxuZnVuY3Rpb24gX2NhY2hlRG9tKGVsZW1lbnQpIHtcbiAgRE9NLiRuYXZiYXIgPSAkKGVsZW1lbnQpO1xuICBET00uJG5hdmJhclRvZ2dsZXIgPSBET00uJG5hdmJhci5maW5kKCcubmF2YmFyLXRvZ2dsZXInKTtcbiAgRE9NLiRuYXZiYXJDb2xsYXBzZSA9IERPTS4kbmF2YmFyLmZpbmQoJy5uYXZiYXItY29sbGFwc2UnKTtcbiAgRE9NLiRpY29uT3BlbiA9IERPTS4kbmF2YmFyLmZpbmQoJy5qcy0taWNvbi1vcGVuJyk7XG4gIERPTS4kaWNvbkNsb3NlID0gRE9NLiRuYXZiYXIuZmluZCgnLmpzLS1pY29uLWNsb3NlJyk7XG59XG5cbmZ1bmN0aW9uIF9iaW5kRXZlbnRzKGVsZW1lbnQpIHtcbiAgLy8gQ2xvc2UgbmF2YmFyIHdoZW4gY2xpY2tpbmcgb3V0c2lkZSBvZiB0aGEgbmF2YmFyXG4gIC8vIGV2ZW50cy5vbignZG9jdW1lbnRDbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAvLyAgICAgX2NvbGxhcHNlTmF2YmFyKCk7XG4gIC8vIH0pO1xuXG4gIC8vIENvbGxhcHNlIG5hdmJhciBhZnRlciBjbGlja2luZyBvbiBuYXZiYXIgbGlua1xuICBET00uJG5hdmJhci5vbignY2xpY2snLCAnLm5hdi1saW5rJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgX2NvbGxhcHNlTmF2YmFyKCk7XG4gIH0pO1xuXG4gIC8vIERPTS4kbmF2YmFyLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAvLyAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAvLyB9KTtcblxuICAvLyBTd2FwIG5hdmJhciBpY29ucyBoYW1idXJnZXIgYW5kIGNsb3NlXG4gIERPTS4kbmF2YmFyQ29sbGFwc2Uub24oJ3Nob3cuYnMuY29sbGFwc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgaGVscGVycy5hbmltYXRlQ1NTKERPTS4kaWNvbk9wZW4uZ2V0KDApLCAnYm91bmNlT3V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgRE9NLiRpY29uT3Blbi5oaWRlKCk7XG4gICAgICBET00uJGljb25DbG9zZS5zaG93KCk7XG4gICAgICBoZWxwZXJzLmFuaW1hdGVDU1MoRE9NLiRpY29uQ2xvc2UuZ2V0KDApLCAncm90YXRlSW4nKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgRE9NLiRuYXZiYXJDb2xsYXBzZS5vbignaGlkZS5icy5jb2xsYXBzZScsIGZ1bmN0aW9uICgpIHtcbiAgICBoZWxwZXJzLmFuaW1hdGVDU1MoRE9NLiRpY29uQ2xvc2UuZ2V0KDApLCAncm90YXRlT3V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgRE9NLiRpY29uQ2xvc2UuaGlkZSgpO1xuICAgICAgRE9NLiRpY29uT3Blbi5zaG93KCk7XG4gICAgICBoZWxwZXJzLmFuaW1hdGVDU1MoRE9NLiRpY29uT3Blbi5nZXQoMCksICdib3VuY2VJbicpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gX2NvbGxhcHNlTmF2YmFyKCkge1xuICAvLyBCUzUgQ29sbGFwc2UgcGx1Z2luOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNzQ3Mzg0MTJcbiAgLy8gaWYgdGhlIGluc3RhbmNlIGlzIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgdGhlbiBjcmVhdGUgbmV3IGNvbGxhcHNlXG4gIGlmICh0eXBlb2YgYnNDb2xsYXBzZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGxldCBpZCA9IFwiI1wiICsgRE9NLiRuYXZiYXJDb2xsYXBzZS5hdHRyKFwiaWRcIik7XG4gICAgYnNDb2xsYXBzZSA9IG5ldyBic0NvbGxhcHNlKGlkLCB7XG4gICAgICAgICAgdG9nZ2xlOiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgYnNDb2xsYXBzZS5oaWRlKCk7XG59XG5cbmZ1bmN0aW9uIGluaXQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudCkge1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCAkKGVsZW1lbnQpLmRhdGEoKSk7XG4gICAgX2NhY2hlRG9tKGVsZW1lbnQpO1xuICAgIF9iaW5kRXZlbnRzKCk7XG4gICAgLy8gX3JlbmRlcigpO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIGlzRml4ZWQoKSB7XG4vLyAgIHJldHVybiBmaXhlZDtcbi8vIH1cblxuLy8gZnVuY3Rpb24gZ2V0TmF2YmFySGVpZ2h0KCkge1xuLy8gICByZXR1cm4gaGVpZ2h0O1xuLy8gfVxuXG5cbmV4cG9ydHMuaW5pdCA9IGluaXQ7XG4vLyBleHBvcnRzLmlzRml4ZWQgPSBpc0ZpeGVkO1xuLy8gZXhwb3J0cy5nZXROYXZiYXJIZWlnaHQgPSBnZXROYXZiYXJIZWlnaHQ7IiwidmFyICQgPSByZXF1aXJlKCdjYXNoLWRvbScpO1xudmFyIGJvb3RzdHJhcCA9IHJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxudmFyIGlkID0gMDtcblxuLy8gVHlwZSBpcyBib290c3RyYXAgYmFja2dyb3VuZCBjb2xvciBjbGFzczpcbi8vIGh0dHBzOi8vZ2V0Ym9vdHN0cmFwLmNvbS9kb2NzLzUuMy9jb21wb25lbnRzL3RvYXN0cy8jY29sb3Itc2NoZW1lc1xuXG4vLyBwcmltYXJ5IHNlY29uZGFyeSBzdWNjZXNzIGRhbmdlciB3YXJuaW5nIGluZm8gbGlnaHQgZGFya1xuXG5mdW5jdGlvbiBub3RpZnkodHlwZSwgbWVzc2FnZSwgdGltZW91dCkge1xuICB2YXIgbWlsbGlzZWNvbmRzID0gdHlwZW9mIHRpbWVvdXQgIT09ICd1bmRlZmluZWQnID8gdGltZW91dCA6IDUwMDA7XG5cbiAgLy8gQ3JlYXRlIHRvYXN0IGVsZW1lbnQgKGNhc2ggY29sbGVjdGlvbilcbiAgdmFyIHRlbXBsYXRlID0gJCgnI3RvYXN0LXRlbXBsYXRlJykuaHRtbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICB0eXBlOiAgICB0eXBlLFxuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgaWQ6ICAgICAgXCJ0b2FzdC1cIiArIGlkXG4gIH07XG4gIHZhciB0b2FzdEhUTUwgPSBoZWxwZXJzLnJlbmRlclRlbXBsYXRlKHRlbXBsYXRlLCBkYXRhKTtcblxuICAvLyBBcHBlbmQgdG9hc3QgSFRNTCB0byBjb250YWluZXJcbiAgdmFyICR0b2FzdENvbnRhaW5lciA9ICQoJyN0b2FzdC1jb250YWluZXInKTtcbiAgJCh0b2FzdEhUTUwpLmFwcGVuZFRvKCR0b2FzdENvbnRhaW5lci5nZXQoMCkpO1xuXG4gIC8vIE9idGFpbiB0b2FzdCBlbGVtZW50XG4gICR0b2FzdCA9ICQoJyN0b2FzdC0nK2lkKTtcblxuICAvLyBIb29rIHVwIEJTIGphdmFzY3JpcHQgYW5kIHNob3dcbiAgY29uc3QgdG9hc3RCb290c3RyYXAgPSBib290c3RyYXAuVG9hc3QuZ2V0T3JDcmVhdGVJbnN0YW5jZSgkdG9hc3QuZ2V0KDApKTtcbiAgdG9hc3RCb290c3RyYXAuc2hvdyh7ZGVsYXk6IG1pbGxpc2Vjb25kc30pO1xuXG4gIC8vIERlbGV0ZSB0b2FzdCBlbGVtZW50IGFmdGVyIGhpZGluZ1xuICAkdG9hc3QuZ2V0KDApLmFkZEV2ZW50TGlzdGVuZXIoJ2hpZGRlbi5icy50b2FzdCcsIGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgfSk7XG5cbiAgLy8gSW5jcmVtZW50IGlkXG4gIGlkKys7XG59XG5cbmV4cG9ydHMubm90aWZ5ID0gbm90aWZ5OyIsIi8vIFBldHIgU3RlYW5vdjogQ09SUyBpc3N1ZXMgLSBkaXNhYmxlZC5cblxudmFyICQgPSByZXF1aXJlKCdjYXNoLWRvbScpO1xuXG52YXIgU25pcGNhcnRMb2FkT25DbGljayA9IGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgRE9NID0ge307XG4gICAgdmFyIGxvYWRpbmdGbGFnID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBfY2FjaGVEb20oKXtcbiAgICAgICAgRE9NLiR0cmlnZ2VyRWxlbWVudHMgPSAkKFwiLnNuaXBjYXJ0LWNoZWNrb3V0LCAuc25pcGNhcnQtYWRkLWl0ZW1cIik7XG4gICAgICAgIERPTS4kc25pcGNhcnRUZW1wbGF0ZSA9ICQoJyNzbmlwY2FydC10ZW1wbGF0ZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9iaW5kRXZlbnRzKCl7XG4gICAgICAgIERPTS4kdHJpZ2dlckVsZW1lbnRzLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoIWxvYWRpbmdGbGFnKXtcbiAgICAgICAgICAgICAgICBsb2FkaW5nRmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgRE9NLiR0cmlnZ2VyRWwgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIF9zdGFydFNwaW5uZXIoRE9NLiR0cmlnZ2VyRWwpO1xuICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gRE9NLiRzbmlwY2FydFRlbXBsYXRlLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICRwYXJlbnQuYXBwZW5kKERPTS4kc25pcGNhcnRUZW1wbGF0ZS5odG1sKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzbmlwY2FydC5yZWFkeScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBTbmlwY2FydC5ldmVudHMub24oJ3NuaXBjYXJ0LmluaXRpYWxpemVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgX3N0b3BTcGlubmVyKERPTS4kdHJpZ2dlckVsKTtcbiAgICAgICAgICAgICAgICBET00uJHRyaWdnZXJFbC5nZXQoMCkuY2xpY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc3RhcnRTcGlubmVyKCRlbGVtZW50KSB7XG4gICAgICAgIC8vIElmIGNhcnQgYnV0dG9uXG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKFwic3RvcmUtbG9hZGluZ1wiKTtcbiAgICAgICAgLy8gSWYgc3VibWl0IGJ1dHRvblxuICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdmb3JtIGJ1dHRvblt0eXBlPXN1Ym1pdF0nKS5hZGRDbGFzcyhcInN0b3JlLWxvYWRpbmdcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N0b3BTcGlubmVyKCRlbGVtZW50KSB7XG4gICAgICAgIC8vIElmIGNhcnQgYnV0dG9uXG4gICAgICAgICRlbGVtZW50LnJlbW92ZUNsYXNzKFwic3RvcmUtbG9hZGluZ1wiKTtcbiAgICAgICAgLy8gSWYgc3VibWl0IGJ1dHRvblxuICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdmb3JtIGJ1dHRvblt0eXBlPXN1Ym1pdF0nKS5yZW1vdmVDbGFzcyhcInN0b3JlLWxvYWRpbmdcIik7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBfY2FjaGVEb20oKTtcbiAgICAgICAgX2JpbmRFdmVudHMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU25pcGNhcnRMb2FkT25DbGljazsiLCIvKipcbiAqIEBwb3BwZXJqcy9jb3JlIHYyLjExLjggLSBNSVQgTGljZW5zZVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxuZnVuY3Rpb24gZ2V0V2luZG93KG5vZGUpIHtcbiAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICBpZiAobm9kZS50b1N0cmluZygpICE9PSAnW29iamVjdCBXaW5kb3ddJykge1xuICAgIHZhciBvd25lckRvY3VtZW50ID0gbm9kZS5vd25lckRvY3VtZW50O1xuICAgIHJldHVybiBvd25lckRvY3VtZW50ID8gb3duZXJEb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3cgOiB3aW5kb3c7XG4gIH1cblxuICByZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgdmFyIE93bkVsZW1lbnQgPSBnZXRXaW5kb3cobm9kZSkuRWxlbWVudDtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBPd25FbGVtZW50IHx8IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBpc0hUTUxFbGVtZW50KG5vZGUpIHtcbiAgdmFyIE93bkVsZW1lbnQgPSBnZXRXaW5kb3cobm9kZSkuSFRNTEVsZW1lbnQ7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgT3duRWxlbWVudCB8fCBub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGlzU2hhZG93Um9vdChub2RlKSB7XG4gIC8vIElFIDExIGhhcyBubyBTaGFkb3dSb290XG4gIGlmICh0eXBlb2YgU2hhZG93Um9vdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgT3duRWxlbWVudCA9IGdldFdpbmRvdyhub2RlKS5TaGFkb3dSb290O1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIE93bkVsZW1lbnQgfHwgbm9kZSBpbnN0YW5jZW9mIFNoYWRvd1Jvb3Q7XG59XG5cbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG5cbmZ1bmN0aW9uIGdldFVBU3RyaW5nKCkge1xuICB2YXIgdWFEYXRhID0gbmF2aWdhdG9yLnVzZXJBZ2VudERhdGE7XG5cbiAgaWYgKHVhRGF0YSAhPSBudWxsICYmIHVhRGF0YS5icmFuZHMgJiYgQXJyYXkuaXNBcnJheSh1YURhdGEuYnJhbmRzKSkge1xuICAgIHJldHVybiB1YURhdGEuYnJhbmRzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW0uYnJhbmQgKyBcIi9cIiArIGl0ZW0udmVyc2lvbjtcbiAgICB9KS5qb2luKCcgJyk7XG4gIH1cblxuICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuZnVuY3Rpb24gaXNMYXlvdXRWaWV3cG9ydCgpIHtcbiAgcmV0dXJuICEvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KGdldFVBU3RyaW5nKCkpO1xufVxuXG5mdW5jdGlvbiBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWxlbWVudCwgaW5jbHVkZVNjYWxlLCBpc0ZpeGVkU3RyYXRlZ3kpIHtcbiAgaWYgKGluY2x1ZGVTY2FsZSA9PT0gdm9pZCAwKSB7XG4gICAgaW5jbHVkZVNjYWxlID0gZmFsc2U7XG4gIH1cblxuICBpZiAoaXNGaXhlZFN0cmF0ZWd5ID09PSB2b2lkIDApIHtcbiAgICBpc0ZpeGVkU3RyYXRlZ3kgPSBmYWxzZTtcbiAgfVxuXG4gIHZhciBjbGllbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHNjYWxlWCA9IDE7XG4gIHZhciBzY2FsZVkgPSAxO1xuXG4gIGlmIChpbmNsdWRlU2NhbGUgJiYgaXNIVE1MRWxlbWVudChlbGVtZW50KSkge1xuICAgIHNjYWxlWCA9IGVsZW1lbnQub2Zmc2V0V2lkdGggPiAwID8gcm91bmQoY2xpZW50UmVjdC53aWR0aCkgLyBlbGVtZW50Lm9mZnNldFdpZHRoIHx8IDEgOiAxO1xuICAgIHNjYWxlWSA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0ID4gMCA/IHJvdW5kKGNsaWVudFJlY3QuaGVpZ2h0KSAvIGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IDEgOiAxO1xuICB9XG5cbiAgdmFyIF9yZWYgPSBpc0VsZW1lbnQoZWxlbWVudCkgPyBnZXRXaW5kb3coZWxlbWVudCkgOiB3aW5kb3csXG4gICAgICB2aXN1YWxWaWV3cG9ydCA9IF9yZWYudmlzdWFsVmlld3BvcnQ7XG5cbiAgdmFyIGFkZFZpc3VhbE9mZnNldHMgPSAhaXNMYXlvdXRWaWV3cG9ydCgpICYmIGlzRml4ZWRTdHJhdGVneTtcbiAgdmFyIHggPSAoY2xpZW50UmVjdC5sZWZ0ICsgKGFkZFZpc3VhbE9mZnNldHMgJiYgdmlzdWFsVmlld3BvcnQgPyB2aXN1YWxWaWV3cG9ydC5vZmZzZXRMZWZ0IDogMCkpIC8gc2NhbGVYO1xuICB2YXIgeSA9IChjbGllbnRSZWN0LnRvcCArIChhZGRWaXN1YWxPZmZzZXRzICYmIHZpc3VhbFZpZXdwb3J0ID8gdmlzdWFsVmlld3BvcnQub2Zmc2V0VG9wIDogMCkpIC8gc2NhbGVZO1xuICB2YXIgd2lkdGggPSBjbGllbnRSZWN0LndpZHRoIC8gc2NhbGVYO1xuICB2YXIgaGVpZ2h0ID0gY2xpZW50UmVjdC5oZWlnaHQgLyBzY2FsZVk7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHRvcDogeSxcbiAgICByaWdodDogeCArIHdpZHRoLFxuICAgIGJvdHRvbTogeSArIGhlaWdodCxcbiAgICBsZWZ0OiB4LFxuICAgIHg6IHgsXG4gICAgeTogeVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRXaW5kb3dTY3JvbGwobm9kZSkge1xuICB2YXIgd2luID0gZ2V0V2luZG93KG5vZGUpO1xuICB2YXIgc2Nyb2xsTGVmdCA9IHdpbi5wYWdlWE9mZnNldDtcbiAgdmFyIHNjcm9sbFRvcCA9IHdpbi5wYWdlWU9mZnNldDtcbiAgcmV0dXJuIHtcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogc2Nyb2xsVG9wXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEhUTUxFbGVtZW50U2Nyb2xsKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBzY3JvbGxMZWZ0OiBlbGVtZW50LnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBlbGVtZW50LnNjcm9sbFRvcFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROb2RlU2Nyb2xsKG5vZGUpIHtcbiAgaWYgKG5vZGUgPT09IGdldFdpbmRvdyhub2RlKSB8fCAhaXNIVE1MRWxlbWVudChub2RlKSkge1xuICAgIHJldHVybiBnZXRXaW5kb3dTY3JvbGwobm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGdldEhUTUxFbGVtZW50U2Nyb2xsKG5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE5vZGVOYW1lKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQgPyAoZWxlbWVudC5ub2RlTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldERvY3VtZW50RWxlbWVudChlbGVtZW50KSB7XG4gIC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLXJldHVybl06IGFzc3VtZSBib2R5IGlzIGFsd2F5cyBhdmFpbGFibGVcbiAgcmV0dXJuICgoaXNFbGVtZW50KGVsZW1lbnQpID8gZWxlbWVudC5vd25lckRvY3VtZW50IDogLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gIGVsZW1lbnQuZG9jdW1lbnQpIHx8IHdpbmRvdy5kb2N1bWVudCkuZG9jdW1lbnRFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBnZXRXaW5kb3dTY3JvbGxCYXJYKGVsZW1lbnQpIHtcbiAgLy8gSWYgPGh0bWw+IGhhcyBhIENTUyB3aWR0aCBncmVhdGVyIHRoYW4gdGhlIHZpZXdwb3J0LCB0aGVuIHRoaXMgd2lsbCBiZVxuICAvLyBpbmNvcnJlY3QgZm9yIFJUTC5cbiAgLy8gUG9wcGVyIDEgaXMgYnJva2VuIGluIHRoaXMgY2FzZSBhbmQgbmV2ZXIgaGFkIGEgYnVnIHJlcG9ydCBzbyBsZXQncyBhc3N1bWVcbiAgLy8gaXQncyBub3QgYW4gaXNzdWUuIEkgZG9uJ3QgdGhpbmsgYW55b25lIGV2ZXIgc3BlY2lmaWVzIHdpZHRoIG9uIDxodG1sPlxuICAvLyBhbnl3YXkuXG4gIC8vIEJyb3dzZXJzIHdoZXJlIHRoZSBsZWZ0IHNjcm9sbGJhciBkb2Vzbid0IGNhdXNlIGFuIGlzc3VlIHJlcG9ydCBgMGAgZm9yXG4gIC8vIHRoaXMgKGUuZy4gRWRnZSAyMDE5LCBJRTExLCBTYWZhcmkpXG4gIHJldHVybiBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpKS5sZWZ0ICsgZ2V0V2luZG93U2Nyb2xsKGVsZW1lbnQpLnNjcm9sbExlZnQ7XG59XG5cbmZ1bmN0aW9uIGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkge1xuICByZXR1cm4gZ2V0V2luZG93KGVsZW1lbnQpLmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIGlzU2Nyb2xsUGFyZW50KGVsZW1lbnQpIHtcbiAgLy8gRmlyZWZveCB3YW50cyB1cyB0byBjaGVjayBgLXhgIGFuZCBgLXlgIHZhcmlhdGlvbnMgYXMgd2VsbFxuICB2YXIgX2dldENvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgb3ZlcmZsb3cgPSBfZ2V0Q29tcHV0ZWRTdHlsZS5vdmVyZmxvdyxcbiAgICAgIG92ZXJmbG93WCA9IF9nZXRDb21wdXRlZFN0eWxlLm92ZXJmbG93WCxcbiAgICAgIG92ZXJmbG93WSA9IF9nZXRDb21wdXRlZFN0eWxlLm92ZXJmbG93WTtcblxuICByZXR1cm4gL2F1dG98c2Nyb2xsfG92ZXJsYXl8aGlkZGVuLy50ZXN0KG92ZXJmbG93ICsgb3ZlcmZsb3dZICsgb3ZlcmZsb3dYKTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50U2NhbGVkKGVsZW1lbnQpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgc2NhbGVYID0gcm91bmQocmVjdC53aWR0aCkgLyBlbGVtZW50Lm9mZnNldFdpZHRoIHx8IDE7XG4gIHZhciBzY2FsZVkgPSByb3VuZChyZWN0LmhlaWdodCkgLyBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCAxO1xuICByZXR1cm4gc2NhbGVYICE9PSAxIHx8IHNjYWxlWSAhPT0gMTtcbn0gLy8gUmV0dXJucyB0aGUgY29tcG9zaXRlIHJlY3Qgb2YgYW4gZWxlbWVudCByZWxhdGl2ZSB0byBpdHMgb2Zmc2V0UGFyZW50LlxuLy8gQ29tcG9zaXRlIG1lYW5zIGl0IHRha2VzIGludG8gYWNjb3VudCB0cmFuc2Zvcm1zIGFzIHdlbGwgYXMgbGF5b3V0LlxuXG5cbmZ1bmN0aW9uIGdldENvbXBvc2l0ZVJlY3QoZWxlbWVudE9yVmlydHVhbEVsZW1lbnQsIG9mZnNldFBhcmVudCwgaXNGaXhlZCkge1xuICBpZiAoaXNGaXhlZCA9PT0gdm9pZCAwKSB7XG4gICAgaXNGaXhlZCA9IGZhbHNlO1xuICB9XG5cbiAgdmFyIGlzT2Zmc2V0UGFyZW50QW5FbGVtZW50ID0gaXNIVE1MRWxlbWVudChvZmZzZXRQYXJlbnQpO1xuICB2YXIgb2Zmc2V0UGFyZW50SXNTY2FsZWQgPSBpc0hUTUxFbGVtZW50KG9mZnNldFBhcmVudCkgJiYgaXNFbGVtZW50U2NhbGVkKG9mZnNldFBhcmVudCk7XG4gIHZhciBkb2N1bWVudEVsZW1lbnQgPSBnZXREb2N1bWVudEVsZW1lbnQob2Zmc2V0UGFyZW50KTtcbiAgdmFyIHJlY3QgPSBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWxlbWVudE9yVmlydHVhbEVsZW1lbnQsIG9mZnNldFBhcmVudElzU2NhbGVkLCBpc0ZpeGVkKTtcbiAgdmFyIHNjcm9sbCA9IHtcbiAgICBzY3JvbGxMZWZ0OiAwLFxuICAgIHNjcm9sbFRvcDogMFxuICB9O1xuICB2YXIgb2Zmc2V0cyA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcblxuICBpZiAoaXNPZmZzZXRQYXJlbnRBbkVsZW1lbnQgfHwgIWlzT2Zmc2V0UGFyZW50QW5FbGVtZW50ICYmICFpc0ZpeGVkKSB7XG4gICAgaWYgKGdldE5vZGVOYW1lKG9mZnNldFBhcmVudCkgIT09ICdib2R5JyB8fCAvLyBodHRwczovL2dpdGh1Yi5jb20vcG9wcGVyanMvcG9wcGVyLWNvcmUvaXNzdWVzLzEwNzhcbiAgICBpc1Njcm9sbFBhcmVudChkb2N1bWVudEVsZW1lbnQpKSB7XG4gICAgICBzY3JvbGwgPSBnZXROb2RlU2Nyb2xsKG9mZnNldFBhcmVudCk7XG4gICAgfVxuXG4gICAgaWYgKGlzSFRNTEVsZW1lbnQob2Zmc2V0UGFyZW50KSkge1xuICAgICAgb2Zmc2V0cyA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdChvZmZzZXRQYXJlbnQsIHRydWUpO1xuICAgICAgb2Zmc2V0cy54ICs9IG9mZnNldFBhcmVudC5jbGllbnRMZWZ0O1xuICAgICAgb2Zmc2V0cy55ICs9IG9mZnNldFBhcmVudC5jbGllbnRUb3A7XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIG9mZnNldHMueCA9IGdldFdpbmRvd1Njcm9sbEJhclgoZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHg6IHJlY3QubGVmdCArIHNjcm9sbC5zY3JvbGxMZWZ0IC0gb2Zmc2V0cy54LFxuICAgIHk6IHJlY3QudG9wICsgc2Nyb2xsLnNjcm9sbFRvcCAtIG9mZnNldHMueSxcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0XG4gIH07XG59XG5cbi8vIG1lYW5zIGl0IGRvZXNuJ3QgdGFrZSBpbnRvIGFjY291bnQgdHJhbnNmb3Jtcy5cblxuZnVuY3Rpb24gZ2V0TGF5b3V0UmVjdChlbGVtZW50KSB7XG4gIHZhciBjbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnQpOyAvLyBVc2UgdGhlIGNsaWVudFJlY3Qgc2l6ZXMgaWYgaXQncyBub3QgYmVlbiB0cmFuc2Zvcm1lZC5cbiAgLy8gRml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy8xMjIzXG5cbiAgdmFyIHdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gIGlmIChNYXRoLmFicyhjbGllbnRSZWN0LndpZHRoIC0gd2lkdGgpIDw9IDEpIHtcbiAgICB3aWR0aCA9IGNsaWVudFJlY3Qud2lkdGg7XG4gIH1cblxuICBpZiAoTWF0aC5hYnMoY2xpZW50UmVjdC5oZWlnaHQgLSBoZWlnaHQpIDw9IDEpIHtcbiAgICBoZWlnaHQgPSBjbGllbnRSZWN0LmhlaWdodDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeDogZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgIHk6IGVsZW1lbnQub2Zmc2V0VG9wLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnROb2RlKGVsZW1lbnQpIHtcbiAgaWYgKGdldE5vZGVOYW1lKGVsZW1lbnQpID09PSAnaHRtbCcpIHtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiAoLy8gdGhpcyBpcyBhIHF1aWNrZXIgKGJ1dCBsZXNzIHR5cGUgc2FmZSkgd2F5IHRvIHNhdmUgcXVpdGUgc29tZSBieXRlcyBmcm9tIHRoZSBidW5kbGVcbiAgICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dXG4gICAgLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gICAgZWxlbWVudC5hc3NpZ25lZFNsb3QgfHwgLy8gc3RlcCBpbnRvIHRoZSBzaGFkb3cgRE9NIG9mIHRoZSBwYXJlbnQgb2YgYSBzbG90dGVkIG5vZGVcbiAgICBlbGVtZW50LnBhcmVudE5vZGUgfHwgKCAvLyBET00gRWxlbWVudCBkZXRlY3RlZFxuICAgIGlzU2hhZG93Um9vdChlbGVtZW50KSA/IGVsZW1lbnQuaG9zdCA6IG51bGwpIHx8IC8vIFNoYWRvd1Jvb3QgZGV0ZWN0ZWRcbiAgICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1jYWxsXTogSFRNTEVsZW1lbnQgaXMgYSBOb2RlXG4gICAgZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpIC8vIGZhbGxiYWNrXG5cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsUGFyZW50KG5vZGUpIHtcbiAgaWYgKFsnaHRtbCcsICdib2R5JywgJyNkb2N1bWVudCddLmluZGV4T2YoZ2V0Tm9kZU5hbWUobm9kZSkpID49IDApIHtcbiAgICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dOiBhc3N1bWUgYm9keSBpcyBhbHdheXMgYXZhaWxhYmxlXG4gICAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudC5ib2R5O1xuICB9XG5cbiAgaWYgKGlzSFRNTEVsZW1lbnQobm9kZSkgJiYgaXNTY3JvbGxQYXJlbnQobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHJldHVybiBnZXRTY3JvbGxQYXJlbnQoZ2V0UGFyZW50Tm9kZShub2RlKSk7XG59XG5cbi8qXG5naXZlbiBhIERPTSBlbGVtZW50LCByZXR1cm4gdGhlIGxpc3Qgb2YgYWxsIHNjcm9sbCBwYXJlbnRzLCB1cCB0aGUgbGlzdCBvZiBhbmNlc29yc1xudW50aWwgd2UgZ2V0IHRvIHRoZSB0b3Agd2luZG93IG9iamVjdC4gVGhpcyBsaXN0IGlzIHdoYXQgd2UgYXR0YWNoIHNjcm9sbCBsaXN0ZW5lcnNcbnRvLCBiZWNhdXNlIGlmIGFueSBvZiB0aGVzZSBwYXJlbnQgZWxlbWVudHMgc2Nyb2xsLCB3ZSdsbCBuZWVkIHRvIHJlLWNhbGN1bGF0ZSB0aGVcbnJlZmVyZW5jZSBlbGVtZW50J3MgcG9zaXRpb24uXG4qL1xuXG5mdW5jdGlvbiBsaXN0U2Nyb2xsUGFyZW50cyhlbGVtZW50LCBsaXN0KSB7XG4gIHZhciBfZWxlbWVudCRvd25lckRvY3VtZW47XG5cbiAgaWYgKGxpc3QgPT09IHZvaWQgMCkge1xuICAgIGxpc3QgPSBbXTtcbiAgfVxuXG4gIHZhciBzY3JvbGxQYXJlbnQgPSBnZXRTY3JvbGxQYXJlbnQoZWxlbWVudCk7XG4gIHZhciBpc0JvZHkgPSBzY3JvbGxQYXJlbnQgPT09ICgoX2VsZW1lbnQkb3duZXJEb2N1bWVuID0gZWxlbWVudC5vd25lckRvY3VtZW50KSA9PSBudWxsID8gdm9pZCAwIDogX2VsZW1lbnQkb3duZXJEb2N1bWVuLmJvZHkpO1xuICB2YXIgd2luID0gZ2V0V2luZG93KHNjcm9sbFBhcmVudCk7XG4gIHZhciB0YXJnZXQgPSBpc0JvZHkgPyBbd2luXS5jb25jYXQod2luLnZpc3VhbFZpZXdwb3J0IHx8IFtdLCBpc1Njcm9sbFBhcmVudChzY3JvbGxQYXJlbnQpID8gc2Nyb2xsUGFyZW50IDogW10pIDogc2Nyb2xsUGFyZW50O1xuICB2YXIgdXBkYXRlZExpc3QgPSBsaXN0LmNvbmNhdCh0YXJnZXQpO1xuICByZXR1cm4gaXNCb2R5ID8gdXBkYXRlZExpc3QgOiAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1jYWxsXTogaXNCb2R5IHRlbGxzIHVzIHRhcmdldCB3aWxsIGJlIGFuIEhUTUxFbGVtZW50IGhlcmVcbiAgdXBkYXRlZExpc3QuY29uY2F0KGxpc3RTY3JvbGxQYXJlbnRzKGdldFBhcmVudE5vZGUodGFyZ2V0KSkpO1xufVxuXG5mdW5jdGlvbiBpc1RhYmxlRWxlbWVudChlbGVtZW50KSB7XG4gIHJldHVybiBbJ3RhYmxlJywgJ3RkJywgJ3RoJ10uaW5kZXhPZihnZXROb2RlTmFtZShlbGVtZW50KSkgPj0gMDtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZU9mZnNldFBhcmVudChlbGVtZW50KSB7XG4gIGlmICghaXNIVE1MRWxlbWVudChlbGVtZW50KSB8fCAvLyBodHRwczovL2dpdGh1Yi5jb20vcG9wcGVyanMvcG9wcGVyLWNvcmUvaXNzdWVzLzgzN1xuICBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLnBvc2l0aW9uID09PSAnZml4ZWQnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5vZmZzZXRQYXJlbnQ7XG59IC8vIGAub2Zmc2V0UGFyZW50YCByZXBvcnRzIGBudWxsYCBmb3IgZml4ZWQgZWxlbWVudHMsIHdoaWxlIGFic29sdXRlIGVsZW1lbnRzXG4vLyByZXR1cm4gdGhlIGNvbnRhaW5pbmcgYmxvY2tcblxuXG5mdW5jdGlvbiBnZXRDb250YWluaW5nQmxvY2soZWxlbWVudCkge1xuICB2YXIgaXNGaXJlZm94ID0gL2ZpcmVmb3gvaS50ZXN0KGdldFVBU3RyaW5nKCkpO1xuICB2YXIgaXNJRSA9IC9UcmlkZW50L2kudGVzdChnZXRVQVN0cmluZygpKTtcblxuICBpZiAoaXNJRSAmJiBpc0hUTUxFbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgLy8gSW4gSUUgOSwgMTAgYW5kIDExIGZpeGVkIGVsZW1lbnRzIGNvbnRhaW5pbmcgYmxvY2sgaXMgYWx3YXlzIGVzdGFibGlzaGVkIGJ5IHRoZSB2aWV3cG9ydFxuICAgIHZhciBlbGVtZW50Q3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblxuICAgIGlmIChlbGVtZW50Q3NzLnBvc2l0aW9uID09PSAnZml4ZWQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICB2YXIgY3VycmVudE5vZGUgPSBnZXRQYXJlbnROb2RlKGVsZW1lbnQpO1xuXG4gIGlmIChpc1NoYWRvd1Jvb3QoY3VycmVudE5vZGUpKSB7XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5ob3N0O1xuICB9XG5cbiAgd2hpbGUgKGlzSFRNTEVsZW1lbnQoY3VycmVudE5vZGUpICYmIFsnaHRtbCcsICdib2R5J10uaW5kZXhPZihnZXROb2RlTmFtZShjdXJyZW50Tm9kZSkpIDwgMCkge1xuICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKGN1cnJlbnROb2RlKTsgLy8gVGhpcyBpcyBub24tZXhoYXVzdGl2ZSBidXQgY292ZXJzIHRoZSBtb3N0IGNvbW1vbiBDU1MgcHJvcGVydGllcyB0aGF0XG4gICAgLy8gY3JlYXRlIGEgY29udGFpbmluZyBibG9jay5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ29udGFpbmluZ19ibG9jayNpZGVudGlmeWluZ190aGVfY29udGFpbmluZ19ibG9ja1xuXG4gICAgaWYgKGNzcy50cmFuc2Zvcm0gIT09ICdub25lJyB8fCBjc3MucGVyc3BlY3RpdmUgIT09ICdub25lJyB8fCBjc3MuY29udGFpbiA9PT0gJ3BhaW50JyB8fCBbJ3RyYW5zZm9ybScsICdwZXJzcGVjdGl2ZSddLmluZGV4T2YoY3NzLndpbGxDaGFuZ2UpICE9PSAtMSB8fCBpc0ZpcmVmb3ggJiYgY3NzLndpbGxDaGFuZ2UgPT09ICdmaWx0ZXInIHx8IGlzRmlyZWZveCAmJiBjc3MuZmlsdGVyICYmIGNzcy5maWx0ZXIgIT09ICdub25lJykge1xuICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59IC8vIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3IgcG9zaXRpb25lZCBlbGVtZW50LiBIYW5kbGVzIHNvbWUgZWRnZSBjYXNlcyxcbi8vIHN1Y2ggYXMgdGFibGUgYW5jZXN0b3JzIGFuZCBjcm9zcyBicm93c2VyIGJ1Z3MuXG5cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0UGFyZW50KGVsZW1lbnQpIHtcbiAgdmFyIHdpbmRvdyA9IGdldFdpbmRvdyhlbGVtZW50KTtcbiAgdmFyIG9mZnNldFBhcmVudCA9IGdldFRydWVPZmZzZXRQYXJlbnQoZWxlbWVudCk7XG5cbiAgd2hpbGUgKG9mZnNldFBhcmVudCAmJiBpc1RhYmxlRWxlbWVudChvZmZzZXRQYXJlbnQpICYmIGdldENvbXB1dGVkU3R5bGUob2Zmc2V0UGFyZW50KS5wb3NpdGlvbiA9PT0gJ3N0YXRpYycpIHtcbiAgICBvZmZzZXRQYXJlbnQgPSBnZXRUcnVlT2Zmc2V0UGFyZW50KG9mZnNldFBhcmVudCk7XG4gIH1cblxuICBpZiAob2Zmc2V0UGFyZW50ICYmIChnZXROb2RlTmFtZShvZmZzZXRQYXJlbnQpID09PSAnaHRtbCcgfHwgZ2V0Tm9kZU5hbWUob2Zmc2V0UGFyZW50KSA9PT0gJ2JvZHknICYmIGdldENvbXB1dGVkU3R5bGUob2Zmc2V0UGFyZW50KS5wb3NpdGlvbiA9PT0gJ3N0YXRpYycpKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuXG4gIHJldHVybiBvZmZzZXRQYXJlbnQgfHwgZ2V0Q29udGFpbmluZ0Jsb2NrKGVsZW1lbnQpIHx8IHdpbmRvdztcbn1cblxudmFyIHRvcCA9ICd0b3AnO1xudmFyIGJvdHRvbSA9ICdib3R0b20nO1xudmFyIHJpZ2h0ID0gJ3JpZ2h0JztcbnZhciBsZWZ0ID0gJ2xlZnQnO1xudmFyIGF1dG8gPSAnYXV0byc7XG52YXIgYmFzZVBsYWNlbWVudHMgPSBbdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0XTtcbnZhciBzdGFydCA9ICdzdGFydCc7XG52YXIgZW5kID0gJ2VuZCc7XG52YXIgY2xpcHBpbmdQYXJlbnRzID0gJ2NsaXBwaW5nUGFyZW50cyc7XG52YXIgdmlld3BvcnQgPSAndmlld3BvcnQnO1xudmFyIHBvcHBlciA9ICdwb3BwZXInO1xudmFyIHJlZmVyZW5jZSA9ICdyZWZlcmVuY2UnO1xudmFyIHZhcmlhdGlvblBsYWNlbWVudHMgPSAvKiNfX1BVUkVfXyovYmFzZVBsYWNlbWVudHMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHBsYWNlbWVudCkge1xuICByZXR1cm4gYWNjLmNvbmNhdChbcGxhY2VtZW50ICsgXCItXCIgKyBzdGFydCwgcGxhY2VtZW50ICsgXCItXCIgKyBlbmRdKTtcbn0sIFtdKTtcbnZhciBwbGFjZW1lbnRzID0gLyojX19QVVJFX18qL1tdLmNvbmNhdChiYXNlUGxhY2VtZW50cywgW2F1dG9dKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gIHJldHVybiBhY2MuY29uY2F0KFtwbGFjZW1lbnQsIHBsYWNlbWVudCArIFwiLVwiICsgc3RhcnQsIHBsYWNlbWVudCArIFwiLVwiICsgZW5kXSk7XG59LCBbXSk7IC8vIG1vZGlmaWVycyB0aGF0IG5lZWQgdG8gcmVhZCB0aGUgRE9NXG5cbnZhciBiZWZvcmVSZWFkID0gJ2JlZm9yZVJlYWQnO1xudmFyIHJlYWQgPSAncmVhZCc7XG52YXIgYWZ0ZXJSZWFkID0gJ2FmdGVyUmVhZCc7IC8vIHB1cmUtbG9naWMgbW9kaWZpZXJzXG5cbnZhciBiZWZvcmVNYWluID0gJ2JlZm9yZU1haW4nO1xudmFyIG1haW4gPSAnbWFpbic7XG52YXIgYWZ0ZXJNYWluID0gJ2FmdGVyTWFpbic7IC8vIG1vZGlmaWVyIHdpdGggdGhlIHB1cnBvc2UgdG8gd3JpdGUgdG8gdGhlIERPTSAob3Igd3JpdGUgaW50byBhIGZyYW1ld29yayBzdGF0ZSlcblxudmFyIGJlZm9yZVdyaXRlID0gJ2JlZm9yZVdyaXRlJztcbnZhciB3cml0ZSA9ICd3cml0ZSc7XG52YXIgYWZ0ZXJXcml0ZSA9ICdhZnRlcldyaXRlJztcbnZhciBtb2RpZmllclBoYXNlcyA9IFtiZWZvcmVSZWFkLCByZWFkLCBhZnRlclJlYWQsIGJlZm9yZU1haW4sIG1haW4sIGFmdGVyTWFpbiwgYmVmb3JlV3JpdGUsIHdyaXRlLCBhZnRlcldyaXRlXTtcblxuZnVuY3Rpb24gb3JkZXIobW9kaWZpZXJzKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwKCk7XG4gIHZhciB2aXNpdGVkID0gbmV3IFNldCgpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIG1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgIG1hcC5zZXQobW9kaWZpZXIubmFtZSwgbW9kaWZpZXIpO1xuICB9KTsgLy8gT24gdmlzaXRpbmcgb2JqZWN0LCBjaGVjayBmb3IgaXRzIGRlcGVuZGVuY2llcyBhbmQgdmlzaXQgdGhlbSByZWN1cnNpdmVseVxuXG4gIGZ1bmN0aW9uIHNvcnQobW9kaWZpZXIpIHtcbiAgICB2aXNpdGVkLmFkZChtb2RpZmllci5uYW1lKTtcbiAgICB2YXIgcmVxdWlyZXMgPSBbXS5jb25jYXQobW9kaWZpZXIucmVxdWlyZXMgfHwgW10sIG1vZGlmaWVyLnJlcXVpcmVzSWZFeGlzdHMgfHwgW10pO1xuICAgIHJlcXVpcmVzLmZvckVhY2goZnVuY3Rpb24gKGRlcCkge1xuICAgICAgaWYgKCF2aXNpdGVkLmhhcyhkZXApKSB7XG4gICAgICAgIHZhciBkZXBNb2RpZmllciA9IG1hcC5nZXQoZGVwKTtcblxuICAgICAgICBpZiAoZGVwTW9kaWZpZXIpIHtcbiAgICAgICAgICBzb3J0KGRlcE1vZGlmaWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJlc3VsdC5wdXNoKG1vZGlmaWVyKTtcbiAgfVxuXG4gIG1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgIGlmICghdmlzaXRlZC5oYXMobW9kaWZpZXIubmFtZSkpIHtcbiAgICAgIC8vIGNoZWNrIGZvciB2aXNpdGVkIG9iamVjdFxuICAgICAgc29ydChtb2RpZmllcik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gb3JkZXJNb2RpZmllcnMobW9kaWZpZXJzKSB7XG4gIC8vIG9yZGVyIGJhc2VkIG9uIGRlcGVuZGVuY2llc1xuICB2YXIgb3JkZXJlZE1vZGlmaWVycyA9IG9yZGVyKG1vZGlmaWVycyk7IC8vIG9yZGVyIGJhc2VkIG9uIHBoYXNlXG5cbiAgcmV0dXJuIG1vZGlmaWVyUGhhc2VzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwaGFzZSkge1xuICAgIHJldHVybiBhY2MuY29uY2F0KG9yZGVyZWRNb2RpZmllcnMuZmlsdGVyKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgICAgcmV0dXJuIG1vZGlmaWVyLnBoYXNlID09PSBwaGFzZTtcbiAgICB9KSk7XG4gIH0sIFtdKTtcbn1cblxuZnVuY3Rpb24gZGVib3VuY2UoZm4pIHtcbiAgdmFyIHBlbmRpbmc7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFwZW5kaW5nKSB7XG4gICAgICBwZW5kaW5nID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXNvbHZlKGZuKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwZW5kaW5nO1xuICB9O1xufVxuXG5mdW5jdGlvbiBtZXJnZUJ5TmFtZShtb2RpZmllcnMpIHtcbiAgdmFyIG1lcmdlZCA9IG1vZGlmaWVycy5yZWR1Y2UoZnVuY3Rpb24gKG1lcmdlZCwgY3VycmVudCkge1xuICAgIHZhciBleGlzdGluZyA9IG1lcmdlZFtjdXJyZW50Lm5hbWVdO1xuICAgIG1lcmdlZFtjdXJyZW50Lm5hbWVdID0gZXhpc3RpbmcgPyBPYmplY3QuYXNzaWduKHt9LCBleGlzdGluZywgY3VycmVudCwge1xuICAgICAgb3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSwgZXhpc3Rpbmcub3B0aW9ucywgY3VycmVudC5vcHRpb25zKSxcbiAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oe30sIGV4aXN0aW5nLmRhdGEsIGN1cnJlbnQuZGF0YSlcbiAgICB9KSA6IGN1cnJlbnQ7XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfSwge30pOyAvLyBJRTExIGRvZXMgbm90IHN1cHBvcnQgT2JqZWN0LnZhbHVlc1xuXG4gIHJldHVybiBPYmplY3Qua2V5cyhtZXJnZWQpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIG1lcmdlZFtrZXldO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Vmlld3BvcnRSZWN0KGVsZW1lbnQsIHN0cmF0ZWd5KSB7XG4gIHZhciB3aW4gPSBnZXRXaW5kb3coZWxlbWVudCk7XG4gIHZhciBodG1sID0gZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpO1xuICB2YXIgdmlzdWFsVmlld3BvcnQgPSB3aW4udmlzdWFsVmlld3BvcnQ7XG4gIHZhciB3aWR0aCA9IGh0bWwuY2xpZW50V2lkdGg7XG4gIHZhciBoZWlnaHQgPSBodG1sLmNsaWVudEhlaWdodDtcbiAgdmFyIHggPSAwO1xuICB2YXIgeSA9IDA7XG5cbiAgaWYgKHZpc3VhbFZpZXdwb3J0KSB7XG4gICAgd2lkdGggPSB2aXN1YWxWaWV3cG9ydC53aWR0aDtcbiAgICBoZWlnaHQgPSB2aXN1YWxWaWV3cG9ydC5oZWlnaHQ7XG4gICAgdmFyIGxheW91dFZpZXdwb3J0ID0gaXNMYXlvdXRWaWV3cG9ydCgpO1xuXG4gICAgaWYgKGxheW91dFZpZXdwb3J0IHx8ICFsYXlvdXRWaWV3cG9ydCAmJiBzdHJhdGVneSA9PT0gJ2ZpeGVkJykge1xuICAgICAgeCA9IHZpc3VhbFZpZXdwb3J0Lm9mZnNldExlZnQ7XG4gICAgICB5ID0gdmlzdWFsVmlld3BvcnQub2Zmc2V0VG9wO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHg6IHggKyBnZXRXaW5kb3dTY3JvbGxCYXJYKGVsZW1lbnQpLFxuICAgIHk6IHlcbiAgfTtcbn1cblxuLy8gb2YgdGhlIGA8aHRtbD5gIGFuZCBgPGJvZHk+YCByZWN0IGJvdW5kcyBpZiBob3Jpem9udGFsbHkgc2Nyb2xsYWJsZVxuXG5mdW5jdGlvbiBnZXREb2N1bWVudFJlY3QoZWxlbWVudCkge1xuICB2YXIgX2VsZW1lbnQkb3duZXJEb2N1bWVuO1xuXG4gIHZhciBodG1sID0gZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpO1xuICB2YXIgd2luU2Nyb2xsID0gZ2V0V2luZG93U2Nyb2xsKGVsZW1lbnQpO1xuICB2YXIgYm9keSA9IChfZWxlbWVudCRvd25lckRvY3VtZW4gPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQpID09IG51bGwgPyB2b2lkIDAgOiBfZWxlbWVudCRvd25lckRvY3VtZW4uYm9keTtcbiAgdmFyIHdpZHRoID0gbWF4KGh0bWwuc2Nyb2xsV2lkdGgsIGh0bWwuY2xpZW50V2lkdGgsIGJvZHkgPyBib2R5LnNjcm9sbFdpZHRoIDogMCwgYm9keSA/IGJvZHkuY2xpZW50V2lkdGggOiAwKTtcbiAgdmFyIGhlaWdodCA9IG1heChodG1sLnNjcm9sbEhlaWdodCwgaHRtbC5jbGllbnRIZWlnaHQsIGJvZHkgPyBib2R5LnNjcm9sbEhlaWdodCA6IDAsIGJvZHkgPyBib2R5LmNsaWVudEhlaWdodCA6IDApO1xuICB2YXIgeCA9IC13aW5TY3JvbGwuc2Nyb2xsTGVmdCArIGdldFdpbmRvd1Njcm9sbEJhclgoZWxlbWVudCk7XG4gIHZhciB5ID0gLXdpblNjcm9sbC5zY3JvbGxUb3A7XG5cbiAgaWYgKGdldENvbXB1dGVkU3R5bGUoYm9keSB8fCBodG1sKS5kaXJlY3Rpb24gPT09ICdydGwnKSB7XG4gICAgeCArPSBtYXgoaHRtbC5jbGllbnRXaWR0aCwgYm9keSA/IGJvZHkuY2xpZW50V2lkdGggOiAwKSAtIHdpZHRoO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zKHBhcmVudCwgY2hpbGQpIHtcbiAgdmFyIHJvb3ROb2RlID0gY2hpbGQuZ2V0Um9vdE5vZGUgJiYgY2hpbGQuZ2V0Um9vdE5vZGUoKTsgLy8gRmlyc3QsIGF0dGVtcHQgd2l0aCBmYXN0ZXIgbmF0aXZlIG1ldGhvZFxuXG4gIGlmIChwYXJlbnQuY29udGFpbnMoY2hpbGQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gdGhlbiBmYWxsYmFjayB0byBjdXN0b20gaW1wbGVtZW50YXRpb24gd2l0aCBTaGFkb3cgRE9NIHN1cHBvcnRcbiAgZWxzZSBpZiAocm9vdE5vZGUgJiYgaXNTaGFkb3dSb290KHJvb3ROb2RlKSkge1xuICAgICAgdmFyIG5leHQgPSBjaGlsZDtcblxuICAgICAgZG8ge1xuICAgICAgICBpZiAobmV4dCAmJiBwYXJlbnQuaXNTYW1lTm9kZShuZXh0KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IC8vICRGbG93Rml4TWVbcHJvcC1taXNzaW5nXTogbmVlZCBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXMuLi5cblxuXG4gICAgICAgIG5leHQgPSBuZXh0LnBhcmVudE5vZGUgfHwgbmV4dC5ob3N0O1xuICAgICAgfSB3aGlsZSAobmV4dCk7XG4gICAgfSAvLyBHaXZlIHVwLCB0aGUgcmVzdWx0IGlzIGZhbHNlXG5cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJlY3RUb0NsaWVudFJlY3QocmVjdCkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgcmVjdCwge1xuICAgIGxlZnQ6IHJlY3QueCxcbiAgICB0b3A6IHJlY3QueSxcbiAgICByaWdodDogcmVjdC54ICsgcmVjdC53aWR0aCxcbiAgICBib3R0b206IHJlY3QueSArIHJlY3QuaGVpZ2h0XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJbm5lckJvdW5kaW5nQ2xpZW50UmVjdChlbGVtZW50LCBzdHJhdGVneSkge1xuICB2YXIgcmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbGVtZW50LCBmYWxzZSwgc3RyYXRlZ3kgPT09ICdmaXhlZCcpO1xuICByZWN0LnRvcCA9IHJlY3QudG9wICsgZWxlbWVudC5jbGllbnRUb3A7XG4gIHJlY3QubGVmdCA9IHJlY3QubGVmdCArIGVsZW1lbnQuY2xpZW50TGVmdDtcbiAgcmVjdC5ib3R0b20gPSByZWN0LnRvcCArIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZWN0LnJpZ2h0ID0gcmVjdC5sZWZ0ICsgZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgcmVjdC53aWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gIHJlY3QueCA9IHJlY3QubGVmdDtcbiAgcmVjdC55ID0gcmVjdC50b3A7XG4gIHJldHVybiByZWN0O1xufVxuXG5mdW5jdGlvbiBnZXRDbGllbnRSZWN0RnJvbU1peGVkVHlwZShlbGVtZW50LCBjbGlwcGluZ1BhcmVudCwgc3RyYXRlZ3kpIHtcbiAgcmV0dXJuIGNsaXBwaW5nUGFyZW50ID09PSB2aWV3cG9ydCA/IHJlY3RUb0NsaWVudFJlY3QoZ2V0Vmlld3BvcnRSZWN0KGVsZW1lbnQsIHN0cmF0ZWd5KSkgOiBpc0VsZW1lbnQoY2xpcHBpbmdQYXJlbnQpID8gZ2V0SW5uZXJCb3VuZGluZ0NsaWVudFJlY3QoY2xpcHBpbmdQYXJlbnQsIHN0cmF0ZWd5KSA6IHJlY3RUb0NsaWVudFJlY3QoZ2V0RG9jdW1lbnRSZWN0KGdldERvY3VtZW50RWxlbWVudChlbGVtZW50KSkpO1xufSAvLyBBIFwiY2xpcHBpbmcgcGFyZW50XCIgaXMgYW4gb3ZlcmZsb3dhYmxlIGNvbnRhaW5lciB3aXRoIHRoZSBjaGFyYWN0ZXJpc3RpYyBvZlxuLy8gY2xpcHBpbmcgKG9yIGhpZGluZykgb3ZlcmZsb3dpbmcgZWxlbWVudHMgd2l0aCBhIHBvc2l0aW9uIGRpZmZlcmVudCBmcm9tXG4vLyBgaW5pdGlhbGBcblxuXG5mdW5jdGlvbiBnZXRDbGlwcGluZ1BhcmVudHMoZWxlbWVudCkge1xuICB2YXIgY2xpcHBpbmdQYXJlbnRzID0gbGlzdFNjcm9sbFBhcmVudHMoZ2V0UGFyZW50Tm9kZShlbGVtZW50KSk7XG4gIHZhciBjYW5Fc2NhcGVDbGlwcGluZyA9IFsnYWJzb2x1dGUnLCAnZml4ZWQnXS5pbmRleE9mKGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkucG9zaXRpb24pID49IDA7XG4gIHZhciBjbGlwcGVyRWxlbWVudCA9IGNhbkVzY2FwZUNsaXBwaW5nICYmIGlzSFRNTEVsZW1lbnQoZWxlbWVudCkgPyBnZXRPZmZzZXRQYXJlbnQoZWxlbWVudCkgOiBlbGVtZW50O1xuXG4gIGlmICghaXNFbGVtZW50KGNsaXBwZXJFbGVtZW50KSkge1xuICAgIHJldHVybiBbXTtcbiAgfSAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTQxNFxuXG5cbiAgcmV0dXJuIGNsaXBwaW5nUGFyZW50cy5maWx0ZXIoZnVuY3Rpb24gKGNsaXBwaW5nUGFyZW50KSB7XG4gICAgcmV0dXJuIGlzRWxlbWVudChjbGlwcGluZ1BhcmVudCkgJiYgY29udGFpbnMoY2xpcHBpbmdQYXJlbnQsIGNsaXBwZXJFbGVtZW50KSAmJiBnZXROb2RlTmFtZShjbGlwcGluZ1BhcmVudCkgIT09ICdib2R5JztcbiAgfSk7XG59IC8vIEdldHMgdGhlIG1heGltdW0gYXJlYSB0aGF0IHRoZSBlbGVtZW50IGlzIHZpc2libGUgaW4gZHVlIHRvIGFueSBudW1iZXIgb2Zcbi8vIGNsaXBwaW5nIHBhcmVudHNcblxuXG5mdW5jdGlvbiBnZXRDbGlwcGluZ1JlY3QoZWxlbWVudCwgYm91bmRhcnksIHJvb3RCb3VuZGFyeSwgc3RyYXRlZ3kpIHtcbiAgdmFyIG1haW5DbGlwcGluZ1BhcmVudHMgPSBib3VuZGFyeSA9PT0gJ2NsaXBwaW5nUGFyZW50cycgPyBnZXRDbGlwcGluZ1BhcmVudHMoZWxlbWVudCkgOiBbXS5jb25jYXQoYm91bmRhcnkpO1xuICB2YXIgY2xpcHBpbmdQYXJlbnRzID0gW10uY29uY2F0KG1haW5DbGlwcGluZ1BhcmVudHMsIFtyb290Qm91bmRhcnldKTtcbiAgdmFyIGZpcnN0Q2xpcHBpbmdQYXJlbnQgPSBjbGlwcGluZ1BhcmVudHNbMF07XG4gIHZhciBjbGlwcGluZ1JlY3QgPSBjbGlwcGluZ1BhcmVudHMucmVkdWNlKGZ1bmN0aW9uIChhY2NSZWN0LCBjbGlwcGluZ1BhcmVudCkge1xuICAgIHZhciByZWN0ID0gZ2V0Q2xpZW50UmVjdEZyb21NaXhlZFR5cGUoZWxlbWVudCwgY2xpcHBpbmdQYXJlbnQsIHN0cmF0ZWd5KTtcbiAgICBhY2NSZWN0LnRvcCA9IG1heChyZWN0LnRvcCwgYWNjUmVjdC50b3ApO1xuICAgIGFjY1JlY3QucmlnaHQgPSBtaW4ocmVjdC5yaWdodCwgYWNjUmVjdC5yaWdodCk7XG4gICAgYWNjUmVjdC5ib3R0b20gPSBtaW4ocmVjdC5ib3R0b20sIGFjY1JlY3QuYm90dG9tKTtcbiAgICBhY2NSZWN0LmxlZnQgPSBtYXgocmVjdC5sZWZ0LCBhY2NSZWN0LmxlZnQpO1xuICAgIHJldHVybiBhY2NSZWN0O1xuICB9LCBnZXRDbGllbnRSZWN0RnJvbU1peGVkVHlwZShlbGVtZW50LCBmaXJzdENsaXBwaW5nUGFyZW50LCBzdHJhdGVneSkpO1xuICBjbGlwcGluZ1JlY3Qud2lkdGggPSBjbGlwcGluZ1JlY3QucmlnaHQgLSBjbGlwcGluZ1JlY3QubGVmdDtcbiAgY2xpcHBpbmdSZWN0LmhlaWdodCA9IGNsaXBwaW5nUmVjdC5ib3R0b20gLSBjbGlwcGluZ1JlY3QudG9wO1xuICBjbGlwcGluZ1JlY3QueCA9IGNsaXBwaW5nUmVjdC5sZWZ0O1xuICBjbGlwcGluZ1JlY3QueSA9IGNsaXBwaW5nUmVjdC50b3A7XG4gIHJldHVybiBjbGlwcGluZ1JlY3Q7XG59XG5cbmZ1bmN0aW9uIGdldEJhc2VQbGFjZW1lbnQocGxhY2VtZW50KSB7XG4gIHJldHVybiBwbGFjZW1lbnQuc3BsaXQoJy0nKVswXTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkge1xuICByZXR1cm4gcGxhY2VtZW50LnNwbGl0KCctJylbMV07XG59XG5cbmZ1bmN0aW9uIGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChwbGFjZW1lbnQpIHtcbiAgcmV0dXJuIFsndG9wJywgJ2JvdHRvbSddLmluZGV4T2YocGxhY2VtZW50KSA+PSAwID8gJ3gnIDogJ3knO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciByZWZlcmVuY2UgPSBfcmVmLnJlZmVyZW5jZSxcbiAgICAgIGVsZW1lbnQgPSBfcmVmLmVsZW1lbnQsXG4gICAgICBwbGFjZW1lbnQgPSBfcmVmLnBsYWNlbWVudDtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBwbGFjZW1lbnQgPyBnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgdmFyaWF0aW9uID0gcGxhY2VtZW50ID8gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgY29tbW9uWCA9IHJlZmVyZW5jZS54ICsgcmVmZXJlbmNlLndpZHRoIC8gMiAtIGVsZW1lbnQud2lkdGggLyAyO1xuICB2YXIgY29tbW9uWSA9IHJlZmVyZW5jZS55ICsgcmVmZXJlbmNlLmhlaWdodCAvIDIgLSBlbGVtZW50LmhlaWdodCAvIDI7XG4gIHZhciBvZmZzZXRzO1xuXG4gIHN3aXRjaCAoYmFzZVBsYWNlbWVudCkge1xuICAgIGNhc2UgdG9wOlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogY29tbW9uWCxcbiAgICAgICAgeTogcmVmZXJlbmNlLnkgLSBlbGVtZW50LmhlaWdodFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBib3R0b206XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiBjb21tb25YLFxuICAgICAgICB5OiByZWZlcmVuY2UueSArIHJlZmVyZW5jZS5oZWlnaHRcbiAgICAgIH07XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcmlnaHQ6XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiByZWZlcmVuY2UueCArIHJlZmVyZW5jZS53aWR0aCxcbiAgICAgICAgeTogY29tbW9uWVxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBsZWZ0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLnggLSBlbGVtZW50LndpZHRoLFxuICAgICAgICB5OiBjb21tb25ZXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLngsXG4gICAgICAgIHk6IHJlZmVyZW5jZS55XG4gICAgICB9O1xuICB9XG5cbiAgdmFyIG1haW5BeGlzID0gYmFzZVBsYWNlbWVudCA/IGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChiYXNlUGxhY2VtZW50KSA6IG51bGw7XG5cbiAgaWYgKG1haW5BeGlzICE9IG51bGwpIHtcbiAgICB2YXIgbGVuID0gbWFpbkF4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcblxuICAgIHN3aXRjaCAodmFyaWF0aW9uKSB7XG4gICAgICBjYXNlIHN0YXJ0OlxuICAgICAgICBvZmZzZXRzW21haW5BeGlzXSA9IG9mZnNldHNbbWFpbkF4aXNdIC0gKHJlZmVyZW5jZVtsZW5dIC8gMiAtIGVsZW1lbnRbbGVuXSAvIDIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBlbmQ6XG4gICAgICAgIG9mZnNldHNbbWFpbkF4aXNdID0gb2Zmc2V0c1ttYWluQXhpc10gKyAocmVmZXJlbmNlW2xlbl0gLyAyIC0gZWxlbWVudFtsZW5dIC8gMik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvZmZzZXRzO1xufVxuXG5mdW5jdGlvbiBnZXRGcmVzaFNpZGVPYmplY3QoKSB7XG4gIHJldHVybiB7XG4gICAgdG9wOiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICBsZWZ0OiAwXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlUGFkZGluZ09iamVjdChwYWRkaW5nT2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBnZXRGcmVzaFNpZGVPYmplY3QoKSwgcGFkZGluZ09iamVjdCk7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZFRvSGFzaE1hcCh2YWx1ZSwga2V5cykge1xuICByZXR1cm4ga2V5cy5yZWR1Y2UoZnVuY3Rpb24gKGhhc2hNYXAsIGtleSkge1xuICAgIGhhc2hNYXBba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiBoYXNoTWFwO1xuICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIGRldGVjdE92ZXJmbG93KHN0YXRlLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICB2YXIgX29wdGlvbnMgPSBvcHRpb25zLFxuICAgICAgX29wdGlvbnMkcGxhY2VtZW50ID0gX29wdGlvbnMucGxhY2VtZW50LFxuICAgICAgcGxhY2VtZW50ID0gX29wdGlvbnMkcGxhY2VtZW50ID09PSB2b2lkIDAgPyBzdGF0ZS5wbGFjZW1lbnQgOiBfb3B0aW9ucyRwbGFjZW1lbnQsXG4gICAgICBfb3B0aW9ucyRzdHJhdGVneSA9IF9vcHRpb25zLnN0cmF0ZWd5LFxuICAgICAgc3RyYXRlZ3kgPSBfb3B0aW9ucyRzdHJhdGVneSA9PT0gdm9pZCAwID8gc3RhdGUuc3RyYXRlZ3kgOiBfb3B0aW9ucyRzdHJhdGVneSxcbiAgICAgIF9vcHRpb25zJGJvdW5kYXJ5ID0gX29wdGlvbnMuYm91bmRhcnksXG4gICAgICBib3VuZGFyeSA9IF9vcHRpb25zJGJvdW5kYXJ5ID09PSB2b2lkIDAgPyBjbGlwcGluZ1BhcmVudHMgOiBfb3B0aW9ucyRib3VuZGFyeSxcbiAgICAgIF9vcHRpb25zJHJvb3RCb3VuZGFyeSA9IF9vcHRpb25zLnJvb3RCb3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeSA9IF9vcHRpb25zJHJvb3RCb3VuZGFyeSA9PT0gdm9pZCAwID8gdmlld3BvcnQgOiBfb3B0aW9ucyRyb290Qm91bmRhcnksXG4gICAgICBfb3B0aW9ucyRlbGVtZW50Q29udGUgPSBfb3B0aW9ucy5lbGVtZW50Q29udGV4dCxcbiAgICAgIGVsZW1lbnRDb250ZXh0ID0gX29wdGlvbnMkZWxlbWVudENvbnRlID09PSB2b2lkIDAgPyBwb3BwZXIgOiBfb3B0aW9ucyRlbGVtZW50Q29udGUsXG4gICAgICBfb3B0aW9ucyRhbHRCb3VuZGFyeSA9IF9vcHRpb25zLmFsdEJvdW5kYXJ5LFxuICAgICAgYWx0Qm91bmRhcnkgPSBfb3B0aW9ucyRhbHRCb3VuZGFyeSA9PT0gdm9pZCAwID8gZmFsc2UgOiBfb3B0aW9ucyRhbHRCb3VuZGFyeSxcbiAgICAgIF9vcHRpb25zJHBhZGRpbmcgPSBfb3B0aW9ucy5wYWRkaW5nLFxuICAgICAgcGFkZGluZyA9IF9vcHRpb25zJHBhZGRpbmcgPT09IHZvaWQgMCA/IDAgOiBfb3B0aW9ucyRwYWRkaW5nO1xuICB2YXIgcGFkZGluZ09iamVjdCA9IG1lcmdlUGFkZGluZ09iamVjdCh0eXBlb2YgcGFkZGluZyAhPT0gJ251bWJlcicgPyBwYWRkaW5nIDogZXhwYW5kVG9IYXNoTWFwKHBhZGRpbmcsIGJhc2VQbGFjZW1lbnRzKSk7XG4gIHZhciBhbHRDb250ZXh0ID0gZWxlbWVudENvbnRleHQgPT09IHBvcHBlciA/IHJlZmVyZW5jZSA6IHBvcHBlcjtcbiAgdmFyIHBvcHBlclJlY3QgPSBzdGF0ZS5yZWN0cy5wb3BwZXI7XG4gIHZhciBlbGVtZW50ID0gc3RhdGUuZWxlbWVudHNbYWx0Qm91bmRhcnkgPyBhbHRDb250ZXh0IDogZWxlbWVudENvbnRleHRdO1xuICB2YXIgY2xpcHBpbmdDbGllbnRSZWN0ID0gZ2V0Q2xpcHBpbmdSZWN0KGlzRWxlbWVudChlbGVtZW50KSA/IGVsZW1lbnQgOiBlbGVtZW50LmNvbnRleHRFbGVtZW50IHx8IGdldERvY3VtZW50RWxlbWVudChzdGF0ZS5lbGVtZW50cy5wb3BwZXIpLCBib3VuZGFyeSwgcm9vdEJvdW5kYXJ5LCBzdHJhdGVneSk7XG4gIHZhciByZWZlcmVuY2VDbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KHN0YXRlLmVsZW1lbnRzLnJlZmVyZW5jZSk7XG4gIHZhciBwb3BwZXJPZmZzZXRzID0gY29tcHV0ZU9mZnNldHMoe1xuICAgIHJlZmVyZW5jZTogcmVmZXJlbmNlQ2xpZW50UmVjdCxcbiAgICBlbGVtZW50OiBwb3BwZXJSZWN0LFxuICAgIHN0cmF0ZWd5OiAnYWJzb2x1dGUnLFxuICAgIHBsYWNlbWVudDogcGxhY2VtZW50XG4gIH0pO1xuICB2YXIgcG9wcGVyQ2xpZW50UmVjdCA9IHJlY3RUb0NsaWVudFJlY3QoT2JqZWN0LmFzc2lnbih7fSwgcG9wcGVyUmVjdCwgcG9wcGVyT2Zmc2V0cykpO1xuICB2YXIgZWxlbWVudENsaWVudFJlY3QgPSBlbGVtZW50Q29udGV4dCA9PT0gcG9wcGVyID8gcG9wcGVyQ2xpZW50UmVjdCA6IHJlZmVyZW5jZUNsaWVudFJlY3Q7IC8vIHBvc2l0aXZlID0gb3ZlcmZsb3dpbmcgdGhlIGNsaXBwaW5nIHJlY3RcbiAgLy8gMCBvciBuZWdhdGl2ZSA9IHdpdGhpbiB0aGUgY2xpcHBpbmcgcmVjdFxuXG4gIHZhciBvdmVyZmxvd09mZnNldHMgPSB7XG4gICAgdG9wOiBjbGlwcGluZ0NsaWVudFJlY3QudG9wIC0gZWxlbWVudENsaWVudFJlY3QudG9wICsgcGFkZGluZ09iamVjdC50b3AsXG4gICAgYm90dG9tOiBlbGVtZW50Q2xpZW50UmVjdC5ib3R0b20gLSBjbGlwcGluZ0NsaWVudFJlY3QuYm90dG9tICsgcGFkZGluZ09iamVjdC5ib3R0b20sXG4gICAgbGVmdDogY2xpcHBpbmdDbGllbnRSZWN0LmxlZnQgLSBlbGVtZW50Q2xpZW50UmVjdC5sZWZ0ICsgcGFkZGluZ09iamVjdC5sZWZ0LFxuICAgIHJpZ2h0OiBlbGVtZW50Q2xpZW50UmVjdC5yaWdodCAtIGNsaXBwaW5nQ2xpZW50UmVjdC5yaWdodCArIHBhZGRpbmdPYmplY3QucmlnaHRcbiAgfTtcbiAgdmFyIG9mZnNldERhdGEgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLm9mZnNldDsgLy8gT2Zmc2V0cyBjYW4gYmUgYXBwbGllZCBvbmx5IHRvIHRoZSBwb3BwZXIgZWxlbWVudFxuXG4gIGlmIChlbGVtZW50Q29udGV4dCA9PT0gcG9wcGVyICYmIG9mZnNldERhdGEpIHtcbiAgICB2YXIgb2Zmc2V0ID0gb2Zmc2V0RGF0YVtwbGFjZW1lbnRdO1xuICAgIE9iamVjdC5rZXlzKG92ZXJmbG93T2Zmc2V0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgbXVsdGlwbHkgPSBbcmlnaHQsIGJvdHRvbV0uaW5kZXhPZihrZXkpID49IDAgPyAxIDogLTE7XG4gICAgICB2YXIgYXhpcyA9IFt0b3AsIGJvdHRvbV0uaW5kZXhPZihrZXkpID49IDAgPyAneScgOiAneCc7XG4gICAgICBvdmVyZmxvd09mZnNldHNba2V5XSArPSBvZmZzZXRbYXhpc10gKiBtdWx0aXBseTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBvdmVyZmxvd09mZnNldHM7XG59XG5cbnZhciBERUZBVUxUX09QVElPTlMgPSB7XG4gIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gIG1vZGlmaWVyczogW10sXG4gIHN0cmF0ZWd5OiAnYWJzb2x1dGUnXG59O1xuXG5mdW5jdGlvbiBhcmVWYWxpZEVsZW1lbnRzKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuICFhcmdzLnNvbWUoZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gIShlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwb3BwZXJHZW5lcmF0b3IoZ2VuZXJhdG9yT3B0aW9ucykge1xuICBpZiAoZ2VuZXJhdG9yT3B0aW9ucyA9PT0gdm9pZCAwKSB7XG4gICAgZ2VuZXJhdG9yT3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgdmFyIF9nZW5lcmF0b3JPcHRpb25zID0gZ2VuZXJhdG9yT3B0aW9ucyxcbiAgICAgIF9nZW5lcmF0b3JPcHRpb25zJGRlZiA9IF9nZW5lcmF0b3JPcHRpb25zLmRlZmF1bHRNb2RpZmllcnMsXG4gICAgICBkZWZhdWx0TW9kaWZpZXJzID0gX2dlbmVyYXRvck9wdGlvbnMkZGVmID09PSB2b2lkIDAgPyBbXSA6IF9nZW5lcmF0b3JPcHRpb25zJGRlZixcbiAgICAgIF9nZW5lcmF0b3JPcHRpb25zJGRlZjIgPSBfZ2VuZXJhdG9yT3B0aW9ucy5kZWZhdWx0T3B0aW9ucyxcbiAgICAgIGRlZmF1bHRPcHRpb25zID0gX2dlbmVyYXRvck9wdGlvbnMkZGVmMiA9PT0gdm9pZCAwID8gREVGQVVMVF9PUFRJT05TIDogX2dlbmVyYXRvck9wdGlvbnMkZGVmMjtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZVBvcHBlcihyZWZlcmVuY2UsIHBvcHBlciwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbiAgICB9XG5cbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBwbGFjZW1lbnQ6ICdib3R0b20nLFxuICAgICAgb3JkZXJlZE1vZGlmaWVyczogW10sXG4gICAgICBvcHRpb25zOiBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIGRlZmF1bHRPcHRpb25zKSxcbiAgICAgIG1vZGlmaWVyc0RhdGE6IHt9LFxuICAgICAgZWxlbWVudHM6IHtcbiAgICAgICAgcmVmZXJlbmNlOiByZWZlcmVuY2UsXG4gICAgICAgIHBvcHBlcjogcG9wcGVyXG4gICAgICB9LFxuICAgICAgYXR0cmlidXRlczoge30sXG4gICAgICBzdHlsZXM6IHt9XG4gICAgfTtcbiAgICB2YXIgZWZmZWN0Q2xlYW51cEZucyA9IFtdO1xuICAgIHZhciBpc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHZhciBpbnN0YW5jZSA9IHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIHNldE9wdGlvbnMoc2V0T3B0aW9uc0FjdGlvbikge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBzZXRPcHRpb25zQWN0aW9uID09PSAnZnVuY3Rpb24nID8gc2V0T3B0aW9uc0FjdGlvbihzdGF0ZS5vcHRpb25zKSA6IHNldE9wdGlvbnNBY3Rpb247XG4gICAgICAgIGNsZWFudXBNb2RpZmllckVmZmVjdHMoKTtcbiAgICAgICAgc3RhdGUub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBzdGF0ZS5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgc3RhdGUuc2Nyb2xsUGFyZW50cyA9IHtcbiAgICAgICAgICByZWZlcmVuY2U6IGlzRWxlbWVudChyZWZlcmVuY2UpID8gbGlzdFNjcm9sbFBhcmVudHMocmVmZXJlbmNlKSA6IHJlZmVyZW5jZS5jb250ZXh0RWxlbWVudCA/IGxpc3RTY3JvbGxQYXJlbnRzKHJlZmVyZW5jZS5jb250ZXh0RWxlbWVudCkgOiBbXSxcbiAgICAgICAgICBwb3BwZXI6IGxpc3RTY3JvbGxQYXJlbnRzKHBvcHBlcilcbiAgICAgICAgfTsgLy8gT3JkZXJzIHRoZSBtb2RpZmllcnMgYmFzZWQgb24gdGhlaXIgZGVwZW5kZW5jaWVzIGFuZCBgcGhhc2VgXG4gICAgICAgIC8vIHByb3BlcnRpZXNcblxuICAgICAgICB2YXIgb3JkZXJlZE1vZGlmaWVycyA9IG9yZGVyTW9kaWZpZXJzKG1lcmdlQnlOYW1lKFtdLmNvbmNhdChkZWZhdWx0TW9kaWZpZXJzLCBzdGF0ZS5vcHRpb25zLm1vZGlmaWVycykpKTsgLy8gU3RyaXAgb3V0IGRpc2FibGVkIG1vZGlmaWVyc1xuXG4gICAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMgPSBvcmRlcmVkTW9kaWZpZXJzLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICAgIHJldHVybiBtLmVuYWJsZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICBydW5Nb2RpZmllckVmZmVjdHMoKTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnVwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIC8vIFN5bmMgdXBkYXRlIOKAkyBpdCB3aWxsIGFsd2F5cyBiZSBleGVjdXRlZCwgZXZlbiBpZiBub3QgbmVjZXNzYXJ5LiBUaGlzXG4gICAgICAvLyBpcyB1c2VmdWwgZm9yIGxvdyBmcmVxdWVuY3kgdXBkYXRlcyB3aGVyZSBzeW5jIGJlaGF2aW9yIHNpbXBsaWZpZXMgdGhlXG4gICAgICAvLyBsb2dpYy5cbiAgICAgIC8vIEZvciBoaWdoIGZyZXF1ZW5jeSB1cGRhdGVzIChlLmcuIGByZXNpemVgIGFuZCBgc2Nyb2xsYCBldmVudHMpLCBhbHdheXNcbiAgICAgIC8vIHByZWZlciB0aGUgYXN5bmMgUG9wcGVyI3VwZGF0ZSBtZXRob2RcbiAgICAgIGZvcmNlVXBkYXRlOiBmdW5jdGlvbiBmb3JjZVVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKGlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9zdGF0ZSRlbGVtZW50cyA9IHN0YXRlLmVsZW1lbnRzLFxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX3N0YXRlJGVsZW1lbnRzLnJlZmVyZW5jZSxcbiAgICAgICAgICAgIHBvcHBlciA9IF9zdGF0ZSRlbGVtZW50cy5wb3BwZXI7IC8vIERvbid0IHByb2NlZWQgaWYgYHJlZmVyZW5jZWAgb3IgYHBvcHBlcmAgYXJlIG5vdCB2YWxpZCBlbGVtZW50c1xuICAgICAgICAvLyBhbnltb3JlXG5cbiAgICAgICAgaWYgKCFhcmVWYWxpZEVsZW1lbnRzKHJlZmVyZW5jZSwgcG9wcGVyKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAvLyBTdG9yZSB0aGUgcmVmZXJlbmNlIGFuZCBwb3BwZXIgcmVjdHMgdG8gYmUgcmVhZCBieSBtb2RpZmllcnNcblxuXG4gICAgICAgIHN0YXRlLnJlY3RzID0ge1xuICAgICAgICAgIHJlZmVyZW5jZTogZ2V0Q29tcG9zaXRlUmVjdChyZWZlcmVuY2UsIGdldE9mZnNldFBhcmVudChwb3BwZXIpLCBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5ID09PSAnZml4ZWQnKSxcbiAgICAgICAgICBwb3BwZXI6IGdldExheW91dFJlY3QocG9wcGVyKVxuICAgICAgICB9OyAvLyBNb2RpZmllcnMgaGF2ZSB0aGUgYWJpbGl0eSB0byByZXNldCB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGUuIFRoZVxuICAgICAgICAvLyBtb3N0IGNvbW1vbiB1c2UgY2FzZSBmb3IgdGhpcyBpcyB0aGUgYGZsaXBgIG1vZGlmaWVyIGNoYW5naW5nIHRoZVxuICAgICAgICAvLyBwbGFjZW1lbnQsIHdoaWNoIHRoZW4gbmVlZHMgdG8gcmUtcnVuIGFsbCB0aGUgbW9kaWZpZXJzLCBiZWNhdXNlIHRoZVxuICAgICAgICAvLyBsb2dpYyB3YXMgcHJldmlvdXNseSByYW4gZm9yIHRoZSBwcmV2aW91cyBwbGFjZW1lbnQgYW5kIGlzIHRoZXJlZm9yZVxuICAgICAgICAvLyBzdGFsZS9pbmNvcnJlY3RcblxuICAgICAgICBzdGF0ZS5yZXNldCA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5wbGFjZW1lbnQgPSBzdGF0ZS5vcHRpb25zLnBsYWNlbWVudDsgLy8gT24gZWFjaCB1cGRhdGUgY3ljbGUsIHRoZSBgbW9kaWZpZXJzRGF0YWAgcHJvcGVydHkgZm9yIGVhY2ggbW9kaWZpZXJcbiAgICAgICAgLy8gaXMgZmlsbGVkIHdpdGggdGhlIGluaXRpYWwgZGF0YSBzcGVjaWZpZWQgYnkgdGhlIG1vZGlmaWVyLiBUaGlzIG1lYW5zXG4gICAgICAgIC8vIGl0IGRvZXNuJ3QgcGVyc2lzdCBhbmQgaXMgZnJlc2ggb24gZWFjaCB1cGRhdGUuXG4gICAgICAgIC8vIFRvIGVuc3VyZSBwZXJzaXN0ZW50IGRhdGEsIHVzZSBgJHtuYW1lfSNwZXJzaXN0ZW50YFxuXG4gICAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUubW9kaWZpZXJzRGF0YVttb2RpZmllci5uYW1lXSA9IE9iamVjdC5hc3NpZ24oe30sIG1vZGlmaWVyLmRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgc3RhdGUub3JkZXJlZE1vZGlmaWVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBpZiAoc3RhdGUucmVzZXQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHN0YXRlLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIF9zdGF0ZSRvcmRlcmVkTW9kaWZpZSA9IHN0YXRlLm9yZGVyZWRNb2RpZmllcnNbaW5kZXhdLFxuICAgICAgICAgICAgICBmbiA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5mbixcbiAgICAgICAgICAgICAgX3N0YXRlJG9yZGVyZWRNb2RpZmllMiA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5vcHRpb25zLFxuICAgICAgICAgICAgICBfb3B0aW9ucyA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZTIgPT09IHZvaWQgMCA/IHt9IDogX3N0YXRlJG9yZGVyZWRNb2RpZmllMixcbiAgICAgICAgICAgICAgbmFtZSA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5uYW1lO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RhdGUgPSBmbih7XG4gICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgb3B0aW9uczogX29wdGlvbnMsXG4gICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgICAgfSkgfHwgc3RhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gQXN5bmMgYW5kIG9wdGltaXN0aWNhbGx5IG9wdGltaXplZCB1cGRhdGUg4oCTIGl0IHdpbGwgbm90IGJlIGV4ZWN1dGVkIGlmXG4gICAgICAvLyBub3QgbmVjZXNzYXJ5IChkZWJvdW5jZWQgdG8gcnVuIGF0IG1vc3Qgb25jZS1wZXItdGljaylcbiAgICAgIHVwZGF0ZTogZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICBpbnN0YW5jZS5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgIHJlc29sdmUoc3RhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgY2xlYW51cE1vZGlmaWVyRWZmZWN0cygpO1xuICAgICAgICBpc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghYXJlVmFsaWRFbGVtZW50cyhyZWZlcmVuY2UsIHBvcHBlcikpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZS5zZXRPcHRpb25zKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICBpZiAoIWlzRGVzdHJveWVkICYmIG9wdGlvbnMub25GaXJzdFVwZGF0ZSkge1xuICAgICAgICBvcHRpb25zLm9uRmlyc3RVcGRhdGUoc3RhdGUpO1xuICAgICAgfVxuICAgIH0pOyAvLyBNb2RpZmllcnMgaGF2ZSB0aGUgYWJpbGl0eSB0byBleGVjdXRlIGFyYml0cmFyeSBjb2RlIGJlZm9yZSB0aGUgZmlyc3RcbiAgICAvLyB1cGRhdGUgY3ljbGUgcnVucy4gVGhleSB3aWxsIGJlIGV4ZWN1dGVkIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSB1cGRhdGVcbiAgICAvLyBjeWNsZS4gVGhpcyBpcyB1c2VmdWwgd2hlbiBhIG1vZGlmaWVyIGFkZHMgc29tZSBwZXJzaXN0ZW50IGRhdGEgdGhhdFxuICAgIC8vIG90aGVyIG1vZGlmaWVycyBuZWVkIHRvIHVzZSwgYnV0IHRoZSBtb2RpZmllciBpcyBydW4gYWZ0ZXIgdGhlIGRlcGVuZGVudFxuICAgIC8vIG9uZS5cblxuICAgIGZ1bmN0aW9uIHJ1bk1vZGlmaWVyRWZmZWN0cygpIHtcbiAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgbmFtZSA9IF9yZWYubmFtZSxcbiAgICAgICAgICAgIF9yZWYkb3B0aW9ucyA9IF9yZWYub3B0aW9ucyxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBfcmVmJG9wdGlvbnMgPT09IHZvaWQgMCA/IHt9IDogX3JlZiRvcHRpb25zLFxuICAgICAgICAgICAgZWZmZWN0ID0gX3JlZi5lZmZlY3Q7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBlZmZlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB2YXIgY2xlYW51cEZuID0gZWZmZWN0KHtcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgbm9vcEZuID0gZnVuY3Rpb24gbm9vcEZuKCkge307XG5cbiAgICAgICAgICBlZmZlY3RDbGVhbnVwRm5zLnB1c2goY2xlYW51cEZuIHx8IG5vb3BGbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFudXBNb2RpZmllckVmZmVjdHMoKSB7XG4gICAgICBlZmZlY3RDbGVhbnVwRm5zLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmbigpO1xuICAgICAgfSk7XG4gICAgICBlZmZlY3RDbGVhbnVwRm5zID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xufVxuXG52YXIgcGFzc2l2ZSA9IHtcbiAgcGFzc2l2ZTogdHJ1ZVxufTtcblxuZnVuY3Rpb24gZWZmZWN0JDIoX3JlZikge1xuICB2YXIgc3RhdGUgPSBfcmVmLnN0YXRlLFxuICAgICAgaW5zdGFuY2UgPSBfcmVmLmluc3RhbmNlLFxuICAgICAgb3B0aW9ucyA9IF9yZWYub3B0aW9ucztcbiAgdmFyIF9vcHRpb25zJHNjcm9sbCA9IG9wdGlvbnMuc2Nyb2xsLFxuICAgICAgc2Nyb2xsID0gX29wdGlvbnMkc2Nyb2xsID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkc2Nyb2xsLFxuICAgICAgX29wdGlvbnMkcmVzaXplID0gb3B0aW9ucy5yZXNpemUsXG4gICAgICByZXNpemUgPSBfb3B0aW9ucyRyZXNpemUgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRyZXNpemU7XG4gIHZhciB3aW5kb3cgPSBnZXRXaW5kb3coc3RhdGUuZWxlbWVudHMucG9wcGVyKTtcbiAgdmFyIHNjcm9sbFBhcmVudHMgPSBbXS5jb25jYXQoc3RhdGUuc2Nyb2xsUGFyZW50cy5yZWZlcmVuY2UsIHN0YXRlLnNjcm9sbFBhcmVudHMucG9wcGVyKTtcblxuICBpZiAoc2Nyb2xsKSB7XG4gICAgc2Nyb2xsUGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzY3JvbGxQYXJlbnQpIHtcbiAgICAgIHNjcm9sbFBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlc2l6ZSkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2Nyb2xsKSB7XG4gICAgICBzY3JvbGxQYXJlbnRzLmZvckVhY2goZnVuY3Rpb24gKHNjcm9sbFBhcmVudCkge1xuICAgICAgICBzY3JvbGxQYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaW5zdGFuY2UudXBkYXRlLCBwYXNzaXZlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXNpemUpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICAgIH1cbiAgfTtcbn0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5cbnZhciBldmVudExpc3RlbmVycyA9IHtcbiAgbmFtZTogJ2V2ZW50TGlzdGVuZXJzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICd3cml0ZScsXG4gIGZuOiBmdW5jdGlvbiBmbigpIHt9LFxuICBlZmZlY3Q6IGVmZmVjdCQyLFxuICBkYXRhOiB7fVxufTtcblxuZnVuY3Rpb24gcG9wcGVyT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGUsXG4gICAgICBuYW1lID0gX3JlZi5uYW1lO1xuICAvLyBPZmZzZXRzIGFyZSB0aGUgYWN0dWFsIHBvc2l0aW9uIHRoZSBwb3BwZXIgbmVlZHMgdG8gaGF2ZSB0byBiZVxuICAvLyBwcm9wZXJseSBwb3NpdGlvbmVkIG5lYXIgaXRzIHJlZmVyZW5jZSBlbGVtZW50XG4gIC8vIFRoaXMgaXMgdGhlIG1vc3QgYmFzaWMgcGxhY2VtZW50LCBhbmQgd2lsbCBiZSBhZGp1c3RlZCBieVxuICAvLyB0aGUgbW9kaWZpZXJzIGluIHRoZSBuZXh0IHN0ZXBcbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGNvbXB1dGVPZmZzZXRzKHtcbiAgICByZWZlcmVuY2U6IHN0YXRlLnJlY3RzLnJlZmVyZW5jZSxcbiAgICBlbGVtZW50OiBzdGF0ZS5yZWN0cy5wb3BwZXIsXG4gICAgc3RyYXRlZ3k6ICdhYnNvbHV0ZScsXG4gICAgcGxhY2VtZW50OiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgcG9wcGVyT2Zmc2V0cyQxID0ge1xuICBuYW1lOiAncG9wcGVyT2Zmc2V0cycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAncmVhZCcsXG4gIGZuOiBwb3BwZXJPZmZzZXRzLFxuICBkYXRhOiB7fVxufTtcblxudmFyIHVuc2V0U2lkZXMgPSB7XG4gIHRvcDogJ2F1dG8nLFxuICByaWdodDogJ2F1dG8nLFxuICBib3R0b206ICdhdXRvJyxcbiAgbGVmdDogJ2F1dG8nXG59OyAvLyBSb3VuZCB0aGUgb2Zmc2V0cyB0byB0aGUgbmVhcmVzdCBzdWl0YWJsZSBzdWJwaXhlbCBiYXNlZCBvbiB0aGUgRFBSLlxuLy8gWm9vbWluZyBjYW4gY2hhbmdlIHRoZSBEUFIsIGJ1dCBpdCBzZWVtcyB0byByZXBvcnQgYSB2YWx1ZSB0aGF0IHdpbGxcbi8vIGNsZWFubHkgZGl2aWRlIHRoZSB2YWx1ZXMgaW50byB0aGUgYXBwcm9wcmlhdGUgc3VicGl4ZWxzLlxuXG5mdW5jdGlvbiByb3VuZE9mZnNldHNCeURQUihfcmVmLCB3aW4pIHtcbiAgdmFyIHggPSBfcmVmLngsXG4gICAgICB5ID0gX3JlZi55O1xuICB2YXIgZHByID0gd2luLmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgcmV0dXJuIHtcbiAgICB4OiByb3VuZCh4ICogZHByKSAvIGRwciB8fCAwLFxuICAgIHk6IHJvdW5kKHkgKiBkcHIpIC8gZHByIHx8IDBcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWFwVG9TdHlsZXMoX3JlZjIpIHtcbiAgdmFyIF9PYmplY3QkYXNzaWduMjtcblxuICB2YXIgcG9wcGVyID0gX3JlZjIucG9wcGVyLFxuICAgICAgcG9wcGVyUmVjdCA9IF9yZWYyLnBvcHBlclJlY3QsXG4gICAgICBwbGFjZW1lbnQgPSBfcmVmMi5wbGFjZW1lbnQsXG4gICAgICB2YXJpYXRpb24gPSBfcmVmMi52YXJpYXRpb24sXG4gICAgICBvZmZzZXRzID0gX3JlZjIub2Zmc2V0cyxcbiAgICAgIHBvc2l0aW9uID0gX3JlZjIucG9zaXRpb24sXG4gICAgICBncHVBY2NlbGVyYXRpb24gPSBfcmVmMi5ncHVBY2NlbGVyYXRpb24sXG4gICAgICBhZGFwdGl2ZSA9IF9yZWYyLmFkYXB0aXZlLFxuICAgICAgcm91bmRPZmZzZXRzID0gX3JlZjIucm91bmRPZmZzZXRzLFxuICAgICAgaXNGaXhlZCA9IF9yZWYyLmlzRml4ZWQ7XG4gIHZhciBfb2Zmc2V0cyR4ID0gb2Zmc2V0cy54LFxuICAgICAgeCA9IF9vZmZzZXRzJHggPT09IHZvaWQgMCA/IDAgOiBfb2Zmc2V0cyR4LFxuICAgICAgX29mZnNldHMkeSA9IG9mZnNldHMueSxcbiAgICAgIHkgPSBfb2Zmc2V0cyR5ID09PSB2b2lkIDAgPyAwIDogX29mZnNldHMkeTtcblxuICB2YXIgX3JlZjMgPSB0eXBlb2Ygcm91bmRPZmZzZXRzID09PSAnZnVuY3Rpb24nID8gcm91bmRPZmZzZXRzKHtcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfSkgOiB7XG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH07XG5cbiAgeCA9IF9yZWYzLng7XG4gIHkgPSBfcmVmMy55O1xuICB2YXIgaGFzWCA9IG9mZnNldHMuaGFzT3duUHJvcGVydHkoJ3gnKTtcbiAgdmFyIGhhc1kgPSBvZmZzZXRzLmhhc093blByb3BlcnR5KCd5Jyk7XG4gIHZhciBzaWRlWCA9IGxlZnQ7XG4gIHZhciBzaWRlWSA9IHRvcDtcbiAgdmFyIHdpbiA9IHdpbmRvdztcblxuICBpZiAoYWRhcHRpdmUpIHtcbiAgICB2YXIgb2Zmc2V0UGFyZW50ID0gZ2V0T2Zmc2V0UGFyZW50KHBvcHBlcik7XG4gICAgdmFyIGhlaWdodFByb3AgPSAnY2xpZW50SGVpZ2h0JztcbiAgICB2YXIgd2lkdGhQcm9wID0gJ2NsaWVudFdpZHRoJztcblxuICAgIGlmIChvZmZzZXRQYXJlbnQgPT09IGdldFdpbmRvdyhwb3BwZXIpKSB7XG4gICAgICBvZmZzZXRQYXJlbnQgPSBnZXREb2N1bWVudEVsZW1lbnQocG9wcGVyKTtcblxuICAgICAgaWYgKGdldENvbXB1dGVkU3R5bGUob2Zmc2V0UGFyZW50KS5wb3NpdGlvbiAhPT0gJ3N0YXRpYycgJiYgcG9zaXRpb24gPT09ICdhYnNvbHV0ZScpIHtcbiAgICAgICAgaGVpZ2h0UHJvcCA9ICdzY3JvbGxIZWlnaHQnO1xuICAgICAgICB3aWR0aFByb3AgPSAnc2Nyb2xsV2lkdGgnO1xuICAgICAgfVxuICAgIH0gLy8gJEZsb3dGaXhNZVtpbmNvbXBhdGlibGUtY2FzdF06IGZvcmNlIHR5cGUgcmVmaW5lbWVudCwgd2UgY29tcGFyZSBvZmZzZXRQYXJlbnQgd2l0aCB3aW5kb3cgYWJvdmUsIGJ1dCBGbG93IGRvZXNuJ3QgZGV0ZWN0IGl0XG5cblxuICAgIG9mZnNldFBhcmVudCA9IG9mZnNldFBhcmVudDtcblxuICAgIGlmIChwbGFjZW1lbnQgPT09IHRvcCB8fCAocGxhY2VtZW50ID09PSBsZWZ0IHx8IHBsYWNlbWVudCA9PT0gcmlnaHQpICYmIHZhcmlhdGlvbiA9PT0gZW5kKSB7XG4gICAgICBzaWRlWSA9IGJvdHRvbTtcbiAgICAgIHZhciBvZmZzZXRZID0gaXNGaXhlZCAmJiBvZmZzZXRQYXJlbnQgPT09IHdpbiAmJiB3aW4udmlzdWFsVmlld3BvcnQgPyB3aW4udmlzdWFsVmlld3BvcnQuaGVpZ2h0IDogLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gICAgICBvZmZzZXRQYXJlbnRbaGVpZ2h0UHJvcF07XG4gICAgICB5IC09IG9mZnNldFkgLSBwb3BwZXJSZWN0LmhlaWdodDtcbiAgICAgIHkgKj0gZ3B1QWNjZWxlcmF0aW9uID8gMSA6IC0xO1xuICAgIH1cblxuICAgIGlmIChwbGFjZW1lbnQgPT09IGxlZnQgfHwgKHBsYWNlbWVudCA9PT0gdG9wIHx8IHBsYWNlbWVudCA9PT0gYm90dG9tKSAmJiB2YXJpYXRpb24gPT09IGVuZCkge1xuICAgICAgc2lkZVggPSByaWdodDtcbiAgICAgIHZhciBvZmZzZXRYID0gaXNGaXhlZCAmJiBvZmZzZXRQYXJlbnQgPT09IHdpbiAmJiB3aW4udmlzdWFsVmlld3BvcnQgPyB3aW4udmlzdWFsVmlld3BvcnQud2lkdGggOiAvLyAkRmxvd0ZpeE1lW3Byb3AtbWlzc2luZ11cbiAgICAgIG9mZnNldFBhcmVudFt3aWR0aFByb3BdO1xuICAgICAgeCAtPSBvZmZzZXRYIC0gcG9wcGVyUmVjdC53aWR0aDtcbiAgICAgIHggKj0gZ3B1QWNjZWxlcmF0aW9uID8gMSA6IC0xO1xuICAgIH1cbiAgfVxuXG4gIHZhciBjb21tb25TdHlsZXMgPSBPYmplY3QuYXNzaWduKHtcbiAgICBwb3NpdGlvbjogcG9zaXRpb25cbiAgfSwgYWRhcHRpdmUgJiYgdW5zZXRTaWRlcyk7XG5cbiAgdmFyIF9yZWY0ID0gcm91bmRPZmZzZXRzID09PSB0cnVlID8gcm91bmRPZmZzZXRzQnlEUFIoe1xuICAgIHg6IHgsXG4gICAgeTogeVxuICB9LCBnZXRXaW5kb3cocG9wcGVyKSkgOiB7XG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH07XG5cbiAgeCA9IF9yZWY0Lng7XG4gIHkgPSBfcmVmNC55O1xuXG4gIGlmIChncHVBY2NlbGVyYXRpb24pIHtcbiAgICB2YXIgX09iamVjdCRhc3NpZ247XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29tbW9uU3R5bGVzLCAoX09iamVjdCRhc3NpZ24gPSB7fSwgX09iamVjdCRhc3NpZ25bc2lkZVldID0gaGFzWSA/ICcwJyA6ICcnLCBfT2JqZWN0JGFzc2lnbltzaWRlWF0gPSBoYXNYID8gJzAnIDogJycsIF9PYmplY3QkYXNzaWduLnRyYW5zZm9ybSA9ICh3aW4uZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKSA8PSAxID8gXCJ0cmFuc2xhdGUoXCIgKyB4ICsgXCJweCwgXCIgKyB5ICsgXCJweClcIiA6IFwidHJhbnNsYXRlM2QoXCIgKyB4ICsgXCJweCwgXCIgKyB5ICsgXCJweCwgMClcIiwgX09iamVjdCRhc3NpZ24pKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBjb21tb25TdHlsZXMsIChfT2JqZWN0JGFzc2lnbjIgPSB7fSwgX09iamVjdCRhc3NpZ24yW3NpZGVZXSA9IGhhc1kgPyB5ICsgXCJweFwiIDogJycsIF9PYmplY3QkYXNzaWduMltzaWRlWF0gPSBoYXNYID8geCArIFwicHhcIiA6ICcnLCBfT2JqZWN0JGFzc2lnbjIudHJhbnNmb3JtID0gJycsIF9PYmplY3QkYXNzaWduMikpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3R5bGVzKF9yZWY1KSB7XG4gIHZhciBzdGF0ZSA9IF9yZWY1LnN0YXRlLFxuICAgICAgb3B0aW9ucyA9IF9yZWY1Lm9wdGlvbnM7XG4gIHZhciBfb3B0aW9ucyRncHVBY2NlbGVyYXQgPSBvcHRpb25zLmdwdUFjY2VsZXJhdGlvbixcbiAgICAgIGdwdUFjY2VsZXJhdGlvbiA9IF9vcHRpb25zJGdwdUFjY2VsZXJhdCA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJGdwdUFjY2VsZXJhdCxcbiAgICAgIF9vcHRpb25zJGFkYXB0aXZlID0gb3B0aW9ucy5hZGFwdGl2ZSxcbiAgICAgIGFkYXB0aXZlID0gX29wdGlvbnMkYWRhcHRpdmUgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRhZGFwdGl2ZSxcbiAgICAgIF9vcHRpb25zJHJvdW5kT2Zmc2V0cyA9IG9wdGlvbnMucm91bmRPZmZzZXRzLFxuICAgICAgcm91bmRPZmZzZXRzID0gX29wdGlvbnMkcm91bmRPZmZzZXRzID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkcm91bmRPZmZzZXRzO1xuICB2YXIgY29tbW9uU3R5bGVzID0ge1xuICAgIHBsYWNlbWVudDogZ2V0QmFzZVBsYWNlbWVudChzdGF0ZS5wbGFjZW1lbnQpLFxuICAgIHZhcmlhdGlvbjogZ2V0VmFyaWF0aW9uKHN0YXRlLnBsYWNlbWVudCksXG4gICAgcG9wcGVyOiBzdGF0ZS5lbGVtZW50cy5wb3BwZXIsXG4gICAgcG9wcGVyUmVjdDogc3RhdGUucmVjdHMucG9wcGVyLFxuICAgIGdwdUFjY2VsZXJhdGlvbjogZ3B1QWNjZWxlcmF0aW9uLFxuICAgIGlzRml4ZWQ6IHN0YXRlLm9wdGlvbnMuc3RyYXRlZ3kgPT09ICdmaXhlZCdcbiAgfTtcblxuICBpZiAoc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzICE9IG51bGwpIHtcbiAgICBzdGF0ZS5zdHlsZXMucG9wcGVyID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc3R5bGVzLnBvcHBlciwgbWFwVG9TdHlsZXMoT2JqZWN0LmFzc2lnbih7fSwgY29tbW9uU3R5bGVzLCB7XG4gICAgICBvZmZzZXRzOiBzdGF0ZS5tb2RpZmllcnNEYXRhLnBvcHBlck9mZnNldHMsXG4gICAgICBwb3NpdGlvbjogc3RhdGUub3B0aW9ucy5zdHJhdGVneSxcbiAgICAgIGFkYXB0aXZlOiBhZGFwdGl2ZSxcbiAgICAgIHJvdW5kT2Zmc2V0czogcm91bmRPZmZzZXRzXG4gICAgfSkpKTtcbiAgfVxuXG4gIGlmIChzdGF0ZS5tb2RpZmllcnNEYXRhLmFycm93ICE9IG51bGwpIHtcbiAgICBzdGF0ZS5zdHlsZXMuYXJyb3cgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5zdHlsZXMuYXJyb3csIG1hcFRvU3R5bGVzKE9iamVjdC5hc3NpZ24oe30sIGNvbW1vblN0eWxlcywge1xuICAgICAgb2Zmc2V0czogc3RhdGUubW9kaWZpZXJzRGF0YS5hcnJvdyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgYWRhcHRpdmU6IGZhbHNlLFxuICAgICAgcm91bmRPZmZzZXRzOiByb3VuZE9mZnNldHNcbiAgICB9KSkpO1xuICB9XG5cbiAgc3RhdGUuYXR0cmlidXRlcy5wb3BwZXIgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5hdHRyaWJ1dGVzLnBvcHBlciwge1xuICAgICdkYXRhLXBvcHBlci1wbGFjZW1lbnQnOiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgY29tcHV0ZVN0eWxlcyQxID0ge1xuICBuYW1lOiAnY29tcHV0ZVN0eWxlcycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnYmVmb3JlV3JpdGUnLFxuICBmbjogY29tcHV0ZVN0eWxlcyxcbiAgZGF0YToge31cbn07XG5cbi8vIGFuZCBhcHBsaWVzIHRoZW0gdG8gdGhlIEhUTUxFbGVtZW50cyBzdWNoIGFzIHBvcHBlciBhbmQgYXJyb3dcblxuZnVuY3Rpb24gYXBwbHlTdHlsZXMoX3JlZikge1xuICB2YXIgc3RhdGUgPSBfcmVmLnN0YXRlO1xuICBPYmplY3Qua2V5cyhzdGF0ZS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBzdHlsZSA9IHN0YXRlLnN0eWxlc1tuYW1lXSB8fCB7fTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHN0YXRlLmF0dHJpYnV0ZXNbbmFtZV0gfHwge307XG4gICAgdmFyIGVsZW1lbnQgPSBzdGF0ZS5lbGVtZW50c1tuYW1lXTsgLy8gYXJyb3cgaXMgb3B0aW9uYWwgKyB2aXJ0dWFsIGVsZW1lbnRzXG5cbiAgICBpZiAoIWlzSFRNTEVsZW1lbnQoZWxlbWVudCkgfHwgIWdldE5vZGVOYW1lKGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBGbG93IGRvZXNuJ3Qgc3VwcG9ydCB0byBleHRlbmQgdGhpcyBwcm9wZXJ0eSwgYnV0IGl0J3MgdGhlIG1vc3RcbiAgICAvLyBlZmZlY3RpdmUgd2F5IHRvIGFwcGx5IHN0eWxlcyB0byBhbiBIVE1MRWxlbWVudFxuICAgIC8vICRGbG93Rml4TWVbY2Fubm90LXdyaXRlXVxuXG5cbiAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHN0eWxlKTtcbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhdHRyaWJ1dGVzW25hbWVdO1xuXG4gICAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUgPT09IHRydWUgPyAnJyA6IHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVmZmVjdCQxKF9yZWYyKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYyLnN0YXRlO1xuICB2YXIgaW5pdGlhbFN0eWxlcyA9IHtcbiAgICBwb3BwZXI6IHtcbiAgICAgIHBvc2l0aW9uOiBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5LFxuICAgICAgbGVmdDogJzAnLFxuICAgICAgdG9wOiAnMCcsXG4gICAgICBtYXJnaW46ICcwJ1xuICAgIH0sXG4gICAgYXJyb3c6IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgfSxcbiAgICByZWZlcmVuY2U6IHt9XG4gIH07XG4gIE9iamVjdC5hc3NpZ24oc3RhdGUuZWxlbWVudHMucG9wcGVyLnN0eWxlLCBpbml0aWFsU3R5bGVzLnBvcHBlcik7XG4gIHN0YXRlLnN0eWxlcyA9IGluaXRpYWxTdHlsZXM7XG5cbiAgaWYgKHN0YXRlLmVsZW1lbnRzLmFycm93KSB7XG4gICAgT2JqZWN0LmFzc2lnbihzdGF0ZS5lbGVtZW50cy5hcnJvdy5zdHlsZSwgaW5pdGlhbFN0eWxlcy5hcnJvdyk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIE9iamVjdC5rZXlzKHN0YXRlLmVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzW25hbWVdO1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBzdGF0ZS5hdHRyaWJ1dGVzW25hbWVdIHx8IHt9O1xuICAgICAgdmFyIHN0eWxlUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHN0YXRlLnN0eWxlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSA/IHN0YXRlLnN0eWxlc1tuYW1lXSA6IGluaXRpYWxTdHlsZXNbbmFtZV0pOyAvLyBTZXQgYWxsIHZhbHVlcyB0byBhbiBlbXB0eSBzdHJpbmcgdG8gdW5zZXQgdGhlbVxuXG4gICAgICB2YXIgc3R5bGUgPSBzdHlsZVByb3BlcnRpZXMucmVkdWNlKGZ1bmN0aW9uIChzdHlsZSwgcHJvcGVydHkpIHtcbiAgICAgICAgc3R5bGVbcHJvcGVydHldID0gJyc7XG4gICAgICAgIHJldHVybiBzdHlsZTtcbiAgICAgIH0sIHt9KTsgLy8gYXJyb3cgaXMgb3B0aW9uYWwgKyB2aXJ0dWFsIGVsZW1lbnRzXG5cbiAgICAgIGlmICghaXNIVE1MRWxlbWVudChlbGVtZW50KSB8fCAhZ2V0Tm9kZU5hbWUoZWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHN0eWxlKTtcbiAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgYXBwbHlTdHlsZXMkMSA9IHtcbiAgbmFtZTogJ2FwcGx5U3R5bGVzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICd3cml0ZScsXG4gIGZuOiBhcHBseVN0eWxlcyxcbiAgZWZmZWN0OiBlZmZlY3QkMSxcbiAgcmVxdWlyZXM6IFsnY29tcHV0ZVN0eWxlcyddXG59O1xuXG5mdW5jdGlvbiBkaXN0YW5jZUFuZFNraWRkaW5nVG9YWShwbGFjZW1lbnQsIHJlY3RzLCBvZmZzZXQpIHtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCk7XG4gIHZhciBpbnZlcnREaXN0YW5jZSA9IFtsZWZ0LCB0b3BdLmluZGV4T2YoYmFzZVBsYWNlbWVudCkgPj0gMCA/IC0xIDogMTtcblxuICB2YXIgX3JlZiA9IHR5cGVvZiBvZmZzZXQgPT09ICdmdW5jdGlvbicgPyBvZmZzZXQoT2JqZWN0LmFzc2lnbih7fSwgcmVjdHMsIHtcbiAgICBwbGFjZW1lbnQ6IHBsYWNlbWVudFxuICB9KSkgOiBvZmZzZXQsXG4gICAgICBza2lkZGluZyA9IF9yZWZbMF0sXG4gICAgICBkaXN0YW5jZSA9IF9yZWZbMV07XG5cbiAgc2tpZGRpbmcgPSBza2lkZGluZyB8fCAwO1xuICBkaXN0YW5jZSA9IChkaXN0YW5jZSB8fCAwKSAqIGludmVydERpc3RhbmNlO1xuICByZXR1cm4gW2xlZnQsIHJpZ2h0XS5pbmRleE9mKGJhc2VQbGFjZW1lbnQpID49IDAgPyB7XG4gICAgeDogZGlzdGFuY2UsXG4gICAgeTogc2tpZGRpbmdcbiAgfSA6IHtcbiAgICB4OiBza2lkZGluZyxcbiAgICB5OiBkaXN0YW5jZVxuICB9O1xufVxuXG5mdW5jdGlvbiBvZmZzZXQoX3JlZjIpIHtcbiAgdmFyIHN0YXRlID0gX3JlZjIuc3RhdGUsXG4gICAgICBvcHRpb25zID0gX3JlZjIub3B0aW9ucyxcbiAgICAgIG5hbWUgPSBfcmVmMi5uYW1lO1xuICB2YXIgX29wdGlvbnMkb2Zmc2V0ID0gb3B0aW9ucy5vZmZzZXQsXG4gICAgICBvZmZzZXQgPSBfb3B0aW9ucyRvZmZzZXQgPT09IHZvaWQgMCA/IFswLCAwXSA6IF9vcHRpb25zJG9mZnNldDtcbiAgdmFyIGRhdGEgPSBwbGFjZW1lbnRzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwbGFjZW1lbnQpIHtcbiAgICBhY2NbcGxhY2VtZW50XSA9IGRpc3RhbmNlQW5kU2tpZGRpbmdUb1hZKHBsYWNlbWVudCwgc3RhdGUucmVjdHMsIG9mZnNldCk7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICB2YXIgX2RhdGEkc3RhdGUkcGxhY2VtZW50ID0gZGF0YVtzdGF0ZS5wbGFjZW1lbnRdLFxuICAgICAgeCA9IF9kYXRhJHN0YXRlJHBsYWNlbWVudC54LFxuICAgICAgeSA9IF9kYXRhJHN0YXRlJHBsYWNlbWVudC55O1xuXG4gIGlmIChzdGF0ZS5tb2RpZmllcnNEYXRhLnBvcHBlck9mZnNldHMgIT0gbnVsbCkge1xuICAgIHN0YXRlLm1vZGlmaWVyc0RhdGEucG9wcGVyT2Zmc2V0cy54ICs9IHg7XG4gICAgc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzLnkgKz0geTtcbiAgfVxuXG4gIHN0YXRlLm1vZGlmaWVyc0RhdGFbbmFtZV0gPSBkYXRhO1xufSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cblxudmFyIG9mZnNldCQxID0ge1xuICBuYW1lOiAnb2Zmc2V0JyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdtYWluJyxcbiAgcmVxdWlyZXM6IFsncG9wcGVyT2Zmc2V0cyddLFxuICBmbjogb2Zmc2V0XG59O1xuXG52YXIgaGFzaCQxID0ge1xuICBsZWZ0OiAncmlnaHQnLFxuICByaWdodDogJ2xlZnQnLFxuICBib3R0b206ICd0b3AnLFxuICB0b3A6ICdib3R0b20nXG59O1xuZnVuY3Rpb24gZ2V0T3Bwb3NpdGVQbGFjZW1lbnQocGxhY2VtZW50KSB7XG4gIHJldHVybiBwbGFjZW1lbnQucmVwbGFjZSgvbGVmdHxyaWdodHxib3R0b218dG9wL2csIGZ1bmN0aW9uIChtYXRjaGVkKSB7XG4gICAgcmV0dXJuIGhhc2gkMVttYXRjaGVkXTtcbiAgfSk7XG59XG5cbnZhciBoYXNoID0ge1xuICBzdGFydDogJ2VuZCcsXG4gIGVuZDogJ3N0YXJ0J1xufTtcbmZ1bmN0aW9uIGdldE9wcG9zaXRlVmFyaWF0aW9uUGxhY2VtZW50KHBsYWNlbWVudCkge1xuICByZXR1cm4gcGxhY2VtZW50LnJlcGxhY2UoL3N0YXJ0fGVuZC9nLCBmdW5jdGlvbiAobWF0Y2hlZCkge1xuICAgIHJldHVybiBoYXNoW21hdGNoZWRdO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZUF1dG9QbGFjZW1lbnQoc3RhdGUsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIHZhciBfb3B0aW9ucyA9IG9wdGlvbnMsXG4gICAgICBwbGFjZW1lbnQgPSBfb3B0aW9ucy5wbGFjZW1lbnQsXG4gICAgICBib3VuZGFyeSA9IF9vcHRpb25zLmJvdW5kYXJ5LFxuICAgICAgcm9vdEJvdW5kYXJ5ID0gX29wdGlvbnMucm9vdEJvdW5kYXJ5LFxuICAgICAgcGFkZGluZyA9IF9vcHRpb25zLnBhZGRpbmcsXG4gICAgICBmbGlwVmFyaWF0aW9ucyA9IF9vcHRpb25zLmZsaXBWYXJpYXRpb25zLFxuICAgICAgX29wdGlvbnMkYWxsb3dlZEF1dG9QID0gX29wdGlvbnMuYWxsb3dlZEF1dG9QbGFjZW1lbnRzLFxuICAgICAgYWxsb3dlZEF1dG9QbGFjZW1lbnRzID0gX29wdGlvbnMkYWxsb3dlZEF1dG9QID09PSB2b2lkIDAgPyBwbGFjZW1lbnRzIDogX29wdGlvbnMkYWxsb3dlZEF1dG9QO1xuICB2YXIgdmFyaWF0aW9uID0gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCk7XG4gIHZhciBwbGFjZW1lbnRzJDEgPSB2YXJpYXRpb24gPyBmbGlwVmFyaWF0aW9ucyA/IHZhcmlhdGlvblBsYWNlbWVudHMgOiB2YXJpYXRpb25QbGFjZW1lbnRzLmZpbHRlcihmdW5jdGlvbiAocGxhY2VtZW50KSB7XG4gICAgcmV0dXJuIGdldFZhcmlhdGlvbihwbGFjZW1lbnQpID09PSB2YXJpYXRpb247XG4gIH0pIDogYmFzZVBsYWNlbWVudHM7XG4gIHZhciBhbGxvd2VkUGxhY2VtZW50cyA9IHBsYWNlbWVudHMkMS5maWx0ZXIoZnVuY3Rpb24gKHBsYWNlbWVudCkge1xuICAgIHJldHVybiBhbGxvd2VkQXV0b1BsYWNlbWVudHMuaW5kZXhPZihwbGFjZW1lbnQpID49IDA7XG4gIH0pO1xuXG4gIGlmIChhbGxvd2VkUGxhY2VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBhbGxvd2VkUGxhY2VtZW50cyA9IHBsYWNlbWVudHMkMTtcbiAgfSAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS10eXBlXTogRmxvdyBzZWVtcyB0byBoYXZlIHByb2JsZW1zIHdpdGggdHdvIGFycmF5IHVuaW9ucy4uLlxuXG5cbiAgdmFyIG92ZXJmbG93cyA9IGFsbG93ZWRQbGFjZW1lbnRzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwbGFjZW1lbnQpIHtcbiAgICBhY2NbcGxhY2VtZW50XSA9IGRldGVjdE92ZXJmbG93KHN0YXRlLCB7XG4gICAgICBwbGFjZW1lbnQ6IHBsYWNlbWVudCxcbiAgICAgIGJvdW5kYXJ5OiBib3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeTogcm9vdEJvdW5kYXJ5LFxuICAgICAgcGFkZGluZzogcGFkZGluZ1xuICAgIH0pW2dldEJhc2VQbGFjZW1lbnQocGxhY2VtZW50KV07XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICByZXR1cm4gT2JqZWN0LmtleXMob3ZlcmZsb3dzKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIG92ZXJmbG93c1thXSAtIG92ZXJmbG93c1tiXTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEV4cGFuZGVkRmFsbGJhY2tQbGFjZW1lbnRzKHBsYWNlbWVudCkge1xuICBpZiAoZ2V0QmFzZVBsYWNlbWVudChwbGFjZW1lbnQpID09PSBhdXRvKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIG9wcG9zaXRlUGxhY2VtZW50ID0gZ2V0T3Bwb3NpdGVQbGFjZW1lbnQocGxhY2VtZW50KTtcbiAgcmV0dXJuIFtnZXRPcHBvc2l0ZVZhcmlhdGlvblBsYWNlbWVudChwbGFjZW1lbnQpLCBvcHBvc2l0ZVBsYWNlbWVudCwgZ2V0T3Bwb3NpdGVWYXJpYXRpb25QbGFjZW1lbnQob3Bwb3NpdGVQbGFjZW1lbnQpXTtcbn1cblxuZnVuY3Rpb24gZmxpcChfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGUsXG4gICAgICBvcHRpb25zID0gX3JlZi5vcHRpb25zLFxuICAgICAgbmFtZSA9IF9yZWYubmFtZTtcblxuICBpZiAoc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXS5fc2tpcCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBfb3B0aW9ucyRtYWluQXhpcyA9IG9wdGlvbnMubWFpbkF4aXMsXG4gICAgICBjaGVja01haW5BeGlzID0gX29wdGlvbnMkbWFpbkF4aXMgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRtYWluQXhpcyxcbiAgICAgIF9vcHRpb25zJGFsdEF4aXMgPSBvcHRpb25zLmFsdEF4aXMsXG4gICAgICBjaGVja0FsdEF4aXMgPSBfb3B0aW9ucyRhbHRBeGlzID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkYWx0QXhpcyxcbiAgICAgIHNwZWNpZmllZEZhbGxiYWNrUGxhY2VtZW50cyA9IG9wdGlvbnMuZmFsbGJhY2tQbGFjZW1lbnRzLFxuICAgICAgcGFkZGluZyA9IG9wdGlvbnMucGFkZGluZyxcbiAgICAgIGJvdW5kYXJ5ID0gb3B0aW9ucy5ib3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeSA9IG9wdGlvbnMucm9vdEJvdW5kYXJ5LFxuICAgICAgYWx0Qm91bmRhcnkgPSBvcHRpb25zLmFsdEJvdW5kYXJ5LFxuICAgICAgX29wdGlvbnMkZmxpcFZhcmlhdGlvID0gb3B0aW9ucy5mbGlwVmFyaWF0aW9ucyxcbiAgICAgIGZsaXBWYXJpYXRpb25zID0gX29wdGlvbnMkZmxpcFZhcmlhdGlvID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkZmxpcFZhcmlhdGlvLFxuICAgICAgYWxsb3dlZEF1dG9QbGFjZW1lbnRzID0gb3B0aW9ucy5hbGxvd2VkQXV0b1BsYWNlbWVudHM7XG4gIHZhciBwcmVmZXJyZWRQbGFjZW1lbnQgPSBzdGF0ZS5vcHRpb25zLnBsYWNlbWVudDtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBnZXRCYXNlUGxhY2VtZW50KHByZWZlcnJlZFBsYWNlbWVudCk7XG4gIHZhciBpc0Jhc2VQbGFjZW1lbnQgPSBiYXNlUGxhY2VtZW50ID09PSBwcmVmZXJyZWRQbGFjZW1lbnQ7XG4gIHZhciBmYWxsYmFja1BsYWNlbWVudHMgPSBzcGVjaWZpZWRGYWxsYmFja1BsYWNlbWVudHMgfHwgKGlzQmFzZVBsYWNlbWVudCB8fCAhZmxpcFZhcmlhdGlvbnMgPyBbZ2V0T3Bwb3NpdGVQbGFjZW1lbnQocHJlZmVycmVkUGxhY2VtZW50KV0gOiBnZXRFeHBhbmRlZEZhbGxiYWNrUGxhY2VtZW50cyhwcmVmZXJyZWRQbGFjZW1lbnQpKTtcbiAgdmFyIHBsYWNlbWVudHMgPSBbcHJlZmVycmVkUGxhY2VtZW50XS5jb25jYXQoZmFsbGJhY2tQbGFjZW1lbnRzKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gICAgcmV0dXJuIGFjYy5jb25jYXQoZ2V0QmFzZVBsYWNlbWVudChwbGFjZW1lbnQpID09PSBhdXRvID8gY29tcHV0ZUF1dG9QbGFjZW1lbnQoc3RhdGUsIHtcbiAgICAgIHBsYWNlbWVudDogcGxhY2VtZW50LFxuICAgICAgYm91bmRhcnk6IGJvdW5kYXJ5LFxuICAgICAgcm9vdEJvdW5kYXJ5OiByb290Qm91bmRhcnksXG4gICAgICBwYWRkaW5nOiBwYWRkaW5nLFxuICAgICAgZmxpcFZhcmlhdGlvbnM6IGZsaXBWYXJpYXRpb25zLFxuICAgICAgYWxsb3dlZEF1dG9QbGFjZW1lbnRzOiBhbGxvd2VkQXV0b1BsYWNlbWVudHNcbiAgICB9KSA6IHBsYWNlbWVudCk7XG4gIH0sIFtdKTtcbiAgdmFyIHJlZmVyZW5jZVJlY3QgPSBzdGF0ZS5yZWN0cy5yZWZlcmVuY2U7XG4gIHZhciBwb3BwZXJSZWN0ID0gc3RhdGUucmVjdHMucG9wcGVyO1xuICB2YXIgY2hlY2tzTWFwID0gbmV3IE1hcCgpO1xuICB2YXIgbWFrZUZhbGxiYWNrQ2hlY2tzID0gdHJ1ZTtcbiAgdmFyIGZpcnN0Rml0dGluZ1BsYWNlbWVudCA9IHBsYWNlbWVudHNbMF07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGFjZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBsYWNlbWVudCA9IHBsYWNlbWVudHNbaV07XG5cbiAgICB2YXIgX2Jhc2VQbGFjZW1lbnQgPSBnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCk7XG5cbiAgICB2YXIgaXNTdGFydFZhcmlhdGlvbiA9IGdldFZhcmlhdGlvbihwbGFjZW1lbnQpID09PSBzdGFydDtcbiAgICB2YXIgaXNWZXJ0aWNhbCA9IFt0b3AsIGJvdHRvbV0uaW5kZXhPZihfYmFzZVBsYWNlbWVudCkgPj0gMDtcbiAgICB2YXIgbGVuID0gaXNWZXJ0aWNhbCA/ICd3aWR0aCcgOiAnaGVpZ2h0JztcbiAgICB2YXIgb3ZlcmZsb3cgPSBkZXRlY3RPdmVyZmxvdyhzdGF0ZSwge1xuICAgICAgcGxhY2VtZW50OiBwbGFjZW1lbnQsXG4gICAgICBib3VuZGFyeTogYm91bmRhcnksXG4gICAgICByb290Qm91bmRhcnk6IHJvb3RCb3VuZGFyeSxcbiAgICAgIGFsdEJvdW5kYXJ5OiBhbHRCb3VuZGFyeSxcbiAgICAgIHBhZGRpbmc6IHBhZGRpbmdcbiAgICB9KTtcbiAgICB2YXIgbWFpblZhcmlhdGlvblNpZGUgPSBpc1ZlcnRpY2FsID8gaXNTdGFydFZhcmlhdGlvbiA/IHJpZ2h0IDogbGVmdCA6IGlzU3RhcnRWYXJpYXRpb24gPyBib3R0b20gOiB0b3A7XG5cbiAgICBpZiAocmVmZXJlbmNlUmVjdFtsZW5dID4gcG9wcGVyUmVjdFtsZW5dKSB7XG4gICAgICBtYWluVmFyaWF0aW9uU2lkZSA9IGdldE9wcG9zaXRlUGxhY2VtZW50KG1haW5WYXJpYXRpb25TaWRlKTtcbiAgICB9XG5cbiAgICB2YXIgYWx0VmFyaWF0aW9uU2lkZSA9IGdldE9wcG9zaXRlUGxhY2VtZW50KG1haW5WYXJpYXRpb25TaWRlKTtcbiAgICB2YXIgY2hlY2tzID0gW107XG5cbiAgICBpZiAoY2hlY2tNYWluQXhpcykge1xuICAgICAgY2hlY2tzLnB1c2gob3ZlcmZsb3dbX2Jhc2VQbGFjZW1lbnRdIDw9IDApO1xuICAgIH1cblxuICAgIGlmIChjaGVja0FsdEF4aXMpIHtcbiAgICAgIGNoZWNrcy5wdXNoKG92ZXJmbG93W21haW5WYXJpYXRpb25TaWRlXSA8PSAwLCBvdmVyZmxvd1thbHRWYXJpYXRpb25TaWRlXSA8PSAwKTtcbiAgICB9XG5cbiAgICBpZiAoY2hlY2tzLmV2ZXJ5KGZ1bmN0aW9uIChjaGVjaykge1xuICAgICAgcmV0dXJuIGNoZWNrO1xuICAgIH0pKSB7XG4gICAgICBmaXJzdEZpdHRpbmdQbGFjZW1lbnQgPSBwbGFjZW1lbnQ7XG4gICAgICBtYWtlRmFsbGJhY2tDaGVja3MgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNoZWNrc01hcC5zZXQocGxhY2VtZW50LCBjaGVja3MpO1xuICB9XG5cbiAgaWYgKG1ha2VGYWxsYmFja0NoZWNrcykge1xuICAgIC8vIGAyYCBtYXkgYmUgZGVzaXJlZCBpbiBzb21lIGNhc2VzIOKAkyByZXNlYXJjaCBsYXRlclxuICAgIHZhciBudW1iZXJPZkNoZWNrcyA9IGZsaXBWYXJpYXRpb25zID8gMyA6IDE7XG5cbiAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChfaSkge1xuICAgICAgdmFyIGZpdHRpbmdQbGFjZW1lbnQgPSBwbGFjZW1lbnRzLmZpbmQoZnVuY3Rpb24gKHBsYWNlbWVudCkge1xuICAgICAgICB2YXIgY2hlY2tzID0gY2hlY2tzTWFwLmdldChwbGFjZW1lbnQpO1xuXG4gICAgICAgIGlmIChjaGVja3MpIHtcbiAgICAgICAgICByZXR1cm4gY2hlY2tzLnNsaWNlKDAsIF9pKS5ldmVyeShmdW5jdGlvbiAoY2hlY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVjaztcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChmaXR0aW5nUGxhY2VtZW50KSB7XG4gICAgICAgIGZpcnN0Rml0dGluZ1BsYWNlbWVudCA9IGZpdHRpbmdQbGFjZW1lbnQ7XG4gICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZvciAodmFyIF9pID0gbnVtYmVyT2ZDaGVja3M7IF9pID4gMDsgX2ktLSkge1xuICAgICAgdmFyIF9yZXQgPSBfbG9vcChfaSk7XG5cbiAgICAgIGlmIChfcmV0ID09PSBcImJyZWFrXCIpIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZS5wbGFjZW1lbnQgIT09IGZpcnN0Rml0dGluZ1BsYWNlbWVudCkge1xuICAgIHN0YXRlLm1vZGlmaWVyc0RhdGFbbmFtZV0uX3NraXAgPSB0cnVlO1xuICAgIHN0YXRlLnBsYWNlbWVudCA9IGZpcnN0Rml0dGluZ1BsYWNlbWVudDtcbiAgICBzdGF0ZS5yZXNldCA9IHRydWU7XG4gIH1cbn0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5cbnZhciBmbGlwJDEgPSB7XG4gIG5hbWU6ICdmbGlwJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdtYWluJyxcbiAgZm46IGZsaXAsXG4gIHJlcXVpcmVzSWZFeGlzdHM6IFsnb2Zmc2V0J10sXG4gIGRhdGE6IHtcbiAgICBfc2tpcDogZmFsc2VcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0QWx0QXhpcyhheGlzKSB7XG4gIHJldHVybiBheGlzID09PSAneCcgPyAneScgOiAneCc7XG59XG5cbmZ1bmN0aW9uIHdpdGhpbihtaW4kMSwgdmFsdWUsIG1heCQxKSB7XG4gIHJldHVybiBtYXgobWluJDEsIG1pbih2YWx1ZSwgbWF4JDEpKTtcbn1cbmZ1bmN0aW9uIHdpdGhpbk1heENsYW1wKG1pbiwgdmFsdWUsIG1heCkge1xuICB2YXIgdiA9IHdpdGhpbihtaW4sIHZhbHVlLCBtYXgpO1xuICByZXR1cm4gdiA+IG1heCA/IG1heCA6IHY7XG59XG5cbmZ1bmN0aW9uIHByZXZlbnRPdmVyZmxvdyhfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGUsXG4gICAgICBvcHRpb25zID0gX3JlZi5vcHRpb25zLFxuICAgICAgbmFtZSA9IF9yZWYubmFtZTtcbiAgdmFyIF9vcHRpb25zJG1haW5BeGlzID0gb3B0aW9ucy5tYWluQXhpcyxcbiAgICAgIGNoZWNrTWFpbkF4aXMgPSBfb3B0aW9ucyRtYWluQXhpcyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJG1haW5BeGlzLFxuICAgICAgX29wdGlvbnMkYWx0QXhpcyA9IG9wdGlvbnMuYWx0QXhpcyxcbiAgICAgIGNoZWNrQWx0QXhpcyA9IF9vcHRpb25zJGFsdEF4aXMgPT09IHZvaWQgMCA/IGZhbHNlIDogX29wdGlvbnMkYWx0QXhpcyxcbiAgICAgIGJvdW5kYXJ5ID0gb3B0aW9ucy5ib3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeSA9IG9wdGlvbnMucm9vdEJvdW5kYXJ5LFxuICAgICAgYWx0Qm91bmRhcnkgPSBvcHRpb25zLmFsdEJvdW5kYXJ5LFxuICAgICAgcGFkZGluZyA9IG9wdGlvbnMucGFkZGluZyxcbiAgICAgIF9vcHRpb25zJHRldGhlciA9IG9wdGlvbnMudGV0aGVyLFxuICAgICAgdGV0aGVyID0gX29wdGlvbnMkdGV0aGVyID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkdGV0aGVyLFxuICAgICAgX29wdGlvbnMkdGV0aGVyT2Zmc2V0ID0gb3B0aW9ucy50ZXRoZXJPZmZzZXQsXG4gICAgICB0ZXRoZXJPZmZzZXQgPSBfb3B0aW9ucyR0ZXRoZXJPZmZzZXQgPT09IHZvaWQgMCA/IDAgOiBfb3B0aW9ucyR0ZXRoZXJPZmZzZXQ7XG4gIHZhciBvdmVyZmxvdyA9IGRldGVjdE92ZXJmbG93KHN0YXRlLCB7XG4gICAgYm91bmRhcnk6IGJvdW5kYXJ5LFxuICAgIHJvb3RCb3VuZGFyeTogcm9vdEJvdW5kYXJ5LFxuICAgIHBhZGRpbmc6IHBhZGRpbmcsXG4gICAgYWx0Qm91bmRhcnk6IGFsdEJvdW5kYXJ5XG4gIH0pO1xuICB2YXIgYmFzZVBsYWNlbWVudCA9IGdldEJhc2VQbGFjZW1lbnQoc3RhdGUucGxhY2VtZW50KTtcbiAgdmFyIHZhcmlhdGlvbiA9IGdldFZhcmlhdGlvbihzdGF0ZS5wbGFjZW1lbnQpO1xuICB2YXIgaXNCYXNlUGxhY2VtZW50ID0gIXZhcmlhdGlvbjtcbiAgdmFyIG1haW5BeGlzID0gZ2V0TWFpbkF4aXNGcm9tUGxhY2VtZW50KGJhc2VQbGFjZW1lbnQpO1xuICB2YXIgYWx0QXhpcyA9IGdldEFsdEF4aXMobWFpbkF4aXMpO1xuICB2YXIgcG9wcGVyT2Zmc2V0cyA9IHN0YXRlLm1vZGlmaWVyc0RhdGEucG9wcGVyT2Zmc2V0cztcbiAgdmFyIHJlZmVyZW5jZVJlY3QgPSBzdGF0ZS5yZWN0cy5yZWZlcmVuY2U7XG4gIHZhciBwb3BwZXJSZWN0ID0gc3RhdGUucmVjdHMucG9wcGVyO1xuICB2YXIgdGV0aGVyT2Zmc2V0VmFsdWUgPSB0eXBlb2YgdGV0aGVyT2Zmc2V0ID09PSAnZnVuY3Rpb24nID8gdGV0aGVyT2Zmc2V0KE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnJlY3RzLCB7XG4gICAgcGxhY2VtZW50OiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSkpIDogdGV0aGVyT2Zmc2V0O1xuICB2YXIgbm9ybWFsaXplZFRldGhlck9mZnNldFZhbHVlID0gdHlwZW9mIHRldGhlck9mZnNldFZhbHVlID09PSAnbnVtYmVyJyA/IHtcbiAgICBtYWluQXhpczogdGV0aGVyT2Zmc2V0VmFsdWUsXG4gICAgYWx0QXhpczogdGV0aGVyT2Zmc2V0VmFsdWVcbiAgfSA6IE9iamVjdC5hc3NpZ24oe1xuICAgIG1haW5BeGlzOiAwLFxuICAgIGFsdEF4aXM6IDBcbiAgfSwgdGV0aGVyT2Zmc2V0VmFsdWUpO1xuICB2YXIgb2Zmc2V0TW9kaWZpZXJTdGF0ZSA9IHN0YXRlLm1vZGlmaWVyc0RhdGEub2Zmc2V0ID8gc3RhdGUubW9kaWZpZXJzRGF0YS5vZmZzZXRbc3RhdGUucGxhY2VtZW50XSA6IG51bGw7XG4gIHZhciBkYXRhID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuXG4gIGlmICghcG9wcGVyT2Zmc2V0cykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChjaGVja01haW5BeGlzKSB7XG4gICAgdmFyIF9vZmZzZXRNb2RpZmllclN0YXRlJDtcblxuICAgIHZhciBtYWluU2lkZSA9IG1haW5BeGlzID09PSAneScgPyB0b3AgOiBsZWZ0O1xuICAgIHZhciBhbHRTaWRlID0gbWFpbkF4aXMgPT09ICd5JyA/IGJvdHRvbSA6IHJpZ2h0O1xuICAgIHZhciBsZW4gPSBtYWluQXhpcyA9PT0gJ3knID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuICAgIHZhciBvZmZzZXQgPSBwb3BwZXJPZmZzZXRzW21haW5BeGlzXTtcbiAgICB2YXIgbWluJDEgPSBvZmZzZXQgKyBvdmVyZmxvd1ttYWluU2lkZV07XG4gICAgdmFyIG1heCQxID0gb2Zmc2V0IC0gb3ZlcmZsb3dbYWx0U2lkZV07XG4gICAgdmFyIGFkZGl0aXZlID0gdGV0aGVyID8gLXBvcHBlclJlY3RbbGVuXSAvIDIgOiAwO1xuICAgIHZhciBtaW5MZW4gPSB2YXJpYXRpb24gPT09IHN0YXJ0ID8gcmVmZXJlbmNlUmVjdFtsZW5dIDogcG9wcGVyUmVjdFtsZW5dO1xuICAgIHZhciBtYXhMZW4gPSB2YXJpYXRpb24gPT09IHN0YXJ0ID8gLXBvcHBlclJlY3RbbGVuXSA6IC1yZWZlcmVuY2VSZWN0W2xlbl07IC8vIFdlIG5lZWQgdG8gaW5jbHVkZSB0aGUgYXJyb3cgaW4gdGhlIGNhbGN1bGF0aW9uIHNvIHRoZSBhcnJvdyBkb2Vzbid0IGdvXG4gICAgLy8gb3V0c2lkZSB0aGUgcmVmZXJlbmNlIGJvdW5kc1xuXG4gICAgdmFyIGFycm93RWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzLmFycm93O1xuICAgIHZhciBhcnJvd1JlY3QgPSB0ZXRoZXIgJiYgYXJyb3dFbGVtZW50ID8gZ2V0TGF5b3V0UmVjdChhcnJvd0VsZW1lbnQpIDoge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIHZhciBhcnJvd1BhZGRpbmdPYmplY3QgPSBzdGF0ZS5tb2RpZmllcnNEYXRhWydhcnJvdyNwZXJzaXN0ZW50J10gPyBzdGF0ZS5tb2RpZmllcnNEYXRhWydhcnJvdyNwZXJzaXN0ZW50J10ucGFkZGluZyA6IGdldEZyZXNoU2lkZU9iamVjdCgpO1xuICAgIHZhciBhcnJvd1BhZGRpbmdNaW4gPSBhcnJvd1BhZGRpbmdPYmplY3RbbWFpblNpZGVdO1xuICAgIHZhciBhcnJvd1BhZGRpbmdNYXggPSBhcnJvd1BhZGRpbmdPYmplY3RbYWx0U2lkZV07IC8vIElmIHRoZSByZWZlcmVuY2UgbGVuZ3RoIGlzIHNtYWxsZXIgdGhhbiB0aGUgYXJyb3cgbGVuZ3RoLCB3ZSBkb24ndCB3YW50XG4gICAgLy8gdG8gaW5jbHVkZSBpdHMgZnVsbCBzaXplIGluIHRoZSBjYWxjdWxhdGlvbi4gSWYgdGhlIHJlZmVyZW5jZSBpcyBzbWFsbFxuICAgIC8vIGFuZCBuZWFyIHRoZSBlZGdlIG9mIGEgYm91bmRhcnksIHRoZSBwb3BwZXIgY2FuIG92ZXJmbG93IGV2ZW4gaWYgdGhlXG4gICAgLy8gcmVmZXJlbmNlIGlzIG5vdCBvdmVyZmxvd2luZyBhcyB3ZWxsIChlLmcuIHZpcnR1YWwgZWxlbWVudHMgd2l0aCBub1xuICAgIC8vIHdpZHRoIG9yIGhlaWdodClcblxuICAgIHZhciBhcnJvd0xlbiA9IHdpdGhpbigwLCByZWZlcmVuY2VSZWN0W2xlbl0sIGFycm93UmVjdFtsZW5dKTtcbiAgICB2YXIgbWluT2Zmc2V0ID0gaXNCYXNlUGxhY2VtZW50ID8gcmVmZXJlbmNlUmVjdFtsZW5dIC8gMiAtIGFkZGl0aXZlIC0gYXJyb3dMZW4gLSBhcnJvd1BhZGRpbmdNaW4gLSBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUubWFpbkF4aXMgOiBtaW5MZW4gLSBhcnJvd0xlbiAtIGFycm93UGFkZGluZ01pbiAtIG5vcm1hbGl6ZWRUZXRoZXJPZmZzZXRWYWx1ZS5tYWluQXhpcztcbiAgICB2YXIgbWF4T2Zmc2V0ID0gaXNCYXNlUGxhY2VtZW50ID8gLXJlZmVyZW5jZVJlY3RbbGVuXSAvIDIgKyBhZGRpdGl2ZSArIGFycm93TGVuICsgYXJyb3dQYWRkaW5nTWF4ICsgbm9ybWFsaXplZFRldGhlck9mZnNldFZhbHVlLm1haW5BeGlzIDogbWF4TGVuICsgYXJyb3dMZW4gKyBhcnJvd1BhZGRpbmdNYXggKyBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUubWFpbkF4aXM7XG4gICAgdmFyIGFycm93T2Zmc2V0UGFyZW50ID0gc3RhdGUuZWxlbWVudHMuYXJyb3cgJiYgZ2V0T2Zmc2V0UGFyZW50KHN0YXRlLmVsZW1lbnRzLmFycm93KTtcbiAgICB2YXIgY2xpZW50T2Zmc2V0ID0gYXJyb3dPZmZzZXRQYXJlbnQgPyBtYWluQXhpcyA9PT0gJ3knID8gYXJyb3dPZmZzZXRQYXJlbnQuY2xpZW50VG9wIHx8IDAgOiBhcnJvd09mZnNldFBhcmVudC5jbGllbnRMZWZ0IHx8IDAgOiAwO1xuICAgIHZhciBvZmZzZXRNb2RpZmllclZhbHVlID0gKF9vZmZzZXRNb2RpZmllclN0YXRlJCA9IG9mZnNldE1vZGlmaWVyU3RhdGUgPT0gbnVsbCA/IHZvaWQgMCA6IG9mZnNldE1vZGlmaWVyU3RhdGVbbWFpbkF4aXNdKSAhPSBudWxsID8gX29mZnNldE1vZGlmaWVyU3RhdGUkIDogMDtcbiAgICB2YXIgdGV0aGVyTWluID0gb2Zmc2V0ICsgbWluT2Zmc2V0IC0gb2Zmc2V0TW9kaWZpZXJWYWx1ZSAtIGNsaWVudE9mZnNldDtcbiAgICB2YXIgdGV0aGVyTWF4ID0gb2Zmc2V0ICsgbWF4T2Zmc2V0IC0gb2Zmc2V0TW9kaWZpZXJWYWx1ZTtcbiAgICB2YXIgcHJldmVudGVkT2Zmc2V0ID0gd2l0aGluKHRldGhlciA/IG1pbihtaW4kMSwgdGV0aGVyTWluKSA6IG1pbiQxLCBvZmZzZXQsIHRldGhlciA/IG1heChtYXgkMSwgdGV0aGVyTWF4KSA6IG1heCQxKTtcbiAgICBwb3BwZXJPZmZzZXRzW21haW5BeGlzXSA9IHByZXZlbnRlZE9mZnNldDtcbiAgICBkYXRhW21haW5BeGlzXSA9IHByZXZlbnRlZE9mZnNldCAtIG9mZnNldDtcbiAgfVxuXG4gIGlmIChjaGVja0FsdEF4aXMpIHtcbiAgICB2YXIgX29mZnNldE1vZGlmaWVyU3RhdGUkMjtcblxuICAgIHZhciBfbWFpblNpZGUgPSBtYWluQXhpcyA9PT0gJ3gnID8gdG9wIDogbGVmdDtcblxuICAgIHZhciBfYWx0U2lkZSA9IG1haW5BeGlzID09PSAneCcgPyBib3R0b20gOiByaWdodDtcblxuICAgIHZhciBfb2Zmc2V0ID0gcG9wcGVyT2Zmc2V0c1thbHRBeGlzXTtcblxuICAgIHZhciBfbGVuID0gYWx0QXhpcyA9PT0gJ3knID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuXG4gICAgdmFyIF9taW4gPSBfb2Zmc2V0ICsgb3ZlcmZsb3dbX21haW5TaWRlXTtcblxuICAgIHZhciBfbWF4ID0gX29mZnNldCAtIG92ZXJmbG93W19hbHRTaWRlXTtcblxuICAgIHZhciBpc09yaWdpblNpZGUgPSBbdG9wLCBsZWZ0XS5pbmRleE9mKGJhc2VQbGFjZW1lbnQpICE9PSAtMTtcblxuICAgIHZhciBfb2Zmc2V0TW9kaWZpZXJWYWx1ZSA9IChfb2Zmc2V0TW9kaWZpZXJTdGF0ZSQyID0gb2Zmc2V0TW9kaWZpZXJTdGF0ZSA9PSBudWxsID8gdm9pZCAwIDogb2Zmc2V0TW9kaWZpZXJTdGF0ZVthbHRBeGlzXSkgIT0gbnVsbCA/IF9vZmZzZXRNb2RpZmllclN0YXRlJDIgOiAwO1xuXG4gICAgdmFyIF90ZXRoZXJNaW4gPSBpc09yaWdpblNpZGUgPyBfbWluIDogX29mZnNldCAtIHJlZmVyZW5jZVJlY3RbX2xlbl0gLSBwb3BwZXJSZWN0W19sZW5dIC0gX29mZnNldE1vZGlmaWVyVmFsdWUgKyBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUuYWx0QXhpcztcblxuICAgIHZhciBfdGV0aGVyTWF4ID0gaXNPcmlnaW5TaWRlID8gX29mZnNldCArIHJlZmVyZW5jZVJlY3RbX2xlbl0gKyBwb3BwZXJSZWN0W19sZW5dIC0gX29mZnNldE1vZGlmaWVyVmFsdWUgLSBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUuYWx0QXhpcyA6IF9tYXg7XG5cbiAgICB2YXIgX3ByZXZlbnRlZE9mZnNldCA9IHRldGhlciAmJiBpc09yaWdpblNpZGUgPyB3aXRoaW5NYXhDbGFtcChfdGV0aGVyTWluLCBfb2Zmc2V0LCBfdGV0aGVyTWF4KSA6IHdpdGhpbih0ZXRoZXIgPyBfdGV0aGVyTWluIDogX21pbiwgX29mZnNldCwgdGV0aGVyID8gX3RldGhlck1heCA6IF9tYXgpO1xuXG4gICAgcG9wcGVyT2Zmc2V0c1thbHRBeGlzXSA9IF9wcmV2ZW50ZWRPZmZzZXQ7XG4gICAgZGF0YVthbHRBeGlzXSA9IF9wcmV2ZW50ZWRPZmZzZXQgLSBfb2Zmc2V0O1xuICB9XG5cbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGRhdGE7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgcHJldmVudE92ZXJmbG93JDEgPSB7XG4gIG5hbWU6ICdwcmV2ZW50T3ZlcmZsb3cnLFxuICBlbmFibGVkOiB0cnVlLFxuICBwaGFzZTogJ21haW4nLFxuICBmbjogcHJldmVudE92ZXJmbG93LFxuICByZXF1aXJlc0lmRXhpc3RzOiBbJ29mZnNldCddXG59O1xuXG52YXIgdG9QYWRkaW5nT2JqZWN0ID0gZnVuY3Rpb24gdG9QYWRkaW5nT2JqZWN0KHBhZGRpbmcsIHN0YXRlKSB7XG4gIHBhZGRpbmcgPSB0eXBlb2YgcGFkZGluZyA9PT0gJ2Z1bmN0aW9uJyA/IHBhZGRpbmcoT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUucmVjdHMsIHtcbiAgICBwbGFjZW1lbnQ6IHN0YXRlLnBsYWNlbWVudFxuICB9KSkgOiBwYWRkaW5nO1xuICByZXR1cm4gbWVyZ2VQYWRkaW5nT2JqZWN0KHR5cGVvZiBwYWRkaW5nICE9PSAnbnVtYmVyJyA/IHBhZGRpbmcgOiBleHBhbmRUb0hhc2hNYXAocGFkZGluZywgYmFzZVBsYWNlbWVudHMpKTtcbn07XG5cbmZ1bmN0aW9uIGFycm93KF9yZWYpIHtcbiAgdmFyIF9zdGF0ZSRtb2RpZmllcnNEYXRhJDtcblxuICB2YXIgc3RhdGUgPSBfcmVmLnN0YXRlLFxuICAgICAgbmFtZSA9IF9yZWYubmFtZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmLm9wdGlvbnM7XG4gIHZhciBhcnJvd0VsZW1lbnQgPSBzdGF0ZS5lbGVtZW50cy5hcnJvdztcbiAgdmFyIHBvcHBlck9mZnNldHMgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLnBvcHBlck9mZnNldHM7XG4gIHZhciBiYXNlUGxhY2VtZW50ID0gZ2V0QmFzZVBsYWNlbWVudChzdGF0ZS5wbGFjZW1lbnQpO1xuICB2YXIgYXhpcyA9IGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChiYXNlUGxhY2VtZW50KTtcbiAgdmFyIGlzVmVydGljYWwgPSBbbGVmdCwgcmlnaHRdLmluZGV4T2YoYmFzZVBsYWNlbWVudCkgPj0gMDtcbiAgdmFyIGxlbiA9IGlzVmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG5cbiAgaWYgKCFhcnJvd0VsZW1lbnQgfHwgIXBvcHBlck9mZnNldHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcGFkZGluZ09iamVjdCA9IHRvUGFkZGluZ09iamVjdChvcHRpb25zLnBhZGRpbmcsIHN0YXRlKTtcbiAgdmFyIGFycm93UmVjdCA9IGdldExheW91dFJlY3QoYXJyb3dFbGVtZW50KTtcbiAgdmFyIG1pblByb3AgPSBheGlzID09PSAneScgPyB0b3AgOiBsZWZ0O1xuICB2YXIgbWF4UHJvcCA9IGF4aXMgPT09ICd5JyA/IGJvdHRvbSA6IHJpZ2h0O1xuICB2YXIgZW5kRGlmZiA9IHN0YXRlLnJlY3RzLnJlZmVyZW5jZVtsZW5dICsgc3RhdGUucmVjdHMucmVmZXJlbmNlW2F4aXNdIC0gcG9wcGVyT2Zmc2V0c1theGlzXSAtIHN0YXRlLnJlY3RzLnBvcHBlcltsZW5dO1xuICB2YXIgc3RhcnREaWZmID0gcG9wcGVyT2Zmc2V0c1theGlzXSAtIHN0YXRlLnJlY3RzLnJlZmVyZW5jZVtheGlzXTtcbiAgdmFyIGFycm93T2Zmc2V0UGFyZW50ID0gZ2V0T2Zmc2V0UGFyZW50KGFycm93RWxlbWVudCk7XG4gIHZhciBjbGllbnRTaXplID0gYXJyb3dPZmZzZXRQYXJlbnQgPyBheGlzID09PSAneScgPyBhcnJvd09mZnNldFBhcmVudC5jbGllbnRIZWlnaHQgfHwgMCA6IGFycm93T2Zmc2V0UGFyZW50LmNsaWVudFdpZHRoIHx8IDAgOiAwO1xuICB2YXIgY2VudGVyVG9SZWZlcmVuY2UgPSBlbmREaWZmIC8gMiAtIHN0YXJ0RGlmZiAvIDI7IC8vIE1ha2Ugc3VyZSB0aGUgYXJyb3cgZG9lc24ndCBvdmVyZmxvdyB0aGUgcG9wcGVyIGlmIHRoZSBjZW50ZXIgcG9pbnQgaXNcbiAgLy8gb3V0c2lkZSBvZiB0aGUgcG9wcGVyIGJvdW5kc1xuXG4gIHZhciBtaW4gPSBwYWRkaW5nT2JqZWN0W21pblByb3BdO1xuICB2YXIgbWF4ID0gY2xpZW50U2l6ZSAtIGFycm93UmVjdFtsZW5dIC0gcGFkZGluZ09iamVjdFttYXhQcm9wXTtcbiAgdmFyIGNlbnRlciA9IGNsaWVudFNpemUgLyAyIC0gYXJyb3dSZWN0W2xlbl0gLyAyICsgY2VudGVyVG9SZWZlcmVuY2U7XG4gIHZhciBvZmZzZXQgPSB3aXRoaW4obWluLCBjZW50ZXIsIG1heCk7IC8vIFByZXZlbnRzIGJyZWFraW5nIHN5bnRheCBoaWdobGlnaHRpbmcuLi5cblxuICB2YXIgYXhpc1Byb3AgPSBheGlzO1xuICBzdGF0ZS5tb2RpZmllcnNEYXRhW25hbWVdID0gKF9zdGF0ZSRtb2RpZmllcnNEYXRhJCA9IHt9LCBfc3RhdGUkbW9kaWZpZXJzRGF0YSRbYXhpc1Byb3BdID0gb2Zmc2V0LCBfc3RhdGUkbW9kaWZpZXJzRGF0YSQuY2VudGVyT2Zmc2V0ID0gb2Zmc2V0IC0gY2VudGVyLCBfc3RhdGUkbW9kaWZpZXJzRGF0YSQpO1xufVxuXG5mdW5jdGlvbiBlZmZlY3QoX3JlZjIpIHtcbiAgdmFyIHN0YXRlID0gX3JlZjIuc3RhdGUsXG4gICAgICBvcHRpb25zID0gX3JlZjIub3B0aW9ucztcbiAgdmFyIF9vcHRpb25zJGVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnQsXG4gICAgICBhcnJvd0VsZW1lbnQgPSBfb3B0aW9ucyRlbGVtZW50ID09PSB2b2lkIDAgPyAnW2RhdGEtcG9wcGVyLWFycm93XScgOiBfb3B0aW9ucyRlbGVtZW50O1xuXG4gIGlmIChhcnJvd0VsZW1lbnQgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfSAvLyBDU1Mgc2VsZWN0b3JcblxuXG4gIGlmICh0eXBlb2YgYXJyb3dFbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIGFycm93RWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzLnBvcHBlci5xdWVyeVNlbGVjdG9yKGFycm93RWxlbWVudCk7XG5cbiAgICBpZiAoIWFycm93RWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGlmICghY29udGFpbnMoc3RhdGUuZWxlbWVudHMucG9wcGVyLCBhcnJvd0VsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc3RhdGUuZWxlbWVudHMuYXJyb3cgPSBhcnJvd0VsZW1lbnQ7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgYXJyb3ckMSA9IHtcbiAgbmFtZTogJ2Fycm93JyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdtYWluJyxcbiAgZm46IGFycm93LFxuICBlZmZlY3Q6IGVmZmVjdCxcbiAgcmVxdWlyZXM6IFsncG9wcGVyT2Zmc2V0cyddLFxuICByZXF1aXJlc0lmRXhpc3RzOiBbJ3ByZXZlbnRPdmVyZmxvdyddXG59O1xuXG5mdW5jdGlvbiBnZXRTaWRlT2Zmc2V0cyhvdmVyZmxvdywgcmVjdCwgcHJldmVudGVkT2Zmc2V0cykge1xuICBpZiAocHJldmVudGVkT2Zmc2V0cyA9PT0gdm9pZCAwKSB7XG4gICAgcHJldmVudGVkT2Zmc2V0cyA9IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdG9wOiBvdmVyZmxvdy50b3AgLSByZWN0LmhlaWdodCAtIHByZXZlbnRlZE9mZnNldHMueSxcbiAgICByaWdodDogb3ZlcmZsb3cucmlnaHQgLSByZWN0LndpZHRoICsgcHJldmVudGVkT2Zmc2V0cy54LFxuICAgIGJvdHRvbTogb3ZlcmZsb3cuYm90dG9tIC0gcmVjdC5oZWlnaHQgKyBwcmV2ZW50ZWRPZmZzZXRzLnksXG4gICAgbGVmdDogb3ZlcmZsb3cubGVmdCAtIHJlY3Qud2lkdGggLSBwcmV2ZW50ZWRPZmZzZXRzLnhcbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNBbnlTaWRlRnVsbHlDbGlwcGVkKG92ZXJmbG93KSB7XG4gIHJldHVybiBbdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XS5zb21lKGZ1bmN0aW9uIChzaWRlKSB7XG4gICAgcmV0dXJuIG92ZXJmbG93W3NpZGVdID49IDA7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoaWRlKF9yZWYpIHtcbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZSxcbiAgICAgIG5hbWUgPSBfcmVmLm5hbWU7XG4gIHZhciByZWZlcmVuY2VSZWN0ID0gc3RhdGUucmVjdHMucmVmZXJlbmNlO1xuICB2YXIgcG9wcGVyUmVjdCA9IHN0YXRlLnJlY3RzLnBvcHBlcjtcbiAgdmFyIHByZXZlbnRlZE9mZnNldHMgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLnByZXZlbnRPdmVyZmxvdztcbiAgdmFyIHJlZmVyZW5jZU92ZXJmbG93ID0gZGV0ZWN0T3ZlcmZsb3coc3RhdGUsIHtcbiAgICBlbGVtZW50Q29udGV4dDogJ3JlZmVyZW5jZSdcbiAgfSk7XG4gIHZhciBwb3BwZXJBbHRPdmVyZmxvdyA9IGRldGVjdE92ZXJmbG93KHN0YXRlLCB7XG4gICAgYWx0Qm91bmRhcnk6IHRydWVcbiAgfSk7XG4gIHZhciByZWZlcmVuY2VDbGlwcGluZ09mZnNldHMgPSBnZXRTaWRlT2Zmc2V0cyhyZWZlcmVuY2VPdmVyZmxvdywgcmVmZXJlbmNlUmVjdCk7XG4gIHZhciBwb3BwZXJFc2NhcGVPZmZzZXRzID0gZ2V0U2lkZU9mZnNldHMocG9wcGVyQWx0T3ZlcmZsb3csIHBvcHBlclJlY3QsIHByZXZlbnRlZE9mZnNldHMpO1xuICB2YXIgaXNSZWZlcmVuY2VIaWRkZW4gPSBpc0FueVNpZGVGdWxseUNsaXBwZWQocmVmZXJlbmNlQ2xpcHBpbmdPZmZzZXRzKTtcbiAgdmFyIGhhc1BvcHBlckVzY2FwZWQgPSBpc0FueVNpZGVGdWxseUNsaXBwZWQocG9wcGVyRXNjYXBlT2Zmc2V0cyk7XG4gIHN0YXRlLm1vZGlmaWVyc0RhdGFbbmFtZV0gPSB7XG4gICAgcmVmZXJlbmNlQ2xpcHBpbmdPZmZzZXRzOiByZWZlcmVuY2VDbGlwcGluZ09mZnNldHMsXG4gICAgcG9wcGVyRXNjYXBlT2Zmc2V0czogcG9wcGVyRXNjYXBlT2Zmc2V0cyxcbiAgICBpc1JlZmVyZW5jZUhpZGRlbjogaXNSZWZlcmVuY2VIaWRkZW4sXG4gICAgaGFzUG9wcGVyRXNjYXBlZDogaGFzUG9wcGVyRXNjYXBlZFxuICB9O1xuICBzdGF0ZS5hdHRyaWJ1dGVzLnBvcHBlciA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmF0dHJpYnV0ZXMucG9wcGVyLCB7XG4gICAgJ2RhdGEtcG9wcGVyLXJlZmVyZW5jZS1oaWRkZW4nOiBpc1JlZmVyZW5jZUhpZGRlbixcbiAgICAnZGF0YS1wb3BwZXItZXNjYXBlZCc6IGhhc1BvcHBlckVzY2FwZWRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG52YXIgaGlkZSQxID0ge1xuICBuYW1lOiAnaGlkZScsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnbWFpbicsXG4gIHJlcXVpcmVzSWZFeGlzdHM6IFsncHJldmVudE92ZXJmbG93J10sXG4gIGZuOiBoaWRlXG59O1xuXG52YXIgZGVmYXVsdE1vZGlmaWVycyQxID0gW2V2ZW50TGlzdGVuZXJzLCBwb3BwZXJPZmZzZXRzJDEsIGNvbXB1dGVTdHlsZXMkMSwgYXBwbHlTdHlsZXMkMV07XG52YXIgY3JlYXRlUG9wcGVyJDEgPSAvKiNfX1BVUkVfXyovcG9wcGVyR2VuZXJhdG9yKHtcbiAgZGVmYXVsdE1vZGlmaWVyczogZGVmYXVsdE1vZGlmaWVycyQxXG59KTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG52YXIgZGVmYXVsdE1vZGlmaWVycyA9IFtldmVudExpc3RlbmVycywgcG9wcGVyT2Zmc2V0cyQxLCBjb21wdXRlU3R5bGVzJDEsIGFwcGx5U3R5bGVzJDEsIG9mZnNldCQxLCBmbGlwJDEsIHByZXZlbnRPdmVyZmxvdyQxLCBhcnJvdyQxLCBoaWRlJDFdO1xudmFyIGNyZWF0ZVBvcHBlciA9IC8qI19fUFVSRV9fKi9wb3BwZXJHZW5lcmF0b3Ioe1xuICBkZWZhdWx0TW9kaWZpZXJzOiBkZWZhdWx0TW9kaWZpZXJzXG59KTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5leHBvcnRzLmFwcGx5U3R5bGVzID0gYXBwbHlTdHlsZXMkMTtcbmV4cG9ydHMuYXJyb3cgPSBhcnJvdyQxO1xuZXhwb3J0cy5jb21wdXRlU3R5bGVzID0gY29tcHV0ZVN0eWxlcyQxO1xuZXhwb3J0cy5jcmVhdGVQb3BwZXIgPSBjcmVhdGVQb3BwZXI7XG5leHBvcnRzLmNyZWF0ZVBvcHBlckxpdGUgPSBjcmVhdGVQb3BwZXIkMTtcbmV4cG9ydHMuZGVmYXVsdE1vZGlmaWVycyA9IGRlZmF1bHRNb2RpZmllcnM7XG5leHBvcnRzLmRldGVjdE92ZXJmbG93ID0gZGV0ZWN0T3ZlcmZsb3c7XG5leHBvcnRzLmV2ZW50TGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnM7XG5leHBvcnRzLmZsaXAgPSBmbGlwJDE7XG5leHBvcnRzLmhpZGUgPSBoaWRlJDE7XG5leHBvcnRzLm9mZnNldCA9IG9mZnNldCQxO1xuZXhwb3J0cy5wb3BwZXJHZW5lcmF0b3IgPSBwb3BwZXJHZW5lcmF0b3I7XG5leHBvcnRzLnBvcHBlck9mZnNldHMgPSBwb3BwZXJPZmZzZXRzJDE7XG5leHBvcnRzLnByZXZlbnRPdmVyZmxvdyA9IHByZXZlbnRPdmVyZmxvdyQxO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG9wcGVyLmpzLm1hcFxuIiwiIWZ1bmN0aW9uKGUsdCl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9dCgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUodCk6ZS5BT1M9dCgpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGU9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp7fSx0PVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLG49TmFOLG89XCJbb2JqZWN0IFN5bWJvbF1cIixpPS9eXFxzK3xcXHMrJC9nLGE9L15bLStdMHhbMC05YS1mXSskL2kscj0vXjBiWzAxXSskL2ksYz0vXjBvWzAtN10rJC9pLHM9cGFyc2VJbnQsdT1cIm9iamVjdFwiPT10eXBlb2YgZSYmZSYmZS5PYmplY3Q9PT1PYmplY3QmJmUsZD1cIm9iamVjdFwiPT10eXBlb2Ygc2VsZiYmc2VsZiYmc2VsZi5PYmplY3Q9PT1PYmplY3QmJnNlbGYsbD11fHxkfHxGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksZj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLG09TWF0aC5tYXgscD1NYXRoLm1pbixiPWZ1bmN0aW9uKCl7cmV0dXJuIGwuRGF0ZS5ub3coKX07ZnVuY3Rpb24gdihlLG4sbyl7dmFyIGksYSxyLGMscyx1LGQ9MCxsPSExLGY9ITEsdj0hMDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IodCk7ZnVuY3Rpb24geSh0KXt2YXIgbj1pLG89YTtyZXR1cm4gaT1hPXZvaWQgMCxkPXQsYz1lLmFwcGx5KG8sbil9ZnVuY3Rpb24gaChlKXt2YXIgdD1lLXU7cmV0dXJuIHZvaWQgMD09PXV8fHQ+PW58fHQ8MHx8ZiYmZS1kPj1yfWZ1bmN0aW9uIGsoKXt2YXIgZT1iKCk7aWYoaChlKSlyZXR1cm4geChlKTtzPXNldFRpbWVvdXQoayxmdW5jdGlvbihlKXt2YXIgdD1uLShlLXUpO3JldHVybiBmP3AodCxyLShlLWQpKTp0fShlKSl9ZnVuY3Rpb24geChlKXtyZXR1cm4gcz12b2lkIDAsdiYmaT95KGUpOihpPWE9dm9pZCAwLGMpfWZ1bmN0aW9uIE8oKXt2YXIgZT1iKCksdD1oKGUpO2lmKGk9YXJndW1lbnRzLGE9dGhpcyx1PWUsdCl7aWYodm9pZCAwPT09cylyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGQ9ZSxzPXNldFRpbWVvdXQoayxuKSxsP3koZSk6Y30odSk7aWYoZilyZXR1cm4gcz1zZXRUaW1lb3V0KGssbikseSh1KX1yZXR1cm4gdm9pZCAwPT09cyYmKHM9c2V0VGltZW91dChrLG4pKSxjfXJldHVybiBuPXcobil8fDAsZyhvKSYmKGw9ISFvLmxlYWRpbmcscj0oZj1cIm1heFdhaXRcImluIG8pP20odyhvLm1heFdhaXQpfHwwLG4pOnIsdj1cInRyYWlsaW5nXCJpbiBvPyEhby50cmFpbGluZzp2KSxPLmNhbmNlbD1mdW5jdGlvbigpe3ZvaWQgMCE9PXMmJmNsZWFyVGltZW91dChzKSxkPTAsaT11PWE9cz12b2lkIDB9LE8uZmx1c2g9ZnVuY3Rpb24oKXtyZXR1cm4gdm9pZCAwPT09cz9jOngoYigpKX0sT31mdW5jdGlvbiBnKGUpe3ZhciB0PXR5cGVvZiBlO3JldHVybiEhZSYmKFwib2JqZWN0XCI9PXR8fFwiZnVuY3Rpb25cIj09dCl9ZnVuY3Rpb24gdyhlKXtpZihcIm51bWJlclwiPT10eXBlb2YgZSlyZXR1cm4gZTtpZihmdW5jdGlvbihlKXtyZXR1cm5cInN5bWJvbFwiPT10eXBlb2YgZXx8ZnVuY3Rpb24oZSl7cmV0dXJuISFlJiZcIm9iamVjdFwiPT10eXBlb2YgZX0oZSkmJmYuY2FsbChlKT09b30oZSkpcmV0dXJuIG47aWYoZyhlKSl7dmFyIHQ9XCJmdW5jdGlvblwiPT10eXBlb2YgZS52YWx1ZU9mP2UudmFsdWVPZigpOmU7ZT1nKHQpP3QrXCJcIjp0fWlmKFwic3RyaW5nXCIhPXR5cGVvZiBlKXJldHVybiAwPT09ZT9lOitlO2U9ZS5yZXBsYWNlKGksXCJcIik7dmFyIHU9ci50ZXN0KGUpO3JldHVybiB1fHxjLnRlc3QoZSk/cyhlLnNsaWNlKDIpLHU/Mjo4KTphLnRlc3QoZSk/bjorZX12YXIgeT1mdW5jdGlvbihlLG4sbyl7dmFyIGk9ITAsYT0hMDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IodCk7cmV0dXJuIGcobykmJihpPVwibGVhZGluZ1wiaW4gbz8hIW8ubGVhZGluZzppLGE9XCJ0cmFpbGluZ1wiaW4gbz8hIW8udHJhaWxpbmc6YSksdihlLG4se2xlYWRpbmc6aSxtYXhXYWl0Om4sdHJhaWxpbmc6YX0pfSxoPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLGs9TmFOLHg9XCJbb2JqZWN0IFN5bWJvbF1cIixPPS9eXFxzK3xcXHMrJC9nLGo9L15bLStdMHhbMC05YS1mXSskL2ksRT0vXjBiWzAxXSskL2ksTj0vXjBvWzAtN10rJC9pLHo9cGFyc2VJbnQsQz1cIm9iamVjdFwiPT10eXBlb2YgZSYmZSYmZS5PYmplY3Q9PT1PYmplY3QmJmUsQT1cIm9iamVjdFwiPT10eXBlb2Ygc2VsZiYmc2VsZiYmc2VsZi5PYmplY3Q9PT1PYmplY3QmJnNlbGYscT1DfHxBfHxGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksTD1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFQ9TWF0aC5tYXgsTT1NYXRoLm1pbixTPWZ1bmN0aW9uKCl7cmV0dXJuIHEuRGF0ZS5ub3coKX07ZnVuY3Rpb24gRChlKXt2YXIgdD10eXBlb2YgZTtyZXR1cm4hIWUmJihcIm9iamVjdFwiPT10fHxcImZ1bmN0aW9uXCI9PXQpfWZ1bmN0aW9uIEgoZSl7aWYoXCJudW1iZXJcIj09dHlwZW9mIGUpcmV0dXJuIGU7aWYoZnVuY3Rpb24oZSl7cmV0dXJuXCJzeW1ib2xcIj09dHlwZW9mIGV8fGZ1bmN0aW9uKGUpe3JldHVybiEhZSYmXCJvYmplY3RcIj09dHlwZW9mIGV9KGUpJiZMLmNhbGwoZSk9PXh9KGUpKXJldHVybiBrO2lmKEQoZSkpe3ZhciB0PVwiZnVuY3Rpb25cIj09dHlwZW9mIGUudmFsdWVPZj9lLnZhbHVlT2YoKTplO2U9RCh0KT90K1wiXCI6dH1pZihcInN0cmluZ1wiIT10eXBlb2YgZSlyZXR1cm4gMD09PWU/ZTorZTtlPWUucmVwbGFjZShPLFwiXCIpO3ZhciBuPUUudGVzdChlKTtyZXR1cm4gbnx8Ti50ZXN0KGUpP3ooZS5zbGljZSgyKSxuPzI6OCk6ai50ZXN0KGUpP2s6K2V9dmFyICQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciBvLGksYSxyLGMscyx1PTAsZD0hMSxsPSExLGY9ITA7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKGgpO2Z1bmN0aW9uIG0odCl7dmFyIG49byxhPWk7cmV0dXJuIG89aT12b2lkIDAsdT10LHI9ZS5hcHBseShhLG4pfWZ1bmN0aW9uIHAoZSl7dmFyIG49ZS1zO3JldHVybiB2b2lkIDA9PT1zfHxuPj10fHxuPDB8fGwmJmUtdT49YX1mdW5jdGlvbiBiKCl7dmFyIGU9UygpO2lmKHAoZSkpcmV0dXJuIHYoZSk7Yz1zZXRUaW1lb3V0KGIsZnVuY3Rpb24oZSl7dmFyIG49dC0oZS1zKTtyZXR1cm4gbD9NKG4sYS0oZS11KSk6bn0oZSkpfWZ1bmN0aW9uIHYoZSl7cmV0dXJuIGM9dm9pZCAwLGYmJm8/bShlKToobz1pPXZvaWQgMCxyKX1mdW5jdGlvbiBnKCl7dmFyIGU9UygpLG49cChlKTtpZihvPWFyZ3VtZW50cyxpPXRoaXMscz1lLG4pe2lmKHZvaWQgMD09PWMpcmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiB1PWUsYz1zZXRUaW1lb3V0KGIsdCksZD9tKGUpOnJ9KHMpO2lmKGwpcmV0dXJuIGM9c2V0VGltZW91dChiLHQpLG0ocyl9cmV0dXJuIHZvaWQgMD09PWMmJihjPXNldFRpbWVvdXQoYix0KSkscn1yZXR1cm4gdD1IKHQpfHwwLEQobikmJihkPSEhbi5sZWFkaW5nLGE9KGw9XCJtYXhXYWl0XCJpbiBuKT9UKEgobi5tYXhXYWl0KXx8MCx0KTphLGY9XCJ0cmFpbGluZ1wiaW4gbj8hIW4udHJhaWxpbmc6ZiksZy5jYW5jZWw9ZnVuY3Rpb24oKXt2b2lkIDAhPT1jJiZjbGVhclRpbWVvdXQoYyksdT0wLG89cz1pPWM9dm9pZCAwfSxnLmZsdXNoPWZ1bmN0aW9uKCl7cmV0dXJuIHZvaWQgMD09PWM/cjp2KFMoKSl9LGd9LFc9ZnVuY3Rpb24oKXt9O2Z1bmN0aW9uIFAoZSl7ZSYmZS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciB0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGUuYWRkZWROb2Rlcyksbj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlLnJlbW92ZWROb2Rlcyk7aWYoZnVuY3Rpb24gZSh0KXt2YXIgbj12b2lkIDAsbz12b2lkIDA7Zm9yKG49MDtuPHQubGVuZ3RoO24rPTEpe2lmKChvPXRbbl0pLmRhdGFzZXQmJm8uZGF0YXNldC5hb3MpcmV0dXJuITA7aWYoby5jaGlsZHJlbiYmZShvLmNoaWxkcmVuKSlyZXR1cm4hMH1yZXR1cm4hMX0odC5jb25jYXQobikpKXJldHVybiBXKCl9KX1mdW5jdGlvbiBZKCl7cmV0dXJuIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcnx8d2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXJ9dmFyIF89e2lzU3VwcG9ydGVkOmZ1bmN0aW9uKCl7cmV0dXJuISFZKCl9LHJlYWR5OmZ1bmN0aW9uKGUsdCl7dmFyIG49d2luZG93LmRvY3VtZW50LG89bmV3KFkoKSkoUCk7Vz10LG8ub2JzZXJ2ZShuLmRvY3VtZW50RWxlbWVudCx7Y2hpbGRMaXN0OiEwLHN1YnRyZWU6ITAscmVtb3ZlZE5vZGVzOiEwfSl9fSxCPWZ1bmN0aW9uKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0sRj1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIG89dFtuXTtvLmVudW1lcmFibGU9by5lbnVtZXJhYmxlfHwhMSxvLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBvJiYoby53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsby5rZXksbyl9fXJldHVybiBmdW5jdGlvbih0LG4sbyl7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksbyYmZSh0LG8pLHR9fSgpLEk9T2JqZWN0LmFzc2lnbnx8ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PTE7dDxhcmd1bWVudHMubGVuZ3RoO3QrKyl7dmFyIG49YXJndW1lbnRzW3RdO2Zvcih2YXIgbyBpbiBuKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuLG8pJiYoZVtvXT1uW29dKX1yZXR1cm4gZX0sSz0vKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vL2ksRz0vMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaSxKPS8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaSxRPS8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzXFwtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfFxcLW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxid1xcLShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtXFwtfGNlbGx8Y2h0bXxjbGRjfGNtZFxcLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkY1xcLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8XFwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KFxcLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZlxcLTV8Z1xcLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGRcXC0obXxwfHQpfGhlaVxcLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzXFwtY3xodChjKFxcLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGlcXC0oMjB8Z298bWEpfGkyMzB8aWFjKCB8XFwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2NcXC18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8XFwtW2Etd10pfGxpYnd8bHlueHxtMVxcLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtXFwtY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoXFwtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSlcXC18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfFxcLShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwblxcLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdFxcLWd8cWFcXC1hfHFjKDA3fDEyfDIxfDMyfDYwfFxcLVsyLTddfGlcXC0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoXFwtfG9vfHBcXC0pfHNka1xcL3xzZShjKFxcLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2hcXC18c2hhcnxzaWUoXFwtfG0pfHNrXFwtMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoXFwtfHZcXC18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2xcXC18dGRnXFwtfHRlbChpfG0pfHRpbVxcLXx0XFwtbW98dG8ocGx8c2gpfHRzKDcwfG1cXC18bTN8bTUpfHR4XFwtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118XFwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYyhcXC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXNcXC18eW91cnx6ZXRvfHp0ZVxcLS9pO2Z1bmN0aW9uIFIoKXtyZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudHx8bmF2aWdhdG9yLnZlbmRvcnx8d2luZG93Lm9wZXJhfHxcIlwifXZhciBVPW5ldyhmdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXtCKHRoaXMsZSl9cmV0dXJuIEYoZSxbe2tleTpcInBob25lXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1SKCk7cmV0dXJuISghSy50ZXN0KGUpJiYhRy50ZXN0KGUuc3Vic3RyKDAsNCkpKX19LHtrZXk6XCJtb2JpbGVcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPVIoKTtyZXR1cm4hKCFKLnRlc3QoZSkmJiFRLnRlc3QoZS5zdWJzdHIoMCw0KSkpfX0se2tleTpcInRhYmxldFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW9iaWxlKCkmJiF0aGlzLnBob25lKCl9fSx7a2V5OlwiaWUxMVwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuXCItbXMtc2Nyb2xsLWxpbWl0XCJpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUmJlwiLW1zLWltZS1hbGlnblwiaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlfX1dKSxlfSgpKSxWPWZ1bmN0aW9uKGUsdCl7dmFyIG49dm9pZCAwO3JldHVybiBVLmllMTEoKT8obj1kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpKS5pbml0Q3VzdG9tRXZlbnQoZSwhMCwhMCx7ZGV0YWlsOnR9KTpuPW5ldyBDdXN0b21FdmVudChlLHtkZXRhaWw6dH0pLGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobil9LFg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUuZm9yRWFjaChmdW5jdGlvbihlLHQpe3JldHVybiBmdW5jdGlvbihlLHQpe3ZhciBuPWUub3B0aW9ucyxvPWUucG9zaXRpb24saT1lLm5vZGUsYT0oZS5kYXRhLGZ1bmN0aW9uKCl7ZS5hbmltYXRlZCYmKGZ1bmN0aW9uKGUsdCl7dCYmdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3JldHVybiBlLmNsYXNzTGlzdC5yZW1vdmUodCl9KX0oaSxuLmFuaW1hdGVkQ2xhc3NOYW1lcyksVihcImFvczpvdXRcIixpKSxlLm9wdGlvbnMuaWQmJlYoXCJhb3M6aW46XCIrZS5vcHRpb25zLmlkLGkpLGUuYW5pbWF0ZWQ9ITEpfSk7bi5taXJyb3ImJnQ+PW8ub3V0JiYhbi5vbmNlP2EoKTp0Pj1vLmluP2UuYW5pbWF0ZWR8fChmdW5jdGlvbihlLHQpe3QmJnQuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5jbGFzc0xpc3QuYWRkKHQpfSl9KGksbi5hbmltYXRlZENsYXNzTmFtZXMpLFYoXCJhb3M6aW5cIixpKSxlLm9wdGlvbnMuaWQmJlYoXCJhb3M6aW46XCIrZS5vcHRpb25zLmlkLGkpLGUuYW5pbWF0ZWQ9ITApOmUuYW5pbWF0ZWQmJiFuLm9uY2UmJmEoKX0oZSx3aW5kb3cucGFnZVlPZmZzZXQpfSl9LFo9ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PTAsbj0wO2UmJiFpc05hTihlLm9mZnNldExlZnQpJiYhaXNOYU4oZS5vZmZzZXRUb3ApOyl0Kz1lLm9mZnNldExlZnQtKFwiQk9EWVwiIT1lLnRhZ05hbWU/ZS5zY3JvbGxMZWZ0OjApLG4rPWUub2Zmc2V0VG9wLShcIkJPRFlcIiE9ZS50YWdOYW1lP2Uuc2Nyb2xsVG9wOjApLGU9ZS5vZmZzZXRQYXJlbnQ7cmV0dXJue3RvcDpuLGxlZnQ6dH19LGVlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgbz1lLmdldEF0dHJpYnV0ZShcImRhdGEtYW9zLVwiK3QpO2lmKHZvaWQgMCE9PW8pe2lmKFwidHJ1ZVwiPT09bylyZXR1cm4hMDtpZihcImZhbHNlXCI9PT1vKXJldHVybiExfXJldHVybiBvfHxufSx0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlLmZvckVhY2goZnVuY3Rpb24oZSxuKXt2YXIgbz1lZShlLm5vZGUsXCJtaXJyb3JcIix0Lm1pcnJvciksaT1lZShlLm5vZGUsXCJvbmNlXCIsdC5vbmNlKSxhPWVlKGUubm9kZSxcImlkXCIpLHI9dC51c2VDbGFzc05hbWVzJiZlLm5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1hb3NcIiksYz1bdC5hbmltYXRlZENsYXNzTmFtZV0uY29uY2F0KHI/ci5zcGxpdChcIiBcIik6W10pLmZpbHRlcihmdW5jdGlvbihlKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgZX0pO3QuaW5pdENsYXNzTmFtZSYmZS5ub2RlLmNsYXNzTGlzdC5hZGQodC5pbml0Q2xhc3NOYW1lKSxlLnBvc2l0aW9uPXtpbjpmdW5jdGlvbihlLHQsbil7dmFyIG89d2luZG93LmlubmVySGVpZ2h0LGk9ZWUoZSxcImFuY2hvclwiKSxhPWVlKGUsXCJhbmNob3ItcGxhY2VtZW50XCIpLHI9TnVtYmVyKGVlKGUsXCJvZmZzZXRcIixhPzA6dCkpLGM9YXx8bixzPWU7aSYmZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChpKSYmKHM9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChpKVswXSk7dmFyIHU9WihzKS50b3Atbztzd2l0Y2goYyl7Y2FzZVwidG9wLWJvdHRvbVwiOmJyZWFrO2Nhc2VcImNlbnRlci1ib3R0b21cIjp1Kz1zLm9mZnNldEhlaWdodC8yO2JyZWFrO2Nhc2VcImJvdHRvbS1ib3R0b21cIjp1Kz1zLm9mZnNldEhlaWdodDticmVhaztjYXNlXCJ0b3AtY2VudGVyXCI6dSs9by8yO2JyZWFrO2Nhc2VcImNlbnRlci1jZW50ZXJcIjp1Kz1vLzIrcy5vZmZzZXRIZWlnaHQvMjticmVhaztjYXNlXCJib3R0b20tY2VudGVyXCI6dSs9by8yK3Mub2Zmc2V0SGVpZ2h0O2JyZWFrO2Nhc2VcInRvcC10b3BcIjp1Kz1vO2JyZWFrO2Nhc2VcImJvdHRvbS10b3BcIjp1Kz1vK3Mub2Zmc2V0SGVpZ2h0O2JyZWFrO2Nhc2VcImNlbnRlci10b3BcIjp1Kz1vK3Mub2Zmc2V0SGVpZ2h0LzJ9cmV0dXJuIHUrcn0oZS5ub2RlLHQub2Zmc2V0LHQuYW5jaG9yUGxhY2VtZW50KSxvdXQ6byYmZnVuY3Rpb24oZSx0KXt3aW5kb3cuaW5uZXJIZWlnaHQ7dmFyIG49ZWUoZSxcImFuY2hvclwiKSxvPWVlKGUsXCJvZmZzZXRcIix0KSxpPWU7cmV0dXJuIG4mJmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobikmJihpPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobilbMF0pLFooaSkudG9wK2kub2Zmc2V0SGVpZ2h0LW99KGUubm9kZSx0Lm9mZnNldCl9LGUub3B0aW9ucz17b25jZTppLG1pcnJvcjpvLGFuaW1hdGVkQ2xhc3NOYW1lczpjLGlkOmF9fSksZX0sbmU9ZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYW9zXVwiKTtyZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGUsZnVuY3Rpb24oZSl7cmV0dXJue25vZGU6ZX19KX0sb2U9W10saWU9ITEsYWU9e29mZnNldDoxMjAsZGVsYXk6MCxlYXNpbmc6XCJlYXNlXCIsZHVyYXRpb246NDAwLGRpc2FibGU6ITEsb25jZTohMSxtaXJyb3I6ITEsYW5jaG9yUGxhY2VtZW50OlwidG9wLWJvdHRvbVwiLHN0YXJ0RXZlbnQ6XCJET01Db250ZW50TG9hZGVkXCIsYW5pbWF0ZWRDbGFzc05hbWU6XCJhb3MtYW5pbWF0ZVwiLGluaXRDbGFzc05hbWU6XCJhb3MtaW5pdFwiLHVzZUNsYXNzTmFtZXM6ITEsZGlzYWJsZU11dGF0aW9uT2JzZXJ2ZXI6ITEsdGhyb3R0bGVEZWxheTo5OSxkZWJvdW5jZURlbGF5OjUwfSxyZT1mdW5jdGlvbigpe3JldHVybiBkb2N1bWVudC5hbGwmJiF3aW5kb3cuYXRvYn0sY2U9ZnVuY3Rpb24oKXthcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdJiYoaWU9ITApLGllJiYob2U9dGUob2UsYWUpLFgob2UpLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIseShmdW5jdGlvbigpe1gob2UsYWUub25jZSl9LGFlLnRocm90dGxlRGVsYXkpKSl9LHNlPWZ1bmN0aW9uKCl7aWYob2U9bmUoKSxkZShhZS5kaXNhYmxlKXx8cmUoKSlyZXR1cm4gdWUoKTtjZSgpfSx1ZT1mdW5jdGlvbigpe29lLmZvckVhY2goZnVuY3Rpb24oZSx0KXtlLm5vZGUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1hb3NcIiksZS5ub2RlLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtYW9zLWVhc2luZ1wiKSxlLm5vZGUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1hb3MtZHVyYXRpb25cIiksZS5ub2RlLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtYW9zLWRlbGF5XCIpLGFlLmluaXRDbGFzc05hbWUmJmUubm9kZS5jbGFzc0xpc3QucmVtb3ZlKGFlLmluaXRDbGFzc05hbWUpLGFlLmFuaW1hdGVkQ2xhc3NOYW1lJiZlLm5vZGUuY2xhc3NMaXN0LnJlbW92ZShhZS5hbmltYXRlZENsYXNzTmFtZSl9KX0sZGU9ZnVuY3Rpb24oZSl7cmV0dXJuITA9PT1lfHxcIm1vYmlsZVwiPT09ZSYmVS5tb2JpbGUoKXx8XCJwaG9uZVwiPT09ZSYmVS5waG9uZSgpfHxcInRhYmxldFwiPT09ZSYmVS50YWJsZXQoKXx8XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmITA9PT1lKCl9O3JldHVybntpbml0OmZ1bmN0aW9uKGUpe3JldHVybiBhZT1JKGFlLGUpLG9lPW5lKCksYWUuZGlzYWJsZU11dGF0aW9uT2JzZXJ2ZXJ8fF8uaXNTdXBwb3J0ZWQoKXx8KGNvbnNvbGUuaW5mbygnXFxuICAgICAgYW9zOiBNdXRhdGlvbk9ic2VydmVyIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBicm93c2VyLFxcbiAgICAgIGNvZGUgbXV0YXRpb25zIG9ic2VydmluZyBoYXMgYmVlbiBkaXNhYmxlZC5cXG4gICAgICBZb3UgbWF5IGhhdmUgdG8gY2FsbCBcInJlZnJlc2hIYXJkKClcIiBieSB5b3Vyc2VsZi5cXG4gICAgJyksYWUuZGlzYWJsZU11dGF0aW9uT2JzZXJ2ZXI9ITApLGFlLmRpc2FibGVNdXRhdGlvbk9ic2VydmVyfHxfLnJlYWR5KFwiW2RhdGEtYW9zXVwiLHNlKSxkZShhZS5kaXNhYmxlKXx8cmUoKT91ZSgpOihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWFvcy1lYXNpbmdcIixhZS5lYXNpbmcpLGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnNldEF0dHJpYnV0ZShcImRhdGEtYW9zLWR1cmF0aW9uXCIsYWUuZHVyYXRpb24pLGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnNldEF0dHJpYnV0ZShcImRhdGEtYW9zLWRlbGF5XCIsYWUuZGVsYXkpLC0xPT09W1wiRE9NQ29udGVudExvYWRlZFwiLFwibG9hZFwiXS5pbmRleE9mKGFlLnN0YXJ0RXZlbnQpP2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYWUuc3RhcnRFdmVudCxmdW5jdGlvbigpe2NlKCEwKX0pOndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLGZ1bmN0aW9uKCl7Y2UoITApfSksXCJET01Db250ZW50TG9hZGVkXCI9PT1hZS5zdGFydEV2ZW50JiZbXCJjb21wbGV0ZVwiLFwiaW50ZXJhY3RpdmVcIl0uaW5kZXhPZihkb2N1bWVudC5yZWFkeVN0YXRlKT4tMSYmY2UoITApLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsJChjZSxhZS5kZWJvdW5jZURlbGF5LCEwKSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCQoY2UsYWUuZGVib3VuY2VEZWxheSwhMCkpLG9lKX0scmVmcmVzaDpjZSxyZWZyZXNoSGFyZDpzZX19KTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBnbG9iYWwuYXV0b3NpemUgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkge1xuXHR2YXIgbWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiID8gbmV3IE1hcCgpIDogZnVuY3Rpb24gKCkge1xuXHQgIHZhciBrZXlzID0gW107XG5cdCAgdmFyIHZhbHVlcyA9IFtdO1xuXHQgIHJldHVybiB7XG5cdCAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpIHtcblx0ICAgICAgcmV0dXJuIGtleXMuaW5kZXhPZihrZXkpID4gLTE7XG5cdCAgICB9LFxuXHQgICAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KSB7XG5cdCAgICAgIHJldHVybiB2YWx1ZXNba2V5cy5pbmRleE9mKGtleSldO1xuXHQgICAgfSxcblx0ICAgIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcblx0ICAgICAgaWYgKGtleXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuXHQgICAgICAgIGtleXMucHVzaChrZXkpO1xuXHQgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcblx0ICAgICAgfVxuXHQgICAgfSxcblx0ICAgIFwiZGVsZXRlXCI6IGZ1bmN0aW9uIF9kZWxldGUoa2V5KSB7XG5cdCAgICAgIHZhciBpbmRleCA9IGtleXMuaW5kZXhPZihrZXkpO1xuXG5cdCAgICAgIGlmIChpbmRleCA+IC0xKSB7XG5cdCAgICAgICAga2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHQgICAgICAgIHZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblx0fSgpO1xuXG5cdHZhciBjcmVhdGVFdmVudCA9IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KG5hbWUpIHtcblx0ICByZXR1cm4gbmV3IEV2ZW50KG5hbWUsIHtcblx0ICAgIGJ1YmJsZXM6IHRydWVcblx0ICB9KTtcblx0fTtcblxuXHR0cnkge1xuXHQgIG5ldyBFdmVudCgndGVzdCcpO1xuXHR9IGNhdGNoIChlKSB7XG5cdCAgLy8gSUUgZG9lcyBub3Qgc3VwcG9ydCBgbmV3IEV2ZW50KClgXG5cdCAgY3JlYXRlRXZlbnQgPSBmdW5jdGlvbiBjcmVhdGVFdmVudChuYW1lKSB7XG5cdCAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG5cdCAgICBldnQuaW5pdEV2ZW50KG5hbWUsIHRydWUsIGZhbHNlKTtcblx0ICAgIHJldHVybiBldnQ7XG5cdCAgfTtcblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2lnbih0YSkge1xuXHQgIGlmICghdGEgfHwgIXRhLm5vZGVOYW1lIHx8IHRhLm5vZGVOYW1lICE9PSAnVEVYVEFSRUEnIHx8IG1hcC5oYXModGEpKSByZXR1cm47XG5cdCAgdmFyIGhlaWdodE9mZnNldCA9IG51bGw7XG5cdCAgdmFyIGNsaWVudFdpZHRoID0gbnVsbDtcblx0ICB2YXIgY2FjaGVkSGVpZ2h0ID0gbnVsbDtcblxuXHQgIGZ1bmN0aW9uIGluaXQoKSB7XG5cdCAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCk7XG5cblx0ICAgIGlmIChzdHlsZS5yZXNpemUgPT09ICd2ZXJ0aWNhbCcpIHtcblx0ICAgICAgdGEuc3R5bGUucmVzaXplID0gJ25vbmUnO1xuXHQgICAgfSBlbHNlIGlmIChzdHlsZS5yZXNpemUgPT09ICdib3RoJykge1xuXHQgICAgICB0YS5zdHlsZS5yZXNpemUgPSAnaG9yaXpvbnRhbCc7XG5cdCAgICB9XG5cblx0ICAgIGlmIChzdHlsZS5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcpIHtcblx0ICAgICAgaGVpZ2h0T2Zmc2V0ID0gLShwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKSk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBoZWlnaHRPZmZzZXQgPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclRvcFdpZHRoKSArIHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuXHQgICAgfSAvLyBGaXggd2hlbiBhIHRleHRhcmVhIGlzIG5vdCBvbiBkb2N1bWVudCBib2R5IGFuZCBoZWlnaHRPZmZzZXQgaXMgTm90IGEgTnVtYmVyXG5cblxuXHQgICAgaWYgKGlzTmFOKGhlaWdodE9mZnNldCkpIHtcblx0ICAgICAgaGVpZ2h0T2Zmc2V0ID0gMDtcblx0ICAgIH1cblxuXHQgICAgdXBkYXRlKCk7XG5cdCAgfVxuXG5cdCAgZnVuY3Rpb24gY2hhbmdlT3ZlcmZsb3codmFsdWUpIHtcblx0ICAgIHtcblx0ICAgICAgLy8gQ2hyb21lL1NhZmFyaS1zcGVjaWZpYyBmaXg6XG5cdCAgICAgIC8vIFdoZW4gdGhlIHRleHRhcmVhIHktb3ZlcmZsb3cgaXMgaGlkZGVuLCBDaHJvbWUvU2FmYXJpIGRvIG5vdCByZWZsb3cgdGhlIHRleHQgdG8gYWNjb3VudCBmb3IgdGhlIHNwYWNlXG5cdCAgICAgIC8vIG1hZGUgYXZhaWxhYmxlIGJ5IHJlbW92aW5nIHRoZSBzY3JvbGxiYXIuIFRoZSBmb2xsb3dpbmcgZm9yY2VzIHRoZSBuZWNlc3NhcnkgdGV4dCByZWZsb3cuXG5cdCAgICAgIHZhciB3aWR0aCA9IHRhLnN0eWxlLndpZHRoO1xuXHQgICAgICB0YS5zdHlsZS53aWR0aCA9ICcwcHgnOyAvLyBGb3JjZSByZWZsb3c6XG5cdCAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG5cblx0ICAgICAgdGEuc3R5bGUud2lkdGggPSB3aWR0aDtcblx0ICAgIH1cblx0ICAgIHRhLnN0eWxlLm92ZXJmbG93WSA9IHZhbHVlO1xuXHQgIH1cblxuXHQgIGZ1bmN0aW9uIGJvb2ttYXJrT3ZlcmZsb3dzKGVsKSB7XG5cdCAgICB2YXIgYXJyID0gW107XG5cblx0ICAgIHdoaWxlIChlbCAmJiBlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG5cdCAgICAgIGlmIChlbC5wYXJlbnROb2RlLnNjcm9sbFRvcCkge1xuXHQgICAgICAgIGVsLnBhcmVudE5vZGUuc3R5bGUuc2Nyb2xsQmVoYXZpb3IgPSAnYXV0byc7XG5cdCAgICAgICAgYXJyLnB1c2goW2VsLnBhcmVudE5vZGUsIGVsLnBhcmVudE5vZGUuc2Nyb2xsVG9wXSk7XG5cdCAgICAgIH1cblxuXHQgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIHJldHVybiBhcnIuZm9yRWFjaChmdW5jdGlvbiAoX3JlZikge1xuXHQgICAgICAgIHZhciBub2RlID0gX3JlZlswXSxcblx0ICAgICAgICAgICAgc2Nyb2xsVG9wID0gX3JlZlsxXTtcblx0ICAgICAgICBub2RlLnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcblx0ICAgICAgICBub2RlLnN0eWxlLnNjcm9sbEJlaGF2aW9yID0gbnVsbDtcblx0ICAgICAgfSk7XG5cdCAgICB9O1xuXHQgIH1cblxuXHQgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcblx0ICAgIGlmICh0YS5zY3JvbGxIZWlnaHQgPT09IDApIHtcblx0ICAgICAgLy8gSWYgdGhlIHNjcm9sbEhlaWdodCBpcyAwLCB0aGVuIHRoZSBlbGVtZW50IHByb2JhYmx5IGhhcyBkaXNwbGF5Om5vbmUgb3IgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuXHQgICAgICByZXR1cm47XG5cdCAgICB9IC8vIHJlbW92ZSBzbW9vdGggc2Nyb2xsICYgcHJldmVudCBzY3JvbGwtcG9zaXRpb24ganVtcGluZyBieSByZXN0b3Jpbmcgb3JpZ2luYWwgc2Nyb2xsIHBvc2l0aW9uXG5cblxuXHQgICAgdmFyIHJlc3RvcmVPdmVyZmxvd3MgPSBib29rbWFya092ZXJmbG93cyh0YSk7XG5cdCAgICB0YS5zdHlsZS5oZWlnaHQgPSAnJztcblx0ICAgIHRhLnN0eWxlLmhlaWdodCA9IHRhLnNjcm9sbEhlaWdodCArIGhlaWdodE9mZnNldCArICdweCc7IC8vIHVzZWQgdG8gY2hlY2sgaWYgYW4gdXBkYXRlIGlzIGFjdHVhbGx5IG5lY2Vzc2FyeSBvbiB3aW5kb3cucmVzaXplXG5cblx0ICAgIGNsaWVudFdpZHRoID0gdGEuY2xpZW50V2lkdGg7XG5cdCAgICByZXN0b3JlT3ZlcmZsb3dzKCk7XG5cdCAgfVxuXG5cdCAgZnVuY3Rpb24gdXBkYXRlKCkge1xuXHQgICAgcmVzaXplKCk7XG5cdCAgICB2YXIgc3R5bGVIZWlnaHQgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodGEuc3R5bGUuaGVpZ2h0KSk7XG5cdCAgICB2YXIgY29tcHV0ZWQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCk7IC8vIFVzaW5nIG9mZnNldEhlaWdodCBhcyBhIHJlcGxhY2VtZW50IGZvciBjb21wdXRlZC5oZWlnaHQgaW4gSUUsIGJlY2F1c2UgSUUgZG9lcyBub3QgYWNjb3VudCB1c2Ugb2YgYm9yZGVyLWJveFxuXG5cdCAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gY29tcHV0ZWQuYm94U2l6aW5nID09PSAnY29udGVudC1ib3gnID8gTWF0aC5yb3VuZChwYXJzZUZsb2F0KGNvbXB1dGVkLmhlaWdodCkpIDogdGEub2Zmc2V0SGVpZ2h0OyAvLyBUaGUgYWN0dWFsIGhlaWdodCBub3QgbWF0Y2hpbmcgdGhlIHN0eWxlIGhlaWdodCAoc2V0IHZpYSB0aGUgcmVzaXplIG1ldGhvZCkgaW5kaWNhdGVzIHRoYXRcblx0ICAgIC8vIHRoZSBtYXgtaGVpZ2h0IGhhcyBiZWVuIGV4Y2VlZGVkLCBpbiB3aGljaCBjYXNlIHRoZSBvdmVyZmxvdyBzaG91bGQgYmUgYWxsb3dlZC5cblxuXHQgICAgaWYgKGFjdHVhbEhlaWdodCA8IHN0eWxlSGVpZ2h0KSB7XG5cdCAgICAgIGlmIChjb21wdXRlZC5vdmVyZmxvd1kgPT09ICdoaWRkZW4nKSB7XG5cdCAgICAgICAgY2hhbmdlT3ZlcmZsb3coJ3Njcm9sbCcpO1xuXHQgICAgICAgIHJlc2l6ZSgpO1xuXHQgICAgICAgIGFjdHVhbEhlaWdodCA9IGNvbXB1dGVkLmJveFNpemluZyA9PT0gJ2NvbnRlbnQtYm94JyA/IE1hdGgucm91bmQocGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCkuaGVpZ2h0KSkgOiB0YS5vZmZzZXRIZWlnaHQ7XG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIE5vcm1hbGx5IGtlZXAgb3ZlcmZsb3cgc2V0IHRvIGhpZGRlbiwgdG8gYXZvaWQgZmxhc2ggb2Ygc2Nyb2xsYmFyIGFzIHRoZSB0ZXh0YXJlYSBleHBhbmRzLlxuXHQgICAgICBpZiAoY29tcHV0ZWQub3ZlcmZsb3dZICE9PSAnaGlkZGVuJykge1xuXHQgICAgICAgIGNoYW5nZU92ZXJmbG93KCdoaWRkZW4nKTtcblx0ICAgICAgICByZXNpemUoKTtcblx0ICAgICAgICBhY3R1YWxIZWlnaHQgPSBjb21wdXRlZC5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcgPyBNYXRoLnJvdW5kKHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGEsIG51bGwpLmhlaWdodCkpIDogdGEub2Zmc2V0SGVpZ2h0O1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIGlmIChjYWNoZWRIZWlnaHQgIT09IGFjdHVhbEhlaWdodCkge1xuXHQgICAgICBjYWNoZWRIZWlnaHQgPSBhY3R1YWxIZWlnaHQ7XG5cdCAgICAgIHZhciBldnQgPSBjcmVhdGVFdmVudCgnYXV0b3NpemU6cmVzaXplZCcpO1xuXG5cdCAgICAgIHRyeSB7XG5cdCAgICAgICAgdGEuZGlzcGF0Y2hFdmVudChldnQpO1xuXHQgICAgICB9IGNhdGNoIChlcnIpIHsvLyBGaXJlZm94IHdpbGwgdGhyb3cgYW4gZXJyb3Igb24gZGlzcGF0Y2hFdmVudCBmb3IgYSBkZXRhY2hlZCBlbGVtZW50XG5cdCAgICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODg5Mzc2XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cblx0ICB2YXIgcGFnZVJlc2l6ZSA9IGZ1bmN0aW9uIHBhZ2VSZXNpemUoKSB7XG5cdCAgICBpZiAodGEuY2xpZW50V2lkdGggIT09IGNsaWVudFdpZHRoKSB7XG5cdCAgICAgIHVwZGF0ZSgpO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICB2YXIgZGVzdHJveSA9IGZ1bmN0aW9uIChzdHlsZSkge1xuXHQgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHBhZ2VSZXNpemUsIGZhbHNlKTtcblx0ICAgIHRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdXBkYXRlLCBmYWxzZSk7XG5cdCAgICB0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZSwgZmFsc2UpO1xuXHQgICAgdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignYXV0b3NpemU6ZGVzdHJveScsIGRlc3Ryb3ksIGZhbHNlKTtcblx0ICAgIHRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2F1dG9zaXplOnVwZGF0ZScsIHVwZGF0ZSwgZmFsc2UpO1xuXHQgICAgT2JqZWN0LmtleXMoc3R5bGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHQgICAgICB0YS5zdHlsZVtrZXldID0gc3R5bGVba2V5XTtcblx0ICAgIH0pO1xuXHQgICAgbWFwW1wiZGVsZXRlXCJdKHRhKTtcblx0ICB9LmJpbmQodGEsIHtcblx0ICAgIGhlaWdodDogdGEuc3R5bGUuaGVpZ2h0LFxuXHQgICAgcmVzaXplOiB0YS5zdHlsZS5yZXNpemUsXG5cdCAgICBvdmVyZmxvd1k6IHRhLnN0eWxlLm92ZXJmbG93WSxcblx0ICAgIG92ZXJmbG93WDogdGEuc3R5bGUub3ZlcmZsb3dYLFxuXHQgICAgd29yZFdyYXA6IHRhLnN0eWxlLndvcmRXcmFwXG5cdCAgfSk7XG5cblx0ICB0YS5hZGRFdmVudExpc3RlbmVyKCdhdXRvc2l6ZTpkZXN0cm95JywgZGVzdHJveSwgZmFsc2UpOyAvLyBJRTkgZG9lcyBub3QgZmlyZSBvbnByb3BlcnR5Y2hhbmdlIG9yIG9uaW5wdXQgZm9yIGRlbGV0aW9ucyxcblx0ICAvLyBzbyBiaW5kaW5nIHRvIG9ua2V5dXAgdG8gY2F0Y2ggbW9zdCBvZiB0aG9zZSBldmVudHMuXG5cdCAgLy8gVGhlcmUgaXMgbm8gd2F5IHRoYXQgSSBrbm93IG9mIHRvIGRldGVjdCBzb21ldGhpbmcgbGlrZSAnY3V0JyBpbiBJRTkuXG5cblx0ICBpZiAoJ29ucHJvcGVydHljaGFuZ2UnIGluIHRhICYmICdvbmlucHV0JyBpbiB0YSkge1xuXHQgICAgdGEuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGUsIGZhbHNlKTtcblx0ICB9XG5cblx0ICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcGFnZVJlc2l6ZSwgZmFsc2UpO1xuXHQgIHRhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdXBkYXRlLCBmYWxzZSk7XG5cdCAgdGEuYWRkRXZlbnRMaXN0ZW5lcignYXV0b3NpemU6dXBkYXRlJywgdXBkYXRlLCBmYWxzZSk7XG5cdCAgdGEuc3R5bGUub3ZlcmZsb3dYID0gJ2hpZGRlbic7XG5cdCAgdGEuc3R5bGUud29yZFdyYXAgPSAnYnJlYWstd29yZCc7XG5cdCAgbWFwLnNldCh0YSwge1xuXHQgICAgZGVzdHJveTogZGVzdHJveSxcblx0ICAgIHVwZGF0ZTogdXBkYXRlXG5cdCAgfSk7XG5cdCAgaW5pdCgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveSh0YSkge1xuXHQgIHZhciBtZXRob2RzID0gbWFwLmdldCh0YSk7XG5cblx0ICBpZiAobWV0aG9kcykge1xuXHQgICAgbWV0aG9kcy5kZXN0cm95KCk7XG5cdCAgfVxuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlKHRhKSB7XG5cdCAgdmFyIG1ldGhvZHMgPSBtYXAuZ2V0KHRhKTtcblxuXHQgIGlmIChtZXRob2RzKSB7XG5cdCAgICBtZXRob2RzLnVwZGF0ZSgpO1xuXHQgIH1cblx0fVxuXG5cdHZhciBhdXRvc2l6ZSA9IG51bGw7IC8vIERvIG5vdGhpbmcgaW4gTm9kZS5qcyBlbnZpcm9ubWVudCBhbmQgSUU4IChvciBsb3dlcilcblxuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlICE9PSAnZnVuY3Rpb24nKSB7XG5cdCAgYXV0b3NpemUgPSBmdW5jdGlvbiBhdXRvc2l6ZShlbCkge1xuXHQgICAgcmV0dXJuIGVsO1xuXHQgIH07XG5cblx0ICBhdXRvc2l6ZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgICByZXR1cm4gZWw7XG5cdCAgfTtcblxuXHQgIGF1dG9zaXplLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbCkge1xuXHQgICAgcmV0dXJuIGVsO1xuXHQgIH07XG5cdH0gZWxzZSB7XG5cdCAgYXV0b3NpemUgPSBmdW5jdGlvbiBhdXRvc2l6ZShlbCwgb3B0aW9ucykge1xuXHQgICAgaWYgKGVsKSB7XG5cdCAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZWwubGVuZ3RoID8gZWwgOiBbZWxdLCBmdW5jdGlvbiAoeCkge1xuXHQgICAgICAgIHJldHVybiBhc3NpZ24oeCk7XG5cdCAgICAgIH0pO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gZWw7XG5cdCAgfTtcblxuXHQgIGF1dG9zaXplLmRlc3Ryb3kgPSBmdW5jdGlvbiAoZWwpIHtcblx0ICAgIGlmIChlbCkge1xuXHQgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsLmxlbmd0aCA/IGVsIDogW2VsXSwgZGVzdHJveSk7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBlbDtcblx0ICB9O1xuXG5cdCAgYXV0b3NpemUudXBkYXRlID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgICBpZiAoZWwpIHtcblx0ICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbC5sZW5ndGggPyBlbCA6IFtlbF0sIHVwZGF0ZSk7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBlbDtcblx0ICB9O1xuXHR9XG5cblx0dmFyIGF1dG9zaXplJDEgPSBhdXRvc2l6ZTtcblxuXHRyZXR1cm4gYXV0b3NpemUkMTtcblxufSkpKTtcbiIsIi8qIVxuICAqIEJvb3RzdHJhcCB2NS4zLjMgKGh0dHBzOi8vZ2V0Ym9vdHN0cmFwLmNvbS8pXG4gICogQ29weXJpZ2h0IDIwMTEtMjAyNCBUaGUgQm9vdHN0cmFwIEF1dGhvcnMgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ncmFwaHMvY29udHJpYnV0b3JzKVxuICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ0Bwb3BwZXJqcy9jb3JlJykpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnQHBvcHBlcmpzL2NvcmUnXSwgZmFjdG9yeSkgOlxuICAoZ2xvYmFsID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IGdsb2JhbCB8fCBzZWxmLCBnbG9iYWwuYm9vdHN0cmFwID0gZmFjdG9yeShnbG9iYWwuUG9wcGVyKSk7XG59KSh0aGlzLCAoZnVuY3Rpb24gKFBvcHBlcikgeyAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gX2ludGVyb3BOYW1lc3BhY2VEZWZhdWx0KGUpIHtcbiAgICBjb25zdCBuID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7IFtTeW1ib2wudG9TdHJpbmdUYWddOiB7IHZhbHVlOiAnTW9kdWxlJyB9IH0pO1xuICAgIGlmIChlKSB7XG4gICAgICBmb3IgKGNvbnN0IGsgaW4gZSkge1xuICAgICAgICBpZiAoayAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgY29uc3QgZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgayk7XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG4sIGssIGQuZ2V0ID8gZCA6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQ6ICgpID0+IGVba11cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBuLmRlZmF1bHQgPSBlO1xuICAgIHJldHVybiBPYmplY3QuZnJlZXplKG4pO1xuICB9XG5cbiAgY29uc3QgUG9wcGVyX19uYW1lc3BhY2UgPSAvKiNfX1BVUkVfXyovX2ludGVyb3BOYW1lc3BhY2VEZWZhdWx0KFBvcHBlcik7XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCBkb20vZGF0YS5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBlbGVtZW50TWFwID0gbmV3IE1hcCgpO1xuICBjb25zdCBEYXRhID0ge1xuICAgIHNldChlbGVtZW50LCBrZXksIGluc3RhbmNlKSB7XG4gICAgICBpZiAoIWVsZW1lbnRNYXAuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIG5ldyBNYXAoKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBpbnN0YW5jZU1hcCA9IGVsZW1lbnRNYXAuZ2V0KGVsZW1lbnQpO1xuXG4gICAgICAvLyBtYWtlIGl0IGNsZWFyIHdlIG9ubHkgd2FudCBvbmUgaW5zdGFuY2UgcGVyIGVsZW1lbnRcbiAgICAgIC8vIGNhbiBiZSByZW1vdmVkIGxhdGVyIHdoZW4gbXVsdGlwbGUga2V5L2luc3RhbmNlcyBhcmUgZmluZSB0byBiZSB1c2VkXG4gICAgICBpZiAoIWluc3RhbmNlTWFwLmhhcyhrZXkpICYmIGluc3RhbmNlTWFwLnNpemUgIT09IDApIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5lcnJvcihgQm9vdHN0cmFwIGRvZXNuJ3QgYWxsb3cgbW9yZSB0aGFuIG9uZSBpbnN0YW5jZSBwZXIgZWxlbWVudC4gQm91bmQgaW5zdGFuY2U6ICR7QXJyYXkuZnJvbShpbnN0YW5jZU1hcC5rZXlzKCkpWzBdfS5gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaW5zdGFuY2VNYXAuc2V0KGtleSwgaW5zdGFuY2UpO1xuICAgIH0sXG4gICAgZ2V0KGVsZW1lbnQsIGtleSkge1xuICAgICAgaWYgKGVsZW1lbnRNYXAuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50TWFwLmdldChlbGVtZW50KS5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICByZW1vdmUoZWxlbWVudCwga2V5KSB7XG4gICAgICBpZiAoIWVsZW1lbnRNYXAuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGluc3RhbmNlTWFwID0gZWxlbWVudE1hcC5nZXQoZWxlbWVudCk7XG4gICAgICBpbnN0YW5jZU1hcC5kZWxldGUoa2V5KTtcblxuICAgICAgLy8gZnJlZSB1cCBlbGVtZW50IHJlZmVyZW5jZXMgaWYgdGhlcmUgYXJlIG5vIGluc3RhbmNlcyBsZWZ0IGZvciBhbiBlbGVtZW50XG4gICAgICBpZiAoaW5zdGFuY2VNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICBlbGVtZW50TWFwLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCB1dGlsL2luZGV4LmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuICBjb25zdCBNQVhfVUlEID0gMTAwMDAwMDtcbiAgY29uc3QgTUlMTElTRUNPTkRTX01VTFRJUExJRVIgPSAxMDAwO1xuICBjb25zdCBUUkFOU0lUSU9OX0VORCA9ICd0cmFuc2l0aW9uZW5kJztcblxuICAvKipcbiAgICogUHJvcGVybHkgZXNjYXBlIElEcyBzZWxlY3RvcnMgdG8gaGFuZGxlIHdlaXJkIElEc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3JcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGNvbnN0IHBhcnNlU2VsZWN0b3IgPSBzZWxlY3RvciA9PiB7XG4gICAgaWYgKHNlbGVjdG9yICYmIHdpbmRvdy5DU1MgJiYgd2luZG93LkNTUy5lc2NhcGUpIHtcbiAgICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgbmVlZHMgZXNjYXBpbmcgdG8gaGFuZGxlIElEcyAoaHRtbDUrKSBjb250YWluaW5nIGZvciBpbnN0YW5jZSAvXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoLyMoW15cXHNcIiMnXSspL2csIChtYXRjaCwgaWQpID0+IGAjJHtDU1MuZXNjYXBlKGlkKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9O1xuXG4gIC8vIFNob3V0LW91dCBBbmd1cyBDcm9sbCAoaHR0cHM6Ly9nb28uZ2wvcHh3UUdwKVxuICBjb25zdCB0b1R5cGUgPSBvYmplY3QgPT4ge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwgfHwgb2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBgJHtvYmplY3R9YDtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpLm1hdGNoKC9cXHMoW2Etel0rKS9pKVsxXS50b0xvd2VyQ2FzZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdWJsaWMgVXRpbCBBUElcbiAgICovXG5cbiAgY29uc3QgZ2V0VUlEID0gcHJlZml4ID0+IHtcbiAgICBkbyB7XG4gICAgICBwcmVmaXggKz0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTUFYX1VJRCk7XG4gICAgfSB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSk7XG4gICAgcmV0dXJuIHByZWZpeDtcbiAgfTtcbiAgY29uc3QgZ2V0VHJhbnNpdGlvbkR1cmF0aW9uRnJvbUVsZW1lbnQgPSBlbGVtZW50ID0+IHtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8vIEdldCB0cmFuc2l0aW9uLWR1cmF0aW9uIG9mIHRoZSBlbGVtZW50XG4gICAgbGV0IHtcbiAgICAgIHRyYW5zaXRpb25EdXJhdGlvbixcbiAgICAgIHRyYW5zaXRpb25EZWxheVxuICAgIH0gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBjb25zdCBmbG9hdFRyYW5zaXRpb25EdXJhdGlvbiA9IE51bWJlci5wYXJzZUZsb2F0KHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgY29uc3QgZmxvYXRUcmFuc2l0aW9uRGVsYXkgPSBOdW1iZXIucGFyc2VGbG9hdCh0cmFuc2l0aW9uRGVsYXkpO1xuXG4gICAgLy8gUmV0dXJuIDAgaWYgZWxlbWVudCBvciB0cmFuc2l0aW9uIGR1cmF0aW9uIGlzIG5vdCBmb3VuZFxuICAgIGlmICghZmxvYXRUcmFuc2l0aW9uRHVyYXRpb24gJiYgIWZsb2F0VHJhbnNpdGlvbkRlbGF5KSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyBJZiBtdWx0aXBsZSBkdXJhdGlvbnMgYXJlIGRlZmluZWQsIHRha2UgdGhlIGZpcnN0XG4gICAgdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsJylbMF07XG4gICAgdHJhbnNpdGlvbkRlbGF5ID0gdHJhbnNpdGlvbkRlbGF5LnNwbGl0KCcsJylbMF07XG4gICAgcmV0dXJuIChOdW1iZXIucGFyc2VGbG9hdCh0cmFuc2l0aW9uRHVyYXRpb24pICsgTnVtYmVyLnBhcnNlRmxvYXQodHJhbnNpdGlvbkRlbGF5KSkgKiBNSUxMSVNFQ09ORFNfTVVMVElQTElFUjtcbiAgfTtcbiAgY29uc3QgdHJpZ2dlclRyYW5zaXRpb25FbmQgPSBlbGVtZW50ID0+IHtcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFRSQU5TSVRJT05fRU5EKSk7XG4gIH07XG4gIGNvbnN0IGlzRWxlbWVudCA9IG9iamVjdCA9PiB7XG4gICAgaWYgKCFvYmplY3QgfHwgdHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmplY3QuanF1ZXJ5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0ID0gb2JqZWN0WzBdO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdC5ub2RlVHlwZSAhPT0gJ3VuZGVmaW5lZCc7XG4gIH07XG4gIGNvbnN0IGdldEVsZW1lbnQgPSBvYmplY3QgPT4ge1xuICAgIC8vIGl0J3MgYSBqUXVlcnkgb2JqZWN0IG9yIGEgbm9kZSBlbGVtZW50XG4gICAgaWYgKGlzRWxlbWVudChvYmplY3QpKSB7XG4gICAgICByZXR1cm4gb2JqZWN0LmpxdWVyeSA/IG9iamVjdFswXSA6IG9iamVjdDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICdzdHJpbmcnICYmIG9iamVjdC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJzZVNlbGVjdG9yKG9iamVjdCkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgY29uc3QgaXNWaXNpYmxlID0gZWxlbWVudCA9PiB7XG4gICAgaWYgKCFpc0VsZW1lbnQoZWxlbWVudCkgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBlbGVtZW50SXNWaXNpYmxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKCd2aXNpYmlsaXR5JykgPT09ICd2aXNpYmxlJztcbiAgICAvLyBIYW5kbGUgYGRldGFpbHNgIGVsZW1lbnQgYXMgaXRzIGNvbnRlbnQgbWF5IGZhbHNpZSBhcHBlYXIgdmlzaWJsZSB3aGVuIGl0IGlzIGNsb3NlZFxuICAgIGNvbnN0IGNsb3NlZERldGFpbHMgPSBlbGVtZW50LmNsb3Nlc3QoJ2RldGFpbHM6bm90KFtvcGVuXSknKTtcbiAgICBpZiAoIWNsb3NlZERldGFpbHMpIHtcbiAgICAgIHJldHVybiBlbGVtZW50SXNWaXNpYmxlO1xuICAgIH1cbiAgICBpZiAoY2xvc2VkRGV0YWlscyAhPT0gZWxlbWVudCkge1xuICAgICAgY29uc3Qgc3VtbWFyeSA9IGVsZW1lbnQuY2xvc2VzdCgnc3VtbWFyeScpO1xuICAgICAgaWYgKHN1bW1hcnkgJiYgc3VtbWFyeS5wYXJlbnROb2RlICE9PSBjbG9zZWREZXRhaWxzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzdW1tYXJ5ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRJc1Zpc2libGU7XG4gIH07XG4gIGNvbnN0IGlzRGlzYWJsZWQgPSBlbGVtZW50ID0+IHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5ub2RlVHlwZSAhPT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVsZW1lbnQuZGlzYWJsZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5kaXNhYmxlZDtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICYmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpICE9PSAnZmFsc2UnO1xuICB9O1xuICBjb25zdCBmaW5kU2hhZG93Um9vdCA9IGVsZW1lbnQgPT4ge1xuICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dGFjaFNoYWRvdykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2FuIGZpbmQgdGhlIHNoYWRvdyByb290IG90aGVyd2lzZSBpdCdsbCByZXR1cm4gdGhlIGRvY3VtZW50XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50LmdldFJvb3ROb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCByb290ID0gZWxlbWVudC5nZXRSb290Tm9kZSgpO1xuICAgICAgcmV0dXJuIHJvb3QgaW5zdGFuY2VvZiBTaGFkb3dSb290ID8gcm9vdCA6IG51bGw7XG4gICAgfVxuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgU2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8gd2hlbiB3ZSBkb24ndCBmaW5kIGEgc2hhZG93IHJvb3RcbiAgICBpZiAoIWVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBmaW5kU2hhZG93Um9vdChlbGVtZW50LnBhcmVudE5vZGUpO1xuICB9O1xuICBjb25zdCBub29wID0gKCkgPT4ge307XG5cbiAgLyoqXG4gICAqIFRyaWNrIHRvIHJlc3RhcnQgYW4gZWxlbWVudCdzIGFuaW1hdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4gdm9pZFxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmNoYXJpc3RoZW8uaW8vYmxvZy8yMDIxLzAyL3Jlc3RhcnQtYS1jc3MtYW5pbWF0aW9uLXdpdGgtamF2YXNjcmlwdC8jcmVzdGFydGluZy1hLWNzcy1hbmltYXRpb25cbiAgICovXG4gIGNvbnN0IHJlZmxvdyA9IGVsZW1lbnQgPT4ge1xuICAgIGVsZW1lbnQub2Zmc2V0SGVpZ2h0OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuICB9O1xuICBjb25zdCBnZXRqUXVlcnkgPSAoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5qUXVlcnkgJiYgIWRvY3VtZW50LmJvZHkuaGFzQXR0cmlidXRlKCdkYXRhLWJzLW5vLWpxdWVyeScpKSB7XG4gICAgICByZXR1cm4gd2luZG93LmpRdWVyeTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGNvbnN0IERPTUNvbnRlbnRMb2FkZWRDYWxsYmFja3MgPSBbXTtcbiAgY29uc3Qgb25ET01Db250ZW50TG9hZGVkID0gY2FsbGJhY2sgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICAgIC8vIGFkZCBsaXN0ZW5lciBvbiB0aGUgZmlyc3QgY2FsbCB3aGVuIHRoZSBkb2N1bWVudCBpcyBpbiBsb2FkaW5nIHN0YXRlXG4gICAgICBpZiAoIURPTUNvbnRlbnRMb2FkZWRDYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBET01Db250ZW50TG9hZGVkQ2FsbGJhY2tzKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBET01Db250ZW50TG9hZGVkQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgaXNSVEwgPSAoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZGlyID09PSAncnRsJztcbiAgY29uc3QgZGVmaW5lSlF1ZXJ5UGx1Z2luID0gcGx1Z2luID0+IHtcbiAgICBvbkRPTUNvbnRlbnRMb2FkZWQoKCkgPT4ge1xuICAgICAgY29uc3QgJCA9IGdldGpRdWVyeSgpO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoJCkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGx1Z2luLk5BTUU7XG4gICAgICAgIGNvbnN0IEpRVUVSWV9OT19DT05GTElDVCA9ICQuZm5bbmFtZV07XG4gICAgICAgICQuZm5bbmFtZV0gPSBwbHVnaW4ualF1ZXJ5SW50ZXJmYWNlO1xuICAgICAgICAkLmZuW25hbWVdLkNvbnN0cnVjdG9yID0gcGx1Z2luO1xuICAgICAgICAkLmZuW25hbWVdLm5vQ29uZmxpY3QgPSAoKSA9PiB7XG4gICAgICAgICAgJC5mbltuYW1lXSA9IEpRVUVSWV9OT19DT05GTElDVDtcbiAgICAgICAgICByZXR1cm4gcGx1Z2luLmpRdWVyeUludGVyZmFjZTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgY29uc3QgZXhlY3V0ZSA9IChwb3NzaWJsZUNhbGxiYWNrLCBhcmdzID0gW10sIGRlZmF1bHRWYWx1ZSA9IHBvc3NpYmxlQ2FsbGJhY2spID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIHBvc3NpYmxlQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBwb3NzaWJsZUNhbGxiYWNrKC4uLmFyZ3MpIDogZGVmYXVsdFZhbHVlO1xuICB9O1xuICBjb25zdCBleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uID0gKGNhbGxiYWNrLCB0cmFuc2l0aW9uRWxlbWVudCwgd2FpdEZvclRyYW5zaXRpb24gPSB0cnVlKSA9PiB7XG4gICAgaWYgKCF3YWl0Rm9yVHJhbnNpdGlvbikge1xuICAgICAgZXhlY3V0ZShjYWxsYmFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGR1cmF0aW9uUGFkZGluZyA9IDU7XG4gICAgY29uc3QgZW11bGF0ZWREdXJhdGlvbiA9IGdldFRyYW5zaXRpb25EdXJhdGlvbkZyb21FbGVtZW50KHRyYW5zaXRpb25FbGVtZW50KSArIGR1cmF0aW9uUGFkZGluZztcbiAgICBsZXQgY2FsbGVkID0gZmFsc2U7XG4gICAgY29uc3QgaGFuZGxlciA9ICh7XG4gICAgICB0YXJnZXRcbiAgICB9KSA9PiB7XG4gICAgICBpZiAodGFyZ2V0ICE9PSB0cmFuc2l0aW9uRWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgdHJhbnNpdGlvbkVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihUUkFOU0lUSU9OX0VORCwgaGFuZGxlcik7XG4gICAgICBleGVjdXRlKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIHRyYW5zaXRpb25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoVFJBTlNJVElPTl9FTkQsIGhhbmRsZXIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgdHJpZ2dlclRyYW5zaXRpb25FbmQodHJhbnNpdGlvbkVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0sIGVtdWxhdGVkRHVyYXRpb24pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHByZXZpb3VzL25leHQgZWxlbWVudCBvZiBhIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgICAgVGhlIGxpc3Qgb2YgZWxlbWVudHNcbiAgICogQHBhcmFtIGFjdGl2ZUVsZW1lbnQgICBUaGUgYWN0aXZlIGVsZW1lbnRcbiAgICogQHBhcmFtIHNob3VsZEdldE5leHQgICBDaG9vc2UgdG8gZ2V0IG5leHQgb3IgcHJldmlvdXMgZWxlbWVudFxuICAgKiBAcGFyYW0gaXNDeWNsZUFsbG93ZWRcbiAgICogQHJldHVybiB7RWxlbWVudHxlbGVtfSBUaGUgcHJvcGVyIGVsZW1lbnRcbiAgICovXG4gIGNvbnN0IGdldE5leHRBY3RpdmVFbGVtZW50ID0gKGxpc3QsIGFjdGl2ZUVsZW1lbnQsIHNob3VsZEdldE5leHQsIGlzQ3ljbGVBbGxvd2VkKSA9PiB7XG4gICAgY29uc3QgbGlzdExlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICAgIGxldCBpbmRleCA9IGxpc3QuaW5kZXhPZihhY3RpdmVFbGVtZW50KTtcblxuICAgIC8vIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0IHJldHVybiBhbiBlbGVtZW50XG4gICAgLy8gZGVwZW5kaW5nIG9uIHRoZSBkaXJlY3Rpb24gYW5kIGlmIGN5Y2xlIGlzIGFsbG93ZWRcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gIXNob3VsZEdldE5leHQgJiYgaXNDeWNsZUFsbG93ZWQgPyBsaXN0W2xpc3RMZW5ndGggLSAxXSA6IGxpc3RbMF07XG4gICAgfVxuICAgIGluZGV4ICs9IHNob3VsZEdldE5leHQgPyAxIDogLTE7XG4gICAgaWYgKGlzQ3ljbGVBbGxvd2VkKSB7XG4gICAgICBpbmRleCA9IChpbmRleCArIGxpc3RMZW5ndGgpICUgbGlzdExlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGxpc3RbTWF0aC5tYXgoMCwgTWF0aC5taW4oaW5kZXgsIGxpc3RMZW5ndGggLSAxKSldO1xuICB9O1xuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgZG9tL2V2ZW50LWhhbmRsZXIuanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBuYW1lc3BhY2VSZWdleCA9IC9bXi5dKig/PVxcLi4qKVxcLnwuKi87XG4gIGNvbnN0IHN0cmlwTmFtZVJlZ2V4ID0gL1xcLi4qLztcbiAgY29uc3Qgc3RyaXBVaWRSZWdleCA9IC86OlxcZCskLztcbiAgY29uc3QgZXZlbnRSZWdpc3RyeSA9IHt9OyAvLyBFdmVudHMgc3RvcmFnZVxuICBsZXQgdWlkRXZlbnQgPSAxO1xuICBjb25zdCBjdXN0b21FdmVudHMgPSB7XG4gICAgbW91c2VlbnRlcjogJ21vdXNlb3ZlcicsXG4gICAgbW91c2VsZWF2ZTogJ21vdXNlb3V0J1xuICB9O1xuICBjb25zdCBuYXRpdmVFdmVudHMgPSBuZXcgU2V0KFsnY2xpY2snLCAnZGJsY2xpY2snLCAnbW91c2V1cCcsICdtb3VzZWRvd24nLCAnY29udGV4dG1lbnUnLCAnbW91c2V3aGVlbCcsICdET01Nb3VzZVNjcm9sbCcsICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAnbW91c2Vtb3ZlJywgJ3NlbGVjdHN0YXJ0JywgJ3NlbGVjdGVuZCcsICdrZXlkb3duJywgJ2tleXByZXNzJywgJ2tleXVwJywgJ29yaWVudGF0aW9uY2hhbmdlJywgJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJywgJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVybGVhdmUnLCAncG9pbnRlcmNhbmNlbCcsICdnZXN0dXJlc3RhcnQnLCAnZ2VzdHVyZWNoYW5nZScsICdnZXN0dXJlZW5kJywgJ2ZvY3VzJywgJ2JsdXInLCAnY2hhbmdlJywgJ3Jlc2V0JywgJ3NlbGVjdCcsICdzdWJtaXQnLCAnZm9jdXNpbicsICdmb2N1c291dCcsICdsb2FkJywgJ3VubG9hZCcsICdiZWZvcmV1bmxvYWQnLCAncmVzaXplJywgJ21vdmUnLCAnRE9NQ29udGVudExvYWRlZCcsICdyZWFkeXN0YXRlY2hhbmdlJywgJ2Vycm9yJywgJ2Fib3J0JywgJ3Njcm9sbCddKTtcblxuICAvKipcbiAgICogUHJpdmF0ZSBtZXRob2RzXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG1ha2VFdmVudFVpZChlbGVtZW50LCB1aWQpIHtcbiAgICByZXR1cm4gdWlkICYmIGAke3VpZH06OiR7dWlkRXZlbnQrK31gIHx8IGVsZW1lbnQudWlkRXZlbnQgfHwgdWlkRXZlbnQrKztcbiAgfVxuICBmdW5jdGlvbiBnZXRFbGVtZW50RXZlbnRzKGVsZW1lbnQpIHtcbiAgICBjb25zdCB1aWQgPSBtYWtlRXZlbnRVaWQoZWxlbWVudCk7XG4gICAgZWxlbWVudC51aWRFdmVudCA9IHVpZDtcbiAgICBldmVudFJlZ2lzdHJ5W3VpZF0gPSBldmVudFJlZ2lzdHJ5W3VpZF0gfHwge307XG4gICAgcmV0dXJuIGV2ZW50UmVnaXN0cnlbdWlkXTtcbiAgfVxuICBmdW5jdGlvbiBib290c3RyYXBIYW5kbGVyKGVsZW1lbnQsIGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIGh5ZHJhdGVPYmooZXZlbnQsIHtcbiAgICAgICAgZGVsZWdhdGVUYXJnZXQ6IGVsZW1lbnRcbiAgICAgIH0pO1xuICAgICAgaWYgKGhhbmRsZXIub25lT2ZmKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vZmYoZWxlbWVudCwgZXZlbnQudHlwZSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZuLmFwcGx5KGVsZW1lbnQsIFtldmVudF0pO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gYm9vdHN0cmFwRGVsZWdhdGlvbkhhbmRsZXIoZWxlbWVudCwgc2VsZWN0b3IsIGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGRvbUVsZW1lbnRzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgIGZvciAobGV0IHtcbiAgICAgICAgdGFyZ2V0XG4gICAgICB9ID0gZXZlbnQ7IHRhcmdldCAmJiB0YXJnZXQgIT09IHRoaXM7IHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZG9tRWxlbWVudCBvZiBkb21FbGVtZW50cykge1xuICAgICAgICAgIGlmIChkb21FbGVtZW50ICE9PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoeWRyYXRlT2JqKGV2ZW50LCB7XG4gICAgICAgICAgICBkZWxlZ2F0ZVRhcmdldDogdGFyZ2V0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGhhbmRsZXIub25lT2ZmKSB7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIub2ZmKGVsZW1lbnQsIGV2ZW50LnR5cGUsIHNlbGVjdG9yLCBmbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0YXJnZXQsIFtldmVudF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBmaW5kSGFuZGxlcihldmVudHMsIGNhbGxhYmxlLCBkZWxlZ2F0aW9uU2VsZWN0b3IgPSBudWxsKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoZXZlbnRzKS5maW5kKGV2ZW50ID0+IGV2ZW50LmNhbGxhYmxlID09PSBjYWxsYWJsZSAmJiBldmVudC5kZWxlZ2F0aW9uU2VsZWN0b3IgPT09IGRlbGVnYXRpb25TZWxlY3Rvcik7XG4gIH1cbiAgZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyhvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKSB7XG4gICAgY29uc3QgaXNEZWxlZ2F0ZWQgPSB0eXBlb2YgaGFuZGxlciA9PT0gJ3N0cmluZyc7XG4gICAgLy8gVE9ETzogdG9vbHRpcCBwYXNzZXMgYGZhbHNlYCBpbnN0ZWFkIG9mIHNlbGVjdG9yLCBzbyB3ZSBuZWVkIHRvIGNoZWNrXG4gICAgY29uc3QgY2FsbGFibGUgPSBpc0RlbGVnYXRlZCA/IGRlbGVnYXRpb25GdW5jdGlvbiA6IGhhbmRsZXIgfHwgZGVsZWdhdGlvbkZ1bmN0aW9uO1xuICAgIGxldCB0eXBlRXZlbnQgPSBnZXRUeXBlRXZlbnQob3JpZ2luYWxUeXBlRXZlbnQpO1xuICAgIGlmICghbmF0aXZlRXZlbnRzLmhhcyh0eXBlRXZlbnQpKSB7XG4gICAgICB0eXBlRXZlbnQgPSBvcmlnaW5hbFR5cGVFdmVudDtcbiAgICB9XG4gICAgcmV0dXJuIFtpc0RlbGVnYXRlZCwgY2FsbGFibGUsIHR5cGVFdmVudF07XG4gIH1cbiAgZnVuY3Rpb24gYWRkSGFuZGxlcihlbGVtZW50LCBvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uLCBvbmVPZmYpIHtcbiAgICBpZiAodHlwZW9mIG9yaWdpbmFsVHlwZUV2ZW50ICE9PSAnc3RyaW5nJyB8fCAhZWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgW2lzRGVsZWdhdGVkLCBjYWxsYWJsZSwgdHlwZUV2ZW50XSA9IG5vcm1hbGl6ZVBhcmFtZXRlcnMob3JpZ2luYWxUeXBlRXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbik7XG5cbiAgICAvLyBpbiBjYXNlIG9mIG1vdXNlZW50ZXIgb3IgbW91c2VsZWF2ZSB3cmFwIHRoZSBoYW5kbGVyIHdpdGhpbiBhIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGZvciBpdHMgRE9NIHBvc2l0aW9uXG4gICAgLy8gdGhpcyBwcmV2ZW50cyB0aGUgaGFuZGxlciBmcm9tIGJlaW5nIGRpc3BhdGNoZWQgdGhlIHNhbWUgd2F5IGFzIG1vdXNlb3ZlciBvciBtb3VzZW91dCBkb2VzXG4gICAgaWYgKG9yaWdpbmFsVHlwZUV2ZW50IGluIGN1c3RvbUV2ZW50cykge1xuICAgICAgY29uc3Qgd3JhcEZ1bmN0aW9uID0gZm4gPT4ge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgaWYgKCFldmVudC5yZWxhdGVkVGFyZ2V0IHx8IGV2ZW50LnJlbGF0ZWRUYXJnZXQgIT09IGV2ZW50LmRlbGVnYXRlVGFyZ2V0ICYmICFldmVudC5kZWxlZ2F0ZVRhcmdldC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBjYWxsYWJsZSA9IHdyYXBGdW5jdGlvbihjYWxsYWJsZSk7XG4gICAgfVxuICAgIGNvbnN0IGV2ZW50cyA9IGdldEVsZW1lbnRFdmVudHMoZWxlbWVudCk7XG4gICAgY29uc3QgaGFuZGxlcnMgPSBldmVudHNbdHlwZUV2ZW50XSB8fCAoZXZlbnRzW3R5cGVFdmVudF0gPSB7fSk7XG4gICAgY29uc3QgcHJldmlvdXNGdW5jdGlvbiA9IGZpbmRIYW5kbGVyKGhhbmRsZXJzLCBjYWxsYWJsZSwgaXNEZWxlZ2F0ZWQgPyBoYW5kbGVyIDogbnVsbCk7XG4gICAgaWYgKHByZXZpb3VzRnVuY3Rpb24pIHtcbiAgICAgIHByZXZpb3VzRnVuY3Rpb24ub25lT2ZmID0gcHJldmlvdXNGdW5jdGlvbi5vbmVPZmYgJiYgb25lT2ZmO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB1aWQgPSBtYWtlRXZlbnRVaWQoY2FsbGFibGUsIG9yaWdpbmFsVHlwZUV2ZW50LnJlcGxhY2UobmFtZXNwYWNlUmVnZXgsICcnKSk7XG4gICAgY29uc3QgZm4gPSBpc0RlbGVnYXRlZCA/IGJvb3RzdHJhcERlbGVnYXRpb25IYW5kbGVyKGVsZW1lbnQsIGhhbmRsZXIsIGNhbGxhYmxlKSA6IGJvb3RzdHJhcEhhbmRsZXIoZWxlbWVudCwgY2FsbGFibGUpO1xuICAgIGZuLmRlbGVnYXRpb25TZWxlY3RvciA9IGlzRGVsZWdhdGVkID8gaGFuZGxlciA6IG51bGw7XG4gICAgZm4uY2FsbGFibGUgPSBjYWxsYWJsZTtcbiAgICBmbi5vbmVPZmYgPSBvbmVPZmY7XG4gICAgZm4udWlkRXZlbnQgPSB1aWQ7XG4gICAgaGFuZGxlcnNbdWlkXSA9IGZuO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlRXZlbnQsIGZuLCBpc0RlbGVnYXRlZCk7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvblNlbGVjdG9yKSB7XG4gICAgY29uc3QgZm4gPSBmaW5kSGFuZGxlcihldmVudHNbdHlwZUV2ZW50XSwgaGFuZGxlciwgZGVsZWdhdGlvblNlbGVjdG9yKTtcbiAgICBpZiAoIWZuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlRXZlbnQsIGZuLCBCb29sZWFuKGRlbGVnYXRpb25TZWxlY3RvcikpO1xuICAgIGRlbGV0ZSBldmVudHNbdHlwZUV2ZW50XVtmbi51aWRFdmVudF07XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlTmFtZXNwYWNlZEhhbmRsZXJzKGVsZW1lbnQsIGV2ZW50cywgdHlwZUV2ZW50LCBuYW1lc3BhY2UpIHtcbiAgICBjb25zdCBzdG9yZUVsZW1lbnRFdmVudCA9IGV2ZW50c1t0eXBlRXZlbnRdIHx8IHt9O1xuICAgIGZvciAoY29uc3QgW2hhbmRsZXJLZXksIGV2ZW50XSBvZiBPYmplY3QuZW50cmllcyhzdG9yZUVsZW1lbnRFdmVudCkpIHtcbiAgICAgIGlmIChoYW5kbGVyS2V5LmluY2x1ZGVzKG5hbWVzcGFjZSkpIHtcbiAgICAgICAgcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgZXZlbnQuY2FsbGFibGUsIGV2ZW50LmRlbGVnYXRpb25TZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGdldFR5cGVFdmVudChldmVudCkge1xuICAgIC8vIGFsbG93IHRvIGdldCB0aGUgbmF0aXZlIGV2ZW50cyBmcm9tIG5hbWVzcGFjZWQgZXZlbnRzICgnY2xpY2suYnMuYnV0dG9uJyAtLT4gJ2NsaWNrJylcbiAgICBldmVudCA9IGV2ZW50LnJlcGxhY2Uoc3RyaXBOYW1lUmVnZXgsICcnKTtcbiAgICByZXR1cm4gY3VzdG9tRXZlbnRzW2V2ZW50XSB8fCBldmVudDtcbiAgfVxuICBjb25zdCBFdmVudEhhbmRsZXIgPSB7XG4gICAgb24oZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbikge1xuICAgICAgYWRkSGFuZGxlcihlbGVtZW50LCBldmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uLCBmYWxzZSk7XG4gICAgfSxcbiAgICBvbmUoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbikge1xuICAgICAgYWRkSGFuZGxlcihlbGVtZW50LCBldmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uLCB0cnVlKTtcbiAgICB9LFxuICAgIG9mZihlbGVtZW50LCBvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVHlwZUV2ZW50ICE9PSAnc3RyaW5nJyB8fCAhZWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBbaXNEZWxlZ2F0ZWQsIGNhbGxhYmxlLCB0eXBlRXZlbnRdID0gbm9ybWFsaXplUGFyYW1ldGVycyhvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKTtcbiAgICAgIGNvbnN0IGluTmFtZXNwYWNlID0gdHlwZUV2ZW50ICE9PSBvcmlnaW5hbFR5cGVFdmVudDtcbiAgICAgIGNvbnN0IGV2ZW50cyA9IGdldEVsZW1lbnRFdmVudHMoZWxlbWVudCk7XG4gICAgICBjb25zdCBzdG9yZUVsZW1lbnRFdmVudCA9IGV2ZW50c1t0eXBlRXZlbnRdIHx8IHt9O1xuICAgICAgY29uc3QgaXNOYW1lc3BhY2UgPSBvcmlnaW5hbFR5cGVFdmVudC5zdGFydHNXaXRoKCcuJyk7XG4gICAgICBpZiAodHlwZW9mIGNhbGxhYmxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyBTaW1wbGVzdCBjYXNlOiBoYW5kbGVyIGlzIHBhc3NlZCwgcmVtb3ZlIHRoYXQgbGlzdGVuZXIgT05MWS5cbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhzdG9yZUVsZW1lbnRFdmVudCkubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZUhhbmRsZXIoZWxlbWVudCwgZXZlbnRzLCB0eXBlRXZlbnQsIGNhbGxhYmxlLCBpc0RlbGVnYXRlZCA/IGhhbmRsZXIgOiBudWxsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGlzTmFtZXNwYWNlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudEV2ZW50IG9mIE9iamVjdC5rZXlzKGV2ZW50cykpIHtcbiAgICAgICAgICByZW1vdmVOYW1lc3BhY2VkSGFuZGxlcnMoZWxlbWVudCwgZXZlbnRzLCBlbGVtZW50RXZlbnQsIG9yaWdpbmFsVHlwZUV2ZW50LnNsaWNlKDEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBba2V5SGFuZGxlcnMsIGV2ZW50XSBvZiBPYmplY3QuZW50cmllcyhzdG9yZUVsZW1lbnRFdmVudCkpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlcktleSA9IGtleUhhbmRsZXJzLnJlcGxhY2Uoc3RyaXBVaWRSZWdleCwgJycpO1xuICAgICAgICBpZiAoIWluTmFtZXNwYWNlIHx8IG9yaWdpbmFsVHlwZUV2ZW50LmluY2x1ZGVzKGhhbmRsZXJLZXkpKSB7XG4gICAgICAgICAgcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgZXZlbnQuY2FsbGFibGUsIGV2ZW50LmRlbGVnYXRpb25TZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRyaWdnZXIoZWxlbWVudCwgZXZlbnQsIGFyZ3MpIHtcbiAgICAgIGlmICh0eXBlb2YgZXZlbnQgIT09ICdzdHJpbmcnIHx8ICFlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3QgJCA9IGdldGpRdWVyeSgpO1xuICAgICAgY29uc3QgdHlwZUV2ZW50ID0gZ2V0VHlwZUV2ZW50KGV2ZW50KTtcbiAgICAgIGNvbnN0IGluTmFtZXNwYWNlID0gZXZlbnQgIT09IHR5cGVFdmVudDtcbiAgICAgIGxldCBqUXVlcnlFdmVudCA9IG51bGw7XG4gICAgICBsZXQgYnViYmxlcyA9IHRydWU7XG4gICAgICBsZXQgbmF0aXZlRGlzcGF0Y2ggPSB0cnVlO1xuICAgICAgbGV0IGRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgIGlmIChpbk5hbWVzcGFjZSAmJiAkKSB7XG4gICAgICAgIGpRdWVyeUV2ZW50ID0gJC5FdmVudChldmVudCwgYXJncyk7XG4gICAgICAgICQoZWxlbWVudCkudHJpZ2dlcihqUXVlcnlFdmVudCk7XG4gICAgICAgIGJ1YmJsZXMgPSAhalF1ZXJ5RXZlbnQuaXNQcm9wYWdhdGlvblN0b3BwZWQoKTtcbiAgICAgICAgbmF0aXZlRGlzcGF0Y2ggPSAhalF1ZXJ5RXZlbnQuaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQoKTtcbiAgICAgICAgZGVmYXVsdFByZXZlbnRlZCA9IGpRdWVyeUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpO1xuICAgICAgfVxuICAgICAgY29uc3QgZXZ0ID0gaHlkcmF0ZU9iaihuZXcgRXZlbnQoZXZlbnQsIHtcbiAgICAgICAgYnViYmxlcyxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgfSksIGFyZ3MpO1xuICAgICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgICBpZiAobmF0aXZlRGlzcGF0Y2gpIHtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICB9XG4gICAgICBpZiAoZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgJiYgalF1ZXJ5RXZlbnQpIHtcbiAgICAgICAgalF1ZXJ5RXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBldnQ7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBoeWRyYXRlT2JqKG9iaiwgbWV0YSA9IHt9KSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMobWV0YSkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgICB9IGNhdGNoIChfdW51c2VkKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgZG9tL21hbmlwdWxhdG9yLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuICBmdW5jdGlvbiBub3JtYWxpemVEYXRhKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSBOdW1iZXIodmFsdWUpLnRvU3RyaW5nKCkpIHtcbiAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbnVsbCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgfSBjYXRjaCAoX3VudXNlZCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBub3JtYWxpemVEYXRhS2V5KGtleSkge1xuICAgIHJldHVybiBrZXkucmVwbGFjZSgvW0EtWl0vZywgY2hyID0+IGAtJHtjaHIudG9Mb3dlckNhc2UoKX1gKTtcbiAgfVxuICBjb25zdCBNYW5pcHVsYXRvciA9IHtcbiAgICBzZXREYXRhQXR0cmlidXRlKGVsZW1lbnQsIGtleSwgdmFsdWUpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGBkYXRhLWJzLSR7bm9ybWFsaXplRGF0YUtleShrZXkpfWAsIHZhbHVlKTtcbiAgICB9LFxuICAgIHJlbW92ZURhdGFBdHRyaWJ1dGUoZWxlbWVudCwga2V5KSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShgZGF0YS1icy0ke25vcm1hbGl6ZURhdGFLZXkoa2V5KX1gKTtcbiAgICB9LFxuICAgIGdldERhdGFBdHRyaWJ1dGVzKGVsZW1lbnQpIHtcbiAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgICBjb25zdCBhdHRyaWJ1dGVzID0ge307XG4gICAgICBjb25zdCBic0tleXMgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoJ2JzJykgJiYgIWtleS5zdGFydHNXaXRoKCdic0NvbmZpZycpKTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGJzS2V5cykge1xuICAgICAgICBsZXQgcHVyZUtleSA9IGtleS5yZXBsYWNlKC9eYnMvLCAnJyk7XG4gICAgICAgIHB1cmVLZXkgPSBwdXJlS2V5LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgcHVyZUtleS5zbGljZSgxLCBwdXJlS2V5Lmxlbmd0aCk7XG4gICAgICAgIGF0dHJpYnV0ZXNbcHVyZUtleV0gPSBub3JtYWxpemVEYXRhKGVsZW1lbnQuZGF0YXNldFtrZXldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuICAgIH0sXG4gICAgZ2V0RGF0YUF0dHJpYnV0ZShlbGVtZW50LCBrZXkpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemVEYXRhKGVsZW1lbnQuZ2V0QXR0cmlidXRlKGBkYXRhLWJzLSR7bm9ybWFsaXplRGF0YUtleShrZXkpfWApKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCB1dGlsL2NvbmZpZy5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBDb25maWcge1xuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGhhdmUgdG8gaW1wbGVtZW50IHRoZSBzdGF0aWMgbWV0aG9kIFwiTkFNRVwiLCBmb3IgZWFjaCBjb21wb25lbnQhJyk7XG4gICAgfVxuICAgIF9nZXRDb25maWcoY29uZmlnKSB7XG4gICAgICBjb25maWcgPSB0aGlzLl9tZXJnZUNvbmZpZ09iaihjb25maWcpO1xuICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpO1xuICAgICAgdGhpcy5fdHlwZUNoZWNrQ29uZmlnKGNvbmZpZyk7XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuICAgIF9tZXJnZUNvbmZpZ09iaihjb25maWcsIGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGpzb25Db25maWcgPSBpc0VsZW1lbnQoZWxlbWVudCkgPyBNYW5pcHVsYXRvci5nZXREYXRhQXR0cmlidXRlKGVsZW1lbnQsICdjb25maWcnKSA6IHt9OyAvLyB0cnkgdG8gcGFyc2VcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGhpcy5jb25zdHJ1Y3Rvci5EZWZhdWx0LFxuICAgICAgICAuLi4odHlwZW9mIGpzb25Db25maWcgPT09ICdvYmplY3QnID8ganNvbkNvbmZpZyA6IHt9KSxcbiAgICAgICAgLi4uKGlzRWxlbWVudChlbGVtZW50KSA/IE1hbmlwdWxhdG9yLmdldERhdGFBdHRyaWJ1dGVzKGVsZW1lbnQpIDoge30pLFxuICAgICAgICAuLi4odHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgPyBjb25maWcgOiB7fSlcbiAgICAgIH07XG4gICAgfVxuICAgIF90eXBlQ2hlY2tDb25maWcoY29uZmlnLCBjb25maWdUeXBlcyA9IHRoaXMuY29uc3RydWN0b3IuRGVmYXVsdFR5cGUpIHtcbiAgICAgIGZvciAoY29uc3QgW3Byb3BlcnR5LCBleHBlY3RlZFR5cGVzXSBvZiBPYmplY3QuZW50cmllcyhjb25maWdUeXBlcykpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb25maWdbcHJvcGVydHldO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSBpc0VsZW1lbnQodmFsdWUpID8gJ2VsZW1lbnQnIDogdG9UeXBlKHZhbHVlKTtcbiAgICAgICAgaWYgKCFuZXcgUmVnRXhwKGV4cGVjdGVkVHlwZXMpLnRlc3QodmFsdWVUeXBlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dGhpcy5jb25zdHJ1Y3Rvci5OQU1FLnRvVXBwZXJDYXNlKCl9OiBPcHRpb24gXCIke3Byb3BlcnR5fVwiIHByb3ZpZGVkIHR5cGUgXCIke3ZhbHVlVHlwZX1cIiBidXQgZXhwZWN0ZWQgdHlwZSBcIiR7ZXhwZWN0ZWRUeXBlc31cIi5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgYmFzZS1jb21wb25lbnQuanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBWRVJTSU9OID0gJzUuMy4zJztcblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBCYXNlQ29tcG9uZW50IGV4dGVuZHMgQ29uZmlnIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICBlbGVtZW50ID0gZ2V0RWxlbWVudChlbGVtZW50KTtcbiAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhjb25maWcpO1xuICAgICAgRGF0YS5zZXQodGhpcy5fZWxlbWVudCwgdGhpcy5jb25zdHJ1Y3Rvci5EQVRBX0tFWSwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgIERhdGEucmVtb3ZlKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuREFUQV9LRVkpO1xuICAgICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLkVWRU5UX0tFWSk7XG4gICAgICBmb3IgKGNvbnN0IHByb3BlcnR5TmFtZSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBfcXVldWVDYWxsYmFjayhjYWxsYmFjaywgZWxlbWVudCwgaXNBbmltYXRlZCA9IHRydWUpIHtcbiAgICAgIGV4ZWN1dGVBZnRlclRyYW5zaXRpb24oY2FsbGJhY2ssIGVsZW1lbnQsIGlzQW5pbWF0ZWQpO1xuICAgIH1cbiAgICBfZ2V0Q29uZmlnKGNvbmZpZykge1xuICAgICAgY29uZmlnID0gdGhpcy5fbWVyZ2VDb25maWdPYmooY29uZmlnLCB0aGlzLl9lbGVtZW50KTtcbiAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKTtcbiAgICAgIHRoaXMuX3R5cGVDaGVja0NvbmZpZyhjb25maWcpO1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICAvLyBTdGF0aWNcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIERhdGEuZ2V0KGdldEVsZW1lbnQoZWxlbWVudCksIHRoaXMuREFUQV9LRVkpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0T3JDcmVhdGVJbnN0YW5jZShlbGVtZW50LCBjb25maWcgPSB7fSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoZWxlbWVudCkgfHwgbmV3IHRoaXMoZWxlbWVudCwgdHlwZW9mIGNvbmZpZyA9PT0gJ29iamVjdCcgPyBjb25maWcgOiBudWxsKTtcbiAgICB9XG4gICAgc3RhdGljIGdldCBWRVJTSU9OKCkge1xuICAgICAgcmV0dXJuIFZFUlNJT047XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgREFUQV9LRVkoKSB7XG4gICAgICByZXR1cm4gYGJzLiR7dGhpcy5OQU1FfWA7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRVZFTlRfS0VZKCkge1xuICAgICAgcmV0dXJuIGAuJHt0aGlzLkRBVEFfS0VZfWA7XG4gICAgfVxuICAgIHN0YXRpYyBldmVudE5hbWUobmFtZSkge1xuICAgICAgcmV0dXJuIGAke25hbWV9JHt0aGlzLkVWRU5UX0tFWX1gO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgZG9tL3NlbGVjdG9yLWVuZ2luZS5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgY29uc3QgZ2V0U2VsZWN0b3IgPSBlbGVtZW50ID0+IHtcbiAgICBsZXQgc2VsZWN0b3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1icy10YXJnZXQnKTtcbiAgICBpZiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yID09PSAnIycpIHtcbiAgICAgIGxldCBocmVmQXR0cmlidXRlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgLy8gVGhlIG9ubHkgdmFsaWQgY29udGVudCB0aGF0IGNvdWxkIGRvdWJsZSBhcyBhIHNlbGVjdG9yIGFyZSBJRHMgb3IgY2xhc3NlcyxcbiAgICAgIC8vIHNvIGV2ZXJ5dGhpbmcgc3RhcnRpbmcgd2l0aCBgI2Agb3IgYC5gLiBJZiBhIFwicmVhbFwiIFVSTCBpcyB1c2VkIGFzIHRoZSBzZWxlY3RvcixcbiAgICAgIC8vIGBkb2N1bWVudC5xdWVyeVNlbGVjdG9yYCB3aWxsIHJpZ2h0ZnVsbHkgY29tcGxhaW4gaXQgaXMgaW52YWxpZC5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzMyMjczXG4gICAgICBpZiAoIWhyZWZBdHRyaWJ1dGUgfHwgIWhyZWZBdHRyaWJ1dGUuaW5jbHVkZXMoJyMnKSAmJiAhaHJlZkF0dHJpYnV0ZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIEp1c3QgaW4gY2FzZSBzb21lIENNUyBwdXRzIG91dCBhIGZ1bGwgVVJMIHdpdGggdGhlIGFuY2hvciBhcHBlbmRlZFxuICAgICAgaWYgKGhyZWZBdHRyaWJ1dGUuaW5jbHVkZXMoJyMnKSAmJiAhaHJlZkF0dHJpYnV0ZS5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgaHJlZkF0dHJpYnV0ZSA9IGAjJHtocmVmQXR0cmlidXRlLnNwbGl0KCcjJylbMV19YDtcbiAgICAgIH1cbiAgICAgIHNlbGVjdG9yID0gaHJlZkF0dHJpYnV0ZSAmJiBocmVmQXR0cmlidXRlICE9PSAnIycgPyBocmVmQXR0cmlidXRlLnRyaW0oKSA6IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RvciA/IHNlbGVjdG9yLnNwbGl0KCcsJykubWFwKHNlbCA9PiBwYXJzZVNlbGVjdG9yKHNlbCkpLmpvaW4oJywnKSA6IG51bGw7XG4gIH07XG4gIGNvbnN0IFNlbGVjdG9yRW5naW5lID0ge1xuICAgIGZpbmQoc2VsZWN0b3IsIGVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoLi4uRWxlbWVudC5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbC5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKSk7XG4gICAgfSxcbiAgICBmaW5kT25lKHNlbGVjdG9yLCBlbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICByZXR1cm4gRWxlbWVudC5wcm90b3R5cGUucXVlcnlTZWxlY3Rvci5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgICB9LFxuICAgIGNoaWxkcmVuKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KC4uLmVsZW1lbnQuY2hpbGRyZW4pLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5tYXRjaGVzKHNlbGVjdG9yKSk7XG4gICAgfSxcbiAgICBwYXJlbnRzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBwYXJlbnRzID0gW107XG4gICAgICBsZXQgYW5jZXN0b3IgPSBlbGVtZW50LnBhcmVudE5vZGUuY2xvc2VzdChzZWxlY3Rvcik7XG4gICAgICB3aGlsZSAoYW5jZXN0b3IpIHtcbiAgICAgICAgcGFyZW50cy5wdXNoKGFuY2VzdG9yKTtcbiAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnROb2RlLmNsb3Nlc3Qoc2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcmVudHM7XG4gICAgfSxcbiAgICBwcmV2KGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgICBsZXQgcHJldmlvdXMgPSBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICB3aGlsZSAocHJldmlvdXMpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgcmV0dXJuIFtwcmV2aW91c107XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBwcmV2aW91cy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0sXG4gICAgLy8gVE9ETzogdGhpcyBpcyBub3cgdW51c2VkOyByZW1vdmUgbGF0ZXIgYWxvbmcgd2l0aCBwcmV2KClcbiAgICBuZXh0KGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgICBsZXQgbmV4dCA9IGVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgd2hpbGUgKG5leHQpIHtcbiAgICAgICAgaWYgKG5leHQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICByZXR1cm4gW25leHRdO1xuICAgICAgICB9XG4gICAgICAgIG5leHQgPSBuZXh0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuICAgIGZvY3VzYWJsZUNoaWxkcmVuKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGZvY3VzYWJsZXMgPSBbJ2EnLCAnYnV0dG9uJywgJ2lucHV0JywgJ3RleHRhcmVhJywgJ3NlbGVjdCcsICdkZXRhaWxzJywgJ1t0YWJpbmRleF0nLCAnW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nXS5tYXAoc2VsZWN0b3IgPT4gYCR7c2VsZWN0b3J9Om5vdChbdGFiaW5kZXhePVwiLVwiXSlgKS5qb2luKCcsJyk7XG4gICAgICByZXR1cm4gdGhpcy5maW5kKGZvY3VzYWJsZXMsIGVsZW1lbnQpLmZpbHRlcihlbCA9PiAhaXNEaXNhYmxlZChlbCkgJiYgaXNWaXNpYmxlKGVsKSk7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RvckZyb21FbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoc2VsZWN0b3IpID8gc2VsZWN0b3IgOiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRFbGVtZW50RnJvbVNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICByZXR1cm4gc2VsZWN0b3IgPyBTZWxlY3RvckVuZ2luZS5maW5kT25lKHNlbGVjdG9yKSA6IG51bGw7XG4gICAgfSxcbiAgICBnZXRNdWx0aXBsZUVsZW1lbnRzRnJvbVNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICByZXR1cm4gc2VsZWN0b3IgPyBTZWxlY3RvckVuZ2luZS5maW5kKHNlbGVjdG9yKSA6IFtdO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHV0aWwvY29tcG9uZW50LWZ1bmN0aW9ucy5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgY29uc3QgZW5hYmxlRGlzbWlzc1RyaWdnZXIgPSAoY29tcG9uZW50LCBtZXRob2QgPSAnaGlkZScpID0+IHtcbiAgICBjb25zdCBjbGlja0V2ZW50ID0gYGNsaWNrLmRpc21pc3Mke2NvbXBvbmVudC5FVkVOVF9LRVl9YDtcbiAgICBjb25zdCBuYW1lID0gY29tcG9uZW50Lk5BTUU7XG4gICAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBjbGlja0V2ZW50LCBgW2RhdGEtYnMtZGlzbWlzcz1cIiR7bmFtZX1cIl1gLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChbJ0EnLCAnQVJFQSddLmluY2x1ZGVzKHRoaXMudGFnTmFtZSkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Rpc2FibGVkKHRoaXMpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRhcmdldCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IodGhpcykgfHwgdGhpcy5jbG9zZXN0KGAuJHtuYW1lfWApO1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBjb21wb25lbnQuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0YXJnZXQpO1xuXG4gICAgICAvLyBNZXRob2QgYXJndW1lbnQgaXMgbGVmdCwgZm9yIEFsZXJ0IGFuZCBvbmx5LCBhcyBpdCBkb2Vzbid0IGltcGxlbWVudCB0aGUgJ2hpZGUnIG1ldGhvZFxuICAgICAgaW5zdGFuY2VbbWV0aG9kXSgpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgYWxlcnQuanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBOQU1FJGYgPSAnYWxlcnQnO1xuICBjb25zdCBEQVRBX0tFWSRhID0gJ2JzLmFsZXJ0JztcbiAgY29uc3QgRVZFTlRfS0VZJGIgPSBgLiR7REFUQV9LRVkkYX1gO1xuICBjb25zdCBFVkVOVF9DTE9TRSA9IGBjbG9zZSR7RVZFTlRfS0VZJGJ9YDtcbiAgY29uc3QgRVZFTlRfQ0xPU0VEID0gYGNsb3NlZCR7RVZFTlRfS0VZJGJ9YDtcbiAgY29uc3QgQ0xBU1NfTkFNRV9GQURFJDUgPSAnZmFkZSc7XG4gIGNvbnN0IENMQVNTX05BTUVfU0hPVyQ4ID0gJ3Nob3cnO1xuXG4gIC8qKlxuICAgKiBDbGFzcyBkZWZpbml0aW9uXG4gICAqL1xuXG4gIGNsYXNzIEFsZXJ0IGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJGY7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgY2xvc2UoKSB7XG4gICAgICBjb25zdCBjbG9zZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfQ0xPU0UpO1xuICAgICAgaWYgKGNsb3NlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XJDgpO1xuICAgICAgY29uc3QgaXNBbmltYXRlZCA9IHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfRkFERSQ1KTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soKCkgPT4gdGhpcy5fZGVzdHJveUVsZW1lbnQoKSwgdGhpcy5fZWxlbWVudCwgaXNBbmltYXRlZCk7XG4gICAgfVxuXG4gICAgLy8gUHJpdmF0ZVxuICAgIF9kZXN0cm95RWxlbWVudCgpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlKCk7XG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9DTE9TRUQpO1xuICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gU3RhdGljXG4gICAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gQWxlcnQuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0aGlzKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhW2NvbmZpZ10gPT09IHVuZGVmaW5lZCB8fCBjb25maWcuc3RhcnRzV2l0aCgnXycpIHx8IGNvbmZpZyA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtjb25maWddKHRoaXMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIGVuYWJsZURpc21pc3NUcmlnZ2VyKEFsZXJ0LCAnY2xvc2UnKTtcblxuICAvKipcbiAgICogalF1ZXJ5XG4gICAqL1xuXG4gIGRlZmluZUpRdWVyeVBsdWdpbihBbGVydCk7XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCBidXR0b24uanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBOQU1FJGUgPSAnYnV0dG9uJztcbiAgY29uc3QgREFUQV9LRVkkOSA9ICdicy5idXR0b24nO1xuICBjb25zdCBFVkVOVF9LRVkkYSA9IGAuJHtEQVRBX0tFWSQ5fWA7XG4gIGNvbnN0IERBVEFfQVBJX0tFWSQ2ID0gJy5kYXRhLWFwaSc7XG4gIGNvbnN0IENMQVNTX05BTUVfQUNUSVZFJDMgPSAnYWN0aXZlJztcbiAgY29uc3QgU0VMRUNUT1JfREFUQV9UT0dHTEUkNSA9ICdbZGF0YS1icy10b2dnbGU9XCJidXR0b25cIl0nO1xuICBjb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSQ2ID0gYGNsaWNrJHtFVkVOVF9LRVkkYX0ke0RBVEFfQVBJX0tFWSQ2fWA7XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgQnV0dG9uIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJGU7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgdG9nZ2xlKCkge1xuICAgICAgLy8gVG9nZ2xlIGNsYXNzIGFuZCBzeW5jIHRoZSBgYXJpYS1wcmVzc2VkYCBhdHRyaWJ1dGUgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBgLnRvZ2dsZSgpYCBtZXRob2RcbiAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoQ0xBU1NfTkFNRV9BQ1RJVkUkMykpO1xuICAgIH1cblxuICAgIC8vIFN0YXRpY1xuICAgIHN0YXRpYyBqUXVlcnlJbnRlcmZhY2UoY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEJ1dHRvbi5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMpO1xuICAgICAgICBpZiAoY29uZmlnID09PSAndG9nZ2xlJykge1xuICAgICAgICAgIGRhdGFbY29uZmlnXSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAgICovXG5cbiAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9DTElDS19EQVRBX0FQSSQ2LCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSQ1LCBldmVudCA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBidXR0b24gPSBldmVudC50YXJnZXQuY2xvc2VzdChTRUxFQ1RPUl9EQVRBX1RPR0dMRSQ1KTtcbiAgICBjb25zdCBkYXRhID0gQnV0dG9uLmdldE9yQ3JlYXRlSW5zdGFuY2UoYnV0dG9uKTtcbiAgICBkYXRhLnRvZ2dsZSgpO1xuICB9KTtcblxuICAvKipcbiAgICogalF1ZXJ5XG4gICAqL1xuXG4gIGRlZmluZUpRdWVyeVBsdWdpbihCdXR0b24pO1xuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgdXRpbC9zd2lwZS5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IE5BTUUkZCA9ICdzd2lwZSc7XG4gIGNvbnN0IEVWRU5UX0tFWSQ5ID0gJy5icy5zd2lwZSc7XG4gIGNvbnN0IEVWRU5UX1RPVUNIU1RBUlQgPSBgdG91Y2hzdGFydCR7RVZFTlRfS0VZJDl9YDtcbiAgY29uc3QgRVZFTlRfVE9VQ0hNT1ZFID0gYHRvdWNobW92ZSR7RVZFTlRfS0VZJDl9YDtcbiAgY29uc3QgRVZFTlRfVE9VQ0hFTkQgPSBgdG91Y2hlbmQke0VWRU5UX0tFWSQ5fWA7XG4gIGNvbnN0IEVWRU5UX1BPSU5URVJET1dOID0gYHBvaW50ZXJkb3duJHtFVkVOVF9LRVkkOX1gO1xuICBjb25zdCBFVkVOVF9QT0lOVEVSVVAgPSBgcG9pbnRlcnVwJHtFVkVOVF9LRVkkOX1gO1xuICBjb25zdCBQT0lOVEVSX1RZUEVfVE9VQ0ggPSAndG91Y2gnO1xuICBjb25zdCBQT0lOVEVSX1RZUEVfUEVOID0gJ3Blbic7XG4gIGNvbnN0IENMQVNTX05BTUVfUE9JTlRFUl9FVkVOVCA9ICdwb2ludGVyLWV2ZW50JztcbiAgY29uc3QgU1dJUEVfVEhSRVNIT0xEID0gNDA7XG4gIGNvbnN0IERlZmF1bHQkYyA9IHtcbiAgICBlbmRDYWxsYmFjazogbnVsbCxcbiAgICBsZWZ0Q2FsbGJhY2s6IG51bGwsXG4gICAgcmlnaHRDYWxsYmFjazogbnVsbFxuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSRjID0ge1xuICAgIGVuZENhbGxiYWNrOiAnKGZ1bmN0aW9ufG51bGwpJyxcbiAgICBsZWZ0Q2FsbGJhY2s6ICcoZnVuY3Rpb258bnVsbCknLFxuICAgIHJpZ2h0Q2FsbGJhY2s6ICcoZnVuY3Rpb258bnVsbCknXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgU3dpcGUgZXh0ZW5kcyBDb25maWcge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNvbmZpZykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgaWYgKCFlbGVtZW50IHx8ICFTd2lwZS5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhjb25maWcpO1xuICAgICAgdGhpcy5fZGVsdGFYID0gMDtcbiAgICAgIHRoaXMuX3N1cHBvcnRQb2ludGVyRXZlbnRzID0gQm9vbGVhbih3aW5kb3cuUG9pbnRlckV2ZW50KTtcbiAgICAgIHRoaXMuX2luaXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICAvLyBHZXR0ZXJzXG4gICAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgICAgcmV0dXJuIERlZmF1bHQkYztcbiAgICB9XG4gICAgc3RhdGljIGdldCBEZWZhdWx0VHlwZSgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0VHlwZSRjO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IE5BTUUoKSB7XG4gICAgICByZXR1cm4gTkFNRSRkO1xuICAgIH1cblxuICAgIC8vIFB1YmxpY1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICBFdmVudEhhbmRsZXIub2ZmKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0tFWSQ5KTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX3N0YXJ0KGV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuX3N1cHBvcnRQb2ludGVyRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2RlbHRhWCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2V2ZW50SXNQb2ludGVyUGVuVG91Y2goZXZlbnQpKSB7XG4gICAgICAgIHRoaXMuX2RlbHRhWCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICB9XG4gICAgfVxuICAgIF9lbmQoZXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLl9ldmVudElzUG9pbnRlclBlblRvdWNoKGV2ZW50KSkge1xuICAgICAgICB0aGlzLl9kZWx0YVggPSBldmVudC5jbGllbnRYIC0gdGhpcy5fZGVsdGFYO1xuICAgICAgfVxuICAgICAgdGhpcy5faGFuZGxlU3dpcGUoKTtcbiAgICAgIGV4ZWN1dGUodGhpcy5fY29uZmlnLmVuZENhbGxiYWNrKTtcbiAgICB9XG4gICAgX21vdmUoZXZlbnQpIHtcbiAgICAgIHRoaXMuX2RlbHRhWCA9IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID8gMCA6IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCAtIHRoaXMuX2RlbHRhWDtcbiAgICB9XG4gICAgX2hhbmRsZVN3aXBlKCkge1xuICAgICAgY29uc3QgYWJzRGVsdGFYID0gTWF0aC5hYnModGhpcy5fZGVsdGFYKTtcbiAgICAgIGlmIChhYnNEZWx0YVggPD0gU1dJUEVfVEhSRVNIT0xEKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGFic0RlbHRhWCAvIHRoaXMuX2RlbHRhWDtcbiAgICAgIHRoaXMuX2RlbHRhWCA9IDA7XG4gICAgICBpZiAoIWRpcmVjdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBleGVjdXRlKGRpcmVjdGlvbiA+IDAgPyB0aGlzLl9jb25maWcucmlnaHRDYWxsYmFjayA6IHRoaXMuX2NvbmZpZy5sZWZ0Q2FsbGJhY2spO1xuICAgIH1cbiAgICBfaW5pdEV2ZW50cygpIHtcbiAgICAgIGlmICh0aGlzLl9zdXBwb3J0UG9pbnRlckV2ZW50cykge1xuICAgICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfUE9JTlRFUkRPV04sIGV2ZW50ID0+IHRoaXMuX3N0YXJ0KGV2ZW50KSk7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9QT0lOVEVSVVAsIGV2ZW50ID0+IHRoaXMuX2VuZChldmVudCkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9QT0lOVEVSX0VWRU5UKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9UT1VDSFNUQVJULCBldmVudCA9PiB0aGlzLl9zdGFydChldmVudCkpO1xuICAgICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfVE9VQ0hNT1ZFLCBldmVudCA9PiB0aGlzLl9tb3ZlKGV2ZW50KSk7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9UT1VDSEVORCwgZXZlbnQgPT4gdGhpcy5fZW5kKGV2ZW50KSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9ldmVudElzUG9pbnRlclBlblRvdWNoKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3VwcG9ydFBvaW50ZXJFdmVudHMgJiYgKGV2ZW50LnBvaW50ZXJUeXBlID09PSBQT0lOVEVSX1RZUEVfUEVOIHx8IGV2ZW50LnBvaW50ZXJUeXBlID09PSBQT0lOVEVSX1RZUEVfVE9VQ0gpO1xuICAgIH1cblxuICAgIC8vIFN0YXRpY1xuICAgIHN0YXRpYyBpc1N1cHBvcnRlZCgpIHtcbiAgICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIGNhcm91c2VsLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSRjID0gJ2Nhcm91c2VsJztcbiAgY29uc3QgREFUQV9LRVkkOCA9ICdicy5jYXJvdXNlbCc7XG4gIGNvbnN0IEVWRU5UX0tFWSQ4ID0gYC4ke0RBVEFfS0VZJDh9YDtcbiAgY29uc3QgREFUQV9BUElfS0VZJDUgPSAnLmRhdGEtYXBpJztcbiAgY29uc3QgQVJST1dfTEVGVF9LRVkkMSA9ICdBcnJvd0xlZnQnO1xuICBjb25zdCBBUlJPV19SSUdIVF9LRVkkMSA9ICdBcnJvd1JpZ2h0JztcbiAgY29uc3QgVE9VQ0hFVkVOVF9DT01QQVRfV0FJVCA9IDUwMDsgLy8gVGltZSBmb3IgbW91c2UgY29tcGF0IGV2ZW50cyB0byBmaXJlIGFmdGVyIHRvdWNoXG5cbiAgY29uc3QgT1JERVJfTkVYVCA9ICduZXh0JztcbiAgY29uc3QgT1JERVJfUFJFViA9ICdwcmV2JztcbiAgY29uc3QgRElSRUNUSU9OX0xFRlQgPSAnbGVmdCc7XG4gIGNvbnN0IERJUkVDVElPTl9SSUdIVCA9ICdyaWdodCc7XG4gIGNvbnN0IEVWRU5UX1NMSURFID0gYHNsaWRlJHtFVkVOVF9LRVkkOH1gO1xuICBjb25zdCBFVkVOVF9TTElEID0gYHNsaWQke0VWRU5UX0tFWSQ4fWA7XG4gIGNvbnN0IEVWRU5UX0tFWURPV04kMSA9IGBrZXlkb3duJHtFVkVOVF9LRVkkOH1gO1xuICBjb25zdCBFVkVOVF9NT1VTRUVOVEVSJDEgPSBgbW91c2VlbnRlciR7RVZFTlRfS0VZJDh9YDtcbiAgY29uc3QgRVZFTlRfTU9VU0VMRUFWRSQxID0gYG1vdXNlbGVhdmUke0VWRU5UX0tFWSQ4fWA7XG4gIGNvbnN0IEVWRU5UX0RSQUdfU1RBUlQgPSBgZHJhZ3N0YXJ0JHtFVkVOVF9LRVkkOH1gO1xuICBjb25zdCBFVkVOVF9MT0FEX0RBVEFfQVBJJDMgPSBgbG9hZCR7RVZFTlRfS0VZJDh9JHtEQVRBX0FQSV9LRVkkNX1gO1xuICBjb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSQ1ID0gYGNsaWNrJHtFVkVOVF9LRVkkOH0ke0RBVEFfQVBJX0tFWSQ1fWA7XG4gIGNvbnN0IENMQVNTX05BTUVfQ0FST1VTRUwgPSAnY2Fyb3VzZWwnO1xuICBjb25zdCBDTEFTU19OQU1FX0FDVElWRSQyID0gJ2FjdGl2ZSc7XG4gIGNvbnN0IENMQVNTX05BTUVfU0xJREUgPSAnc2xpZGUnO1xuICBjb25zdCBDTEFTU19OQU1FX0VORCA9ICdjYXJvdXNlbC1pdGVtLWVuZCc7XG4gIGNvbnN0IENMQVNTX05BTUVfU1RBUlQgPSAnY2Fyb3VzZWwtaXRlbS1zdGFydCc7XG4gIGNvbnN0IENMQVNTX05BTUVfTkVYVCA9ICdjYXJvdXNlbC1pdGVtLW5leHQnO1xuICBjb25zdCBDTEFTU19OQU1FX1BSRVYgPSAnY2Fyb3VzZWwtaXRlbS1wcmV2JztcbiAgY29uc3QgU0VMRUNUT1JfQUNUSVZFID0gJy5hY3RpdmUnO1xuICBjb25zdCBTRUxFQ1RPUl9JVEVNID0gJy5jYXJvdXNlbC1pdGVtJztcbiAgY29uc3QgU0VMRUNUT1JfQUNUSVZFX0lURU0gPSBTRUxFQ1RPUl9BQ1RJVkUgKyBTRUxFQ1RPUl9JVEVNO1xuICBjb25zdCBTRUxFQ1RPUl9JVEVNX0lNRyA9ICcuY2Fyb3VzZWwtaXRlbSBpbWcnO1xuICBjb25zdCBTRUxFQ1RPUl9JTkRJQ0FUT1JTID0gJy5jYXJvdXNlbC1pbmRpY2F0b3JzJztcbiAgY29uc3QgU0VMRUNUT1JfREFUQV9TTElERSA9ICdbZGF0YS1icy1zbGlkZV0sIFtkYXRhLWJzLXNsaWRlLXRvXSc7XG4gIGNvbnN0IFNFTEVDVE9SX0RBVEFfUklERSA9ICdbZGF0YS1icy1yaWRlPVwiY2Fyb3VzZWxcIl0nO1xuICBjb25zdCBLRVlfVE9fRElSRUNUSU9OID0ge1xuICAgIFtBUlJPV19MRUZUX0tFWSQxXTogRElSRUNUSU9OX1JJR0hULFxuICAgIFtBUlJPV19SSUdIVF9LRVkkMV06IERJUkVDVElPTl9MRUZUXG4gIH07XG4gIGNvbnN0IERlZmF1bHQkYiA9IHtcbiAgICBpbnRlcnZhbDogNTAwMCxcbiAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICBwYXVzZTogJ2hvdmVyJyxcbiAgICByaWRlOiBmYWxzZSxcbiAgICB0b3VjaDogdHJ1ZSxcbiAgICB3cmFwOiB0cnVlXG4gIH07XG4gIGNvbnN0IERlZmF1bHRUeXBlJGIgPSB7XG4gICAgaW50ZXJ2YWw6ICcobnVtYmVyfGJvb2xlYW4pJyxcbiAgICAvLyBUT0RPOnY2IHJlbW92ZSBib29sZWFuIHN1cHBvcnRcbiAgICBrZXlib2FyZDogJ2Jvb2xlYW4nLFxuICAgIHBhdXNlOiAnKHN0cmluZ3xib29sZWFuKScsXG4gICAgcmlkZTogJyhib29sZWFufHN0cmluZyknLFxuICAgIHRvdWNoOiAnYm9vbGVhbicsXG4gICAgd3JhcDogJ2Jvb2xlYW4nXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgQ2Fyb3VzZWwgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbmZpZyk7XG4gICAgICB0aGlzLl9pbnRlcnZhbCA9IG51bGw7XG4gICAgICB0aGlzLl9hY3RpdmVFbGVtZW50ID0gbnVsbDtcbiAgICAgIHRoaXMuX2lzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy50b3VjaFRpbWVvdXQgPSBudWxsO1xuICAgICAgdGhpcy5fc3dpcGVIZWxwZXIgPSBudWxsO1xuICAgICAgdGhpcy5faW5kaWNhdG9yc0VsZW1lbnQgPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0lORElDQVRPUlMsIHRoaXMuX2VsZW1lbnQpO1xuICAgICAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIGlmICh0aGlzLl9jb25maWcucmlkZSA9PT0gQ0xBU1NfTkFNRV9DQVJPVVNFTCkge1xuICAgICAgICB0aGlzLmN5Y2xlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0JGI7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdFR5cGUkYjtcbiAgICB9XG4gICAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgICAgcmV0dXJuIE5BTUUkYztcbiAgICB9XG5cbiAgICAvLyBQdWJsaWNcbiAgICBuZXh0KCkge1xuICAgICAgdGhpcy5fc2xpZGUoT1JERVJfTkVYVCk7XG4gICAgfVxuICAgIG5leHRXaGVuVmlzaWJsZSgpIHtcbiAgICAgIC8vIEZJWE1FIFRPRE8gdXNlIGBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGVgXG4gICAgICAvLyBEb24ndCBjYWxsIG5leHQgd2hlbiB0aGUgcGFnZSBpc24ndCB2aXNpYmxlXG4gICAgICAvLyBvciB0aGUgY2Fyb3VzZWwgb3IgaXRzIHBhcmVudCBpc24ndCB2aXNpYmxlXG4gICAgICBpZiAoIWRvY3VtZW50LmhpZGRlbiAmJiBpc1Zpc2libGUodGhpcy5fZWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHByZXYoKSB7XG4gICAgICB0aGlzLl9zbGlkZShPUkRFUl9QUkVWKTtcbiAgICB9XG4gICAgcGF1c2UoKSB7XG4gICAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICAgIHRyaWdnZXJUcmFuc2l0aW9uRW5kKHRoaXMuX2VsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXJJbnRlcnZhbCgpO1xuICAgIH1cbiAgICBjeWNsZSgpIHtcbiAgICAgIHRoaXMuX2NsZWFySW50ZXJ2YWwoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUludGVydmFsKCk7XG4gICAgICB0aGlzLl9pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHRoaXMubmV4dFdoZW5WaXNpYmxlKCksIHRoaXMuX2NvbmZpZy5pbnRlcnZhbCk7XG4gICAgfVxuICAgIF9tYXliZUVuYWJsZUN5Y2xlKCkge1xuICAgICAgaWYgKCF0aGlzLl9jb25maWcucmlkZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbmUodGhpcy5fZWxlbWVudCwgRVZFTlRfU0xJRCwgKCkgPT4gdGhpcy5jeWNsZSgpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5jeWNsZSgpO1xuICAgIH1cbiAgICB0byhpbmRleCkge1xuICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLl9nZXRJdGVtcygpO1xuICAgICAgaWYgKGluZGV4ID4gaXRlbXMubGVuZ3RoIC0gMSB8fCBpbmRleCA8IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2lzU2xpZGluZykge1xuICAgICAgICBFdmVudEhhbmRsZXIub25lKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NMSUQsICgpID0+IHRoaXMudG8oaW5kZXgpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aXZlSW5kZXggPSB0aGlzLl9nZXRJdGVtSW5kZXgodGhpcy5fZ2V0QWN0aXZlKCkpO1xuICAgICAgaWYgKGFjdGl2ZUluZGV4ID09PSBpbmRleCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBvcmRlciA9IGluZGV4ID4gYWN0aXZlSW5kZXggPyBPUkRFUl9ORVhUIDogT1JERVJfUFJFVjtcbiAgICAgIHRoaXMuX3NsaWRlKG9yZGVyLCBpdGVtc1tpbmRleF0pO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgaWYgKHRoaXMuX3N3aXBlSGVscGVyKSB7XG4gICAgICAgIHRoaXMuX3N3aXBlSGVscGVyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKSB7XG4gICAgICBjb25maWcuZGVmYXVsdEludGVydmFsID0gY29uZmlnLmludGVydmFsO1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gICAgX2FkZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgaWYgKHRoaXMuX2NvbmZpZy5rZXlib2FyZCkge1xuICAgICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfS0VZRE9XTiQxLCBldmVudCA9PiB0aGlzLl9rZXlkb3duKGV2ZW50KSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uZmlnLnBhdXNlID09PSAnaG92ZXInKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRUVOVEVSJDEsICgpID0+IHRoaXMucGF1c2UoKSk7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRUxFQVZFJDEsICgpID0+IHRoaXMuX21heWJlRW5hYmxlQ3ljbGUoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uZmlnLnRvdWNoICYmIFN3aXBlLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgdGhpcy5fYWRkVG91Y2hFdmVudExpc3RlbmVycygpO1xuICAgICAgfVxuICAgIH1cbiAgICBfYWRkVG91Y2hFdmVudExpc3RlbmVycygpIHtcbiAgICAgIGZvciAoY29uc3QgaW1nIG9mIFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfSVRFTV9JTUcsIHRoaXMuX2VsZW1lbnQpKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vbihpbWcsIEVWRU5UX0RSQUdfU1RBUlQsIGV2ZW50ID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgZW5kQ2FsbEJhY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jb25maWcucGF1c2UgIT09ICdob3ZlcicpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBpdCdzIGEgdG91Y2gtZW5hYmxlZCBkZXZpY2UsIG1vdXNlZW50ZXIvbGVhdmUgYXJlIGZpcmVkIGFzXG4gICAgICAgIC8vIHBhcnQgb2YgdGhlIG1vdXNlIGNvbXBhdGliaWxpdHkgZXZlbnRzIG9uIGZpcnN0IHRhcCAtIHRoZSBjYXJvdXNlbFxuICAgICAgICAvLyB3b3VsZCBzdG9wIGN5Y2xpbmcgdW50aWwgdXNlciB0YXBwZWQgb3V0IG9mIGl0O1xuICAgICAgICAvLyBoZXJlLCB3ZSBsaXN0ZW4gZm9yIHRvdWNoZW5kLCBleHBsaWNpdGx5IHBhdXNlIHRoZSBjYXJvdXNlbFxuICAgICAgICAvLyAoYXMgaWYgaXQncyB0aGUgc2Vjb25kIHRpbWUgd2UgdGFwIG9uIGl0LCBtb3VzZWVudGVyIGNvbXBhdCBldmVudFxuICAgICAgICAvLyBpcyBOT1QgZmlyZWQpIGFuZCBhZnRlciBhIHRpbWVvdXQgKHRvIGFsbG93IGZvciBtb3VzZSBjb21wYXRpYmlsaXR5XG4gICAgICAgIC8vIGV2ZW50cyB0byBmaXJlKSB3ZSBleHBsaWNpdGx5IHJlc3RhcnQgY3ljbGluZ1xuXG4gICAgICAgIHRoaXMucGF1c2UoKTtcbiAgICAgICAgaWYgKHRoaXMudG91Y2hUaW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG91Y2hUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRvdWNoVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fbWF5YmVFbmFibGVDeWNsZSgpLCBUT1VDSEVWRU5UX0NPTVBBVF9XQUlUICsgdGhpcy5fY29uZmlnLmludGVydmFsKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzd2lwZUNvbmZpZyA9IHtcbiAgICAgICAgbGVmdENhbGxiYWNrOiAoKSA9PiB0aGlzLl9zbGlkZSh0aGlzLl9kaXJlY3Rpb25Ub09yZGVyKERJUkVDVElPTl9MRUZUKSksXG4gICAgICAgIHJpZ2h0Q2FsbGJhY2s6ICgpID0+IHRoaXMuX3NsaWRlKHRoaXMuX2RpcmVjdGlvblRvT3JkZXIoRElSRUNUSU9OX1JJR0hUKSksXG4gICAgICAgIGVuZENhbGxiYWNrOiBlbmRDYWxsQmFja1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3N3aXBlSGVscGVyID0gbmV3IFN3aXBlKHRoaXMuX2VsZW1lbnQsIHN3aXBlQ29uZmlnKTtcbiAgICB9XG4gICAgX2tleWRvd24oZXZlbnQpIHtcbiAgICAgIGlmICgvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGV2ZW50LnRhcmdldC50YWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaXJlY3Rpb24gPSBLRVlfVE9fRElSRUNUSU9OW2V2ZW50LmtleV07XG4gICAgICBpZiAoZGlyZWN0aW9uKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX3NsaWRlKHRoaXMuX2RpcmVjdGlvblRvT3JkZXIoZGlyZWN0aW9uKSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9nZXRJdGVtSW5kZXgoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEl0ZW1zKCkuaW5kZXhPZihlbGVtZW50KTtcbiAgICB9XG4gICAgX3NldEFjdGl2ZUluZGljYXRvckVsZW1lbnQoaW5kZXgpIHtcbiAgICAgIGlmICghdGhpcy5faW5kaWNhdG9yc0VsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aXZlSW5kaWNhdG9yID0gU2VsZWN0b3JFbmdpbmUuZmluZE9uZShTRUxFQ1RPUl9BQ1RJVkUsIHRoaXMuX2luZGljYXRvcnNFbGVtZW50KTtcbiAgICAgIGFjdGl2ZUluZGljYXRvci5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQUNUSVZFJDIpO1xuICAgICAgYWN0aXZlSW5kaWNhdG9yLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50Jyk7XG4gICAgICBjb25zdCBuZXdBY3RpdmVJbmRpY2F0b3IgPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKGBbZGF0YS1icy1zbGlkZS10bz1cIiR7aW5kZXh9XCJdYCwgdGhpcy5faW5kaWNhdG9yc0VsZW1lbnQpO1xuICAgICAgaWYgKG5ld0FjdGl2ZUluZGljYXRvcikge1xuICAgICAgICBuZXdBY3RpdmVJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0FDVElWRSQyKTtcbiAgICAgICAgbmV3QWN0aXZlSW5kaWNhdG9yLnNldEF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50JywgJ3RydWUnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3VwZGF0ZUludGVydmFsKCkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2FjdGl2ZUVsZW1lbnQgfHwgdGhpcy5fZ2V0QWN0aXZlKCk7XG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZWxlbWVudEludGVydmFsID0gTnVtYmVyLnBhcnNlSW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJzLWludGVydmFsJyksIDEwKTtcbiAgICAgIHRoaXMuX2NvbmZpZy5pbnRlcnZhbCA9IGVsZW1lbnRJbnRlcnZhbCB8fCB0aGlzLl9jb25maWcuZGVmYXVsdEludGVydmFsO1xuICAgIH1cbiAgICBfc2xpZGUob3JkZXIsIGVsZW1lbnQgPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLl9nZXRBY3RpdmUoKTtcbiAgICAgIGNvbnN0IGlzTmV4dCA9IG9yZGVyID09PSBPUkRFUl9ORVhUO1xuICAgICAgY29uc3QgbmV4dEVsZW1lbnQgPSBlbGVtZW50IHx8IGdldE5leHRBY3RpdmVFbGVtZW50KHRoaXMuX2dldEl0ZW1zKCksIGFjdGl2ZUVsZW1lbnQsIGlzTmV4dCwgdGhpcy5fY29uZmlnLndyYXApO1xuICAgICAgaWYgKG5leHRFbGVtZW50ID09PSBhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHRFbGVtZW50SW5kZXggPSB0aGlzLl9nZXRJdGVtSW5kZXgobmV4dEVsZW1lbnQpO1xuICAgICAgY29uc3QgdHJpZ2dlckV2ZW50ID0gZXZlbnROYW1lID0+IHtcbiAgICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIGV2ZW50TmFtZSwge1xuICAgICAgICAgIHJlbGF0ZWRUYXJnZXQ6IG5leHRFbGVtZW50LFxuICAgICAgICAgIGRpcmVjdGlvbjogdGhpcy5fb3JkZXJUb0RpcmVjdGlvbihvcmRlciksXG4gICAgICAgICAgZnJvbTogdGhpcy5fZ2V0SXRlbUluZGV4KGFjdGl2ZUVsZW1lbnQpLFxuICAgICAgICAgIHRvOiBuZXh0RWxlbWVudEluZGV4XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHNsaWRlRXZlbnQgPSB0cmlnZ2VyRXZlbnQoRVZFTlRfU0xJREUpO1xuICAgICAgaWYgKHNsaWRlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIWFjdGl2ZUVsZW1lbnQgfHwgIW5leHRFbGVtZW50KSB7XG4gICAgICAgIC8vIFNvbWUgd2VpcmRuZXNzIGlzIGhhcHBlbmluZywgc28gd2UgYmFpbFxuICAgICAgICAvLyBUT0RPOiBjaGFuZ2UgdGVzdHMgdGhhdCB1c2UgZW1wdHkgZGl2cyB0byBhdm9pZCB0aGlzIGNoZWNrXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzQ3ljbGluZyA9IEJvb2xlYW4odGhpcy5faW50ZXJ2YWwpO1xuICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgdGhpcy5faXNTbGlkaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3NldEFjdGl2ZUluZGljYXRvckVsZW1lbnQobmV4dEVsZW1lbnRJbmRleCk7XG4gICAgICB0aGlzLl9hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnQ7XG4gICAgICBjb25zdCBkaXJlY3Rpb25hbENsYXNzTmFtZSA9IGlzTmV4dCA/IENMQVNTX05BTUVfU1RBUlQgOiBDTEFTU19OQU1FX0VORDtcbiAgICAgIGNvbnN0IG9yZGVyQ2xhc3NOYW1lID0gaXNOZXh0ID8gQ0xBU1NfTkFNRV9ORVhUIDogQ0xBU1NfTkFNRV9QUkVWO1xuICAgICAgbmV4dEVsZW1lbnQuY2xhc3NMaXN0LmFkZChvcmRlckNsYXNzTmFtZSk7XG4gICAgICByZWZsb3cobmV4dEVsZW1lbnQpO1xuICAgICAgYWN0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGRpcmVjdGlvbmFsQ2xhc3NOYW1lKTtcbiAgICAgIG5leHRFbGVtZW50LmNsYXNzTGlzdC5hZGQoZGlyZWN0aW9uYWxDbGFzc05hbWUpO1xuICAgICAgY29uc3QgY29tcGxldGVDYWxsQmFjayA9ICgpID0+IHtcbiAgICAgICAgbmV4dEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShkaXJlY3Rpb25hbENsYXNzTmFtZSwgb3JkZXJDbGFzc05hbWUpO1xuICAgICAgICBuZXh0RWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQUNUSVZFJDIpO1xuICAgICAgICBhY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9BQ1RJVkUkMiwgb3JkZXJDbGFzc05hbWUsIGRpcmVjdGlvbmFsQ2xhc3NOYW1lKTtcbiAgICAgICAgdGhpcy5faXNTbGlkaW5nID0gZmFsc2U7XG4gICAgICAgIHRyaWdnZXJFdmVudChFVkVOVF9TTElEKTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlQ2FsbEJhY2ssIGFjdGl2ZUVsZW1lbnQsIHRoaXMuX2lzQW5pbWF0ZWQoKSk7XG4gICAgICBpZiAoaXNDeWNsaW5nKSB7XG4gICAgICAgIHRoaXMuY3ljbGUoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2lzQW5pbWF0ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TTElERSk7XG4gICAgfVxuICAgIF9nZXRBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gU2VsZWN0b3JFbmdpbmUuZmluZE9uZShTRUxFQ1RPUl9BQ1RJVkVfSVRFTSwgdGhpcy5fZWxlbWVudCk7XG4gICAgfVxuICAgIF9nZXRJdGVtcygpIHtcbiAgICAgIHJldHVybiBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX0lURU0sIHRoaXMuX2VsZW1lbnQpO1xuICAgIH1cbiAgICBfY2xlYXJJbnRlcnZhbCgpIHtcbiAgICAgIGlmICh0aGlzLl9pbnRlcnZhbCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsKTtcbiAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBfZGlyZWN0aW9uVG9PcmRlcihkaXJlY3Rpb24pIHtcbiAgICAgIGlmIChpc1JUTCgpKSB7XG4gICAgICAgIHJldHVybiBkaXJlY3Rpb24gPT09IERJUkVDVElPTl9MRUZUID8gT1JERVJfUFJFViA6IE9SREVSX05FWFQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGlyZWN0aW9uID09PSBESVJFQ1RJT05fTEVGVCA/IE9SREVSX05FWFQgOiBPUkRFUl9QUkVWO1xuICAgIH1cbiAgICBfb3JkZXJUb0RpcmVjdGlvbihvcmRlcikge1xuICAgICAgaWYgKGlzUlRMKCkpIHtcbiAgICAgICAgcmV0dXJuIG9yZGVyID09PSBPUkRFUl9QUkVWID8gRElSRUNUSU9OX0xFRlQgOiBESVJFQ1RJT05fUklHSFQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JkZXIgPT09IE9SREVSX1BSRVYgPyBESVJFQ1RJT05fUklHSFQgOiBESVJFQ1RJT05fTEVGVDtcbiAgICB9XG5cbiAgICAvLyBTdGF0aWNcbiAgICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBDYXJvdXNlbC5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGRhdGEudG8oY29uZmlnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKGRhdGFbY29uZmlnXSA9PT0gdW5kZWZpbmVkIHx8IGNvbmZpZy5zdGFydHNXaXRoKCdfJykgfHwgY29uZmlnID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhW2NvbmZpZ10oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkNSwgU0VMRUNUT1JfREFUQV9TTElERSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3Rvcih0aGlzKTtcbiAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0NBUk9VU0VMKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGNhcm91c2VsID0gQ2Fyb3VzZWwuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0YXJnZXQpO1xuICAgIGNvbnN0IHNsaWRlSW5kZXggPSB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1icy1zbGlkZS10bycpO1xuICAgIGlmIChzbGlkZUluZGV4KSB7XG4gICAgICBjYXJvdXNlbC50byhzbGlkZUluZGV4KTtcbiAgICAgIGNhcm91c2VsLl9tYXliZUVuYWJsZUN5Y2xlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChNYW5pcHVsYXRvci5nZXREYXRhQXR0cmlidXRlKHRoaXMsICdzbGlkZScpID09PSAnbmV4dCcpIHtcbiAgICAgIGNhcm91c2VsLm5leHQoKTtcbiAgICAgIGNhcm91c2VsLl9tYXliZUVuYWJsZUN5Y2xlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNhcm91c2VsLnByZXYoKTtcbiAgICBjYXJvdXNlbC5fbWF5YmVFbmFibGVDeWNsZSgpO1xuICB9KTtcbiAgRXZlbnRIYW5kbGVyLm9uKHdpbmRvdywgRVZFTlRfTE9BRF9EQVRBX0FQSSQzLCAoKSA9PiB7XG4gICAgY29uc3QgY2Fyb3VzZWxzID0gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1JJREUpO1xuICAgIGZvciAoY29uc3QgY2Fyb3VzZWwgb2YgY2Fyb3VzZWxzKSB7XG4gICAgICBDYXJvdXNlbC5nZXRPckNyZWF0ZUluc3RhbmNlKGNhcm91c2VsKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBqUXVlcnlcbiAgICovXG5cbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luKENhcm91c2VsKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIGNvbGxhcHNlLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSRiID0gJ2NvbGxhcHNlJztcbiAgY29uc3QgREFUQV9LRVkkNyA9ICdicy5jb2xsYXBzZSc7XG4gIGNvbnN0IEVWRU5UX0tFWSQ3ID0gYC4ke0RBVEFfS0VZJDd9YDtcbiAgY29uc3QgREFUQV9BUElfS0VZJDQgPSAnLmRhdGEtYXBpJztcbiAgY29uc3QgRVZFTlRfU0hPVyQ2ID0gYHNob3cke0VWRU5UX0tFWSQ3fWA7XG4gIGNvbnN0IEVWRU5UX1NIT1dOJDYgPSBgc2hvd24ke0VWRU5UX0tFWSQ3fWA7XG4gIGNvbnN0IEVWRU5UX0hJREUkNiA9IGBoaWRlJHtFVkVOVF9LRVkkN31gO1xuICBjb25zdCBFVkVOVF9ISURERU4kNiA9IGBoaWRkZW4ke0VWRU5UX0tFWSQ3fWA7XG4gIGNvbnN0IEVWRU5UX0NMSUNLX0RBVEFfQVBJJDQgPSBgY2xpY2ske0VWRU5UX0tFWSQ3fSR7REFUQV9BUElfS0VZJDR9YDtcbiAgY29uc3QgQ0xBU1NfTkFNRV9TSE9XJDcgPSAnc2hvdyc7XG4gIGNvbnN0IENMQVNTX05BTUVfQ09MTEFQU0UgPSAnY29sbGFwc2UnO1xuICBjb25zdCBDTEFTU19OQU1FX0NPTExBUFNJTkcgPSAnY29sbGFwc2luZyc7XG4gIGNvbnN0IENMQVNTX05BTUVfQ09MTEFQU0VEID0gJ2NvbGxhcHNlZCc7XG4gIGNvbnN0IENMQVNTX05BTUVfREVFUEVSX0NISUxEUkVOID0gYDpzY29wZSAuJHtDTEFTU19OQU1FX0NPTExBUFNFfSAuJHtDTEFTU19OQU1FX0NPTExBUFNFfWA7XG4gIGNvbnN0IENMQVNTX05BTUVfSE9SSVpPTlRBTCA9ICdjb2xsYXBzZS1ob3Jpem9udGFsJztcbiAgY29uc3QgV0lEVEggPSAnd2lkdGgnO1xuICBjb25zdCBIRUlHSFQgPSAnaGVpZ2h0JztcbiAgY29uc3QgU0VMRUNUT1JfQUNUSVZFUyA9ICcuY29sbGFwc2Uuc2hvdywgLmNvbGxhcHNlLmNvbGxhcHNpbmcnO1xuICBjb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSQ0ID0gJ1tkYXRhLWJzLXRvZ2dsZT1cImNvbGxhcHNlXCJdJztcbiAgY29uc3QgRGVmYXVsdCRhID0ge1xuICAgIHBhcmVudDogbnVsbCxcbiAgICB0b2dnbGU6IHRydWVcbiAgfTtcbiAgY29uc3QgRGVmYXVsdFR5cGUkYSA9IHtcbiAgICBwYXJlbnQ6ICcobnVsbHxlbGVtZW50KScsXG4gICAgdG9nZ2xlOiAnYm9vbGVhbidcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBDb2xsYXBzZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNvbmZpZykge1xuICAgICAgc3VwZXIoZWxlbWVudCwgY29uZmlnKTtcbiAgICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fdHJpZ2dlckFycmF5ID0gW107XG4gICAgICBjb25zdCB0b2dnbGVMaXN0ID0gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1RPR0dMRSQ0KTtcbiAgICAgIGZvciAoY29uc3QgZWxlbSBvZiB0b2dnbGVMaXN0KSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gU2VsZWN0b3JFbmdpbmUuZ2V0U2VsZWN0b3JGcm9tRWxlbWVudChlbGVtKTtcbiAgICAgICAgY29uc3QgZmlsdGVyRWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmZpbmQoc2VsZWN0b3IpLmZpbHRlcihmb3VuZEVsZW1lbnQgPT4gZm91bmRFbGVtZW50ID09PSB0aGlzLl9lbGVtZW50KTtcbiAgICAgICAgaWYgKHNlbGVjdG9yICE9PSBudWxsICYmIGZpbHRlckVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlckFycmF5LnB1c2goZWxlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2luaXRpYWxpemVDaGlsZHJlbigpO1xuICAgICAgaWYgKCF0aGlzLl9jb25maWcucGFyZW50KSB7XG4gICAgICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLl90cmlnZ2VyQXJyYXksIHRoaXMuX2lzU2hvd24oKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uZmlnLnRvZ2dsZSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCRhO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJGE7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJGI7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgdG9nZ2xlKCkge1xuICAgICAgaWYgKHRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgfVxuICAgIH1cbiAgICBzaG93KCkge1xuICAgICAgaWYgKHRoaXMuX2lzVHJhbnNpdGlvbmluZyB8fCB0aGlzLl9pc1Nob3duKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IGFjdGl2ZUNoaWxkcmVuID0gW107XG5cbiAgICAgIC8vIGZpbmQgYWN0aXZlIGNoaWxkcmVuXG4gICAgICBpZiAodGhpcy5fY29uZmlnLnBhcmVudCkge1xuICAgICAgICBhY3RpdmVDaGlsZHJlbiA9IHRoaXMuX2dldEZpcnN0TGV2ZWxDaGlsZHJlbihTRUxFQ1RPUl9BQ1RJVkVTKS5maWx0ZXIoZWxlbWVudCA9PiBlbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50KS5tYXAoZWxlbWVudCA9PiBDb2xsYXBzZS5nZXRPckNyZWF0ZUluc3RhbmNlKGVsZW1lbnQsIHtcbiAgICAgICAgICB0b2dnbGU6IGZhbHNlXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmVDaGlsZHJlbi5sZW5ndGggJiYgYWN0aXZlQ2hpbGRyZW5bMF0uX2lzVHJhbnNpdGlvbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBzdGFydEV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPVyQ2KTtcbiAgICAgIGlmIChzdGFydEV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBhY3RpdmVJbnN0YW5jZSBvZiBhY3RpdmVDaGlsZHJlbikge1xuICAgICAgICBhY3RpdmVJbnN0YW5jZS5oaWRlKCk7XG4gICAgICB9XG4gICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLl9nZXREaW1lbnNpb24oKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX0NPTExBUFNFKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0NPTExBUFNJTkcpO1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZVtkaW1lbnNpb25dID0gMDtcbiAgICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLl90cmlnZ2VyQXJyYXksIHRydWUpO1xuICAgICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQ09MTEFQU0lORyk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0NPTExBUFNFLCBDTEFTU19OQU1FX1NIT1ckNyk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9ICcnO1xuICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XTiQ2KTtcbiAgICAgIH07XG4gICAgICBjb25zdCBjYXBpdGFsaXplZERpbWVuc2lvbiA9IGRpbWVuc2lvblswXS50b1VwcGVyQ2FzZSgpICsgZGltZW5zaW9uLnNsaWNlKDEpO1xuICAgICAgY29uc3Qgc2Nyb2xsU2l6ZSA9IGBzY3JvbGwke2NhcGl0YWxpemVkRGltZW5zaW9ufWA7XG4gICAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCB0aGlzLl9lbGVtZW50LCB0cnVlKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9IGAke3RoaXMuX2VsZW1lbnRbc2Nyb2xsU2l6ZV19cHhgO1xuICAgIH1cbiAgICBoaWRlKCkge1xuICAgICAgaWYgKHRoaXMuX2lzVHJhbnNpdGlvbmluZyB8fCAhdGhpcy5faXNTaG93bigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN0YXJ0RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFJDYpO1xuICAgICAgaWYgKHN0YXJ0RXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLl9nZXREaW1lbnNpb24oKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9IGAke3RoaXMuX2VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbZGltZW5zaW9uXX1weGA7XG4gICAgICByZWZsb3codGhpcy5fZWxlbWVudCk7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9DT0xMQVBTSU5HKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX0NPTExBUFNFLCBDTEFTU19OQU1FX1NIT1ckNyk7XG4gICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdGhpcy5fdHJpZ2dlckFycmF5KSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBTZWxlY3RvckVuZ2luZS5nZXRFbGVtZW50RnJvbVNlbGVjdG9yKHRyaWdnZXIpO1xuICAgICAgICBpZiAoZWxlbWVudCAmJiAhdGhpcy5faXNTaG93bihlbGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhbdHJpZ2dlcl0sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQ09MTEFQU0lORyk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0NPTExBUFNFKTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElEREVOJDYpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9ICcnO1xuICAgICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZSwgdGhpcy5fZWxlbWVudCwgdHJ1ZSk7XG4gICAgfVxuICAgIF9pc1Nob3duKGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TSE9XJDcpO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAgIGNvbmZpZy50b2dnbGUgPSBCb29sZWFuKGNvbmZpZy50b2dnbGUpOyAvLyBDb2VyY2Ugc3RyaW5nIHZhbHVlc1xuICAgICAgY29uZmlnLnBhcmVudCA9IGdldEVsZW1lbnQoY29uZmlnLnBhcmVudCk7XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBfZ2V0RGltZW5zaW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfSE9SSVpPTlRBTCkgPyBXSURUSCA6IEhFSUdIVDtcbiAgICB9XG4gICAgX2luaXRpYWxpemVDaGlsZHJlbigpIHtcbiAgICAgIGlmICghdGhpcy5fY29uZmlnLnBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldEZpcnN0TGV2ZWxDaGlsZHJlbihTRUxFQ1RPUl9EQVRBX1RPR0dMRSQ0KTtcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGlsZHJlbikge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IoZWxlbWVudCk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhbZWxlbWVudF0sIHRoaXMuX2lzU2hvd24oc2VsZWN0ZWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBfZ2V0Rmlyc3RMZXZlbENoaWxkcmVuKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFNlbGVjdG9yRW5naW5lLmZpbmQoQ0xBU1NfTkFNRV9ERUVQRVJfQ0hJTERSRU4sIHRoaXMuX2NvbmZpZy5wYXJlbnQpO1xuICAgICAgLy8gcmVtb3ZlIGNoaWxkcmVuIGlmIGdyZWF0ZXIgZGVwdGhcbiAgICAgIHJldHVybiBTZWxlY3RvckVuZ2luZS5maW5kKHNlbGVjdG9yLCB0aGlzLl9jb25maWcucGFyZW50KS5maWx0ZXIoZWxlbWVudCA9PiAhY2hpbGRyZW4uaW5jbHVkZXMoZWxlbWVudCkpO1xuICAgIH1cbiAgICBfYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRyaWdnZXJBcnJheSwgaXNPcGVuKSB7XG4gICAgICBpZiAoIXRyaWdnZXJBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHRyaWdnZXJBcnJheSkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoQ0xBU1NfTkFNRV9DT0xMQVBTRUQsICFpc09wZW4pO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGlzT3Blbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhdGljXG4gICAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICAgIGNvbnN0IF9jb25maWcgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJyAmJiAvc2hvd3xoaWRlLy50ZXN0KGNvbmZpZykpIHtcbiAgICAgICAgX2NvbmZpZy50b2dnbGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gQ29sbGFwc2UuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0aGlzLCBfY29uZmlnKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2NvbmZpZ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhW2NvbmZpZ10oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkNCwgU0VMRUNUT1JfREFUQV9UT0dHTEUkNCwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gcHJldmVudERlZmF1bHQgb25seSBmb3IgPGE+IGVsZW1lbnRzICh3aGljaCBjaGFuZ2UgdGhlIFVSTCkgbm90IGluc2lkZSB0aGUgY29sbGFwc2libGUgZWxlbWVudFxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0EnIHx8IGV2ZW50LmRlbGVnYXRlVGFyZ2V0ICYmIGV2ZW50LmRlbGVnYXRlVGFyZ2V0LnRhZ05hbWUgPT09ICdBJykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFNlbGVjdG9yRW5naW5lLmdldE11bHRpcGxlRWxlbWVudHNGcm9tU2VsZWN0b3IodGhpcykpIHtcbiAgICAgIENvbGxhcHNlLmdldE9yQ3JlYXRlSW5zdGFuY2UoZWxlbWVudCwge1xuICAgICAgICB0b2dnbGU6IGZhbHNlXG4gICAgICB9KS50b2dnbGUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBqUXVlcnlcbiAgICovXG5cbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luKENvbGxhcHNlKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIGRyb3Bkb3duLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSRhID0gJ2Ryb3Bkb3duJztcbiAgY29uc3QgREFUQV9LRVkkNiA9ICdicy5kcm9wZG93bic7XG4gIGNvbnN0IEVWRU5UX0tFWSQ2ID0gYC4ke0RBVEFfS0VZJDZ9YDtcbiAgY29uc3QgREFUQV9BUElfS0VZJDMgPSAnLmRhdGEtYXBpJztcbiAgY29uc3QgRVNDQVBFX0tFWSQyID0gJ0VzY2FwZSc7XG4gIGNvbnN0IFRBQl9LRVkkMSA9ICdUYWInO1xuICBjb25zdCBBUlJPV19VUF9LRVkkMSA9ICdBcnJvd1VwJztcbiAgY29uc3QgQVJST1dfRE9XTl9LRVkkMSA9ICdBcnJvd0Rvd24nO1xuICBjb25zdCBSSUdIVF9NT1VTRV9CVVRUT04gPSAyOyAvLyBNb3VzZUV2ZW50LmJ1dHRvbiB2YWx1ZSBmb3IgdGhlIHNlY29uZGFyeSBidXR0b24sIHVzdWFsbHkgdGhlIHJpZ2h0IGJ1dHRvblxuXG4gIGNvbnN0IEVWRU5UX0hJREUkNSA9IGBoaWRlJHtFVkVOVF9LRVkkNn1gO1xuICBjb25zdCBFVkVOVF9ISURERU4kNSA9IGBoaWRkZW4ke0VWRU5UX0tFWSQ2fWA7XG4gIGNvbnN0IEVWRU5UX1NIT1ckNSA9IGBzaG93JHtFVkVOVF9LRVkkNn1gO1xuICBjb25zdCBFVkVOVF9TSE9XTiQ1ID0gYHNob3duJHtFVkVOVF9LRVkkNn1gO1xuICBjb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSQzID0gYGNsaWNrJHtFVkVOVF9LRVkkNn0ke0RBVEFfQVBJX0tFWSQzfWA7XG4gIGNvbnN0IEVWRU5UX0tFWURPV05fREFUQV9BUEkgPSBga2V5ZG93biR7RVZFTlRfS0VZJDZ9JHtEQVRBX0FQSV9LRVkkM31gO1xuICBjb25zdCBFVkVOVF9LRVlVUF9EQVRBX0FQSSA9IGBrZXl1cCR7RVZFTlRfS0VZJDZ9JHtEQVRBX0FQSV9LRVkkM31gO1xuICBjb25zdCBDTEFTU19OQU1FX1NIT1ckNiA9ICdzaG93JztcbiAgY29uc3QgQ0xBU1NfTkFNRV9EUk9QVVAgPSAnZHJvcHVwJztcbiAgY29uc3QgQ0xBU1NfTkFNRV9EUk9QRU5EID0gJ2Ryb3BlbmQnO1xuICBjb25zdCBDTEFTU19OQU1FX0RST1BTVEFSVCA9ICdkcm9wc3RhcnQnO1xuICBjb25zdCBDTEFTU19OQU1FX0RST1BVUF9DRU5URVIgPSAnZHJvcHVwLWNlbnRlcic7XG4gIGNvbnN0IENMQVNTX05BTUVfRFJPUERPV05fQ0VOVEVSID0gJ2Ryb3Bkb3duLWNlbnRlcic7XG4gIGNvbnN0IFNFTEVDVE9SX0RBVEFfVE9HR0xFJDMgPSAnW2RhdGEtYnMtdG9nZ2xlPVwiZHJvcGRvd25cIl06bm90KC5kaXNhYmxlZCk6bm90KDpkaXNhYmxlZCknO1xuICBjb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRV9TSE9XTiA9IGAke1NFTEVDVE9SX0RBVEFfVE9HR0xFJDN9LiR7Q0xBU1NfTkFNRV9TSE9XJDZ9YDtcbiAgY29uc3QgU0VMRUNUT1JfTUVOVSA9ICcuZHJvcGRvd24tbWVudSc7XG4gIGNvbnN0IFNFTEVDVE9SX05BVkJBUiA9ICcubmF2YmFyJztcbiAgY29uc3QgU0VMRUNUT1JfTkFWQkFSX05BViA9ICcubmF2YmFyLW5hdic7XG4gIGNvbnN0IFNFTEVDVE9SX1ZJU0lCTEVfSVRFTVMgPSAnLmRyb3Bkb3duLW1lbnUgLmRyb3Bkb3duLWl0ZW06bm90KC5kaXNhYmxlZCk6bm90KDpkaXNhYmxlZCknO1xuICBjb25zdCBQTEFDRU1FTlRfVE9QID0gaXNSVEwoKSA/ICd0b3AtZW5kJyA6ICd0b3Atc3RhcnQnO1xuICBjb25zdCBQTEFDRU1FTlRfVE9QRU5EID0gaXNSVEwoKSA/ICd0b3Atc3RhcnQnIDogJ3RvcC1lbmQnO1xuICBjb25zdCBQTEFDRU1FTlRfQk9UVE9NID0gaXNSVEwoKSA/ICdib3R0b20tZW5kJyA6ICdib3R0b20tc3RhcnQnO1xuICBjb25zdCBQTEFDRU1FTlRfQk9UVE9NRU5EID0gaXNSVEwoKSA/ICdib3R0b20tc3RhcnQnIDogJ2JvdHRvbS1lbmQnO1xuICBjb25zdCBQTEFDRU1FTlRfUklHSFQgPSBpc1JUTCgpID8gJ2xlZnQtc3RhcnQnIDogJ3JpZ2h0LXN0YXJ0JztcbiAgY29uc3QgUExBQ0VNRU5UX0xFRlQgPSBpc1JUTCgpID8gJ3JpZ2h0LXN0YXJ0JyA6ICdsZWZ0LXN0YXJ0JztcbiAgY29uc3QgUExBQ0VNRU5UX1RPUENFTlRFUiA9ICd0b3AnO1xuICBjb25zdCBQTEFDRU1FTlRfQk9UVE9NQ0VOVEVSID0gJ2JvdHRvbSc7XG4gIGNvbnN0IERlZmF1bHQkOSA9IHtcbiAgICBhdXRvQ2xvc2U6IHRydWUsXG4gICAgYm91bmRhcnk6ICdjbGlwcGluZ1BhcmVudHMnLFxuICAgIGRpc3BsYXk6ICdkeW5hbWljJyxcbiAgICBvZmZzZXQ6IFswLCAyXSxcbiAgICBwb3BwZXJDb25maWc6IG51bGwsXG4gICAgcmVmZXJlbmNlOiAndG9nZ2xlJ1xuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQ5ID0ge1xuICAgIGF1dG9DbG9zZTogJyhib29sZWFufHN0cmluZyknLFxuICAgIGJvdW5kYXJ5OiAnKHN0cmluZ3xlbGVtZW50KScsXG4gICAgZGlzcGxheTogJ3N0cmluZycsXG4gICAgb2Zmc2V0OiAnKGFycmF5fHN0cmluZ3xmdW5jdGlvbiknLFxuICAgIHBvcHBlckNvbmZpZzogJyhudWxsfG9iamVjdHxmdW5jdGlvbiknLFxuICAgIHJlZmVyZW5jZTogJyhzdHJpbmd8ZWxlbWVudHxvYmplY3QpJ1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBkZWZpbml0aW9uXG4gICAqL1xuXG4gIGNsYXNzIERyb3Bkb3duIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICBzdXBlcihlbGVtZW50LCBjb25maWcpO1xuICAgICAgdGhpcy5fcG9wcGVyID0gbnVsbDtcbiAgICAgIHRoaXMuX3BhcmVudCA9IHRoaXMuX2VsZW1lbnQucGFyZW50Tm9kZTsgLy8gZHJvcGRvd24gd3JhcHBlclxuICAgICAgLy8gVE9ETzogdjYgcmV2ZXJ0ICMzNzAxMSAmIGNoYW5nZSBtYXJrdXAgaHR0cHM6Ly9nZXRib290c3RyYXAuY29tL2RvY3MvNS4zL2Zvcm1zL2lucHV0LWdyb3VwL1xuICAgICAgdGhpcy5fbWVudSA9IFNlbGVjdG9yRW5naW5lLm5leHQodGhpcy5fZWxlbWVudCwgU0VMRUNUT1JfTUVOVSlbMF0gfHwgU2VsZWN0b3JFbmdpbmUucHJldih0aGlzLl9lbGVtZW50LCBTRUxFQ1RPUl9NRU5VKVswXSB8fCBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX01FTlUsIHRoaXMuX3BhcmVudCk7XG4gICAgICB0aGlzLl9pbk5hdmJhciA9IHRoaXMuX2RldGVjdE5hdmJhcigpO1xuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCQ5O1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJDk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJGE7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgdG9nZ2xlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzU2hvd24oKSA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KCk7XG4gICAgfVxuICAgIHNob3coKSB7XG4gICAgICBpZiAoaXNEaXNhYmxlZCh0aGlzLl9lbGVtZW50KSB8fCB0aGlzLl9pc1Nob3duKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVsYXRlZFRhcmdldCA9IHtcbiAgICAgICAgcmVsYXRlZFRhcmdldDogdGhpcy5fZWxlbWVudFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHNob3dFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NIT1ckNSwgcmVsYXRlZFRhcmdldCk7XG4gICAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3JlYXRlUG9wcGVyKCk7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSB0b3VjaC1lbmFibGVkIGRldmljZSB3ZSBhZGQgZXh0cmFcbiAgICAgIC8vIGVtcHR5IG1vdXNlb3ZlciBsaXN0ZW5lcnMgdG8gdGhlIGJvZHkncyBpbW1lZGlhdGUgY2hpbGRyZW47XG4gICAgICAvLyBvbmx5IG5lZWRlZCBiZWNhdXNlIG9mIGJyb2tlbiBldmVudCBkZWxlZ2F0aW9uIG9uIGlPU1xuICAgICAgLy8gaHR0cHM6Ly93d3cucXVpcmtzbW9kZS5vcmcvYmxvZy9hcmNoaXZlcy8yMDE0LzAyL21vdXNlX2V2ZW50X2J1Yi5odG1sXG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICF0aGlzLl9wYXJlbnQuY2xvc2VzdChTRUxFQ1RPUl9OQVZCQVJfTkFWKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgW10uY29uY2F0KC4uLmRvY3VtZW50LmJvZHkuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgRXZlbnRIYW5kbGVyLm9uKGVsZW1lbnQsICdtb3VzZW92ZXInLCBub29wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fZWxlbWVudC5mb2N1cygpO1xuICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKTtcbiAgICAgIHRoaXMuX21lbnUuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX1NIT1ckNik7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XJDYpO1xuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPV04kNSwgcmVsYXRlZFRhcmdldCk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICBpZiAoaXNEaXNhYmxlZCh0aGlzLl9lbGVtZW50KSB8fCAhdGhpcy5faXNTaG93bigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlbGF0ZWRUYXJnZXQgPSB7XG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6IHRoaXMuX2VsZW1lbnRcbiAgICAgIH07XG4gICAgICB0aGlzLl9jb21wbGV0ZUhpZGUocmVsYXRlZFRhcmdldCk7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICBpZiAodGhpcy5fcG9wcGVyKSB7XG4gICAgICAgIHRoaXMuX3BvcHBlci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHVwZGF0ZSgpIHtcbiAgICAgIHRoaXMuX2luTmF2YmFyID0gdGhpcy5fZGV0ZWN0TmF2YmFyKCk7XG4gICAgICBpZiAodGhpcy5fcG9wcGVyKSB7XG4gICAgICAgIHRoaXMuX3BvcHBlci51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX2NvbXBsZXRlSGlkZShyZWxhdGVkVGFyZ2V0KSB7XG4gICAgICBjb25zdCBoaWRlRXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFJDUsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRvdWNoLWVuYWJsZWQgZGV2aWNlIHdlIHJlbW92ZSB0aGUgZXh0cmFcbiAgICAgIC8vIGVtcHR5IG1vdXNlb3ZlciBsaXN0ZW5lcnMgd2UgYWRkZWQgZm9yIGlPUyBzdXBwb3J0XG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBbXS5jb25jYXQoLi4uZG9jdW1lbnQuYm9keS5jaGlsZHJlbikpIHtcbiAgICAgICAgICBFdmVudEhhbmRsZXIub2ZmKGVsZW1lbnQsICdtb3VzZW92ZXInLCBub29wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3BvcHBlcikge1xuICAgICAgICB0aGlzLl9wb3BwZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbWVudS5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVyQ2KTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1ckNik7XG4gICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgTWFuaXB1bGF0b3IucmVtb3ZlRGF0YUF0dHJpYnV0ZSh0aGlzLl9tZW51LCAncG9wcGVyJyk7XG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURERU4kNSwgcmVsYXRlZFRhcmdldCk7XG4gICAgfVxuICAgIF9nZXRDb25maWcoY29uZmlnKSB7XG4gICAgICBjb25maWcgPSBzdXBlci5fZ2V0Q29uZmlnKGNvbmZpZyk7XG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5yZWZlcmVuY2UgPT09ICdvYmplY3QnICYmICFpc0VsZW1lbnQoY29uZmlnLnJlZmVyZW5jZSkgJiYgdHlwZW9mIGNvbmZpZy5yZWZlcmVuY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIFBvcHBlciB2aXJ0dWFsIGVsZW1lbnRzIHJlcXVpcmUgYSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgbWV0aG9kXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7TkFNRSRhLnRvVXBwZXJDYXNlKCl9OiBPcHRpb24gXCJyZWZlcmVuY2VcIiBwcm92aWRlZCB0eXBlIFwib2JqZWN0XCIgd2l0aG91dCBhIHJlcXVpcmVkIFwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0XCIgbWV0aG9kLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gICAgX2NyZWF0ZVBvcHBlcigpIHtcbiAgICAgIGlmICh0eXBlb2YgUG9wcGVyX19uYW1lc3BhY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Jvb3RzdHJhcFxcJ3MgZHJvcGRvd25zIHJlcXVpcmUgUG9wcGVyIChodHRwczovL3BvcHBlci5qcy5vcmcpJyk7XG4gICAgICB9XG4gICAgICBsZXQgcmVmZXJlbmNlRWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgICBpZiAodGhpcy5fY29uZmlnLnJlZmVyZW5jZSA9PT0gJ3BhcmVudCcpIHtcbiAgICAgICAgcmVmZXJlbmNlRWxlbWVudCA9IHRoaXMuX3BhcmVudDtcbiAgICAgIH0gZWxzZSBpZiAoaXNFbGVtZW50KHRoaXMuX2NvbmZpZy5yZWZlcmVuY2UpKSB7XG4gICAgICAgIHJlZmVyZW5jZUVsZW1lbnQgPSBnZXRFbGVtZW50KHRoaXMuX2NvbmZpZy5yZWZlcmVuY2UpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5fY29uZmlnLnJlZmVyZW5jZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmVmZXJlbmNlRWxlbWVudCA9IHRoaXMuX2NvbmZpZy5yZWZlcmVuY2U7XG4gICAgICB9XG4gICAgICBjb25zdCBwb3BwZXJDb25maWcgPSB0aGlzLl9nZXRQb3BwZXJDb25maWcoKTtcbiAgICAgIHRoaXMuX3BvcHBlciA9IFBvcHBlcl9fbmFtZXNwYWNlLmNyZWF0ZVBvcHBlcihyZWZlcmVuY2VFbGVtZW50LCB0aGlzLl9tZW51LCBwb3BwZXJDb25maWcpO1xuICAgIH1cbiAgICBfaXNTaG93bigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tZW51LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX1NIT1ckNik7XG4gICAgfVxuICAgIF9nZXRQbGFjZW1lbnQoKSB7XG4gICAgICBjb25zdCBwYXJlbnREcm9wZG93biA9IHRoaXMuX3BhcmVudDtcbiAgICAgIGlmIChwYXJlbnREcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9EUk9QRU5EKSkge1xuICAgICAgICByZXR1cm4gUExBQ0VNRU5UX1JJR0hUO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BTVEFSVCkpIHtcbiAgICAgICAgcmV0dXJuIFBMQUNFTUVOVF9MRUZUO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BVUF9DRU5URVIpKSB7XG4gICAgICAgIHJldHVybiBQTEFDRU1FTlRfVE9QQ0VOVEVSO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BET1dOX0NFTlRFUikpIHtcbiAgICAgICAgcmV0dXJuIFBMQUNFTUVOVF9CT1RUT01DRU5URVI7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gdHJpbSB0aGUgdmFsdWUgYmVjYXVzZSBjdXN0b20gcHJvcGVydGllcyBjYW4gYWxzbyBpbmNsdWRlIHNwYWNlc1xuICAgICAgY29uc3QgaXNFbmQgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuX21lbnUpLmdldFByb3BlcnR5VmFsdWUoJy0tYnMtcG9zaXRpb24nKS50cmltKCkgPT09ICdlbmQnO1xuICAgICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BVUCkpIHtcbiAgICAgICAgcmV0dXJuIGlzRW5kID8gUExBQ0VNRU5UX1RPUEVORCA6IFBMQUNFTUVOVF9UT1A7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNFbmQgPyBQTEFDRU1FTlRfQk9UVE9NRU5EIDogUExBQ0VNRU5UX0JPVFRPTTtcbiAgICB9XG4gICAgX2RldGVjdE5hdmJhcigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmNsb3Nlc3QoU0VMRUNUT1JfTkFWQkFSKSAhPT0gbnVsbDtcbiAgICB9XG4gICAgX2dldE9mZnNldCgpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgb2Zmc2V0XG4gICAgICB9ID0gdGhpcy5fY29uZmlnO1xuICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvZmZzZXQuc3BsaXQoJywnKS5tYXAodmFsdWUgPT4gTnVtYmVyLnBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHBvcHBlckRhdGEgPT4gb2Zmc2V0KHBvcHBlckRhdGEsIHRoaXMuX2VsZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG4gICAgX2dldFBvcHBlckNvbmZpZygpIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRCc1BvcHBlckNvbmZpZyA9IHtcbiAgICAgICAgcGxhY2VtZW50OiB0aGlzLl9nZXRQbGFjZW1lbnQoKSxcbiAgICAgICAgbW9kaWZpZXJzOiBbe1xuICAgICAgICAgIG5hbWU6ICdwcmV2ZW50T3ZlcmZsb3cnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGJvdW5kYXJ5OiB0aGlzLl9jb25maWcuYm91bmRhcnlcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICBuYW1lOiAnb2Zmc2V0JyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMuX2dldE9mZnNldCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgfTtcblxuICAgICAgLy8gRGlzYWJsZSBQb3BwZXIgaWYgd2UgaGF2ZSBhIHN0YXRpYyBkaXNwbGF5IG9yIERyb3Bkb3duIGlzIGluIE5hdmJhclxuICAgICAgaWYgKHRoaXMuX2luTmF2YmFyIHx8IHRoaXMuX2NvbmZpZy5kaXNwbGF5ID09PSAnc3RhdGljJykge1xuICAgICAgICBNYW5pcHVsYXRvci5zZXREYXRhQXR0cmlidXRlKHRoaXMuX21lbnUsICdwb3BwZXInLCAnc3RhdGljJyk7IC8vIFRPRE86IHY2IHJlbW92ZVxuICAgICAgICBkZWZhdWx0QnNQb3BwZXJDb25maWcubW9kaWZpZXJzID0gW3tcbiAgICAgICAgICBuYW1lOiAnYXBwbHlTdHlsZXMnLFxuICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGVmYXVsdEJzUG9wcGVyQ29uZmlnLFxuICAgICAgICAuLi5leGVjdXRlKHRoaXMuX2NvbmZpZy5wb3BwZXJDb25maWcsIFtkZWZhdWx0QnNQb3BwZXJDb25maWddKVxuICAgICAgfTtcbiAgICB9XG4gICAgX3NlbGVjdE1lbnVJdGVtKHtcbiAgICAgIGtleSxcbiAgICAgIHRhcmdldFxuICAgIH0pIHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9WSVNJQkxFX0lURU1TLCB0aGlzLl9tZW51KS5maWx0ZXIoZWxlbWVudCA9PiBpc1Zpc2libGUoZWxlbWVudCkpO1xuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0YXJnZXQgaXNuJ3QgaW5jbHVkZWQgaW4gaXRlbXMgKGUuZy4gd2hlbiBleHBhbmRpbmcgdGhlIGRyb3Bkb3duKVxuICAgICAgLy8gYWxsb3cgY3ljbGluZyB0byBnZXQgdGhlIGxhc3QgaXRlbSBpbiBjYXNlIGtleSBlcXVhbHMgQVJST1dfVVBfS0VZXG4gICAgICBnZXROZXh0QWN0aXZlRWxlbWVudChpdGVtcywgdGFyZ2V0LCBrZXkgPT09IEFSUk9XX0RPV05fS0VZJDEsICFpdGVtcy5pbmNsdWRlcyh0YXJnZXQpKS5mb2N1cygpO1xuICAgIH1cblxuICAgIC8vIFN0YXRpY1xuICAgIHN0YXRpYyBqUXVlcnlJbnRlcmZhY2UoY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IERyb3Bkb3duLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtjb25maWddKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIGNsZWFyTWVudXMoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5idXR0b24gPT09IFJJR0hUX01PVVNFX0JVVFRPTiB8fCBldmVudC50eXBlID09PSAna2V5dXAnICYmIGV2ZW50LmtleSAhPT0gVEFCX0tFWSQxKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wZW5Ub2dnbGVzID0gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1RPR0dMRV9TSE9XTik7XG4gICAgICBmb3IgKGNvbnN0IHRvZ2dsZSBvZiBvcGVuVG9nZ2xlcykge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gRHJvcGRvd24uZ2V0SW5zdGFuY2UodG9nZ2xlKTtcbiAgICAgICAgaWYgKCFjb250ZXh0IHx8IGNvbnRleHQuX2NvbmZpZy5hdXRvQ2xvc2UgPT09IGZhbHNlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tcG9zZWRQYXRoID0gZXZlbnQuY29tcG9zZWRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGlzTWVudVRhcmdldCA9IGNvbXBvc2VkUGF0aC5pbmNsdWRlcyhjb250ZXh0Ll9tZW51KTtcbiAgICAgICAgaWYgKGNvbXBvc2VkUGF0aC5pbmNsdWRlcyhjb250ZXh0Ll9lbGVtZW50KSB8fCBjb250ZXh0Ll9jb25maWcuYXV0b0Nsb3NlID09PSAnaW5zaWRlJyAmJiAhaXNNZW51VGFyZ2V0IHx8IGNvbnRleHQuX2NvbmZpZy5hdXRvQ2xvc2UgPT09ICdvdXRzaWRlJyAmJiBpc01lbnVUYXJnZXQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRhYiBuYXZpZ2F0aW9uIHRocm91Z2ggdGhlIGRyb3Bkb3duIG1lbnUgb3IgZXZlbnRzIGZyb20gY29udGFpbmVkIGlucHV0cyBzaG91bGRuJ3QgY2xvc2UgdGhlIG1lbnVcbiAgICAgICAgaWYgKGNvbnRleHQuX21lbnUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJiAoZXZlbnQudHlwZSA9PT0gJ2tleXVwJyAmJiBldmVudC5rZXkgPT09IFRBQl9LRVkkMSB8fCAvaW5wdXR8c2VsZWN0fG9wdGlvbnx0ZXh0YXJlYXxmb3JtL2kudGVzdChldmVudC50YXJnZXQudGFnTmFtZSkpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVsYXRlZFRhcmdldCA9IHtcbiAgICAgICAgICByZWxhdGVkVGFyZ2V0OiBjb250ZXh0Ll9lbGVtZW50XG4gICAgICAgIH07XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgcmVsYXRlZFRhcmdldC5jbGlja0V2ZW50ID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5fY29tcGxldGVIaWRlKHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZGF0YUFwaUtleWRvd25IYW5kbGVyKGV2ZW50KSB7XG4gICAgICAvLyBJZiBub3QgYW4gVVAgfCBET1dOIHwgRVNDQVBFIGtleSA9PiBub3QgYSBkcm9wZG93biBjb21tYW5kXG4gICAgICAvLyBJZiBpbnB1dC90ZXh0YXJlYSAmJiBpZiBrZXkgaXMgb3RoZXIgdGhhbiBFU0NBUEUgPT4gbm90IGEgZHJvcGRvd24gY29tbWFuZFxuXG4gICAgICBjb25zdCBpc0lucHV0ID0gL2lucHV0fHRleHRhcmVhL2kudGVzdChldmVudC50YXJnZXQudGFnTmFtZSk7XG4gICAgICBjb25zdCBpc0VzY2FwZUV2ZW50ID0gZXZlbnQua2V5ID09PSBFU0NBUEVfS0VZJDI7XG4gICAgICBjb25zdCBpc1VwT3JEb3duRXZlbnQgPSBbQVJST1dfVVBfS0VZJDEsIEFSUk9XX0RPV05fS0VZJDFdLmluY2x1ZGVzKGV2ZW50LmtleSk7XG4gICAgICBpZiAoIWlzVXBPckRvd25FdmVudCAmJiAhaXNFc2NhcGVFdmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaXNJbnB1dCAmJiAhaXNFc2NhcGVFdmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvLyBUT0RPOiB2NiByZXZlcnQgIzM3MDExICYgY2hhbmdlIG1hcmt1cCBodHRwczovL2dldGJvb3RzdHJhcC5jb20vZG9jcy81LjMvZm9ybXMvaW5wdXQtZ3JvdXAvXG4gICAgICBjb25zdCBnZXRUb2dnbGVCdXR0b24gPSB0aGlzLm1hdGNoZXMoU0VMRUNUT1JfREFUQV9UT0dHTEUkMykgPyB0aGlzIDogU2VsZWN0b3JFbmdpbmUucHJldih0aGlzLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSQzKVswXSB8fCBTZWxlY3RvckVuZ2luZS5uZXh0KHRoaXMsIFNFTEVDVE9SX0RBVEFfVE9HR0xFJDMpWzBdIHx8IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfREFUQV9UT0dHTEUkMywgZXZlbnQuZGVsZWdhdGVUYXJnZXQucGFyZW50Tm9kZSk7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IERyb3Bkb3duLmdldE9yQ3JlYXRlSW5zdGFuY2UoZ2V0VG9nZ2xlQnV0dG9uKTtcbiAgICAgIGlmIChpc1VwT3JEb3duRXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGluc3RhbmNlLnNob3coKTtcbiAgICAgICAgaW5zdGFuY2UuX3NlbGVjdE1lbnVJdGVtKGV2ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGluc3RhbmNlLl9pc1Nob3duKCkpIHtcbiAgICAgICAgLy8gZWxzZSBpcyBlc2NhcGUgYW5kIHdlIGNoZWNrIGlmIGl0IGlzIHNob3duXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpbnN0YW5jZS5oaWRlKCk7XG4gICAgICAgIGdldFRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICAgKi9cblxuICBFdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0tFWURPV05fREFUQV9BUEksIFNFTEVDVE9SX0RBVEFfVE9HR0xFJDMsIERyb3Bkb3duLmRhdGFBcGlLZXlkb3duSGFuZGxlcik7XG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfS0VZRE9XTl9EQVRBX0FQSSwgU0VMRUNUT1JfTUVOVSwgRHJvcGRvd24uZGF0YUFwaUtleWRvd25IYW5kbGVyKTtcbiAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9DTElDS19EQVRBX0FQSSQzLCBEcm9wZG93bi5jbGVhck1lbnVzKTtcbiAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9LRVlVUF9EQVRBX0FQSSwgRHJvcGRvd24uY2xlYXJNZW51cyk7XG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkMywgU0VMRUNUT1JfREFUQV9UT0dHTEUkMywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBEcm9wZG93bi5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMpLnRvZ2dsZSgpO1xuICB9KTtcblxuICAvKipcbiAgICogalF1ZXJ5XG4gICAqL1xuXG4gIGRlZmluZUpRdWVyeVBsdWdpbihEcm9wZG93bik7XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCB1dGlsL2JhY2tkcm9wLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSQ5ID0gJ2JhY2tkcm9wJztcbiAgY29uc3QgQ0xBU1NfTkFNRV9GQURFJDQgPSAnZmFkZSc7XG4gIGNvbnN0IENMQVNTX05BTUVfU0hPVyQ1ID0gJ3Nob3cnO1xuICBjb25zdCBFVkVOVF9NT1VTRURPV04gPSBgbW91c2Vkb3duLmJzLiR7TkFNRSQ5fWA7XG4gIGNvbnN0IERlZmF1bHQkOCA9IHtcbiAgICBjbGFzc05hbWU6ICdtb2RhbC1iYWNrZHJvcCcsXG4gICAgY2xpY2tDYWxsYmFjazogbnVsbCxcbiAgICBpc0FuaW1hdGVkOiBmYWxzZSxcbiAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgLy8gaWYgZmFsc2UsIHdlIHVzZSB0aGUgYmFja2Ryb3AgaGVscGVyIHdpdGhvdXQgYWRkaW5nIGFueSBlbGVtZW50IHRvIHRoZSBkb21cbiAgICByb290RWxlbWVudDogJ2JvZHknIC8vIGdpdmUgdGhlIGNob2ljZSB0byBwbGFjZSBiYWNrZHJvcCB1bmRlciBkaWZmZXJlbnQgZWxlbWVudHNcbiAgfTtcbiAgY29uc3QgRGVmYXVsdFR5cGUkOCA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGNsaWNrQ2FsbGJhY2s6ICcoZnVuY3Rpb258bnVsbCknLFxuICAgIGlzQW5pbWF0ZWQ6ICdib29sZWFuJyxcbiAgICBpc1Zpc2libGU6ICdib29sZWFuJyxcbiAgICByb290RWxlbWVudDogJyhlbGVtZW50fHN0cmluZyknXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgQmFja2Ryb3AgZXh0ZW5kcyBDb25maWcge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhjb25maWcpO1xuICAgICAgdGhpcy5faXNBcHBlbmRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0JDg7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdFR5cGUkODtcbiAgICB9XG4gICAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgICAgcmV0dXJuIE5BTUUkOTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWNcbiAgICBzaG93KGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIXRoaXMuX2NvbmZpZy5pc1Zpc2libGUpIHtcbiAgICAgICAgZXhlY3V0ZShjYWxsYmFjayk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGVuZCgpO1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQoKTtcbiAgICAgIGlmICh0aGlzLl9jb25maWcuaXNBbmltYXRlZCkge1xuICAgICAgICByZWZsb3coZWxlbWVudCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XJDUpO1xuICAgICAgdGhpcy5fZW11bGF0ZUFuaW1hdGlvbigoKSA9PiB7XG4gICAgICAgIGV4ZWN1dGUoY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGhpZGUoY2FsbGJhY2spIHtcbiAgICAgIGlmICghdGhpcy5fY29uZmlnLmlzVmlzaWJsZSkge1xuICAgICAgICBleGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fZ2V0RWxlbWVudCgpLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XJDUpO1xuICAgICAgdGhpcy5fZW11bGF0ZUFuaW1hdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICBleGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgaWYgKCF0aGlzLl9pc0FwcGVuZGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIEV2ZW50SGFuZGxlci5vZmYodGhpcy5fZWxlbWVudCwgRVZFTlRfTU9VU0VET1dOKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlKCk7XG4gICAgICB0aGlzLl9pc0FwcGVuZGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gUHJpdmF0ZVxuICAgIF9nZXRFbGVtZW50KCkge1xuICAgICAgaWYgKCF0aGlzLl9lbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9IHRoaXMuX2NvbmZpZy5jbGFzc05hbWU7XG4gICAgICAgIGlmICh0aGlzLl9jb25maWcuaXNBbmltYXRlZCkge1xuICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9GQURFJDQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBiYWNrZHJvcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cbiAgICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAgIC8vIHVzZSBnZXRFbGVtZW50KCkgd2l0aCB0aGUgZGVmYXVsdCBcImJvZHlcIiB0byBnZXQgYSBmcmVzaCBFbGVtZW50IG9uIGVhY2ggaW5zdGFudGlhdGlvblxuICAgICAgY29uZmlnLnJvb3RFbGVtZW50ID0gZ2V0RWxlbWVudChjb25maWcucm9vdEVsZW1lbnQpO1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gICAgX2FwcGVuZCgpIHtcbiAgICAgIGlmICh0aGlzLl9pc0FwcGVuZGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KCk7XG4gICAgICB0aGlzLl9jb25maWcucm9vdEVsZW1lbnQuYXBwZW5kKGVsZW1lbnQpO1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKGVsZW1lbnQsIEVWRU5UX01PVVNFRE9XTiwgKCkgPT4ge1xuICAgICAgICBleGVjdXRlKHRoaXMuX2NvbmZpZy5jbGlja0NhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5faXNBcHBlbmRlZCA9IHRydWU7XG4gICAgfVxuICAgIF9lbXVsYXRlQW5pbWF0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uKGNhbGxiYWNrLCB0aGlzLl9nZXRFbGVtZW50KCksIHRoaXMuX2NvbmZpZy5pc0FuaW1hdGVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHV0aWwvZm9jdXN0cmFwLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSQ4ID0gJ2ZvY3VzdHJhcCc7XG4gIGNvbnN0IERBVEFfS0VZJDUgPSAnYnMuZm9jdXN0cmFwJztcbiAgY29uc3QgRVZFTlRfS0VZJDUgPSBgLiR7REFUQV9LRVkkNX1gO1xuICBjb25zdCBFVkVOVF9GT0NVU0lOJDIgPSBgZm9jdXNpbiR7RVZFTlRfS0VZJDV9YDtcbiAgY29uc3QgRVZFTlRfS0VZRE9XTl9UQUIgPSBga2V5ZG93bi50YWIke0VWRU5UX0tFWSQ1fWA7XG4gIGNvbnN0IFRBQl9LRVkgPSAnVGFiJztcbiAgY29uc3QgVEFCX05BVl9GT1JXQVJEID0gJ2ZvcndhcmQnO1xuICBjb25zdCBUQUJfTkFWX0JBQ0tXQVJEID0gJ2JhY2t3YXJkJztcbiAgY29uc3QgRGVmYXVsdCQ3ID0ge1xuICAgIGF1dG9mb2N1czogdHJ1ZSxcbiAgICB0cmFwRWxlbWVudDogbnVsbCAvLyBUaGUgZWxlbWVudCB0byB0cmFwIGZvY3VzIGluc2lkZSBvZlxuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQ3ID0ge1xuICAgIGF1dG9mb2N1czogJ2Jvb2xlYW4nLFxuICAgIHRyYXBFbGVtZW50OiAnZWxlbWVudCdcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBGb2N1c1RyYXAgZXh0ZW5kcyBDb25maWcge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhjb25maWcpO1xuICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2xhc3RUYWJOYXZEaXJlY3Rpb24gPSBudWxsO1xuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCQ3O1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJDc7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJDg7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2NvbmZpZy5hdXRvZm9jdXMpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnLnRyYXBFbGVtZW50LmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBFdmVudEhhbmRsZXIub2ZmKGRvY3VtZW50LCBFVkVOVF9LRVkkNSk7IC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgICAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9GT0NVU0lOJDIsIGV2ZW50ID0+IHRoaXMuX2hhbmRsZUZvY3VzaW4oZXZlbnQpKTtcbiAgICAgIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfS0VZRE9XTl9UQUIsIGV2ZW50ID0+IHRoaXMuX2hhbmRsZUtleWRvd24oZXZlbnQpKTtcbiAgICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIEV2ZW50SGFuZGxlci5vZmYoZG9jdW1lbnQsIEVWRU5UX0tFWSQ1KTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX2hhbmRsZUZvY3VzaW4oZXZlbnQpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdHJhcEVsZW1lbnRcbiAgICAgIH0gPSB0aGlzLl9jb25maWc7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBkb2N1bWVudCB8fCBldmVudC50YXJnZXQgPT09IHRyYXBFbGVtZW50IHx8IHRyYXBFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZWxlbWVudHMgPSBTZWxlY3RvckVuZ2luZS5mb2N1c2FibGVDaGlsZHJlbih0cmFwRWxlbWVudCk7XG4gICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRyYXBFbGVtZW50LmZvY3VzKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2xhc3RUYWJOYXZEaXJlY3Rpb24gPT09IFRBQl9OQVZfQkFDS1dBUkQpIHtcbiAgICAgICAgZWxlbWVudHNbZWxlbWVudHMubGVuZ3RoIC0gMV0uZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzWzBdLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9oYW5kbGVLZXlkb3duKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSBUQUJfS0VZKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xhc3RUYWJOYXZEaXJlY3Rpb24gPSBldmVudC5zaGlmdEtleSA/IFRBQl9OQVZfQkFDS1dBUkQgOiBUQUJfTkFWX0ZPUldBUkQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCB1dGlsL3Njcm9sbEJhci5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IFNFTEVDVE9SX0ZJWEVEX0NPTlRFTlQgPSAnLmZpeGVkLXRvcCwgLmZpeGVkLWJvdHRvbSwgLmlzLWZpeGVkLCAuc3RpY2t5LXRvcCc7XG4gIGNvbnN0IFNFTEVDVE9SX1NUSUNLWV9DT05URU5UID0gJy5zdGlja3ktdG9wJztcbiAgY29uc3QgUFJPUEVSVFlfUEFERElORyA9ICdwYWRkaW5nLXJpZ2h0JztcbiAgY29uc3QgUFJPUEVSVFlfTUFSR0lOID0gJ21hcmdpbi1yaWdodCc7XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgU2Nyb2xsQmFySGVscGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuICAgIH1cblxuICAgIC8vIFB1YmxpY1xuICAgIGdldFdpZHRoKCkge1xuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9pbm5lcldpZHRoI3VzYWdlX25vdGVzXG4gICAgICBjb25zdCBkb2N1bWVudFdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHdpbmRvdy5pbm5lcldpZHRoIC0gZG9jdW1lbnRXaWR0aCk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKTtcbiAgICAgIHRoaXMuX2Rpc2FibGVPdmVyRmxvdygpO1xuICAgICAgLy8gZ2l2ZSBwYWRkaW5nIHRvIGVsZW1lbnQgdG8gYmFsYW5jZSB0aGUgaGlkZGVuIHNjcm9sbGJhciB3aWR0aFxuICAgICAgdGhpcy5fc2V0RWxlbWVudEF0dHJpYnV0ZXModGhpcy5fZWxlbWVudCwgUFJPUEVSVFlfUEFERElORywgY2FsY3VsYXRlZFZhbHVlID0+IGNhbGN1bGF0ZWRWYWx1ZSArIHdpZHRoKTtcbiAgICAgIC8vIHRyaWNrOiBXZSBhZGp1c3QgcG9zaXRpdmUgcGFkZGluZ1JpZ2h0IGFuZCBuZWdhdGl2ZSBtYXJnaW5SaWdodCB0byBzdGlja3ktdG9wIGVsZW1lbnRzIHRvIGtlZXAgc2hvd2luZyBmdWxsd2lkdGhcbiAgICAgIHRoaXMuX3NldEVsZW1lbnRBdHRyaWJ1dGVzKFNFTEVDVE9SX0ZJWEVEX0NPTlRFTlQsIFBST1BFUlRZX1BBRERJTkcsIGNhbGN1bGF0ZWRWYWx1ZSA9PiBjYWxjdWxhdGVkVmFsdWUgKyB3aWR0aCk7XG4gICAgICB0aGlzLl9zZXRFbGVtZW50QXR0cmlidXRlcyhTRUxFQ1RPUl9TVElDS1lfQ09OVEVOVCwgUFJPUEVSVFlfTUFSR0lOLCBjYWxjdWxhdGVkVmFsdWUgPT4gY2FsY3VsYXRlZFZhbHVlIC0gd2lkdGgpO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RWxlbWVudEF0dHJpYnV0ZXModGhpcy5fZWxlbWVudCwgJ292ZXJmbG93Jyk7XG4gICAgICB0aGlzLl9yZXNldEVsZW1lbnRBdHRyaWJ1dGVzKHRoaXMuX2VsZW1lbnQsIFBST1BFUlRZX1BBRERJTkcpO1xuICAgICAgdGhpcy5fcmVzZXRFbGVtZW50QXR0cmlidXRlcyhTRUxFQ1RPUl9GSVhFRF9DT05URU5ULCBQUk9QRVJUWV9QQURESU5HKTtcbiAgICAgIHRoaXMuX3Jlc2V0RWxlbWVudEF0dHJpYnV0ZXMoU0VMRUNUT1JfU1RJQ0tZX0NPTlRFTlQsIFBST1BFUlRZX01BUkdJTik7XG4gICAgfVxuICAgIGlzT3ZlcmZsb3dpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRXaWR0aCgpID4gMDtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX2Rpc2FibGVPdmVyRmxvdygpIHtcbiAgICAgIHRoaXMuX3NhdmVJbml0aWFsQXR0cmlidXRlKHRoaXMuX2VsZW1lbnQsICdvdmVyZmxvdycpO1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIH1cbiAgICBfc2V0RWxlbWVudEF0dHJpYnV0ZXMoc2VsZWN0b3IsIHN0eWxlUHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0V2lkdGgoKTtcbiAgICAgIGNvbnN0IG1hbmlwdWxhdGlvbkNhbGxCYWNrID0gZWxlbWVudCA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50ICYmIHdpbmRvdy5pbm5lcldpZHRoID4gZWxlbWVudC5jbGllbnRXaWR0aCArIHNjcm9sbGJhcldpZHRoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NhdmVJbml0aWFsQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlUHJvcGVydHkpO1xuICAgICAgICBjb25zdCBjYWxjdWxhdGVkVmFsdWUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlUHJvcGVydHkpO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHN0eWxlUHJvcGVydHksIGAke2NhbGxiYWNrKE51bWJlci5wYXJzZUZsb2F0KGNhbGN1bGF0ZWRWYWx1ZSkpfXB4YCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fYXBwbHlNYW5pcHVsYXRpb25DYWxsYmFjayhzZWxlY3RvciwgbWFuaXB1bGF0aW9uQ2FsbEJhY2spO1xuICAgIH1cbiAgICBfc2F2ZUluaXRpYWxBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVQcm9wZXJ0eSkge1xuICAgICAgY29uc3QgYWN0dWFsVmFsdWUgPSBlbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoc3R5bGVQcm9wZXJ0eSk7XG4gICAgICBpZiAoYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgTWFuaXB1bGF0b3Iuc2V0RGF0YUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZVByb3BlcnR5LCBhY3R1YWxWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9yZXNldEVsZW1lbnRBdHRyaWJ1dGVzKHNlbGVjdG9yLCBzdHlsZVByb3BlcnR5KSB7XG4gICAgICBjb25zdCBtYW5pcHVsYXRpb25DYWxsQmFjayA9IGVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IE1hbmlwdWxhdG9yLmdldERhdGFBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVQcm9wZXJ0eSk7XG4gICAgICAgIC8vIFdlIG9ubHkgd2FudCB0byByZW1vdmUgdGhlIHByb3BlcnR5IGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGA7IHRoZSB2YWx1ZSBjYW4gYWxzbyBiZSB6ZXJvXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoc3R5bGVQcm9wZXJ0eSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIE1hbmlwdWxhdG9yLnJlbW92ZURhdGFBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVQcm9wZXJ0eSk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoc3R5bGVQcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2FwcGx5TWFuaXB1bGF0aW9uQ2FsbGJhY2soc2VsZWN0b3IsIG1hbmlwdWxhdGlvbkNhbGxCYWNrKTtcbiAgICB9XG4gICAgX2FwcGx5TWFuaXB1bGF0aW9uQ2FsbGJhY2soc2VsZWN0b3IsIGNhbGxCYWNrKSB7XG4gICAgICBpZiAoaXNFbGVtZW50KHNlbGVjdG9yKSkge1xuICAgICAgICBjYWxsQmFjayhzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3Qgc2VsIG9mIFNlbGVjdG9yRW5naW5lLmZpbmQoc2VsZWN0b3IsIHRoaXMuX2VsZW1lbnQpKSB7XG4gICAgICAgIGNhbGxCYWNrKHNlbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCBtb2RhbC5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IE5BTUUkNyA9ICdtb2RhbCc7XG4gIGNvbnN0IERBVEFfS0VZJDQgPSAnYnMubW9kYWwnO1xuICBjb25zdCBFVkVOVF9LRVkkNCA9IGAuJHtEQVRBX0tFWSQ0fWA7XG4gIGNvbnN0IERBVEFfQVBJX0tFWSQyID0gJy5kYXRhLWFwaSc7XG4gIGNvbnN0IEVTQ0FQRV9LRVkkMSA9ICdFc2NhcGUnO1xuICBjb25zdCBFVkVOVF9ISURFJDQgPSBgaGlkZSR7RVZFTlRfS0VZJDR9YDtcbiAgY29uc3QgRVZFTlRfSElERV9QUkVWRU5URUQkMSA9IGBoaWRlUHJldmVudGVkJHtFVkVOVF9LRVkkNH1gO1xuICBjb25zdCBFVkVOVF9ISURERU4kNCA9IGBoaWRkZW4ke0VWRU5UX0tFWSQ0fWA7XG4gIGNvbnN0IEVWRU5UX1NIT1ckNCA9IGBzaG93JHtFVkVOVF9LRVkkNH1gO1xuICBjb25zdCBFVkVOVF9TSE9XTiQ0ID0gYHNob3duJHtFVkVOVF9LRVkkNH1gO1xuICBjb25zdCBFVkVOVF9SRVNJWkUkMSA9IGByZXNpemUke0VWRU5UX0tFWSQ0fWA7XG4gIGNvbnN0IEVWRU5UX0NMSUNLX0RJU01JU1MgPSBgY2xpY2suZGlzbWlzcyR7RVZFTlRfS0VZJDR9YDtcbiAgY29uc3QgRVZFTlRfTU9VU0VET1dOX0RJU01JU1MgPSBgbW91c2Vkb3duLmRpc21pc3Mke0VWRU5UX0tFWSQ0fWA7XG4gIGNvbnN0IEVWRU5UX0tFWURPV05fRElTTUlTUyQxID0gYGtleWRvd24uZGlzbWlzcyR7RVZFTlRfS0VZJDR9YDtcbiAgY29uc3QgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkMiA9IGBjbGljayR7RVZFTlRfS0VZJDR9JHtEQVRBX0FQSV9LRVkkMn1gO1xuICBjb25zdCBDTEFTU19OQU1FX09QRU4gPSAnbW9kYWwtb3Blbic7XG4gIGNvbnN0IENMQVNTX05BTUVfRkFERSQzID0gJ2ZhZGUnO1xuICBjb25zdCBDTEFTU19OQU1FX1NIT1ckNCA9ICdzaG93JztcbiAgY29uc3QgQ0xBU1NfTkFNRV9TVEFUSUMgPSAnbW9kYWwtc3RhdGljJztcbiAgY29uc3QgT1BFTl9TRUxFQ1RPUiQxID0gJy5tb2RhbC5zaG93JztcbiAgY29uc3QgU0VMRUNUT1JfRElBTE9HID0gJy5tb2RhbC1kaWFsb2cnO1xuICBjb25zdCBTRUxFQ1RPUl9NT0RBTF9CT0RZID0gJy5tb2RhbC1ib2R5JztcbiAgY29uc3QgU0VMRUNUT1JfREFUQV9UT0dHTEUkMiA9ICdbZGF0YS1icy10b2dnbGU9XCJtb2RhbFwiXSc7XG4gIGNvbnN0IERlZmF1bHQkNiA9IHtcbiAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICBmb2N1czogdHJ1ZSxcbiAgICBrZXlib2FyZDogdHJ1ZVxuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQ2ID0ge1xuICAgIGJhY2tkcm9wOiAnKGJvb2xlYW58c3RyaW5nKScsXG4gICAgZm9jdXM6ICdib29sZWFuJyxcbiAgICBrZXlib2FyZDogJ2Jvb2xlYW4nXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgTW9kYWwgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICAgIHN1cGVyKGVsZW1lbnQsIGNvbmZpZyk7XG4gICAgICB0aGlzLl9kaWFsb2cgPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0RJQUxPRywgdGhpcy5fZWxlbWVudCk7XG4gICAgICB0aGlzLl9iYWNrZHJvcCA9IHRoaXMuX2luaXRpYWxpemVCYWNrRHJvcCgpO1xuICAgICAgdGhpcy5fZm9jdXN0cmFwID0gdGhpcy5faW5pdGlhbGl6ZUZvY3VzVHJhcCgpO1xuICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuICAgICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9zY3JvbGxCYXIgPSBuZXcgU2Nyb2xsQmFySGVscGVyKCk7XG4gICAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCQ2O1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJDY7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJDc7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgdG9nZ2xlKHJlbGF0ZWRUYXJnZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc1Nob3duID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3cocmVsYXRlZFRhcmdldCk7XG4gICAgfVxuICAgIHNob3cocmVsYXRlZFRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuX2lzU2hvd24gfHwgdGhpcy5faXNUcmFuc2l0aW9uaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNob3dFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NIT1ckNCwge1xuICAgICAgICByZWxhdGVkVGFyZ2V0XG4gICAgICB9KTtcbiAgICAgIGlmIChzaG93RXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9pc1Nob3duID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IHRydWU7XG4gICAgICB0aGlzLl9zY3JvbGxCYXIuaGlkZSgpO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfT1BFTik7XG4gICAgICB0aGlzLl9hZGp1c3REaWFsb2coKTtcbiAgICAgIHRoaXMuX2JhY2tkcm9wLnNob3coKCkgPT4gdGhpcy5fc2hvd0VsZW1lbnQocmVsYXRlZFRhcmdldCkpO1xuICAgIH1cbiAgICBoaWRlKCkge1xuICAgICAgaWYgKCF0aGlzLl9pc1Nob3duIHx8IHRoaXMuX2lzVHJhbnNpdGlvbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBoaWRlRXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFJDQpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcbiAgICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IHRydWU7XG4gICAgICB0aGlzLl9mb2N1c3RyYXAuZGVhY3RpdmF0ZSgpO1xuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVyQ0KTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soKCkgPT4gdGhpcy5faGlkZU1vZGFsKCksIHRoaXMuX2VsZW1lbnQsIHRoaXMuX2lzQW5pbWF0ZWQoKSk7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICBFdmVudEhhbmRsZXIub2ZmKHdpbmRvdywgRVZFTlRfS0VZJDQpO1xuICAgICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9kaWFsb2csIEVWRU5UX0tFWSQ0KTtcbiAgICAgIHRoaXMuX2JhY2tkcm9wLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKCk7XG4gICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGhhbmRsZVVwZGF0ZSgpIHtcbiAgICAgIHRoaXMuX2FkanVzdERpYWxvZygpO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfaW5pdGlhbGl6ZUJhY2tEcm9wKCkge1xuICAgICAgcmV0dXJuIG5ldyBCYWNrZHJvcCh7XG4gICAgICAgIGlzVmlzaWJsZTogQm9vbGVhbih0aGlzLl9jb25maWcuYmFja2Ryb3ApLFxuICAgICAgICAvLyAnc3RhdGljJyBvcHRpb24gd2lsbCBiZSB0cmFuc2xhdGVkIHRvIHRydWUsIGFuZCBib29sZWFucyB3aWxsIGtlZXAgdGhlaXIgdmFsdWUsXG4gICAgICAgIGlzQW5pbWF0ZWQ6IHRoaXMuX2lzQW5pbWF0ZWQoKVxuICAgICAgfSk7XG4gICAgfVxuICAgIF9pbml0aWFsaXplRm9jdXNUcmFwKCkge1xuICAgICAgcmV0dXJuIG5ldyBGb2N1c1RyYXAoe1xuICAgICAgICB0cmFwRWxlbWVudDogdGhpcy5fZWxlbWVudFxuICAgICAgfSk7XG4gICAgfVxuICAgIF9zaG93RWxlbWVudChyZWxhdGVkVGFyZ2V0KSB7XG4gICAgICAvLyB0cnkgdG8gYXBwZW5kIGR5bmFtaWMgbW9kYWxcbiAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLl9lbGVtZW50KSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0aGlzLl9lbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgdHJ1ZSk7XG4gICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICdkaWFsb2cnKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICAgIGNvbnN0IG1vZGFsQm9keSA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfTU9EQUxfQk9EWSwgdGhpcy5fZGlhbG9nKTtcbiAgICAgIGlmIChtb2RhbEJvZHkpIHtcbiAgICAgICAgbW9kYWxCb2R5LnNjcm9sbFRvcCA9IDA7XG4gICAgICB9XG4gICAgICByZWZsb3codGhpcy5fZWxlbWVudCk7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XJDQpO1xuICAgICAgY29uc3QgdHJhbnNpdGlvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY29uZmlnLmZvY3VzKSB7XG4gICAgICAgICAgdGhpcy5fZm9jdXN0cmFwLmFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gZmFsc2U7XG4gICAgICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NIT1dOJDQsIHtcbiAgICAgICAgICByZWxhdGVkVGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2sodHJhbnNpdGlvbkNvbXBsZXRlLCB0aGlzLl9kaWFsb2csIHRoaXMuX2lzQW5pbWF0ZWQoKSk7XG4gICAgfVxuICAgIF9hZGRFdmVudExpc3RlbmVycygpIHtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9LRVlET1dOX0RJU01JU1MkMSwgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSBFU0NBUEVfS0VZJDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5rZXlib2FyZCkge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90cmlnZ2VyQmFja2Ryb3BUcmFuc2l0aW9uKCk7XG4gICAgICB9KTtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih3aW5kb3csIEVWRU5UX1JFU0laRSQxLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3duICYmICF0aGlzLl9pc1RyYW5zaXRpb25pbmcpIHtcbiAgICAgICAgICB0aGlzLl9hZGp1c3REaWFsb2coKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfTU9VU0VET1dOX0RJU01JU1MsIGV2ZW50ID0+IHtcbiAgICAgICAgLy8gYSBiYWQgdHJpY2sgdG8gc2VncmVnYXRlIGNsaWNrcyB0aGF0IG1heSBzdGFydCBpbnNpZGUgZGlhbG9nIGJ1dCBlbmQgb3V0c2lkZSwgYW5kIGF2b2lkIGxpc3RlbiB0byBzY3JvbGxiYXIgY2xpY2tzXG4gICAgICAgIEV2ZW50SGFuZGxlci5vbmUodGhpcy5fZWxlbWVudCwgRVZFTlRfQ0xJQ0tfRElTTUlTUywgZXZlbnQyID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5fZWxlbWVudCAhPT0gZXZlbnQudGFyZ2V0IHx8IHRoaXMuX2VsZW1lbnQgIT09IGV2ZW50Mi50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJCYWNrZHJvcFRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBfaGlkZU1vZGFsKCkge1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcpO1xuICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcbiAgICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fYmFja2Ryb3AuaGlkZSgoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX09QRU4pO1xuICAgICAgICB0aGlzLl9yZXNldEFkanVzdG1lbnRzKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbEJhci5yZXNldCgpO1xuICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURERU4kNCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgX2lzQW5pbWF0ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFJDMpO1xuICAgIH1cbiAgICBfdHJpZ2dlckJhY2tkcm9wVHJhbnNpdGlvbigpIHtcbiAgICAgIGNvbnN0IGhpZGVFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJREVfUFJFVkVOVEVEJDEpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzTW9kYWxPdmVyZmxvd2luZyA9IHRoaXMuX2VsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIGNvbnN0IGluaXRpYWxPdmVyZmxvd1kgPSB0aGlzLl9lbGVtZW50LnN0eWxlLm92ZXJmbG93WTtcbiAgICAgIC8vIHJldHVybiBpZiB0aGUgZm9sbG93aW5nIGJhY2tncm91bmQgdHJhbnNpdGlvbiBoYXNuJ3QgeWV0IGNvbXBsZXRlZFxuICAgICAgaWYgKGluaXRpYWxPdmVyZmxvd1kgPT09ICdoaWRkZW4nIHx8IHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfU1RBVElDKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIWlzTW9kYWxPdmVyZmxvd2luZykge1xuICAgICAgICB0aGlzLl9lbGVtZW50LnN0eWxlLm92ZXJmbG93WSA9ICdoaWRkZW4nO1xuICAgICAgfVxuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU1RBVElDKTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TVEFUSUMpO1xuICAgICAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbGVtZW50LnN0eWxlLm92ZXJmbG93WSA9IGluaXRpYWxPdmVyZmxvd1k7XG4gICAgICAgIH0sIHRoaXMuX2RpYWxvZyk7XG4gICAgICB9LCB0aGlzLl9kaWFsb2cpO1xuICAgICAgdGhpcy5fZWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgdXNlZCB0byBoYW5kbGUgb3ZlcmZsb3dpbmcgbW9kYWxzXG4gICAgICovXG5cbiAgICBfYWRqdXN0RGlhbG9nKCkge1xuICAgICAgY29uc3QgaXNNb2RhbE92ZXJmbG93aW5nID0gdGhpcy5fZWxlbWVudC5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLl9zY3JvbGxCYXIuZ2V0V2lkdGgoKTtcbiAgICAgIGNvbnN0IGlzQm9keU92ZXJmbG93aW5nID0gc2Nyb2xsYmFyV2lkdGggPiAwO1xuICAgICAgaWYgKGlzQm9keU92ZXJmbG93aW5nICYmICFpc01vZGFsT3ZlcmZsb3dpbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSBpc1JUTCgpID8gJ3BhZGRpbmdMZWZ0JyA6ICdwYWRkaW5nUmlnaHQnO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnN0eWxlW3Byb3BlcnR5XSA9IGAke3Njcm9sbGJhcldpZHRofXB4YDtcbiAgICAgIH1cbiAgICAgIGlmICghaXNCb2R5T3ZlcmZsb3dpbmcgJiYgaXNNb2RhbE92ZXJmbG93aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gaXNSVEwoKSA/ICdwYWRkaW5nUmlnaHQnIDogJ3BhZGRpbmdMZWZ0JztcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZVtwcm9wZXJ0eV0gPSBgJHtzY3JvbGxiYXJXaWR0aH1weGA7XG4gICAgICB9XG4gICAgfVxuICAgIF9yZXNldEFkanVzdG1lbnRzKCkge1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5wYWRkaW5nTGVmdCA9ICcnO1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgICB9XG5cbiAgICAvLyBTdGF0aWNcbiAgICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZywgcmVsYXRlZFRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBNb2RhbC5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGRhdGFbY29uZmlnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbY29uZmlnXShyZWxhdGVkVGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICAgKi9cblxuICBFdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0NMSUNLX0RBVEFfQVBJJDIsIFNFTEVDVE9SX0RBVEFfVE9HR0xFJDIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IodGhpcyk7XG4gICAgaWYgKFsnQScsICdBUkVBJ10uaW5jbHVkZXModGhpcy50YWdOYW1lKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgRXZlbnRIYW5kbGVyLm9uZSh0YXJnZXQsIEVWRU5UX1NIT1ckNCwgc2hvd0V2ZW50ID0+IHtcbiAgICAgIGlmIChzaG93RXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAvLyBvbmx5IHJlZ2lzdGVyIGZvY3VzIHJlc3RvcmVyIGlmIG1vZGFsIHdpbGwgYWN0dWFsbHkgZ2V0IHNob3duXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIEV2ZW50SGFuZGxlci5vbmUodGFyZ2V0LCBFVkVOVF9ISURERU4kNCwgKCkgPT4ge1xuICAgICAgICBpZiAoaXNWaXNpYmxlKHRoaXMpKSB7XG4gICAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGF2b2lkIGNvbmZsaWN0IHdoZW4gY2xpY2tpbmcgbW9kYWwgdG9nZ2xlciB3aGlsZSBhbm90aGVyIG9uZSBpcyBvcGVuXG4gICAgY29uc3QgYWxyZWFkeU9wZW4gPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKE9QRU5fU0VMRUNUT1IkMSk7XG4gICAgaWYgKGFscmVhZHlPcGVuKSB7XG4gICAgICBNb2RhbC5nZXRJbnN0YW5jZShhbHJlYWR5T3BlbikuaGlkZSgpO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gTW9kYWwuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0YXJnZXQpO1xuICAgIGRhdGEudG9nZ2xlKHRoaXMpO1xuICB9KTtcbiAgZW5hYmxlRGlzbWlzc1RyaWdnZXIoTW9kYWwpO1xuXG4gIC8qKlxuICAgKiBqUXVlcnlcbiAgICovXG5cbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luKE1vZGFsKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIG9mZmNhbnZhcy5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IE5BTUUkNiA9ICdvZmZjYW52YXMnO1xuICBjb25zdCBEQVRBX0tFWSQzID0gJ2JzLm9mZmNhbnZhcyc7XG4gIGNvbnN0IEVWRU5UX0tFWSQzID0gYC4ke0RBVEFfS0VZJDN9YDtcbiAgY29uc3QgREFUQV9BUElfS0VZJDEgPSAnLmRhdGEtYXBpJztcbiAgY29uc3QgRVZFTlRfTE9BRF9EQVRBX0FQSSQyID0gYGxvYWQke0VWRU5UX0tFWSQzfSR7REFUQV9BUElfS0VZJDF9YDtcbiAgY29uc3QgRVNDQVBFX0tFWSA9ICdFc2NhcGUnO1xuICBjb25zdCBDTEFTU19OQU1FX1NIT1ckMyA9ICdzaG93JztcbiAgY29uc3QgQ0xBU1NfTkFNRV9TSE9XSU5HJDEgPSAnc2hvd2luZyc7XG4gIGNvbnN0IENMQVNTX05BTUVfSElESU5HID0gJ2hpZGluZyc7XG4gIGNvbnN0IENMQVNTX05BTUVfQkFDS0RST1AgPSAnb2ZmY2FudmFzLWJhY2tkcm9wJztcbiAgY29uc3QgT1BFTl9TRUxFQ1RPUiA9ICcub2ZmY2FudmFzLnNob3cnO1xuICBjb25zdCBFVkVOVF9TSE9XJDMgPSBgc2hvdyR7RVZFTlRfS0VZJDN9YDtcbiAgY29uc3QgRVZFTlRfU0hPV04kMyA9IGBzaG93biR7RVZFTlRfS0VZJDN9YDtcbiAgY29uc3QgRVZFTlRfSElERSQzID0gYGhpZGUke0VWRU5UX0tFWSQzfWA7XG4gIGNvbnN0IEVWRU5UX0hJREVfUFJFVkVOVEVEID0gYGhpZGVQcmV2ZW50ZWQke0VWRU5UX0tFWSQzfWA7XG4gIGNvbnN0IEVWRU5UX0hJRERFTiQzID0gYGhpZGRlbiR7RVZFTlRfS0VZJDN9YDtcbiAgY29uc3QgRVZFTlRfUkVTSVpFID0gYHJlc2l6ZSR7RVZFTlRfS0VZJDN9YDtcbiAgY29uc3QgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkMSA9IGBjbGljayR7RVZFTlRfS0VZJDN9JHtEQVRBX0FQSV9LRVkkMX1gO1xuICBjb25zdCBFVkVOVF9LRVlET1dOX0RJU01JU1MgPSBga2V5ZG93bi5kaXNtaXNzJHtFVkVOVF9LRVkkM31gO1xuICBjb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSQxID0gJ1tkYXRhLWJzLXRvZ2dsZT1cIm9mZmNhbnZhc1wiXSc7XG4gIGNvbnN0IERlZmF1bHQkNSA9IHtcbiAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICBzY3JvbGw6IGZhbHNlXG4gIH07XG4gIGNvbnN0IERlZmF1bHRUeXBlJDUgPSB7XG4gICAgYmFja2Ryb3A6ICcoYm9vbGVhbnxzdHJpbmcpJyxcbiAgICBrZXlib2FyZDogJ2Jvb2xlYW4nLFxuICAgIHNjcm9sbDogJ2Jvb2xlYW4nXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgT2ZmY2FudmFzIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICBzdXBlcihlbGVtZW50LCBjb25maWcpO1xuICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuICAgICAgdGhpcy5fYmFja2Ryb3AgPSB0aGlzLl9pbml0aWFsaXplQmFja0Ryb3AoKTtcbiAgICAgIHRoaXMuX2ZvY3VzdHJhcCA9IHRoaXMuX2luaXRpYWxpemVGb2N1c1RyYXAoKTtcbiAgICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0JDU7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdFR5cGUkNTtcbiAgICB9XG4gICAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgICAgcmV0dXJuIE5BTUUkNjtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWNcbiAgICB0b2dnbGUocmVsYXRlZFRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzU2hvd24gPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdyhyZWxhdGVkVGFyZ2V0KTtcbiAgICB9XG4gICAgc2hvdyhyZWxhdGVkVGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5faXNTaG93bikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBzaG93RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XJDMsIHtcbiAgICAgICAgcmVsYXRlZFRhcmdldFxuICAgICAgfSk7XG4gICAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNTaG93biA9IHRydWU7XG4gICAgICB0aGlzLl9iYWNrZHJvcC5zaG93KCk7XG4gICAgICBpZiAoIXRoaXMuX2NvbmZpZy5zY3JvbGwpIHtcbiAgICAgICAgbmV3IFNjcm9sbEJhckhlbHBlcigpLmhpZGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgdHJ1ZSk7XG4gICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICdkaWFsb2cnKTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX1NIT1dJTkckMSk7XG4gICAgICBjb25zdCBjb21wbGV0ZUNhbGxCYWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2NvbmZpZy5zY3JvbGwgfHwgdGhpcy5fY29uZmlnLmJhY2tkcm9wKSB7XG4gICAgICAgICAgdGhpcy5fZm9jdXN0cmFwLmFjdGl2YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVyQzKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPV0lORyQxKTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPV04kMywge1xuICAgICAgICAgIHJlbGF0ZWRUYXJnZXRcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZUNhbGxCYWNrLCB0aGlzLl9lbGVtZW50LCB0cnVlKTtcbiAgICB9XG4gICAgaGlkZSgpIHtcbiAgICAgIGlmICghdGhpcy5faXNTaG93bikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBoaWRlRXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFJDMpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKCk7XG4gICAgICB0aGlzLl9lbGVtZW50LmJsdXIoKTtcbiAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0hJRElORyk7XG4gICAgICB0aGlzLl9iYWNrZHJvcC5oaWRlKCk7XG4gICAgICBjb25zdCBjb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XJDMsIENMQVNTX05BTUVfSElESU5HKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3JvbGUnKTtcbiAgICAgICAgaWYgKCF0aGlzLl9jb25maWcuc2Nyb2xsKSB7XG4gICAgICAgICAgbmV3IFNjcm9sbEJhckhlbHBlcigpLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElEREVOJDMpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soY29tcGxldGVDYWxsYmFjaywgdGhpcy5fZWxlbWVudCwgdHJ1ZSk7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICB0aGlzLl9iYWNrZHJvcC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9mb2N1c3RyYXAuZGVhY3RpdmF0ZSgpO1xuICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfaW5pdGlhbGl6ZUJhY2tEcm9wKCkge1xuICAgICAgY29uc3QgY2xpY2tDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFX1BSRVZFTlRFRCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgfTtcblxuICAgICAgLy8gJ3N0YXRpYycgb3B0aW9uIHdpbGwgYmUgdHJhbnNsYXRlZCB0byB0cnVlLCBhbmQgYm9vbGVhbnMgd2lsbCBrZWVwIHRoZWlyIHZhbHVlXG4gICAgICBjb25zdCBpc1Zpc2libGUgPSBCb29sZWFuKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCk7XG4gICAgICByZXR1cm4gbmV3IEJhY2tkcm9wKHtcbiAgICAgICAgY2xhc3NOYW1lOiBDTEFTU19OQU1FX0JBQ0tEUk9QLFxuICAgICAgICBpc1Zpc2libGUsXG4gICAgICAgIGlzQW5pbWF0ZWQ6IHRydWUsXG4gICAgICAgIHJvb3RFbGVtZW50OiB0aGlzLl9lbGVtZW50LnBhcmVudE5vZGUsXG4gICAgICAgIGNsaWNrQ2FsbGJhY2s6IGlzVmlzaWJsZSA/IGNsaWNrQ2FsbGJhY2sgOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gICAgX2luaXRpYWxpemVGb2N1c1RyYXAoKSB7XG4gICAgICByZXR1cm4gbmV3IEZvY3VzVHJhcCh7XG4gICAgICAgIHRyYXBFbGVtZW50OiB0aGlzLl9lbGVtZW50XG4gICAgICB9KTtcbiAgICB9XG4gICAgX2FkZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0tFWURPV05fRElTTUlTUywgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSBFU0NBUEVfS0VZKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jb25maWcua2V5Ym9hcmQpIHtcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElERV9QUkVWRU5URUQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU3RhdGljXG4gICAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gT2ZmY2FudmFzLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhW2NvbmZpZ10gPT09IHVuZGVmaW5lZCB8fCBjb25maWcuc3RhcnRzV2l0aCgnXycpIHx8IGNvbmZpZyA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtjb25maWddKHRoaXMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEkkMSwgU0VMRUNUT1JfREFUQV9UT0dHTEUkMSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3Rvcih0aGlzKTtcbiAgICBpZiAoWydBJywgJ0FSRUEnXS5pbmNsdWRlcyh0aGlzLnRhZ05hbWUpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBpZiAoaXNEaXNhYmxlZCh0aGlzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBFdmVudEhhbmRsZXIub25lKHRhcmdldCwgRVZFTlRfSElEREVOJDMsICgpID0+IHtcbiAgICAgIC8vIGZvY3VzIG9uIHRyaWdnZXIgd2hlbiBpdCBpcyBjbG9zZWRcbiAgICAgIGlmIChpc1Zpc2libGUodGhpcykpIHtcbiAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYXZvaWQgY29uZmxpY3Qgd2hlbiBjbGlja2luZyBhIHRvZ2dsZXIgb2YgYW4gb2ZmY2FudmFzLCB3aGlsZSBhbm90aGVyIGlzIG9wZW5cbiAgICBjb25zdCBhbHJlYWR5T3BlbiA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoT1BFTl9TRUxFQ1RPUik7XG4gICAgaWYgKGFscmVhZHlPcGVuICYmIGFscmVhZHlPcGVuICE9PSB0YXJnZXQpIHtcbiAgICAgIE9mZmNhbnZhcy5nZXRJbnN0YW5jZShhbHJlYWR5T3BlbikuaGlkZSgpO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gT2ZmY2FudmFzLmdldE9yQ3JlYXRlSW5zdGFuY2UodGFyZ2V0KTtcbiAgICBkYXRhLnRvZ2dsZSh0aGlzKTtcbiAgfSk7XG4gIEV2ZW50SGFuZGxlci5vbih3aW5kb3csIEVWRU5UX0xPQURfREFUQV9BUEkkMiwgKCkgPT4ge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgU2VsZWN0b3JFbmdpbmUuZmluZChPUEVOX1NFTEVDVE9SKSkge1xuICAgICAgT2ZmY2FudmFzLmdldE9yQ3JlYXRlSW5zdGFuY2Uoc2VsZWN0b3IpLnNob3coKTtcbiAgICB9XG4gIH0pO1xuICBFdmVudEhhbmRsZXIub24od2luZG93LCBFVkVOVF9SRVNJWkUsICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgU2VsZWN0b3JFbmdpbmUuZmluZCgnW2FyaWEtbW9kYWxdW2NsYXNzKj1zaG93XVtjbGFzcyo9b2ZmY2FudmFzLV0nKSkge1xuICAgICAgaWYgKGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgT2ZmY2FudmFzLmdldE9yQ3JlYXRlSW5zdGFuY2UoZWxlbWVudCkuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGVuYWJsZURpc21pc3NUcmlnZ2VyKE9mZmNhbnZhcyk7XG5cbiAgLyoqXG4gICAqIGpRdWVyeVxuICAgKi9cblxuICBkZWZpbmVKUXVlcnlQbHVnaW4oT2ZmY2FudmFzKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHV0aWwvc2FuaXRpemVyLmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuICAvLyBqcy1kb2NzLXN0YXJ0IGFsbG93LWxpc3RcbiAgY29uc3QgQVJJQV9BVFRSSUJVVEVfUEFUVEVSTiA9IC9eYXJpYS1bXFx3LV0qJC9pO1xuICBjb25zdCBEZWZhdWx0QWxsb3dsaXN0ID0ge1xuICAgIC8vIEdsb2JhbCBhdHRyaWJ1dGVzIGFsbG93ZWQgb24gYW55IHN1cHBsaWVkIGVsZW1lbnQgYmVsb3cuXG4gICAgJyonOiBbJ2NsYXNzJywgJ2RpcicsICdpZCcsICdsYW5nJywgJ3JvbGUnLCBBUklBX0FUVFJJQlVURV9QQVRURVJOXSxcbiAgICBhOiBbJ3RhcmdldCcsICdocmVmJywgJ3RpdGxlJywgJ3JlbCddLFxuICAgIGFyZWE6IFtdLFxuICAgIGI6IFtdLFxuICAgIGJyOiBbXSxcbiAgICBjb2w6IFtdLFxuICAgIGNvZGU6IFtdLFxuICAgIGRkOiBbXSxcbiAgICBkaXY6IFtdLFxuICAgIGRsOiBbXSxcbiAgICBkdDogW10sXG4gICAgZW06IFtdLFxuICAgIGhyOiBbXSxcbiAgICBoMTogW10sXG4gICAgaDI6IFtdLFxuICAgIGgzOiBbXSxcbiAgICBoNDogW10sXG4gICAgaDU6IFtdLFxuICAgIGg2OiBbXSxcbiAgICBpOiBbXSxcbiAgICBpbWc6IFsnc3JjJywgJ3NyY3NldCcsICdhbHQnLCAndGl0bGUnLCAnd2lkdGgnLCAnaGVpZ2h0J10sXG4gICAgbGk6IFtdLFxuICAgIG9sOiBbXSxcbiAgICBwOiBbXSxcbiAgICBwcmU6IFtdLFxuICAgIHM6IFtdLFxuICAgIHNtYWxsOiBbXSxcbiAgICBzcGFuOiBbXSxcbiAgICBzdWI6IFtdLFxuICAgIHN1cDogW10sXG4gICAgc3Ryb25nOiBbXSxcbiAgICB1OiBbXSxcbiAgICB1bDogW11cbiAgfTtcbiAgLy8ganMtZG9jcy1lbmQgYWxsb3ctbGlzdFxuXG4gIGNvbnN0IHVyaUF0dHJpYnV0ZXMgPSBuZXcgU2V0KFsnYmFja2dyb3VuZCcsICdjaXRlJywgJ2hyZWYnLCAnaXRlbXR5cGUnLCAnbG9uZ2Rlc2MnLCAncG9zdGVyJywgJ3NyYycsICd4bGluazpocmVmJ10pO1xuXG4gIC8qKlxuICAgKiBBIHBhdHRlcm4gdGhhdCByZWNvZ25pemVzIFVSTHMgdGhhdCBhcmUgc2FmZSB3cnQuIFhTUyBpbiBVUkwgbmF2aWdhdGlvblxuICAgKiBjb250ZXh0cy5cbiAgICpcbiAgICogU2hvdXQtb3V0IHRvIEFuZ3VsYXIgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzE1LjIuOC9wYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vdXJsX3Nhbml0aXplci50cyNMMzhcbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL2JldHRlci1yZWdleFxuICBjb25zdCBTQUZFX1VSTF9QQVRURVJOID0gL14oPyFqYXZhc2NyaXB0OikoPzpbYS16MC05Ky4tXSs6fFteJjovPyNdKig/OlsvPyNdfCQpKS9pO1xuICBjb25zdCBhbGxvd2VkQXR0cmlidXRlID0gKGF0dHJpYnV0ZSwgYWxsb3dlZEF0dHJpYnV0ZUxpc3QpID0+IHtcbiAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gYXR0cmlidXRlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGFsbG93ZWRBdHRyaWJ1dGVMaXN0LmluY2x1ZGVzKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICBpZiAodXJpQXR0cmlidXRlcy5oYXMoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oU0FGRV9VUkxfUEFUVEVSTi50ZXN0KGF0dHJpYnV0ZS5ub2RlVmFsdWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGEgcmVndWxhciBleHByZXNzaW9uIHZhbGlkYXRlcyB0aGUgYXR0cmlidXRlLlxuICAgIHJldHVybiBhbGxvd2VkQXR0cmlidXRlTGlzdC5maWx0ZXIoYXR0cmlidXRlUmVnZXggPT4gYXR0cmlidXRlUmVnZXggaW5zdGFuY2VvZiBSZWdFeHApLnNvbWUocmVnZXggPT4gcmVnZXgudGVzdChhdHRyaWJ1dGVOYW1lKSk7XG4gIH07XG4gIGZ1bmN0aW9uIHNhbml0aXplSHRtbCh1bnNhZmVIdG1sLCBhbGxvd0xpc3QsIHNhbml0aXplRnVuY3Rpb24pIHtcbiAgICBpZiAoIXVuc2FmZUh0bWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdW5zYWZlSHRtbDtcbiAgICB9XG4gICAgaWYgKHNhbml0aXplRnVuY3Rpb24gJiYgdHlwZW9mIHNhbml0aXplRnVuY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBzYW5pdGl6ZUZ1bmN0aW9uKHVuc2FmZUh0bWwpO1xuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuICAgIGNvbnN0IGNyZWF0ZWREb2N1bWVudCA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcodW5zYWZlSHRtbCwgJ3RleHQvaHRtbCcpO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gW10uY29uY2F0KC4uLmNyZWF0ZWREb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSk7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBjb25zdCBlbGVtZW50TmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghT2JqZWN0LmtleXMoYWxsb3dMaXN0KS5pbmNsdWRlcyhlbGVtZW50TmFtZSkpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBhdHRyaWJ1dGVMaXN0ID0gW10uY29uY2F0KC4uLmVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgICBjb25zdCBhbGxvd2VkQXR0cmlidXRlcyA9IFtdLmNvbmNhdChhbGxvd0xpc3RbJyonXSB8fCBbXSwgYWxsb3dMaXN0W2VsZW1lbnROYW1lXSB8fCBbXSk7XG4gICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVMaXN0KSB7XG4gICAgICAgIGlmICghYWxsb3dlZEF0dHJpYnV0ZShhdHRyaWJ1dGUsIGFsbG93ZWRBdHRyaWJ1dGVzKSkge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZS5ub2RlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZWREb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbiAgfVxuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgdXRpbC90ZW1wbGF0ZS1mYWN0b3J5LmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSQ1ID0gJ1RlbXBsYXRlRmFjdG9yeSc7XG4gIGNvbnN0IERlZmF1bHQkNCA9IHtcbiAgICBhbGxvd0xpc3Q6IERlZmF1bHRBbGxvd2xpc3QsXG4gICAgY29udGVudDoge30sXG4gICAgLy8geyBzZWxlY3RvciA6IHRleHQgLCAgc2VsZWN0b3IyIDogdGV4dDIgLCB9XG4gICAgZXh0cmFDbGFzczogJycsXG4gICAgaHRtbDogZmFsc2UsXG4gICAgc2FuaXRpemU6IHRydWUsXG4gICAgc2FuaXRpemVGbjogbnVsbCxcbiAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+J1xuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQ0ID0ge1xuICAgIGFsbG93TGlzdDogJ29iamVjdCcsXG4gICAgY29udGVudDogJ29iamVjdCcsXG4gICAgZXh0cmFDbGFzczogJyhzdHJpbmd8ZnVuY3Rpb24pJyxcbiAgICBodG1sOiAnYm9vbGVhbicsXG4gICAgc2FuaXRpemU6ICdib29sZWFuJyxcbiAgICBzYW5pdGl6ZUZuOiAnKG51bGx8ZnVuY3Rpb24pJyxcbiAgICB0ZW1wbGF0ZTogJ3N0cmluZydcbiAgfTtcbiAgY29uc3QgRGVmYXVsdENvbnRlbnRUeXBlID0ge1xuICAgIGVudHJ5OiAnKHN0cmluZ3xlbGVtZW50fGZ1bmN0aW9ufG51bGwpJyxcbiAgICBzZWxlY3RvcjogJyhzdHJpbmd8ZWxlbWVudCknXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgVGVtcGxhdGVGYWN0b3J5IGV4dGVuZHMgQ29uZmlnIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLl9jb25maWcgPSB0aGlzLl9nZXRDb25maWcoY29uZmlnKTtcbiAgICB9XG5cbiAgICAvLyBHZXR0ZXJzXG4gICAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgICAgcmV0dXJuIERlZmF1bHQkNDtcbiAgICB9XG4gICAgc3RhdGljIGdldCBEZWZhdWx0VHlwZSgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0VHlwZSQ0O1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IE5BTUUoKSB7XG4gICAgICByZXR1cm4gTkFNRSQ1O1xuICAgIH1cblxuICAgIC8vIFB1YmxpY1xuICAgIGdldENvbnRlbnQoKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLl9jb25maWcuY29udGVudCkubWFwKGNvbmZpZyA9PiB0aGlzLl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbihjb25maWcpKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgfVxuICAgIGhhc0NvbnRlbnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb250ZW50KCkubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgY2hhbmdlQ29udGVudChjb250ZW50KSB7XG4gICAgICB0aGlzLl9jaGVja0NvbnRlbnQoY29udGVudCk7XG4gICAgICB0aGlzLl9jb25maWcuY29udGVudCA9IHtcbiAgICAgICAgLi4udGhpcy5fY29uZmlnLmNvbnRlbnQsXG4gICAgICAgIC4uLmNvbnRlbnRcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9IdG1sKCkge1xuICAgICAgY29uc3QgdGVtcGxhdGVXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0ZW1wbGF0ZVdyYXBwZXIuaW5uZXJIVE1MID0gdGhpcy5fbWF5YmVTYW5pdGl6ZSh0aGlzLl9jb25maWcudGVtcGxhdGUpO1xuICAgICAgZm9yIChjb25zdCBbc2VsZWN0b3IsIHRleHRdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX2NvbmZpZy5jb250ZW50KSkge1xuICAgICAgICB0aGlzLl9zZXRDb250ZW50KHRlbXBsYXRlV3JhcHBlciwgdGV4dCwgc2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgY29uc3QgdGVtcGxhdGUgPSB0ZW1wbGF0ZVdyYXBwZXIuY2hpbGRyZW5bMF07XG4gICAgICBjb25zdCBleHRyYUNsYXNzID0gdGhpcy5fcmVzb2x2ZVBvc3NpYmxlRnVuY3Rpb24odGhpcy5fY29uZmlnLmV4dHJhQ2xhc3MpO1xuICAgICAgaWYgKGV4dHJhQ2xhc3MpIHtcbiAgICAgICAgdGVtcGxhdGUuY2xhc3NMaXN0LmFkZCguLi5leHRyYUNsYXNzLnNwbGl0KCcgJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfdHlwZUNoZWNrQ29uZmlnKGNvbmZpZykge1xuICAgICAgc3VwZXIuX3R5cGVDaGVja0NvbmZpZyhjb25maWcpO1xuICAgICAgdGhpcy5fY2hlY2tDb250ZW50KGNvbmZpZy5jb250ZW50KTtcbiAgICB9XG4gICAgX2NoZWNrQ29udGVudChhcmcpIHtcbiAgICAgIGZvciAoY29uc3QgW3NlbGVjdG9yLCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhhcmcpKSB7XG4gICAgICAgIHN1cGVyLl90eXBlQ2hlY2tDb25maWcoe1xuICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgIGVudHJ5OiBjb250ZW50XG4gICAgICAgIH0sIERlZmF1bHRDb250ZW50VHlwZSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9zZXRDb250ZW50KHRlbXBsYXRlLCBjb250ZW50LCBzZWxlY3Rvcikge1xuICAgICAgY29uc3QgdGVtcGxhdGVFbGVtZW50ID0gU2VsZWN0b3JFbmdpbmUuZmluZE9uZShzZWxlY3RvciwgdGVtcGxhdGUpO1xuICAgICAgaWYgKCF0ZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29udGVudCA9IHRoaXMuX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKGNvbnRlbnQpO1xuICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgIHRlbXBsYXRlRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGlzRWxlbWVudChjb250ZW50KSkge1xuICAgICAgICB0aGlzLl9wdXRFbGVtZW50SW5UZW1wbGF0ZShnZXRFbGVtZW50KGNvbnRlbnQpLCB0ZW1wbGF0ZUVsZW1lbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY29uZmlnLmh0bWwpIHtcbiAgICAgICAgdGVtcGxhdGVFbGVtZW50LmlubmVySFRNTCA9IHRoaXMuX21heWJlU2FuaXRpemUoY29udGVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRlbXBsYXRlRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbnRlbnQ7XG4gICAgfVxuICAgIF9tYXliZVNhbml0aXplKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5zYW5pdGl6ZSA/IHNhbml0aXplSHRtbChhcmcsIHRoaXMuX2NvbmZpZy5hbGxvd0xpc3QsIHRoaXMuX2NvbmZpZy5zYW5pdGl6ZUZuKSA6IGFyZztcbiAgICB9XG4gICAgX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIGV4ZWN1dGUoYXJnLCBbdGhpc10pO1xuICAgIH1cbiAgICBfcHV0RWxlbWVudEluVGVtcGxhdGUoZWxlbWVudCwgdGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5fY29uZmlnLmh0bWwpIHtcbiAgICAgICAgdGVtcGxhdGVFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICB0ZW1wbGF0ZUVsZW1lbnQuYXBwZW5kKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0ZW1wbGF0ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBCb290c3RyYXAgdG9vbHRpcC5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IE5BTUUkNCA9ICd0b29sdGlwJztcbiAgY29uc3QgRElTQUxMT1dFRF9BVFRSSUJVVEVTID0gbmV3IFNldChbJ3Nhbml0aXplJywgJ2FsbG93TGlzdCcsICdzYW5pdGl6ZUZuJ10pO1xuICBjb25zdCBDTEFTU19OQU1FX0ZBREUkMiA9ICdmYWRlJztcbiAgY29uc3QgQ0xBU1NfTkFNRV9NT0RBTCA9ICdtb2RhbCc7XG4gIGNvbnN0IENMQVNTX05BTUVfU0hPVyQyID0gJ3Nob3cnO1xuICBjb25zdCBTRUxFQ1RPUl9UT09MVElQX0lOTkVSID0gJy50b29sdGlwLWlubmVyJztcbiAgY29uc3QgU0VMRUNUT1JfTU9EQUwgPSBgLiR7Q0xBU1NfTkFNRV9NT0RBTH1gO1xuICBjb25zdCBFVkVOVF9NT0RBTF9ISURFID0gJ2hpZGUuYnMubW9kYWwnO1xuICBjb25zdCBUUklHR0VSX0hPVkVSID0gJ2hvdmVyJztcbiAgY29uc3QgVFJJR0dFUl9GT0NVUyA9ICdmb2N1cyc7XG4gIGNvbnN0IFRSSUdHRVJfQ0xJQ0sgPSAnY2xpY2snO1xuICBjb25zdCBUUklHR0VSX01BTlVBTCA9ICdtYW51YWwnO1xuICBjb25zdCBFVkVOVF9ISURFJDIgPSAnaGlkZSc7XG4gIGNvbnN0IEVWRU5UX0hJRERFTiQyID0gJ2hpZGRlbic7XG4gIGNvbnN0IEVWRU5UX1NIT1ckMiA9ICdzaG93JztcbiAgY29uc3QgRVZFTlRfU0hPV04kMiA9ICdzaG93bic7XG4gIGNvbnN0IEVWRU5UX0lOU0VSVEVEID0gJ2luc2VydGVkJztcbiAgY29uc3QgRVZFTlRfQ0xJQ0skMSA9ICdjbGljayc7XG4gIGNvbnN0IEVWRU5UX0ZPQ1VTSU4kMSA9ICdmb2N1c2luJztcbiAgY29uc3QgRVZFTlRfRk9DVVNPVVQkMSA9ICdmb2N1c291dCc7XG4gIGNvbnN0IEVWRU5UX01PVVNFRU5URVIgPSAnbW91c2VlbnRlcic7XG4gIGNvbnN0IEVWRU5UX01PVVNFTEVBVkUgPSAnbW91c2VsZWF2ZSc7XG4gIGNvbnN0IEF0dGFjaG1lbnRNYXAgPSB7XG4gICAgQVVUTzogJ2F1dG8nLFxuICAgIFRPUDogJ3RvcCcsXG4gICAgUklHSFQ6IGlzUlRMKCkgPyAnbGVmdCcgOiAncmlnaHQnLFxuICAgIEJPVFRPTTogJ2JvdHRvbScsXG4gICAgTEVGVDogaXNSVEwoKSA/ICdyaWdodCcgOiAnbGVmdCdcbiAgfTtcbiAgY29uc3QgRGVmYXVsdCQzID0ge1xuICAgIGFsbG93TGlzdDogRGVmYXVsdEFsbG93bGlzdCxcbiAgICBhbmltYXRpb246IHRydWUsXG4gICAgYm91bmRhcnk6ICdjbGlwcGluZ1BhcmVudHMnLFxuICAgIGNvbnRhaW5lcjogZmFsc2UsXG4gICAgY3VzdG9tQ2xhc3M6ICcnLFxuICAgIGRlbGF5OiAwLFxuICAgIGZhbGxiYWNrUGxhY2VtZW50czogWyd0b3AnLCAncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnXSxcbiAgICBodG1sOiBmYWxzZSxcbiAgICBvZmZzZXQ6IFswLCA2XSxcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgIHBvcHBlckNvbmZpZzogbnVsbCxcbiAgICBzYW5pdGl6ZTogdHJ1ZSxcbiAgICBzYW5pdGl6ZUZuOiBudWxsLFxuICAgIHNlbGVjdG9yOiBmYWxzZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgcm9sZT1cInRvb2x0aXBcIj4nICsgJzxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+JyArICc8ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PicgKyAnPC9kaXY+JyxcbiAgICB0aXRsZTogJycsXG4gICAgdHJpZ2dlcjogJ2hvdmVyIGZvY3VzJ1xuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQzID0ge1xuICAgIGFsbG93TGlzdDogJ29iamVjdCcsXG4gICAgYW5pbWF0aW9uOiAnYm9vbGVhbicsXG4gICAgYm91bmRhcnk6ICcoc3RyaW5nfGVsZW1lbnQpJyxcbiAgICBjb250YWluZXI6ICcoc3RyaW5nfGVsZW1lbnR8Ym9vbGVhbiknLFxuICAgIGN1c3RvbUNsYXNzOiAnKHN0cmluZ3xmdW5jdGlvbiknLFxuICAgIGRlbGF5OiAnKG51bWJlcnxvYmplY3QpJyxcbiAgICBmYWxsYmFja1BsYWNlbWVudHM6ICdhcnJheScsXG4gICAgaHRtbDogJ2Jvb2xlYW4nLFxuICAgIG9mZnNldDogJyhhcnJheXxzdHJpbmd8ZnVuY3Rpb24pJyxcbiAgICBwbGFjZW1lbnQ6ICcoc3RyaW5nfGZ1bmN0aW9uKScsXG4gICAgcG9wcGVyQ29uZmlnOiAnKG51bGx8b2JqZWN0fGZ1bmN0aW9uKScsXG4gICAgc2FuaXRpemU6ICdib29sZWFuJyxcbiAgICBzYW5pdGl6ZUZuOiAnKG51bGx8ZnVuY3Rpb24pJyxcbiAgICBzZWxlY3RvcjogJyhzdHJpbmd8Ym9vbGVhbiknLFxuICAgIHRlbXBsYXRlOiAnc3RyaW5nJyxcbiAgICB0aXRsZTogJyhzdHJpbmd8ZWxlbWVudHxmdW5jdGlvbiknLFxuICAgIHRyaWdnZXI6ICdzdHJpbmcnXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgVG9vbHRpcCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNvbmZpZykge1xuICAgICAgaWYgKHR5cGVvZiBQb3BwZXJfX25hbWVzcGFjZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9vdHN0cmFwXFwncyB0b29sdGlwcyByZXF1aXJlIFBvcHBlciAoaHR0cHM6Ly9wb3BwZXIuanMub3JnKScpO1xuICAgICAgfVxuICAgICAgc3VwZXIoZWxlbWVudCwgY29uZmlnKTtcblxuICAgICAgLy8gUHJpdmF0ZVxuICAgICAgdGhpcy5faXNFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3RpbWVvdXQgPSAwO1xuICAgICAgdGhpcy5faXNIb3ZlcmVkID0gbnVsbDtcbiAgICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXIgPSB7fTtcbiAgICAgIHRoaXMuX3BvcHBlciA9IG51bGw7XG4gICAgICB0aGlzLl90ZW1wbGF0ZUZhY3RvcnkgPSBudWxsO1xuICAgICAgdGhpcy5fbmV3Q29udGVudCA9IG51bGw7XG5cbiAgICAgIC8vIFByb3RlY3RlZFxuICAgICAgdGhpcy50aXAgPSBudWxsO1xuICAgICAgdGhpcy5fc2V0TGlzdGVuZXJzKCk7XG4gICAgICBpZiAoIXRoaXMuX2NvbmZpZy5zZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9maXhUaXRsZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCQzO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJDM7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJDQ7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgZW5hYmxlKCkge1xuICAgICAgdGhpcy5faXNFbmFibGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzYWJsZSgpIHtcbiAgICAgIHRoaXMuX2lzRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB0b2dnbGVFbmFibGVkKCkge1xuICAgICAgdGhpcy5faXNFbmFibGVkID0gIXRoaXMuX2lzRW5hYmxlZDtcbiAgICB9XG4gICAgdG9nZ2xlKCkge1xuICAgICAgaWYgKCF0aGlzLl9pc0VuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fYWN0aXZlVHJpZ2dlci5jbGljayA9ICF0aGlzLl9hY3RpdmVUcmlnZ2VyLmNsaWNrO1xuICAgICAgaWYgKHRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgICB0aGlzLl9sZWF2ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9lbnRlcigpO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpO1xuICAgICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9lbGVtZW50LmNsb3Nlc3QoU0VMRUNUT1JfTU9EQUwpLCBFVkVOVF9NT0RBTF9ISURFLCB0aGlzLl9oaWRlTW9kYWxIYW5kbGVyKTtcbiAgICAgIGlmICh0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1icy1vcmlnaW5hbC10aXRsZScpKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJzLW9yaWdpbmFsLXRpdGxlJykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGlzcG9zZVBvcHBlcigpO1xuICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBzaG93KCkge1xuICAgICAgaWYgKHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHVzZSBzaG93IG9uIHZpc2libGUgZWxlbWVudHMnKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHRoaXMuX2lzV2l0aENvbnRlbnQoKSAmJiB0aGlzLl9pc0VuYWJsZWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNob3dFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX1NIT1ckMikpO1xuICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IGZpbmRTaGFkb3dSb290KHRoaXMuX2VsZW1lbnQpO1xuICAgICAgY29uc3QgaXNJblRoZURvbSA9IChzaGFkb3dSb290IHx8IHRoaXMuX2VsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmNvbnRhaW5zKHRoaXMuX2VsZW1lbnQpO1xuICAgICAgaWYgKHNob3dFdmVudC5kZWZhdWx0UHJldmVudGVkIHx8ICFpc0luVGhlRG9tKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogdjYgcmVtb3ZlIHRoaXMgb3IgbWFrZSBpdCBvcHRpb25hbFxuICAgICAgdGhpcy5fZGlzcG9zZVBvcHBlcigpO1xuICAgICAgY29uc3QgdGlwID0gdGhpcy5fZ2V0VGlwRWxlbWVudCgpO1xuICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aXAuZ2V0QXR0cmlidXRlKCdpZCcpKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29udGFpbmVyXG4gICAgICB9ID0gdGhpcy5fY29uZmlnO1xuICAgICAgaWYgKCF0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKHRoaXMudGlwKSkge1xuICAgICAgICBjb250YWluZXIuYXBwZW5kKHRpcCk7XG4gICAgICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX0lOU0VSVEVEKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9wb3BwZXIgPSB0aGlzLl9jcmVhdGVQb3BwZXIodGlwKTtcbiAgICAgIHRpcC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVyQyKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRvdWNoLWVuYWJsZWQgZGV2aWNlIHdlIGFkZCBleHRyYVxuICAgICAgLy8gZW1wdHkgbW91c2VvdmVyIGxpc3RlbmVycyB0byB0aGUgYm9keSdzIGltbWVkaWF0ZSBjaGlsZHJlbjtcbiAgICAgIC8vIG9ubHkgbmVlZGVkIGJlY2F1c2Ugb2YgYnJva2VuIGV2ZW50IGRlbGVnYXRpb24gb24gaU9TXG4gICAgICAvLyBodHRwczovL3d3dy5xdWlya3Ntb2RlLm9yZy9ibG9nL2FyY2hpdmVzLzIwMTQvMDIvbW91c2VfZXZlbnRfYnViLmh0bWxcbiAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFtdLmNvbmNhdCguLi5kb2N1bWVudC5ib2R5LmNoaWxkcmVuKSkge1xuICAgICAgICAgIEV2ZW50SGFuZGxlci5vbihlbGVtZW50LCAnbW91c2VvdmVyJywgbm9vcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9TSE9XTiQyKSk7XG4gICAgICAgIGlmICh0aGlzLl9pc0hvdmVyZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy5fbGVhdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc0hvdmVyZWQgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCB0aGlzLnRpcCwgdGhpcy5faXNBbmltYXRlZCgpKTtcbiAgICB9XG4gICAgaGlkZSgpIHtcbiAgICAgIGlmICghdGhpcy5faXNTaG93bigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhpZGVFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX0hJREUkMikpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRpcCA9IHRoaXMuX2dldFRpcEVsZW1lbnQoKTtcbiAgICAgIHRpcC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVyQyKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRvdWNoLWVuYWJsZWQgZGV2aWNlIHdlIHJlbW92ZSB0aGUgZXh0cmFcbiAgICAgIC8vIGVtcHR5IG1vdXNlb3ZlciBsaXN0ZW5lcnMgd2UgYWRkZWQgZm9yIGlPUyBzdXBwb3J0XG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBbXS5jb25jYXQoLi4uZG9jdW1lbnQuYm9keS5jaGlsZHJlbikpIHtcbiAgICAgICAgICBFdmVudEhhbmRsZXIub2ZmKGVsZW1lbnQsICdtb3VzZW92ZXInLCBub29wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fYWN0aXZlVHJpZ2dlcltUUklHR0VSX0NMSUNLXSA9IGZhbHNlO1xuICAgICAgdGhpcy5fYWN0aXZlVHJpZ2dlcltUUklHR0VSX0ZPQ1VTXSA9IGZhbHNlO1xuICAgICAgdGhpcy5fYWN0aXZlVHJpZ2dlcltUUklHR0VSX0hPVkVSXSA9IGZhbHNlO1xuICAgICAgdGhpcy5faXNIb3ZlcmVkID0gbnVsbDsgLy8gaXQgaXMgYSB0cmljayB0byBzdXBwb3J0IG1hbnVhbCB0cmlnZ2VyaW5nXG5cbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNXaXRoQWN0aXZlVHJpZ2dlcigpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faXNIb3ZlcmVkKSB7XG4gICAgICAgICAgdGhpcy5fZGlzcG9zZVBvcHBlcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX0hJRERFTiQyKSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZSwgdGhpcy50aXAsIHRoaXMuX2lzQW5pbWF0ZWQoKSk7XG4gICAgfVxuICAgIHVwZGF0ZSgpIHtcbiAgICAgIGlmICh0aGlzLl9wb3BwZXIpIHtcbiAgICAgICAgdGhpcy5fcG9wcGVyLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb3RlY3RlZFxuICAgIF9pc1dpdGhDb250ZW50KCkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fZ2V0VGl0bGUoKSk7XG4gICAgfVxuICAgIF9nZXRUaXBFbGVtZW50KCkge1xuICAgICAgaWYgKCF0aGlzLnRpcCkge1xuICAgICAgICB0aGlzLnRpcCA9IHRoaXMuX2NyZWF0ZVRpcEVsZW1lbnQodGhpcy5fbmV3Q29udGVudCB8fCB0aGlzLl9nZXRDb250ZW50Rm9yVGVtcGxhdGUoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50aXA7XG4gICAgfVxuICAgIF9jcmVhdGVUaXBFbGVtZW50KGNvbnRlbnQpIHtcbiAgICAgIGNvbnN0IHRpcCA9IHRoaXMuX2dldFRlbXBsYXRlRmFjdG9yeShjb250ZW50KS50b0h0bWwoKTtcblxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgY2hlY2sgaW4gdjZcbiAgICAgIGlmICghdGlwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdGlwLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9GQURFJDIsIENMQVNTX05BTUVfU0hPVyQyKTtcbiAgICAgIC8vIFRPRE86IHY2IHRoZSBmb2xsb3dpbmcgY2FuIGJlIGFjaGlldmVkIHdpdGggQ1NTIG9ubHlcbiAgICAgIHRpcC5jbGFzc0xpc3QuYWRkKGBicy0ke3RoaXMuY29uc3RydWN0b3IuTkFNRX0tYXV0b2ApO1xuICAgICAgY29uc3QgdGlwSWQgPSBnZXRVSUQodGhpcy5jb25zdHJ1Y3Rvci5OQU1FKS50b1N0cmluZygpO1xuICAgICAgdGlwLnNldEF0dHJpYnV0ZSgnaWQnLCB0aXBJZCk7XG4gICAgICBpZiAodGhpcy5faXNBbmltYXRlZCgpKSB7XG4gICAgICAgIHRpcC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfRkFERSQyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aXA7XG4gICAgfVxuICAgIHNldENvbnRlbnQoY29udGVudCkge1xuICAgICAgdGhpcy5fbmV3Q29udGVudCA9IGNvbnRlbnQ7XG4gICAgICBpZiAodGhpcy5faXNTaG93bigpKSB7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VQb3BwZXIoKTtcbiAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9nZXRUZW1wbGF0ZUZhY3RvcnkoY29udGVudCkge1xuICAgICAgaWYgKHRoaXMuX3RlbXBsYXRlRmFjdG9yeSkge1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZUZhY3RvcnkuY2hhbmdlQ29udGVudChjb250ZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlRmFjdG9yeSA9IG5ldyBUZW1wbGF0ZUZhY3Rvcnkoe1xuICAgICAgICAgIC4uLnRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAvLyB0aGUgYGNvbnRlbnRgIHZhciBoYXMgdG8gYmUgYWZ0ZXIgYHRoaXMuX2NvbmZpZ2BcbiAgICAgICAgICAvLyB0byBvdmVycmlkZSBjb25maWcuY29udGVudCBpbiBjYXNlIG9mIHBvcG92ZXJcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIGV4dHJhQ2xhc3M6IHRoaXMuX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKHRoaXMuX2NvbmZpZy5jdXN0b21DbGFzcylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVGYWN0b3J5O1xuICAgIH1cbiAgICBfZ2V0Q29udGVudEZvclRlbXBsYXRlKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgW1NFTEVDVE9SX1RPT0xUSVBfSU5ORVJdOiB0aGlzLl9nZXRUaXRsZSgpXG4gICAgICB9O1xuICAgIH1cbiAgICBfZ2V0VGl0bGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVBvc3NpYmxlRnVuY3Rpb24odGhpcy5fY29uZmlnLnRpdGxlKSB8fCB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1icy1vcmlnaW5hbC10aXRsZScpO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfaW5pdGlhbGl6ZU9uRGVsZWdhdGVkVGFyZ2V0KGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRPckNyZWF0ZUluc3RhbmNlKGV2ZW50LmRlbGVnYXRlVGFyZ2V0LCB0aGlzLl9nZXREZWxlZ2F0ZUNvbmZpZygpKTtcbiAgICB9XG4gICAgX2lzQW5pbWF0ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmFuaW1hdGlvbiB8fCB0aGlzLnRpcCAmJiB0aGlzLnRpcC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFJDIpO1xuICAgIH1cbiAgICBfaXNTaG93bigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpcCAmJiB0aGlzLnRpcC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TSE9XJDIpO1xuICAgIH1cbiAgICBfY3JlYXRlUG9wcGVyKHRpcCkge1xuICAgICAgY29uc3QgcGxhY2VtZW50ID0gZXhlY3V0ZSh0aGlzLl9jb25maWcucGxhY2VtZW50LCBbdGhpcywgdGlwLCB0aGlzLl9lbGVtZW50XSk7XG4gICAgICBjb25zdCBhdHRhY2htZW50ID0gQXR0YWNobWVudE1hcFtwbGFjZW1lbnQudG9VcHBlckNhc2UoKV07XG4gICAgICByZXR1cm4gUG9wcGVyX19uYW1lc3BhY2UuY3JlYXRlUG9wcGVyKHRoaXMuX2VsZW1lbnQsIHRpcCwgdGhpcy5fZ2V0UG9wcGVyQ29uZmlnKGF0dGFjaG1lbnQpKTtcbiAgICB9XG4gICAgX2dldE9mZnNldCgpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgb2Zmc2V0XG4gICAgICB9ID0gdGhpcy5fY29uZmlnO1xuICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBvZmZzZXQuc3BsaXQoJywnKS5tYXAodmFsdWUgPT4gTnVtYmVyLnBhcnNlSW50KHZhbHVlLCAxMCkpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHBvcHBlckRhdGEgPT4gb2Zmc2V0KHBvcHBlckRhdGEsIHRoaXMuX2VsZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG4gICAgX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIGV4ZWN1dGUoYXJnLCBbdGhpcy5fZWxlbWVudF0pO1xuICAgIH1cbiAgICBfZ2V0UG9wcGVyQ29uZmlnKGF0dGFjaG1lbnQpIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRCc1BvcHBlckNvbmZpZyA9IHtcbiAgICAgICAgcGxhY2VtZW50OiBhdHRhY2htZW50LFxuICAgICAgICBtb2RpZmllcnM6IFt7XG4gICAgICAgICAgbmFtZTogJ2ZsaXAnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGZhbGxiYWNrUGxhY2VtZW50czogdGhpcy5fY29uZmlnLmZhbGxiYWNrUGxhY2VtZW50c1xuICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgIG5hbWU6ICdvZmZzZXQnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5fZ2V0T2Zmc2V0KClcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICBuYW1lOiAncHJldmVudE92ZXJmbG93JyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBib3VuZGFyeTogdGhpcy5fY29uZmlnLmJvdW5kYXJ5XG4gICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgbmFtZTogJ2Fycm93JyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBlbGVtZW50OiBgLiR7dGhpcy5jb25zdHJ1Y3Rvci5OQU1FfS1hcnJvd2BcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICBuYW1lOiAncHJlU2V0UGxhY2VtZW50JyxcbiAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgIHBoYXNlOiAnYmVmb3JlTWFpbicsXG4gICAgICAgICAgZm46IGRhdGEgPT4ge1xuICAgICAgICAgICAgLy8gUHJlLXNldCBQb3BwZXIncyBwbGFjZW1lbnQgYXR0cmlidXRlIGluIG9yZGVyIHRvIHJlYWQgdGhlIGFycm93IHNpemVzIHByb3Blcmx5LlxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBQb3BwZXIgbWl4ZXMgdXAgdGhlIHdpZHRoIGFuZCBoZWlnaHQgZGltZW5zaW9ucyBzaW5jZSB0aGUgaW5pdGlhbCBhcnJvdyBzdHlsZSBpcyBmb3IgdG9wIHBsYWNlbWVudFxuICAgICAgICAgICAgdGhpcy5fZ2V0VGlwRWxlbWVudCgpLnNldEF0dHJpYnV0ZSgnZGF0YS1wb3BwZXItcGxhY2VtZW50JywgZGF0YS5zdGF0ZS5wbGFjZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIH07XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kZWZhdWx0QnNQb3BwZXJDb25maWcsXG4gICAgICAgIC4uLmV4ZWN1dGUodGhpcy5fY29uZmlnLnBvcHBlckNvbmZpZywgW2RlZmF1bHRCc1BvcHBlckNvbmZpZ10pXG4gICAgICB9O1xuICAgIH1cbiAgICBfc2V0TGlzdGVuZXJzKCkge1xuICAgICAgY29uc3QgdHJpZ2dlcnMgPSB0aGlzLl9jb25maWcudHJpZ2dlci5zcGxpdCgnICcpO1xuICAgICAgZm9yIChjb25zdCB0cmlnZ2VyIG9mIHRyaWdnZXJzKSB7XG4gICAgICAgIGlmICh0cmlnZ2VyID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX0NMSUNLJDEpLCB0aGlzLl9jb25maWcuc2VsZWN0b3IsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9pbml0aWFsaXplT25EZWxlZ2F0ZWRUYXJnZXQoZXZlbnQpO1xuICAgICAgICAgICAgY29udGV4dC50b2dnbGUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9PSBUUklHR0VSX01BTlVBTCkge1xuICAgICAgICAgIGNvbnN0IGV2ZW50SW4gPSB0cmlnZ2VyID09PSBUUklHR0VSX0hPVkVSID8gdGhpcy5jb25zdHJ1Y3Rvci5ldmVudE5hbWUoRVZFTlRfTU9VU0VFTlRFUikgOiB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9GT0NVU0lOJDEpO1xuICAgICAgICAgIGNvbnN0IGV2ZW50T3V0ID0gdHJpZ2dlciA9PT0gVFJJR0dFUl9IT1ZFUiA/IHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX01PVVNFTEVBVkUpIDogdGhpcy5jb25zdHJ1Y3Rvci5ldmVudE5hbWUoRVZFTlRfRk9DVVNPVVQkMSk7XG4gICAgICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIGV2ZW50SW4sIHRoaXMuX2NvbmZpZy5zZWxlY3RvciwgZXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2luaXRpYWxpemVPbkRlbGVnYXRlZFRhcmdldChldmVudCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9hY3RpdmVUcmlnZ2VyW2V2ZW50LnR5cGUgPT09ICdmb2N1c2luJyA/IFRSSUdHRVJfRk9DVVMgOiBUUklHR0VSX0hPVkVSXSA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Ll9lbnRlcigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBldmVudE91dCwgdGhpcy5fY29uZmlnLnNlbGVjdG9yLCBldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5faW5pdGlhbGl6ZU9uRGVsZWdhdGVkVGFyZ2V0KGV2ZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQuX2FjdGl2ZVRyaWdnZXJbZXZlbnQudHlwZSA9PT0gJ2ZvY3Vzb3V0JyA/IFRSSUdHRVJfRk9DVVMgOiBUUklHR0VSX0hPVkVSXSA9IGNvbnRleHQuX2VsZW1lbnQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9sZWF2ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9oaWRlTW9kYWxIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQuY2xvc2VzdChTRUxFQ1RPUl9NT0RBTCksIEVWRU5UX01PREFMX0hJREUsIHRoaXMuX2hpZGVNb2RhbEhhbmRsZXIpO1xuICAgIH1cbiAgICBfZml4VGl0bGUoKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJykgJiYgIXRoaXMuX2VsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGl0bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtb3JpZ2luYWwtdGl0bGUnLCB0aXRsZSk7IC8vIERPIE5PVCBVU0UgSVQuIElzIG9ubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgICB9XG4gICAgX2VudGVyKCkge1xuICAgICAgaWYgKHRoaXMuX2lzU2hvd24oKSB8fCB0aGlzLl9pc0hvdmVyZWQpIHtcbiAgICAgICAgdGhpcy5faXNIb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNIb3ZlcmVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3NldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNIb3ZlcmVkKSB7XG4gICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMuX2NvbmZpZy5kZWxheS5zaG93KTtcbiAgICB9XG4gICAgX2xlYXZlKCkge1xuICAgICAgaWYgKHRoaXMuX2lzV2l0aEFjdGl2ZVRyaWdnZXIoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9pc0hvdmVyZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX3NldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2lzSG92ZXJlZCkge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzLl9jb25maWcuZGVsYXkuaGlkZSk7XG4gICAgfVxuICAgIF9zZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpO1xuICAgIH1cbiAgICBfaXNXaXRoQWN0aXZlVHJpZ2dlcigpIHtcbiAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuX2FjdGl2ZVRyaWdnZXIpLmluY2x1ZGVzKHRydWUpO1xuICAgIH1cbiAgICBfZ2V0Q29uZmlnKGNvbmZpZykge1xuICAgICAgY29uc3QgZGF0YUF0dHJpYnV0ZXMgPSBNYW5pcHVsYXRvci5nZXREYXRhQXR0cmlidXRlcyh0aGlzLl9lbGVtZW50KTtcbiAgICAgIGZvciAoY29uc3QgZGF0YUF0dHJpYnV0ZSBvZiBPYmplY3Qua2V5cyhkYXRhQXR0cmlidXRlcykpIHtcbiAgICAgICAgaWYgKERJU0FMTE9XRURfQVRUUklCVVRFUy5oYXMoZGF0YUF0dHJpYnV0ZSkpIHtcbiAgICAgICAgICBkZWxldGUgZGF0YUF0dHJpYnV0ZXNbZGF0YUF0dHJpYnV0ZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgLi4uZGF0YUF0dHJpYnV0ZXMsXG4gICAgICAgIC4uLih0eXBlb2YgY29uZmlnID09PSAnb2JqZWN0JyAmJiBjb25maWcgPyBjb25maWcgOiB7fSlcbiAgICAgIH07XG4gICAgICBjb25maWcgPSB0aGlzLl9tZXJnZUNvbmZpZ09iaihjb25maWcpO1xuICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpO1xuICAgICAgdGhpcy5fdHlwZUNoZWNrQ29uZmlnKGNvbmZpZyk7XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAgIGNvbmZpZy5jb250YWluZXIgPSBjb25maWcuY29udGFpbmVyID09PSBmYWxzZSA/IGRvY3VtZW50LmJvZHkgOiBnZXRFbGVtZW50KGNvbmZpZy5jb250YWluZXIpO1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcuZGVsYXkgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbmZpZy5kZWxheSA9IHtcbiAgICAgICAgICBzaG93OiBjb25maWcuZGVsYXksXG4gICAgICAgICAgaGlkZTogY29uZmlnLmRlbGF5XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy50aXRsZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uZmlnLnRpdGxlID0gY29uZmlnLnRpdGxlLnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5jb250ZW50ID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25maWcuY29udGVudCA9IGNvbmZpZy5jb250ZW50LnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBfZ2V0RGVsZWdhdGVDb25maWcoKSB7XG4gICAgICBjb25zdCBjb25maWcgPSB7fTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IuRGVmYXVsdFtrZXldICE9PSB2YWx1ZSkge1xuICAgICAgICAgIGNvbmZpZ1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbmZpZy5zZWxlY3RvciA9IGZhbHNlO1xuICAgICAgY29uZmlnLnRyaWdnZXIgPSAnbWFudWFsJztcblxuICAgICAgLy8gSW4gdGhlIGZ1dHVyZSBjYW4gYmUgcmVwbGFjZWQgd2l0aDpcbiAgICAgIC8vIGNvbnN0IGtleXNXaXRoRGlmZmVyZW50VmFsdWVzID0gT2JqZWN0LmVudHJpZXModGhpcy5fY29uZmlnKS5maWx0ZXIoZW50cnkgPT4gdGhpcy5jb25zdHJ1Y3Rvci5EZWZhdWx0W2VudHJ5WzBdXSAhPT0gdGhpcy5fY29uZmlnW2VudHJ5WzBdXSlcbiAgICAgIC8vIGBPYmplY3QuZnJvbUVudHJpZXMoa2V5c1dpdGhEaWZmZXJlbnRWYWx1ZXMpYFxuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gICAgX2Rpc3Bvc2VQb3BwZXIoKSB7XG4gICAgICBpZiAodGhpcy5fcG9wcGVyKSB7XG4gICAgICAgIHRoaXMuX3BvcHBlci5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX3BvcHBlciA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aXApIHtcbiAgICAgICAgdGhpcy50aXAucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMudGlwID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdGF0aWNcbiAgICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBUb29sdGlwLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtjb25maWddKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogalF1ZXJ5XG4gICAqL1xuXG4gIGRlZmluZUpRdWVyeVBsdWdpbihUb29sdGlwKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHBvcG92ZXIuanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBOQU1FJDMgPSAncG9wb3Zlcic7XG4gIGNvbnN0IFNFTEVDVE9SX1RJVExFID0gJy5wb3BvdmVyLWhlYWRlcic7XG4gIGNvbnN0IFNFTEVDVE9SX0NPTlRFTlQgPSAnLnBvcG92ZXItYm9keSc7XG4gIGNvbnN0IERlZmF1bHQkMiA9IHtcbiAgICAuLi5Ub29sdGlwLkRlZmF1bHQsXG4gICAgY29udGVudDogJycsXG4gICAgb2Zmc2V0OiBbMCwgOF0sXG4gICAgcGxhY2VtZW50OiAncmlnaHQnLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPicgKyAnPGRpdiBjbGFzcz1cInBvcG92ZXItYXJyb3dcIj48L2Rpdj4nICsgJzxoMyBjbGFzcz1cInBvcG92ZXItaGVhZGVyXCI+PC9oMz4nICsgJzxkaXYgY2xhc3M9XCJwb3BvdmVyLWJvZHlcIj48L2Rpdj4nICsgJzwvZGl2PicsXG4gICAgdHJpZ2dlcjogJ2NsaWNrJ1xuICB9O1xuICBjb25zdCBEZWZhdWx0VHlwZSQyID0ge1xuICAgIC4uLlRvb2x0aXAuRGVmYXVsdFR5cGUsXG4gICAgY29udGVudDogJyhudWxsfHN0cmluZ3xlbGVtZW50fGZ1bmN0aW9uKSdcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBQb3BvdmVyIGV4dGVuZHMgVG9vbHRpcCB7XG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiBEZWZhdWx0JDI7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdFR5cGUkMjtcbiAgICB9XG4gICAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgICAgcmV0dXJuIE5BTUUkMztcbiAgICB9XG5cbiAgICAvLyBPdmVycmlkZXNcbiAgICBfaXNXaXRoQ29udGVudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRUaXRsZSgpIHx8IHRoaXMuX2dldENvbnRlbnQoKTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG4gICAgX2dldENvbnRlbnRGb3JUZW1wbGF0ZSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIFtTRUxFQ1RPUl9USVRMRV06IHRoaXMuX2dldFRpdGxlKCksXG4gICAgICAgIFtTRUxFQ1RPUl9DT05URU5UXTogdGhpcy5fZ2V0Q29udGVudCgpXG4gICAgICB9O1xuICAgIH1cbiAgICBfZ2V0Q29udGVudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbih0aGlzLl9jb25maWcuY29udGVudCk7XG4gICAgfVxuXG4gICAgLy8gU3RhdGljXG4gICAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gUG9wb3Zlci5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGRhdGFbY29uZmlnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbY29uZmlnXSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGpRdWVyeVxuICAgKi9cblxuICBkZWZpbmVKUXVlcnlQbHVnaW4oUG9wb3Zlcik7XG5cbiAgLyoqXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqIEJvb3RzdHJhcCBzY3JvbGxzcHkuanNcbiAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENvbnN0YW50c1xuICAgKi9cblxuICBjb25zdCBOQU1FJDIgPSAnc2Nyb2xsc3B5JztcbiAgY29uc3QgREFUQV9LRVkkMiA9ICdicy5zY3JvbGxzcHknO1xuICBjb25zdCBFVkVOVF9LRVkkMiA9IGAuJHtEQVRBX0tFWSQyfWA7XG4gIGNvbnN0IERBVEFfQVBJX0tFWSA9ICcuZGF0YS1hcGknO1xuICBjb25zdCBFVkVOVF9BQ1RJVkFURSA9IGBhY3RpdmF0ZSR7RVZFTlRfS0VZJDJ9YDtcbiAgY29uc3QgRVZFTlRfQ0xJQ0sgPSBgY2xpY2ske0VWRU5UX0tFWSQyfWA7XG4gIGNvbnN0IEVWRU5UX0xPQURfREFUQV9BUEkkMSA9IGBsb2FkJHtFVkVOVF9LRVkkMn0ke0RBVEFfQVBJX0tFWX1gO1xuICBjb25zdCBDTEFTU19OQU1FX0RST1BET1dOX0lURU0gPSAnZHJvcGRvd24taXRlbSc7XG4gIGNvbnN0IENMQVNTX05BTUVfQUNUSVZFJDEgPSAnYWN0aXZlJztcbiAgY29uc3QgU0VMRUNUT1JfREFUQV9TUFkgPSAnW2RhdGEtYnMtc3B5PVwic2Nyb2xsXCJdJztcbiAgY29uc3QgU0VMRUNUT1JfVEFSR0VUX0xJTktTID0gJ1tocmVmXSc7XG4gIGNvbnN0IFNFTEVDVE9SX05BVl9MSVNUX0dST1VQID0gJy5uYXYsIC5saXN0LWdyb3VwJztcbiAgY29uc3QgU0VMRUNUT1JfTkFWX0xJTktTID0gJy5uYXYtbGluayc7XG4gIGNvbnN0IFNFTEVDVE9SX05BVl9JVEVNUyA9ICcubmF2LWl0ZW0nO1xuICBjb25zdCBTRUxFQ1RPUl9MSVNUX0lURU1TID0gJy5saXN0LWdyb3VwLWl0ZW0nO1xuICBjb25zdCBTRUxFQ1RPUl9MSU5LX0lURU1TID0gYCR7U0VMRUNUT1JfTkFWX0xJTktTfSwgJHtTRUxFQ1RPUl9OQVZfSVRFTVN9ID4gJHtTRUxFQ1RPUl9OQVZfTElOS1N9LCAke1NFTEVDVE9SX0xJU1RfSVRFTVN9YDtcbiAgY29uc3QgU0VMRUNUT1JfRFJPUERPV04gPSAnLmRyb3Bkb3duJztcbiAgY29uc3QgU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFJDEgPSAnLmRyb3Bkb3duLXRvZ2dsZSc7XG4gIGNvbnN0IERlZmF1bHQkMSA9IHtcbiAgICBvZmZzZXQ6IG51bGwsXG4gICAgLy8gVE9ETzogdjYgQGRlcHJlY2F0ZWQsIGtlZXAgaXQgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHJlYXNvbnNcbiAgICByb290TWFyZ2luOiAnMHB4IDBweCAtMjUlJyxcbiAgICBzbW9vdGhTY3JvbGw6IGZhbHNlLFxuICAgIHRhcmdldDogbnVsbCxcbiAgICB0aHJlc2hvbGQ6IFswLjEsIDAuNSwgMV1cbiAgfTtcbiAgY29uc3QgRGVmYXVsdFR5cGUkMSA9IHtcbiAgICBvZmZzZXQ6ICcobnVtYmVyfG51bGwpJyxcbiAgICAvLyBUT0RPIHY2IEBkZXByZWNhdGVkLCBrZWVwIGl0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSByZWFzb25zXG4gICAgcm9vdE1hcmdpbjogJ3N0cmluZycsXG4gICAgc21vb3RoU2Nyb2xsOiAnYm9vbGVhbicsXG4gICAgdGFyZ2V0OiAnZWxlbWVudCcsXG4gICAgdGhyZXNob2xkOiAnYXJyYXknXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGRlZmluaXRpb25cbiAgICovXG5cbiAgY2xhc3MgU2Nyb2xsU3B5IGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICBzdXBlcihlbGVtZW50LCBjb25maWcpO1xuXG4gICAgICAvLyB0aGlzLl9lbGVtZW50IGlzIHRoZSBvYnNlcnZhYmxlc0NvbnRhaW5lciBhbmQgY29uZmlnLnRhcmdldCB0aGUgbWVudSBsaW5rcyB3cmFwcGVyXG4gICAgICB0aGlzLl90YXJnZXRMaW5rcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX29ic2VydmFibGVTZWN0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3Jvb3RFbGVtZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9lbGVtZW50KS5vdmVyZmxvd1kgPT09ICd2aXNpYmxlJyA/IG51bGwgOiB0aGlzLl9lbGVtZW50O1xuICAgICAgdGhpcy5fYWN0aXZlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuX29ic2VydmVyID0gbnVsbDtcbiAgICAgIHRoaXMuX3ByZXZpb3VzU2Nyb2xsRGF0YSA9IHtcbiAgICAgICAgdmlzaWJsZUVudHJ5VG9wOiAwLFxuICAgICAgICBwYXJlbnRTY3JvbGxUb3A6IDBcbiAgICAgIH07XG4gICAgICB0aGlzLnJlZnJlc2goKTsgLy8gaW5pdGlhbGl6ZVxuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdCQxO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgICAgcmV0dXJuIERlZmF1bHRUeXBlJDE7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJDI7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgcmVmcmVzaCgpIHtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVUYXJnZXRzQW5kT2JzZXJ2YWJsZXMoKTtcbiAgICAgIHRoaXMuX21heWJlRW5hYmxlU21vb3RoU2Nyb2xsKCk7XG4gICAgICBpZiAodGhpcy5fb2JzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSB0aGlzLl9nZXROZXdPYnNlcnZlcigpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBzZWN0aW9uIG9mIHRoaXMuX29ic2VydmFibGVTZWN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgICB0aGlzLl9vYnNlcnZlci5vYnNlcnZlKHNlY3Rpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIC8vIFByaXZhdGVcbiAgICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAgIC8vIFRPRE86IG9uIHY2IHRhcmdldCBzaG91bGQgYmUgZ2l2ZW4gZXhwbGljaXRseSAmIHJlbW92ZSB0aGUge3RhcmdldDogJ3NzLXRhcmdldCd9IGNhc2VcbiAgICAgIGNvbmZpZy50YXJnZXQgPSBnZXRFbGVtZW50KGNvbmZpZy50YXJnZXQpIHx8IGRvY3VtZW50LmJvZHk7XG5cbiAgICAgIC8vIFRPRE86IHY2IE9ubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHJlYXNvbnMuIFVzZSByb290TWFyZ2luIG9ubHlcbiAgICAgIGNvbmZpZy5yb290TWFyZ2luID0gY29uZmlnLm9mZnNldCA/IGAke2NvbmZpZy5vZmZzZXR9cHggMHB4IC0zMCVgIDogY29uZmlnLnJvb3RNYXJnaW47XG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy50aHJlc2hvbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZy50aHJlc2hvbGQgPSBjb25maWcudGhyZXNob2xkLnNwbGl0KCcsJykubWFwKHZhbHVlID0+IE51bWJlci5wYXJzZUZsb2F0KHZhbHVlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cbiAgICBfbWF5YmVFbmFibGVTbW9vdGhTY3JvbGwoKSB7XG4gICAgICBpZiAoIXRoaXMuX2NvbmZpZy5zbW9vdGhTY3JvbGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB1bnJlZ2lzdGVyIGFueSBwcmV2aW91cyBsaXN0ZW5lcnNcbiAgICAgIEV2ZW50SGFuZGxlci5vZmYodGhpcy5fY29uZmlnLnRhcmdldCwgRVZFTlRfQ0xJQ0spO1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2NvbmZpZy50YXJnZXQsIEVWRU5UX0NMSUNLLCBTRUxFQ1RPUl9UQVJHRVRfTElOS1MsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZVNlY3Rpb24gPSB0aGlzLl9vYnNlcnZhYmxlU2VjdGlvbnMuZ2V0KGV2ZW50LnRhcmdldC5oYXNoKTtcbiAgICAgICAgaWYgKG9ic2VydmFibGVTZWN0aW9uKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBjb25zdCByb290ID0gdGhpcy5fcm9vdEVsZW1lbnQgfHwgd2luZG93O1xuICAgICAgICAgIGNvbnN0IGhlaWdodCA9IG9ic2VydmFibGVTZWN0aW9uLm9mZnNldFRvcCAtIHRoaXMuX2VsZW1lbnQub2Zmc2V0VG9wO1xuICAgICAgICAgIGlmIChyb290LnNjcm9sbFRvKSB7XG4gICAgICAgICAgICByb290LnNjcm9sbFRvKHtcbiAgICAgICAgICAgICAgdG9wOiBoZWlnaHQsXG4gICAgICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hyb21lIDYwIGRvZXNuJ3Qgc3VwcG9ydCBgc2Nyb2xsVG9gXG4gICAgICAgICAgcm9vdC5zY3JvbGxUb3AgPSBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBfZ2V0TmV3T2JzZXJ2ZXIoKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICByb290OiB0aGlzLl9yb290RWxlbWVudCxcbiAgICAgICAgdGhyZXNob2xkOiB0aGlzLl9jb25maWcudGhyZXNob2xkLFxuICAgICAgICByb290TWFyZ2luOiB0aGlzLl9jb25maWcucm9vdE1hcmdpblxuICAgICAgfTtcbiAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoZW50cmllcyA9PiB0aGlzLl9vYnNlcnZlckNhbGxiYWNrKGVudHJpZXMpLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbG9naWMgb2Ygc2VsZWN0aW9uXG4gICAgX29ic2VydmVyQ2FsbGJhY2soZW50cmllcykge1xuICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGVudHJ5ID0+IHRoaXMuX3RhcmdldExpbmtzLmdldChgIyR7ZW50cnkudGFyZ2V0LmlkfWApO1xuICAgICAgY29uc3QgYWN0aXZhdGUgPSBlbnRyeSA9PiB7XG4gICAgICAgIHRoaXMuX3ByZXZpb3VzU2Nyb2xsRGF0YS52aXNpYmxlRW50cnlUb3AgPSBlbnRyeS50YXJnZXQub2Zmc2V0VG9wO1xuICAgICAgICB0aGlzLl9wcm9jZXNzKHRhcmdldEVsZW1lbnQoZW50cnkpKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBwYXJlbnRTY3JvbGxUb3AgPSAodGhpcy5fcm9vdEVsZW1lbnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5zY3JvbGxUb3A7XG4gICAgICBjb25zdCB1c2VyU2Nyb2xsc0Rvd24gPSBwYXJlbnRTY3JvbGxUb3AgPj0gdGhpcy5fcHJldmlvdXNTY3JvbGxEYXRhLnBhcmVudFNjcm9sbFRvcDtcbiAgICAgIHRoaXMuX3ByZXZpb3VzU2Nyb2xsRGF0YS5wYXJlbnRTY3JvbGxUb3AgPSBwYXJlbnRTY3JvbGxUb3A7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICAgIHRoaXMuX2FjdGl2ZVRhcmdldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fY2xlYXJBY3RpdmVDbGFzcyh0YXJnZXRFbGVtZW50KGVudHJ5KSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW50cnlJc0xvd2VyVGhhblByZXZpb3VzID0gZW50cnkudGFyZ2V0Lm9mZnNldFRvcCA+PSB0aGlzLl9wcmV2aW91c1Njcm9sbERhdGEudmlzaWJsZUVudHJ5VG9wO1xuICAgICAgICAvLyBpZiB3ZSBhcmUgc2Nyb2xsaW5nIGRvd24sIHBpY2sgdGhlIGJpZ2dlciBvZmZzZXRUb3BcbiAgICAgICAgaWYgKHVzZXJTY3JvbGxzRG93biAmJiBlbnRyeUlzTG93ZXJUaGFuUHJldmlvdXMpIHtcbiAgICAgICAgICBhY3RpdmF0ZShlbnRyeSk7XG4gICAgICAgICAgLy8gaWYgcGFyZW50IGlzbid0IHNjcm9sbGVkLCBsZXQncyBrZWVwIHRoZSBmaXJzdCB2aXNpYmxlIGl0ZW0sIGJyZWFraW5nIHRoZSBpdGVyYXRpb25cbiAgICAgICAgICBpZiAoIXBhcmVudFNjcm9sbFRvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHdlIGFyZSBzY3JvbGxpbmcgdXAsIHBpY2sgdGhlIHNtYWxsZXN0IG9mZnNldFRvcFxuICAgICAgICBpZiAoIXVzZXJTY3JvbGxzRG93biAmJiAhZW50cnlJc0xvd2VyVGhhblByZXZpb3VzKSB7XG4gICAgICAgICAgYWN0aXZhdGUoZW50cnkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIF9pbml0aWFsaXplVGFyZ2V0c0FuZE9ic2VydmFibGVzKCkge1xuICAgICAgdGhpcy5fdGFyZ2V0TGlua3MgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9vYnNlcnZhYmxlU2VjdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgICBjb25zdCB0YXJnZXRMaW5rcyA9IFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfVEFSR0VUX0xJTktTLCB0aGlzLl9jb25maWcudGFyZ2V0KTtcbiAgICAgIGZvciAoY29uc3QgYW5jaG9yIG9mIHRhcmdldExpbmtzKSB7XG4gICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBhbmNob3IgaGFzIGFuIGlkIGFuZCBpcyBub3QgZGlzYWJsZWRcbiAgICAgICAgaWYgKCFhbmNob3IuaGFzaCB8fCBpc0Rpc2FibGVkKGFuY2hvcikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZhYmxlU2VjdGlvbiA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoZGVjb2RlVVJJKGFuY2hvci5oYXNoKSwgdGhpcy5fZWxlbWVudCk7XG5cbiAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIG9ic2VydmFibGVTZWN0aW9uIGV4aXN0cyAmIGlzIHZpc2libGVcbiAgICAgICAgaWYgKGlzVmlzaWJsZShvYnNlcnZhYmxlU2VjdGlvbikpIHtcbiAgICAgICAgICB0aGlzLl90YXJnZXRMaW5rcy5zZXQoZGVjb2RlVVJJKGFuY2hvci5oYXNoKSwgYW5jaG9yKTtcbiAgICAgICAgICB0aGlzLl9vYnNlcnZhYmxlU2VjdGlvbnMuc2V0KGFuY2hvci5oYXNoLCBvYnNlcnZhYmxlU2VjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgX3Byb2Nlc3ModGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5fYWN0aXZlVGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXJBY3RpdmVDbGFzcyh0aGlzLl9jb25maWcudGFyZ2V0KTtcbiAgICAgIHRoaXMuX2FjdGl2ZVRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQUNUSVZFJDEpO1xuICAgICAgdGhpcy5fYWN0aXZhdGVQYXJlbnRzKHRhcmdldCk7XG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9BQ1RJVkFURSwge1xuICAgICAgICByZWxhdGVkVGFyZ2V0OiB0YXJnZXRcbiAgICAgIH0pO1xuICAgIH1cbiAgICBfYWN0aXZhdGVQYXJlbnRzKHRhcmdldCkge1xuICAgICAgLy8gQWN0aXZhdGUgZHJvcGRvd24gcGFyZW50c1xuICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9EUk9QRE9XTl9JVEVNKSkge1xuICAgICAgICBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0RST1BET1dOX1RPR0dMRSQxLCB0YXJnZXQuY2xvc2VzdChTRUxFQ1RPUl9EUk9QRE9XTikpLmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9BQ1RJVkUkMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgbGlzdEdyb3VwIG9mIFNlbGVjdG9yRW5naW5lLnBhcmVudHModGFyZ2V0LCBTRUxFQ1RPUl9OQVZfTElTVF9HUk9VUCkpIHtcbiAgICAgICAgLy8gU2V0IHRyaWdnZXJlZCBsaW5rcyBwYXJlbnRzIGFzIGFjdGl2ZVxuICAgICAgICAvLyBXaXRoIGJvdGggPHVsPiBhbmQgPG5hdj4gbWFya3VwIGEgcGFyZW50IGlzIHRoZSBwcmV2aW91cyBzaWJsaW5nIG9mIGFueSBuYXYgYW5jZXN0b3JcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIFNlbGVjdG9yRW5naW5lLnByZXYobGlzdEdyb3VwLCBTRUxFQ1RPUl9MSU5LX0lURU1TKSkge1xuICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0FDVElWRSQxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBfY2xlYXJBY3RpdmVDbGFzcyhwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQUNUSVZFJDEpO1xuICAgICAgY29uc3QgYWN0aXZlTm9kZXMgPSBTZWxlY3RvckVuZ2luZS5maW5kKGAke1NFTEVDVE9SX1RBUkdFVF9MSU5LU30uJHtDTEFTU19OQU1FX0FDVElWRSQxfWAsIHBhcmVudCk7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgYWN0aXZlTm9kZXMpIHtcbiAgICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQUNUSVZFJDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0YXRpY1xuICAgIHN0YXRpYyBqUXVlcnlJbnRlcmZhY2UoY29uZmlnKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFNjcm9sbFNweS5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YVtjb25maWddID09PSB1bmRlZmluZWQgfHwgY29uZmlnLnN0YXJ0c1dpdGgoJ18nKSB8fCBjb25maWcgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbY29uZmlnXSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIEV2ZW50SGFuZGxlci5vbih3aW5kb3csIEVWRU5UX0xPQURfREFUQV9BUEkkMSwgKCkgPT4ge1xuICAgIGZvciAoY29uc3Qgc3B5IG9mIFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfREFUQV9TUFkpKSB7XG4gICAgICBTY3JvbGxTcHkuZ2V0T3JDcmVhdGVJbnN0YW5jZShzcHkpO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqXG4gICAqIGpRdWVyeVxuICAgKi9cblxuICBkZWZpbmVKUXVlcnlQbHVnaW4oU2Nyb2xsU3B5KTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHRhYi5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cblxuICAvKipcbiAgICogQ29uc3RhbnRzXG4gICAqL1xuXG4gIGNvbnN0IE5BTUUkMSA9ICd0YWInO1xuICBjb25zdCBEQVRBX0tFWSQxID0gJ2JzLnRhYic7XG4gIGNvbnN0IEVWRU5UX0tFWSQxID0gYC4ke0RBVEFfS0VZJDF9YDtcbiAgY29uc3QgRVZFTlRfSElERSQxID0gYGhpZGUke0VWRU5UX0tFWSQxfWA7XG4gIGNvbnN0IEVWRU5UX0hJRERFTiQxID0gYGhpZGRlbiR7RVZFTlRfS0VZJDF9YDtcbiAgY29uc3QgRVZFTlRfU0hPVyQxID0gYHNob3cke0VWRU5UX0tFWSQxfWA7XG4gIGNvbnN0IEVWRU5UX1NIT1dOJDEgPSBgc2hvd24ke0VWRU5UX0tFWSQxfWA7XG4gIGNvbnN0IEVWRU5UX0NMSUNLX0RBVEFfQVBJID0gYGNsaWNrJHtFVkVOVF9LRVkkMX1gO1xuICBjb25zdCBFVkVOVF9LRVlET1dOID0gYGtleWRvd24ke0VWRU5UX0tFWSQxfWA7XG4gIGNvbnN0IEVWRU5UX0xPQURfREFUQV9BUEkgPSBgbG9hZCR7RVZFTlRfS0VZJDF9YDtcbiAgY29uc3QgQVJST1dfTEVGVF9LRVkgPSAnQXJyb3dMZWZ0JztcbiAgY29uc3QgQVJST1dfUklHSFRfS0VZID0gJ0Fycm93UmlnaHQnO1xuICBjb25zdCBBUlJPV19VUF9LRVkgPSAnQXJyb3dVcCc7XG4gIGNvbnN0IEFSUk9XX0RPV05fS0VZID0gJ0Fycm93RG93bic7XG4gIGNvbnN0IEhPTUVfS0VZID0gJ0hvbWUnO1xuICBjb25zdCBFTkRfS0VZID0gJ0VuZCc7XG4gIGNvbnN0IENMQVNTX05BTUVfQUNUSVZFID0gJ2FjdGl2ZSc7XG4gIGNvbnN0IENMQVNTX05BTUVfRkFERSQxID0gJ2ZhZGUnO1xuICBjb25zdCBDTEFTU19OQU1FX1NIT1ckMSA9ICdzaG93JztcbiAgY29uc3QgQ0xBU1NfRFJPUERPV04gPSAnZHJvcGRvd24nO1xuICBjb25zdCBTRUxFQ1RPUl9EUk9QRE9XTl9UT0dHTEUgPSAnLmRyb3Bkb3duLXRvZ2dsZSc7XG4gIGNvbnN0IFNFTEVDVE9SX0RST1BET1dOX01FTlUgPSAnLmRyb3Bkb3duLW1lbnUnO1xuICBjb25zdCBOT1RfU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFID0gYDpub3QoJHtTRUxFQ1RPUl9EUk9QRE9XTl9UT0dHTEV9KWA7XG4gIGNvbnN0IFNFTEVDVE9SX1RBQl9QQU5FTCA9ICcubGlzdC1ncm91cCwgLm5hdiwgW3JvbGU9XCJ0YWJsaXN0XCJdJztcbiAgY29uc3QgU0VMRUNUT1JfT1VURVIgPSAnLm5hdi1pdGVtLCAubGlzdC1ncm91cC1pdGVtJztcbiAgY29uc3QgU0VMRUNUT1JfSU5ORVIgPSBgLm5hdi1saW5rJHtOT1RfU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFfSwgLmxpc3QtZ3JvdXAtaXRlbSR7Tk9UX1NFTEVDVE9SX0RST1BET1dOX1RPR0dMRX0sIFtyb2xlPVwidGFiXCJdJHtOT1RfU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFfWA7XG4gIGNvbnN0IFNFTEVDVE9SX0RBVEFfVE9HR0xFID0gJ1tkYXRhLWJzLXRvZ2dsZT1cInRhYlwiXSwgW2RhdGEtYnMtdG9nZ2xlPVwicGlsbFwiXSwgW2RhdGEtYnMtdG9nZ2xlPVwibGlzdFwiXSc7IC8vIFRPRE86IGNvdWxkIG9ubHkgYmUgYHRhYmAgaW4gdjZcbiAgY29uc3QgU0VMRUNUT1JfSU5ORVJfRUxFTSA9IGAke1NFTEVDVE9SX0lOTkVSfSwgJHtTRUxFQ1RPUl9EQVRBX1RPR0dMRX1gO1xuICBjb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRV9BQ1RJVkUgPSBgLiR7Q0xBU1NfTkFNRV9BQ1RJVkV9W2RhdGEtYnMtdG9nZ2xlPVwidGFiXCJdLCAuJHtDTEFTU19OQU1FX0FDVElWRX1bZGF0YS1icy10b2dnbGU9XCJwaWxsXCJdLCAuJHtDTEFTU19OQU1FX0FDVElWRX1bZGF0YS1icy10b2dnbGU9XCJsaXN0XCJdYDtcblxuICAvKipcbiAgICogQ2xhc3MgZGVmaW5pdGlvblxuICAgKi9cblxuICBjbGFzcyBUYWIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgIHRoaXMuX3BhcmVudCA9IHRoaXMuX2VsZW1lbnQuY2xvc2VzdChTRUxFQ1RPUl9UQUJfUEFORUwpO1xuICAgICAgaWYgKCF0aGlzLl9wYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBUT0RPOiBzaG91bGQgdGhyb3cgZXhjZXB0aW9uIGluIHY2XG4gICAgICAgIC8vIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7ZWxlbWVudC5vdXRlckhUTUx9IGhhcyBub3QgYSB2YWxpZCBwYXJlbnQgJHtTRUxFQ1RPUl9JTk5FUl9FTEVNfWApXG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB1cCBpbml0aWFsIGFyaWEgYXR0cmlidXRlc1xuICAgICAgdGhpcy5fc2V0SW5pdGlhbEF0dHJpYnV0ZXModGhpcy5fcGFyZW50LCB0aGlzLl9nZXRDaGlsZHJlbigpKTtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9LRVlET1dOLCBldmVudCA9PiB0aGlzLl9rZXlkb3duKGV2ZW50KSk7XG4gICAgfVxuXG4gICAgLy8gR2V0dGVyc1xuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FJDE7XG4gICAgfVxuXG4gICAgLy8gUHVibGljXG4gICAgc2hvdygpIHtcbiAgICAgIC8vIFNob3dzIHRoaXMgZWxlbSBhbmQgZGVhY3RpdmF0ZSB0aGUgYWN0aXZlIHNpYmxpbmcgaWYgZXhpc3RzXG4gICAgICBjb25zdCBpbm5lckVsZW0gPSB0aGlzLl9lbGVtZW50O1xuICAgICAgaWYgKHRoaXMuX2VsZW1Jc0FjdGl2ZShpbm5lckVsZW0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2VhcmNoIGZvciBhY3RpdmUgdGFiIG9uIHNhbWUgcGFyZW50IHRvIGRlYWN0aXZhdGUgaXRcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuX2dldEFjdGl2ZUVsZW0oKTtcbiAgICAgIGNvbnN0IGhpZGVFdmVudCA9IGFjdGl2ZSA/IEV2ZW50SGFuZGxlci50cmlnZ2VyKGFjdGl2ZSwgRVZFTlRfSElERSQxLCB7XG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6IGlubmVyRWxlbVxuICAgICAgfSkgOiBudWxsO1xuICAgICAgY29uc3Qgc2hvd0V2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIoaW5uZXJFbGVtLCBFVkVOVF9TSE9XJDEsIHtcbiAgICAgICAgcmVsYXRlZFRhcmdldDogYWN0aXZlXG4gICAgICB9KTtcbiAgICAgIGlmIChzaG93RXZlbnQuZGVmYXVsdFByZXZlbnRlZCB8fCBoaWRlRXZlbnQgJiYgaGlkZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGVhY3RpdmF0ZShhY3RpdmUsIGlubmVyRWxlbSk7XG4gICAgICB0aGlzLl9hY3RpdmF0ZShpbm5lckVsZW0sIGFjdGl2ZSk7XG4gICAgfVxuXG4gICAgLy8gUHJpdmF0ZVxuICAgIF9hY3RpdmF0ZShlbGVtZW50LCByZWxhdGVkRWxlbSkge1xuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0FDVElWRSk7XG4gICAgICB0aGlzLl9hY3RpdmF0ZShTZWxlY3RvckVuZ2luZS5nZXRFbGVtZW50RnJvbVNlbGVjdG9yKGVsZW1lbnQpKTsgLy8gU2VhcmNoIGFuZCBhY3RpdmF0ZS9zaG93IHRoZSBwcm9wZXIgc2VjdGlvblxuXG4gICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICd0YWInKSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVyQxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgdHJ1ZSk7XG4gICAgICAgIHRoaXMuX3RvZ2dsZURyb3BEb3duKGVsZW1lbnQsIHRydWUpO1xuICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcihlbGVtZW50LCBFVkVOVF9TSE9XTiQxLCB7XG4gICAgICAgICAgcmVsYXRlZFRhcmdldDogcmVsYXRlZEVsZW1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZSwgZWxlbWVudCwgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFJDEpKTtcbiAgICB9XG4gICAgX2RlYWN0aXZhdGUoZWxlbWVudCwgcmVsYXRlZEVsZW0pIHtcbiAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9BQ1RJVkUpO1xuICAgICAgZWxlbWVudC5ibHVyKCk7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlKFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IoZWxlbWVudCkpOyAvLyBTZWFyY2ggYW5kIGRlYWN0aXZhdGUgdGhlIHNob3duIHNlY3Rpb24gdG9vXG5cbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RhYicpIHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XJDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIHRoaXMuX3RvZ2dsZURyb3BEb3duKGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIoZWxlbWVudCwgRVZFTlRfSElEREVOJDEsIHtcbiAgICAgICAgICByZWxhdGVkVGFyZ2V0OiByZWxhdGVkRWxlbVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCBlbGVtZW50LCBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0ZBREUkMSkpO1xuICAgIH1cbiAgICBfa2V5ZG93bihldmVudCkge1xuICAgICAgaWYgKCFbQVJST1dfTEVGVF9LRVksIEFSUk9XX1JJR0hUX0tFWSwgQVJST1dfVVBfS0VZLCBBUlJPV19ET1dOX0tFWSwgSE9NRV9LRVksIEVORF9LRVldLmluY2x1ZGVzKGV2ZW50LmtleSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIHN0b3BQcm9wYWdhdGlvbi9wcmV2ZW50RGVmYXVsdCBib3RoIGFkZGVkIHRvIHN1cHBvcnQgdXAvZG93biBrZXlzIHdpdGhvdXQgc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbigpLmZpbHRlcihlbGVtZW50ID0+ICFpc0Rpc2FibGVkKGVsZW1lbnQpKTtcbiAgICAgIGxldCBuZXh0QWN0aXZlRWxlbWVudDtcbiAgICAgIGlmIChbSE9NRV9LRVksIEVORF9LRVldLmluY2x1ZGVzKGV2ZW50LmtleSkpIHtcbiAgICAgICAgbmV4dEFjdGl2ZUVsZW1lbnQgPSBjaGlsZHJlbltldmVudC5rZXkgPT09IEhPTUVfS0VZID8gMCA6IGNoaWxkcmVuLmxlbmd0aCAtIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaXNOZXh0ID0gW0FSUk9XX1JJR0hUX0tFWSwgQVJST1dfRE9XTl9LRVldLmluY2x1ZGVzKGV2ZW50LmtleSk7XG4gICAgICAgIG5leHRBY3RpdmVFbGVtZW50ID0gZ2V0TmV4dEFjdGl2ZUVsZW1lbnQoY2hpbGRyZW4sIGV2ZW50LnRhcmdldCwgaXNOZXh0LCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0QWN0aXZlRWxlbWVudCkge1xuICAgICAgICBuZXh0QWN0aXZlRWxlbWVudC5mb2N1cyh7XG4gICAgICAgICAgcHJldmVudFNjcm9sbDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UobmV4dEFjdGl2ZUVsZW1lbnQpLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2dldENoaWxkcmVuKCkge1xuICAgICAgLy8gY29sbGVjdGlvbiBvZiBpbm5lciBlbGVtZW50c1xuICAgICAgcmV0dXJuIFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfSU5ORVJfRUxFTSwgdGhpcy5fcGFyZW50KTtcbiAgICB9XG4gICAgX2dldEFjdGl2ZUVsZW0oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0Q2hpbGRyZW4oKS5maW5kKGNoaWxkID0+IHRoaXMuX2VsZW1Jc0FjdGl2ZShjaGlsZCkpIHx8IG51bGw7XG4gICAgfVxuICAgIF9zZXRJbml0aWFsQXR0cmlidXRlcyhwYXJlbnQsIGNoaWxkcmVuKSB7XG4gICAgICB0aGlzLl9zZXRBdHRyaWJ1dGVJZk5vdEV4aXN0cyhwYXJlbnQsICdyb2xlJywgJ3RhYmxpc3QnKTtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5fc2V0SW5pdGlhbEF0dHJpYnV0ZXNPbkNoaWxkKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3NldEluaXRpYWxBdHRyaWJ1dGVzT25DaGlsZChjaGlsZCkge1xuICAgICAgY2hpbGQgPSB0aGlzLl9nZXRJbm5lckVsZW1lbnQoY2hpbGQpO1xuICAgICAgY29uc3QgaXNBY3RpdmUgPSB0aGlzLl9lbGVtSXNBY3RpdmUoY2hpbGQpO1xuICAgICAgY29uc3Qgb3V0ZXJFbGVtID0gdGhpcy5fZ2V0T3V0ZXJFbGVtZW50KGNoaWxkKTtcbiAgICAgIGNoaWxkLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIGlzQWN0aXZlKTtcbiAgICAgIGlmIChvdXRlckVsZW0gIT09IGNoaWxkKSB7XG4gICAgICAgIHRoaXMuX3NldEF0dHJpYnV0ZUlmTm90RXhpc3RzKG91dGVyRWxlbSwgJ3JvbGUnLCAncHJlc2VudGF0aW9uJyk7XG4gICAgICB9XG4gICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgIGNoaWxkLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldEF0dHJpYnV0ZUlmTm90RXhpc3RzKGNoaWxkLCAncm9sZScsICd0YWInKTtcblxuICAgICAgLy8gc2V0IGF0dHJpYnV0ZXMgdG8gdGhlIHJlbGF0ZWQgcGFuZWwgdG9vXG4gICAgICB0aGlzLl9zZXRJbml0aWFsQXR0cmlidXRlc09uVGFyZ2V0UGFuZWwoY2hpbGQpO1xuICAgIH1cbiAgICBfc2V0SW5pdGlhbEF0dHJpYnV0ZXNPblRhcmdldFBhbmVsKGNoaWxkKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBTZWxlY3RvckVuZ2luZS5nZXRFbGVtZW50RnJvbVNlbGVjdG9yKGNoaWxkKTtcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldEF0dHJpYnV0ZUlmTm90RXhpc3RzKHRhcmdldCwgJ3JvbGUnLCAndGFicGFuZWwnKTtcbiAgICAgIGlmIChjaGlsZC5pZCkge1xuICAgICAgICB0aGlzLl9zZXRBdHRyaWJ1dGVJZk5vdEV4aXN0cyh0YXJnZXQsICdhcmlhLWxhYmVsbGVkYnknLCBgJHtjaGlsZC5pZH1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3RvZ2dsZURyb3BEb3duKGVsZW1lbnQsIG9wZW4pIHtcbiAgICAgIGNvbnN0IG91dGVyRWxlbSA9IHRoaXMuX2dldE91dGVyRWxlbWVudChlbGVtZW50KTtcbiAgICAgIGlmICghb3V0ZXJFbGVtLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19EUk9QRE9XTikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdG9nZ2xlID0gKHNlbGVjdG9yLCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoc2VsZWN0b3IsIG91dGVyRWxlbSk7XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSwgb3Blbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0b2dnbGUoU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFLCBDTEFTU19OQU1FX0FDVElWRSk7XG4gICAgICB0b2dnbGUoU0VMRUNUT1JfRFJPUERPV05fTUVOVSwgQ0xBU1NfTkFNRV9TSE9XJDEpO1xuICAgICAgb3V0ZXJFbGVtLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIG9wZW4pO1xuICAgIH1cbiAgICBfc2V0QXR0cmlidXRlSWZOb3RFeGlzdHMoZWxlbWVudCwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZWxlbUlzQWN0aXZlKGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0FDVElWRSk7XG4gICAgfVxuXG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgaW5uZXIgZWxlbWVudCAodXN1YWxseSB0aGUgLm5hdi1saW5rKVxuICAgIF9nZXRJbm5lckVsZW1lbnQoZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0ubWF0Y2hlcyhTRUxFQ1RPUl9JTk5FUl9FTEVNKSA/IGVsZW0gOiBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0lOTkVSX0VMRU0sIGVsZW0pO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBnZXQgdGhlIG91dGVyIGVsZW1lbnQgKHVzdWFsbHkgdGhlIC5uYXYtaXRlbSlcbiAgICBfZ2V0T3V0ZXJFbGVtZW50KGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtLmNsb3Nlc3QoU0VMRUNUT1JfT1VURVIpIHx8IGVsZW07XG4gICAgfVxuXG4gICAgLy8gU3RhdGljXG4gICAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBkYXRhID0gVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YVtjb25maWddID09PSB1bmRlZmluZWQgfHwgY29uZmlnLnN0YXJ0c1dpdGgoJ18nKSB8fCBjb25maWcgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbY29uZmlnXSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gICAqL1xuXG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEksIFNFTEVDVE9SX0RBVEFfVE9HR0xFLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoWydBJywgJ0FSRUEnXS5pbmNsdWRlcyh0aGlzLnRhZ05hbWUpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBpZiAoaXNEaXNhYmxlZCh0aGlzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBUYWIuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0aGlzKS5zaG93KCk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIG9uIGZvY3VzXG4gICAqL1xuICBFdmVudEhhbmRsZXIub24od2luZG93LCBFVkVOVF9MT0FEX0RBVEFfQVBJLCAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfREFUQV9UT0dHTEVfQUNUSVZFKSkge1xuICAgICAgVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UoZWxlbWVudCk7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIGpRdWVyeVxuICAgKi9cblxuICBkZWZpbmVKUXVlcnlQbHVnaW4oVGFiKTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIHRvYXN0LmpzXG4gICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDb25zdGFudHNcbiAgICovXG5cbiAgY29uc3QgTkFNRSA9ICd0b2FzdCc7XG4gIGNvbnN0IERBVEFfS0VZID0gJ2JzLnRvYXN0JztcbiAgY29uc3QgRVZFTlRfS0VZID0gYC4ke0RBVEFfS0VZfWA7XG4gIGNvbnN0IEVWRU5UX01PVVNFT1ZFUiA9IGBtb3VzZW92ZXIke0VWRU5UX0tFWX1gO1xuICBjb25zdCBFVkVOVF9NT1VTRU9VVCA9IGBtb3VzZW91dCR7RVZFTlRfS0VZfWA7XG4gIGNvbnN0IEVWRU5UX0ZPQ1VTSU4gPSBgZm9jdXNpbiR7RVZFTlRfS0VZfWA7XG4gIGNvbnN0IEVWRU5UX0ZPQ1VTT1VUID0gYGZvY3Vzb3V0JHtFVkVOVF9LRVl9YDtcbiAgY29uc3QgRVZFTlRfSElERSA9IGBoaWRlJHtFVkVOVF9LRVl9YDtcbiAgY29uc3QgRVZFTlRfSElEREVOID0gYGhpZGRlbiR7RVZFTlRfS0VZfWA7XG4gIGNvbnN0IEVWRU5UX1NIT1cgPSBgc2hvdyR7RVZFTlRfS0VZfWA7XG4gIGNvbnN0IEVWRU5UX1NIT1dOID0gYHNob3duJHtFVkVOVF9LRVl9YDtcbiAgY29uc3QgQ0xBU1NfTkFNRV9GQURFID0gJ2ZhZGUnO1xuICBjb25zdCBDTEFTU19OQU1FX0hJREUgPSAnaGlkZSc7IC8vIEBkZXByZWNhdGVkIC0ga2VwdCBoZXJlIG9ubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIGNvbnN0IENMQVNTX05BTUVfU0hPVyA9ICdzaG93JztcbiAgY29uc3QgQ0xBU1NfTkFNRV9TSE9XSU5HID0gJ3Nob3dpbmcnO1xuICBjb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgICBhbmltYXRpb246ICdib29sZWFuJyxcbiAgICBhdXRvaGlkZTogJ2Jvb2xlYW4nLFxuICAgIGRlbGF5OiAnbnVtYmVyJ1xuICB9O1xuICBjb25zdCBEZWZhdWx0ID0ge1xuICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICBhdXRvaGlkZTogdHJ1ZSxcbiAgICBkZWxheTogNTAwMFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBkZWZpbml0aW9uXG4gICAqL1xuXG4gIGNsYXNzIFRvYXN0IGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICBzdXBlcihlbGVtZW50LCBjb25maWcpO1xuICAgICAgdGhpcy5fdGltZW91dCA9IG51bGw7XG4gICAgICB0aGlzLl9oYXNNb3VzZUludGVyYWN0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLl9oYXNLZXlib2FyZEludGVyYWN0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLl9zZXRMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICAvLyBHZXR0ZXJzXG4gICAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgICAgcmV0dXJuIERlZmF1bHQ7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgICByZXR1cm4gRGVmYXVsdFR5cGU7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICAgIHJldHVybiBOQU1FO1xuICAgIH1cblxuICAgIC8vIFB1YmxpY1xuICAgIHNob3coKSB7XG4gICAgICBjb25zdCBzaG93RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XKTtcbiAgICAgIGlmIChzaG93RXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhclRpbWVvdXQoKTtcbiAgICAgIGlmICh0aGlzLl9jb25maWcuYW5pbWF0aW9uKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0ZBREUpO1xuICAgICAgfVxuICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1dJTkcpO1xuICAgICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XTik7XG4gICAgICAgIHRoaXMuX21heWJlU2NoZWR1bGVIaWRlKCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfSElERSk7IC8vIEBkZXByZWNhdGVkXG4gICAgICByZWZsb3codGhpcy5fZWxlbWVudCk7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XLCBDTEFTU19OQU1FX1NIT1dJTkcpO1xuICAgICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZSwgdGhpcy5fZWxlbWVudCwgdGhpcy5fY29uZmlnLmFuaW1hdGlvbik7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNTaG93bigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhpZGVFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJREUpO1xuICAgICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9ISURFKTsgLy8gQGRlcHJlY2F0ZWRcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPV0lORywgQ0xBU1NfTkFNRV9TSE9XKTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElEREVOKTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XSU5HKTtcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soY29tcGxldGUsIHRoaXMuX2VsZW1lbnQsIHRoaXMuX2NvbmZpZy5hbmltYXRpb24pO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgdGhpcy5fY2xlYXJUaW1lb3V0KCk7XG4gICAgICBpZiAodGhpcy5pc1Nob3duKCkpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVyk7XG4gICAgICB9XG4gICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlzU2hvd24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TSE9XKTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlXG5cbiAgICBfbWF5YmVTY2hlZHVsZUhpZGUoKSB7XG4gICAgICBpZiAoIXRoaXMuX2NvbmZpZy5hdXRvaGlkZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5faGFzTW91c2VJbnRlcmFjdGlvbiB8fCB0aGlzLl9oYXNLZXlib2FyZEludGVyYWN0aW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICB9LCB0aGlzLl9jb25maWcuZGVsYXkpO1xuICAgIH1cbiAgICBfb25JbnRlcmFjdGlvbihldmVudCwgaXNJbnRlcmFjdGluZykge1xuICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlb3Zlcic6XG4gICAgICAgIGNhc2UgJ21vdXNlb3V0JzpcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9oYXNNb3VzZUludGVyYWN0aW9uID0gaXNJbnRlcmFjdGluZztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnZm9jdXNpbic6XG4gICAgICAgIGNhc2UgJ2ZvY3Vzb3V0JzpcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9oYXNLZXlib2FyZEludGVyYWN0aW9uID0gaXNJbnRlcmFjdGluZztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0ludGVyYWN0aW5nKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyVGltZW91dCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0RWxlbWVudCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XG4gICAgICBpZiAodGhpcy5fZWxlbWVudCA9PT0gbmV4dEVsZW1lbnQgfHwgdGhpcy5fZWxlbWVudC5jb250YWlucyhuZXh0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fbWF5YmVTY2hlZHVsZUhpZGUoKTtcbiAgICB9XG4gICAgX3NldExpc3RlbmVycygpIHtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRU9WRVIsIGV2ZW50ID0+IHRoaXMuX29uSW50ZXJhY3Rpb24oZXZlbnQsIHRydWUpKTtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRU9VVCwgZXZlbnQgPT4gdGhpcy5fb25JbnRlcmFjdGlvbihldmVudCwgZmFsc2UpKTtcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9GT0NVU0lOLCBldmVudCA9PiB0aGlzLl9vbkludGVyYWN0aW9uKGV2ZW50LCB0cnVlKSk7XG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfRk9DVVNPVVQsIGV2ZW50ID0+IHRoaXMuX29uSW50ZXJhY3Rpb24oZXZlbnQsIGZhbHNlKSk7XG4gICAgfVxuICAgIF9jbGVhclRpbWVvdXQoKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgICB0aGlzLl90aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTdGF0aWNcbiAgICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBUb2FzdC5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm8gbWV0aG9kIG5hbWVkIFwiJHtjb25maWd9XCJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGF0YVtjb25maWddKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAgICovXG5cbiAgZW5hYmxlRGlzbWlzc1RyaWdnZXIoVG9hc3QpO1xuXG4gIC8qKlxuICAgKiBqUXVlcnlcbiAgICovXG5cbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luKFRvYXN0KTtcblxuICAvKipcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogQm9vdHN0cmFwIGluZGV4LnVtZC5qc1xuICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgY29uc3QgaW5kZXhfdW1kID0ge1xuICAgIEFsZXJ0LFxuICAgIEJ1dHRvbixcbiAgICBDYXJvdXNlbCxcbiAgICBDb2xsYXBzZSxcbiAgICBEcm9wZG93bixcbiAgICBNb2RhbCxcbiAgICBPZmZjYW52YXMsXG4gICAgUG9wb3ZlcixcbiAgICBTY3JvbGxTcHksXG4gICAgVGFiLFxuICAgIFRvYXN0LFxuICAgIFRvb2x0aXBcbiAgfTtcblxuICByZXR1cm4gaW5kZXhfdW1kO1xuXG59KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ib290c3RyYXAuanMubWFwXG4iLCIoZnVuY3Rpb24oKXtcblwidXNlIHN0cmljdFwiO1xudmFyIGRvYyA9IGRvY3VtZW50O1xudmFyIHdpbiA9IHdpbmRvdztcbnZhciBkb2NFbGUgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xudmFyIGNyZWF0ZUVsZW1lbnQgPSBkb2MuY3JlYXRlRWxlbWVudC5iaW5kKGRvYyk7XG52YXIgZGl2ID0gY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG52YXIgdGFibGUgPSBjcmVhdGVFbGVtZW50KCd0YWJsZScpO1xudmFyIHRib2R5ID0gY3JlYXRlRWxlbWVudCgndGJvZHknKTtcbnZhciB0ciA9IGNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXksIEFycmF5UHJvdG90eXBlID0gQXJyYXkucHJvdG90eXBlO1xudmFyIGNvbmNhdCA9IEFycmF5UHJvdG90eXBlLmNvbmNhdCwgZmlsdGVyID0gQXJyYXlQcm90b3R5cGUuZmlsdGVyLCBpbmRleE9mID0gQXJyYXlQcm90b3R5cGUuaW5kZXhPZiwgbWFwID0gQXJyYXlQcm90b3R5cGUubWFwLCBwdXNoID0gQXJyYXlQcm90b3R5cGUucHVzaCwgc2xpY2UgPSBBcnJheVByb3RvdHlwZS5zbGljZSwgc29tZSA9IEFycmF5UHJvdG90eXBlLnNvbWUsIHNwbGljZSA9IEFycmF5UHJvdG90eXBlLnNwbGljZTtcbnZhciBpZFJlID0gL14jKD86W1xcdy1dfFxcXFwufFteXFx4MDAtXFx4YTBdKSokLztcbnZhciBjbGFzc1JlID0gL15cXC4oPzpbXFx3LV18XFxcXC58W15cXHgwMC1cXHhhMF0pKiQvO1xudmFyIGh0bWxSZSA9IC88Lis+LztcbnZhciB0YWdSZSA9IC9eXFx3KyQvO1xuLy8gQHJlcXVpcmUgLi92YXJpYWJsZXMudHNcbmZ1bmN0aW9uIGZpbmQoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgaXNGcmFnbWVudCA9IGlzRG9jdW1lbnRGcmFnbWVudChjb250ZXh0KTtcbiAgICByZXR1cm4gIXNlbGVjdG9yIHx8ICghaXNGcmFnbWVudCAmJiAhaXNEb2N1bWVudChjb250ZXh0KSAmJiAhaXNFbGVtZW50KGNvbnRleHQpKVxuICAgICAgICA/IFtdXG4gICAgICAgIDogIWlzRnJhZ21lbnQgJiYgY2xhc3NSZS50ZXN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgPyBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3Iuc2xpY2UoMSkucmVwbGFjZSgvXFxcXC9nLCAnJykpXG4gICAgICAgICAgICA6ICFpc0ZyYWdtZW50ICYmIHRhZ1JlLnRlc3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgPyBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIDogY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbi8vIEByZXF1aXJlIC4vZmluZC50c1xuLy8gQHJlcXVpcmUgLi92YXJpYWJsZXMudHNcbnZhciBDYXNoID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhc2goc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFzZWxlY3RvcilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKGlzQ2FzaChzZWxlY3RvcikpXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3I7XG4gICAgICAgIHZhciBlbGVzID0gc2VsZWN0b3I7XG4gICAgICAgIGlmIChpc1N0cmluZyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHZhciBjdHggPSBjb250ZXh0IHx8IGRvYztcbiAgICAgICAgICAgIGVsZXMgPSBpZFJlLnRlc3Qoc2VsZWN0b3IpICYmIGlzRG9jdW1lbnQoY3R4KVxuICAgICAgICAgICAgICAgID8gY3R4LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yLnNsaWNlKDEpLnJlcGxhY2UoL1xcXFwvZywgJycpKVxuICAgICAgICAgICAgICAgIDogaHRtbFJlLnRlc3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgICAgID8gcGFyc2VIVE1MKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgICAgICA6IGlzQ2FzaChjdHgpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGN0eC5maW5kKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpc1N0cmluZyhjdHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBjYXNoKGN0eCkuZmluZChzZWxlY3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGZpbmQoc2VsZWN0b3IsIGN0eCk7XG4gICAgICAgICAgICBpZiAoIWVsZXMpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzRnVuY3Rpb24oc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkeShzZWxlY3Rvcik7IC8vRklYTUU6IGBmbi5yZWFkeWAgaXMgbm90IGluY2x1ZGVkIGluIGBjb3JlYCwgYnV0IGl0J3MgYWN0dWFsbHkgYSBjb3JlIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlcy5ub2RlVHlwZSB8fCBlbGVzID09PSB3aW4pXG4gICAgICAgICAgICBlbGVzID0gW2VsZXNdO1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGVsZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzW2ldID0gZWxlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBDYXNoLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FzaChzZWxlY3RvciwgY29udGV4dCk7XG4gICAgfTtcbiAgICByZXR1cm4gQ2FzaDtcbn0oKSk7XG52YXIgZm4gPSBDYXNoLnByb3RvdHlwZTtcbnZhciBjYXNoID0gZm4uaW5pdDtcbmNhc2guZm4gPSBjYXNoLnByb3RvdHlwZSA9IGZuOyAvLyBFbnN1cmluZyB0aGF0IGBjYXNoICgpIGluc3RhbmNlb2YgY2FzaGBcbmZuLmxlbmd0aCA9IDA7XG5mbi5zcGxpY2UgPSBzcGxpY2U7IC8vIEVuc3VyaW5nIGEgY2FzaCBjb2xsZWN0aW9uIGdldHMgcHJpbnRlZCBhcyBhcnJheS1saWtlIGluIENocm9tZSdzIGRldnRvb2xzXG5pZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBFbnN1cmluZyBhIGNhc2ggY29sbGVjdGlvbiBpcyBpdGVyYWJsZVxuICAgIGZuW1N5bWJvbFsnaXRlcmF0b3InXV0gPSBBcnJheVByb3RvdHlwZVtTeW1ib2xbJ2l0ZXJhdG9yJ11dO1xufVxuZnVuY3Rpb24gaXNDYXNoKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgQ2FzaDtcbn1cbmZ1bmN0aW9uIGlzV2luZG93KHZhbHVlKSB7XG4gICAgcmV0dXJuICEhdmFsdWUgJiYgdmFsdWUgPT09IHZhbHVlLndpbmRvdztcbn1cbmZ1bmN0aW9uIGlzRG9jdW1lbnQodmFsdWUpIHtcbiAgICByZXR1cm4gISF2YWx1ZSAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gOTtcbn1cbmZ1bmN0aW9uIGlzRG9jdW1lbnRGcmFnbWVudCh2YWx1ZSkge1xuICAgIHJldHVybiAhIXZhbHVlICYmIHZhbHVlLm5vZGVUeXBlID09PSAxMTtcbn1cbmZ1bmN0aW9uIGlzRWxlbWVudCh2YWx1ZSkge1xuICAgIHJldHVybiAhIXZhbHVlICYmIHZhbHVlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuICEhdmFsdWUgJiYgdmFsdWUubm9kZVR5cGUgPT09IDM7XG59XG5mdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbic7XG59XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljKHZhbHVlKSB7XG4gICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KHZhbHVlKSkgJiYgaXNGaW5pdGUodmFsdWUpO1xufVxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnIHx8IHZhbHVlID09PSBudWxsKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKTtcbiAgICByZXR1cm4gcHJvdG8gPT09IG51bGwgfHwgcHJvdG8gPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5jYXNoLmlzV2luZG93ID0gaXNXaW5kb3c7XG5jYXNoLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuY2FzaC5pc0FycmF5ID0gaXNBcnJheTtcbmNhc2guaXNOdW1lcmljID0gaXNOdW1lcmljO1xuY2FzaC5pc1BsYWluT2JqZWN0ID0gaXNQbGFpbk9iamVjdDtcbmZ1bmN0aW9uIGVhY2goYXJyLCBjYWxsYmFjaywgX3JldmVyc2UpIHtcbiAgICBpZiAoX3JldmVyc2UpIHtcbiAgICAgICAgdmFyIGkgPSBhcnIubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChhcnJbaV0sIGksIGFycltpXSkgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQbGFpbk9iamVjdChhcnIpKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXJyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChhcnJba2V5XSwga2V5LCBhcnJba2V5XSkgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoYXJyW2ldLCBpLCBhcnJbaV0pID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnI7XG59XG5jYXNoLmVhY2ggPSBlYWNoO1xuZm4uZWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHJldHVybiBlYWNoKHRoaXMsIGNhbGxiYWNrKTtcbn07XG5mbi5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgd2hpbGUgKGVsZS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBlbGUucmVtb3ZlQ2hpbGQoZWxlLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgc291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgZGVlcCA9IGlzQm9vbGVhbihzb3VyY2VzWzBdKSA/IHNvdXJjZXMuc2hpZnQoKSA6IGZhbHNlO1xuICAgIHZhciB0YXJnZXQgPSBzb3VyY2VzLnNoaWZ0KCk7XG4gICAgdmFyIGxlbmd0aCA9IHNvdXJjZXMubGVuZ3RoO1xuICAgIGlmICghdGFyZ2V0KVxuICAgICAgICByZXR1cm4ge307XG4gICAgaWYgKCFsZW5ndGgpXG4gICAgICAgIHJldHVybiBleHRlbmQoZGVlcCwgY2FzaCwgdGFyZ2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2ldO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoZGVlcCAmJiAoaXNBcnJheShzb3VyY2Vba2V5XSkgfHwgaXNQbGFpbk9iamVjdChzb3VyY2Vba2V5XSkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRba2V5XSB8fCB0YXJnZXRba2V5XS5jb25zdHJ1Y3RvciAhPT0gc291cmNlW2tleV0uY29uc3RydWN0b3IpXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gbmV3IHNvdXJjZVtrZXldLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgICAgICAgICAgZXh0ZW5kKGRlZXAsIHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5jYXNoLmV4dGVuZCA9IGV4dGVuZDtcbmZuLmV4dGVuZCA9IGZ1bmN0aW9uIChwbHVnaW5zKSB7XG4gICAgcmV0dXJuIGV4dGVuZChmbiwgcGx1Z2lucyk7XG59O1xuLy8gQHJlcXVpcmUgLi90eXBlX2NoZWNraW5nLnRzXG52YXIgc3BsaXRWYWx1ZXNSZSA9IC9cXFMrL2c7XG5mdW5jdGlvbiBnZXRTcGxpdFZhbHVlcyhzdHIpIHtcbiAgICByZXR1cm4gaXNTdHJpbmcoc3RyKSA/IHN0ci5tYXRjaChzcGxpdFZhbHVlc1JlKSB8fCBbXSA6IFtdO1xufVxuZm4udG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiAoY2xzLCBmb3JjZSkge1xuICAgIHZhciBjbGFzc2VzID0gZ2V0U3BsaXRWYWx1ZXMoY2xzKTtcbiAgICB2YXIgaXNGb3JjZSA9ICFpc1VuZGVmaW5lZChmb3JjZSk7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIGlmICghaXNFbGVtZW50KGVsZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGksIGMpIHtcbiAgICAgICAgICAgIGlmIChpc0ZvcmNlKSB7XG4gICAgICAgICAgICAgICAgZm9yY2UgPyBlbGUuY2xhc3NMaXN0LmFkZChjKSA6IGVsZS5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC50b2dnbGUoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbmZuLmFkZENsYXNzID0gZnVuY3Rpb24gKGNscykge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZUNsYXNzKGNscywgdHJ1ZSk7XG59O1xuZm4ucmVtb3ZlQXR0ciA9IGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgdmFyIGF0dHJzID0gZ2V0U3BsaXRWYWx1ZXMoYXR0cik7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIGlmICghaXNFbGVtZW50KGVsZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGVhY2goYXR0cnMsIGZ1bmN0aW9uIChpLCBhKSB7XG4gICAgICAgICAgICBlbGUucmVtb3ZlQXR0cmlidXRlKGEpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBhdHRyKGF0dHIsIHZhbHVlKSB7XG4gICAgaWYgKCFhdHRyKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGlzU3RyaW5nKGF0dHIpKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgaWYgKCF0aGlzWzBdIHx8ICFpc0VsZW1lbnQodGhpc1swXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHZhbHVlXzEgPSB0aGlzWzBdLmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgICAgIHJldHVybiBpc051bGwodmFsdWVfMSkgPyB1bmRlZmluZWQgOiB2YWx1ZV8xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVBdHRyKGF0dHIpO1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICAgIGlmICghaXNFbGVtZW50KGVsZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZWxlLnNldEF0dHJpYnV0ZShhdHRyLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gYXR0cikge1xuICAgICAgICB0aGlzLmF0dHIoa2V5LCBhdHRyW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn1cbmZuLmF0dHIgPSBhdHRyO1xuZm4ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUNsYXNzKGNscywgZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLmF0dHIoJ2NsYXNzJywgJycpO1xufTtcbmZuLmhhc0NsYXNzID0gZnVuY3Rpb24gKGNscykge1xuICAgIHJldHVybiAhIWNscyAmJiBzb21lLmNhbGwodGhpcywgZnVuY3Rpb24gKGVsZSkgeyByZXR1cm4gaXNFbGVtZW50KGVsZSkgJiYgZWxlLmNsYXNzTGlzdC5jb250YWlucyhjbHMpOyB9KTtcbn07XG5mbi5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICBpZiAoaXNVbmRlZmluZWQoaW5kZXgpKVxuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbCh0aGlzKTtcbiAgICBpbmRleCA9IE51bWJlcihpbmRleCk7XG4gICAgcmV0dXJuIHRoaXNbaW5kZXggPCAwID8gaW5kZXggKyB0aGlzLmxlbmd0aCA6IGluZGV4XTtcbn07XG5mbi5lcSA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHJldHVybiBjYXNoKHRoaXMuZ2V0KGluZGV4KSk7XG59O1xuZm4uZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXEoMCk7XG59O1xuZm4ubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lcSgtMSk7XG59O1xuZnVuY3Rpb24gdGV4dCh0ZXh0KSB7XG4gICAgaWYgKGlzVW5kZWZpbmVkKHRleHQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgpLm1hcChmdW5jdGlvbiAoZWxlKSB7IHJldHVybiBpc0VsZW1lbnQoZWxlKSB8fCBpc1RleHQoZWxlKSA/IGVsZS50ZXh0Q29udGVudCA6ICcnOyB9KS5qb2luKCcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIGlmICghaXNFbGVtZW50KGVsZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGVsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgfSk7XG59XG5mbi50ZXh0ID0gdGV4dDtcbi8vIEByZXF1aXJlIGNvcmUvdHlwZV9jaGVja2luZy50c1xuLy8gQHJlcXVpcmUgY29yZS92YXJpYWJsZXMudHNcbmZ1bmN0aW9uIGNvbXB1dGVTdHlsZShlbGUsIHByb3AsIGlzVmFyaWFibGUpIHtcbiAgICBpZiAoIWlzRWxlbWVudChlbGUpKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIHN0eWxlID0gd2luLmdldENvbXB1dGVkU3R5bGUoZWxlLCBudWxsKTtcbiAgICByZXR1cm4gaXNWYXJpYWJsZSA/IHN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcCkgfHwgdW5kZWZpbmVkIDogc3R5bGVbcHJvcF0gfHwgZWxlLnN0eWxlW3Byb3BdO1xufVxuLy8gQHJlcXVpcmUgLi9jb21wdXRlX3N0eWxlLnRzXG5mdW5jdGlvbiBjb21wdXRlU3R5bGVJbnQoZWxlLCBwcm9wKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGNvbXB1dGVTdHlsZShlbGUsIHByb3ApLCAxMCkgfHwgMDtcbn1cbi8vIEByZXF1aXJlIGNzcy9oZWxwZXJzL2NvbXB1dGVfc3R5bGVfaW50LnRzXG5mdW5jdGlvbiBnZXRFeHRyYVNwYWNlKGVsZSwgeEF4aXMpIHtcbiAgICByZXR1cm4gY29tcHV0ZVN0eWxlSW50KGVsZSwgXCJib3JkZXJcIi5jb25jYXQoeEF4aXMgPyAnTGVmdCcgOiAnVG9wJywgXCJXaWR0aFwiKSkgKyBjb21wdXRlU3R5bGVJbnQoZWxlLCBcInBhZGRpbmdcIi5jb25jYXQoeEF4aXMgPyAnTGVmdCcgOiAnVG9wJykpICsgY29tcHV0ZVN0eWxlSW50KGVsZSwgXCJwYWRkaW5nXCIuY29uY2F0KHhBeGlzID8gJ1JpZ2h0JyA6ICdCb3R0b20nKSkgKyBjb21wdXRlU3R5bGVJbnQoZWxlLCBcImJvcmRlclwiLmNvbmNhdCh4QXhpcyA/ICdSaWdodCcgOiAnQm90dG9tJywgXCJXaWR0aFwiKSk7XG59XG4vLyBAcmVxdWlyZSBjc3MvaGVscGVycy9jb21wdXRlX3N0eWxlLnRzXG52YXIgZGVmYXVsdERpc3BsYXkgPSB7fTtcbmZ1bmN0aW9uIGdldERlZmF1bHREaXNwbGF5KHRhZ05hbWUpIHtcbiAgICBpZiAoZGVmYXVsdERpc3BsYXlbdGFnTmFtZV0pXG4gICAgICAgIHJldHVybiBkZWZhdWx0RGlzcGxheVt0YWdOYW1lXTtcbiAgICB2YXIgZWxlID0gY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICBkb2MuYm9keS5pbnNlcnRCZWZvcmUoZWxlLCBudWxsKTtcbiAgICB2YXIgZGlzcGxheSA9IGNvbXB1dGVTdHlsZShlbGUsICdkaXNwbGF5Jyk7XG4gICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQoZWxlKTtcbiAgICByZXR1cm4gZGVmYXVsdERpc3BsYXlbdGFnTmFtZV0gPSBkaXNwbGF5ICE9PSAnbm9uZScgPyBkaXNwbGF5IDogJ2Jsb2NrJztcbn1cbi8vIEByZXF1aXJlIGNzcy9oZWxwZXJzL2NvbXB1dGVfc3R5bGUudHNcbmZ1bmN0aW9uIGlzSGlkZGVuKGVsZSkge1xuICAgIHJldHVybiBjb21wdXRlU3R5bGUoZWxlLCAnZGlzcGxheScpID09PSAnbm9uZSc7XG59XG4vLyBAcmVxdWlyZSAuL2Nhc2gudHNcbmZ1bmN0aW9uIG1hdGNoZXMoZWxlLCBzZWxlY3Rvcikge1xuICAgIHZhciBtYXRjaGVzID0gZWxlICYmIChlbGVbJ21hdGNoZXMnXSB8fCBlbGVbJ3dlYmtpdE1hdGNoZXNTZWxlY3RvciddIHx8IGVsZVsnbXNNYXRjaGVzU2VsZWN0b3InXSk7XG4gICAgcmV0dXJuICEhbWF0Y2hlcyAmJiAhIXNlbGVjdG9yICYmIG1hdGNoZXMuY2FsbChlbGUsIHNlbGVjdG9yKTtcbn1cbi8vIEByZXF1aXJlIC4vbWF0Y2hlcy50c1xuLy8gQHJlcXVpcmUgLi90eXBlX2NoZWNraW5nLnRzXG5mdW5jdGlvbiBnZXRDb21wYXJlRnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgIHJldHVybiBpc1N0cmluZyhjb21wYXJhdG9yKVxuICAgICAgICA/IGZ1bmN0aW9uIChpLCBlbGUpIHsgcmV0dXJuIG1hdGNoZXMoZWxlLCBjb21wYXJhdG9yKTsgfVxuICAgICAgICA6IGlzRnVuY3Rpb24oY29tcGFyYXRvcilcbiAgICAgICAgICAgID8gY29tcGFyYXRvclxuICAgICAgICAgICAgOiBpc0Nhc2goY29tcGFyYXRvcilcbiAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uIChpLCBlbGUpIHsgcmV0dXJuIGNvbXBhcmF0b3IuaXMoZWxlKTsgfVxuICAgICAgICAgICAgICAgIDogIWNvbXBhcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uIChpLCBlbGUpIHsgcmV0dXJuIGVsZSA9PT0gY29tcGFyYXRvcjsgfTtcbn1cbmZuLmZpbHRlciA9IGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgdmFyIGNvbXBhcmUgPSBnZXRDb21wYXJlRnVuY3Rpb24oY29tcGFyYXRvcik7XG4gICAgcmV0dXJuIGNhc2goZmlsdGVyLmNhbGwodGhpcywgZnVuY3Rpb24gKGVsZSwgaSkgeyByZXR1cm4gY29tcGFyZS5jYWxsKGVsZSwgaSwgZWxlKTsgfSkpO1xufTtcbi8vIEByZXF1aXJlIGNvbGxlY3Rpb24vZmlsdGVyLnRzXG5mdW5jdGlvbiBmaWx0ZXJlZChjb2xsZWN0aW9uLCBjb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuICFjb21wYXJhdG9yID8gY29sbGVjdGlvbiA6IGNvbGxlY3Rpb24uZmlsdGVyKGNvbXBhcmF0b3IpO1xufVxuZm4uZGV0YWNoID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IpIHtcbiAgICBmaWx0ZXJlZCh0aGlzLCBjb21wYXJhdG9yKS5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgaWYgKGVsZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBlbGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xudmFyIGZyYWdtZW50UmUgPSAvXlxccyo8KFxcdyspW14+XSo+LztcbnZhciBzaW5nbGVUYWdSZSA9IC9ePChcXHcrKVxccypcXC8/Pig/OjxcXC9cXDE+KT8kLztcbnZhciBjb250YWluZXJzID0ge1xuICAgICcqJzogZGl2LFxuICAgIHRyOiB0Ym9keSxcbiAgICB0ZDogdHIsXG4gICAgdGg6IHRyLFxuICAgIHRoZWFkOiB0YWJsZSxcbiAgICB0Ym9keTogdGFibGUsXG4gICAgdGZvb3Q6IHRhYmxlXG59O1xuLy9UT0RPOiBDcmVhdGUgZWxlbWVudHMgaW5zaWRlIGEgZG9jdW1lbnQgZnJhZ21lbnQsIGluIG9yZGVyIHRvIHByZXZlbnQgaW5saW5lIGV2ZW50IGhhbmRsZXJzIGZyb20gZmlyaW5nXG4vL1RPRE86IEVuc3VyZSB0aGUgY3JlYXRlZCBlbGVtZW50cyBoYXZlIHRoZSBmcmFnbWVudCBhcyB0aGVpciBwYXJlbnQgaW5zdGVhZCBvZiBudWxsLCB0aGlzIGFsc28gZW5zdXJlcyB3ZSBjYW4gZGVhbCB3aXRoIGRldGF0Y2hlZCBub2RlcyBtb3JlIHJlbGlhYmx5XG5mdW5jdGlvbiBwYXJzZUhUTUwoaHRtbCkge1xuICAgIGlmICghaXNTdHJpbmcoaHRtbCkpXG4gICAgICAgIHJldHVybiBbXTtcbiAgICBpZiAoc2luZ2xlVGFnUmUudGVzdChodG1sKSlcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVFbGVtZW50KFJlZ0V4cC4kMSldO1xuICAgIHZhciBmcmFnbWVudCA9IGZyYWdtZW50UmUudGVzdChodG1sKSAmJiBSZWdFeHAuJDE7XG4gICAgdmFyIGNvbnRhaW5lciA9IGNvbnRhaW5lcnNbZnJhZ21lbnRdIHx8IGNvbnRhaW5lcnNbJyonXTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gY2FzaChjb250YWluZXIuY2hpbGROb2RlcykuZGV0YWNoKCkuZ2V0KCk7XG59XG5jYXNoLnBhcnNlSFRNTCA9IHBhcnNlSFRNTDtcbmZuLmhhcyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHZhciBjb21wYXJhdG9yID0gaXNTdHJpbmcoc2VsZWN0b3IpXG4gICAgICAgID8gZnVuY3Rpb24gKGksIGVsZSkgeyByZXR1cm4gZmluZChzZWxlY3RvciwgZWxlKS5sZW5ndGg7IH1cbiAgICAgICAgOiBmdW5jdGlvbiAoaSwgZWxlKSB7IHJldHVybiBlbGUuY29udGFpbnMoc2VsZWN0b3IpOyB9O1xuICAgIHJldHVybiB0aGlzLmZpbHRlcihjb21wYXJhdG9yKTtcbn07XG5mbi5ub3QgPSBmdW5jdGlvbiAoY29tcGFyYXRvcikge1xuICAgIHZhciBjb21wYXJlID0gZ2V0Q29tcGFyZUZ1bmN0aW9uKGNvbXBhcmF0b3IpO1xuICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWxlKSB7IHJldHVybiAoIWlzU3RyaW5nKGNvbXBhcmF0b3IpIHx8IGlzRWxlbWVudChlbGUpKSAmJiAhY29tcGFyZS5jYWxsKGVsZSwgaSwgZWxlKTsgfSk7XG59O1xuZnVuY3Rpb24gcGx1Y2soYXJyLCBwcm9wLCBkZWVwLCB1bnRpbCkge1xuICAgIHZhciBwbHVja2VkID0gW107XG4gICAgdmFyIGlzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKHByb3ApO1xuICAgIHZhciBjb21wYXJlID0gdW50aWwgJiYgZ2V0Q29tcGFyZUZ1bmN0aW9uKHVudGlsKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGlzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciB2YWxfMSA9IHByb3AoYXJyW2ldKTtcbiAgICAgICAgICAgIGlmICh2YWxfMS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcHVzaC5hcHBseShwbHVja2VkLCB2YWxfMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmFsXzIgPSBhcnJbaV1bcHJvcF07XG4gICAgICAgICAgICB3aGlsZSAodmFsXzIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICh1bnRpbCAmJiBjb21wYXJlKC0xLCB2YWxfMikpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIHBsdWNrZWQucHVzaCh2YWxfMik7XG4gICAgICAgICAgICAgICAgdmFsXzIgPSBkZWVwID8gdmFsXzJbcHJvcF0gOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbHVja2VkO1xufVxuLy8gQHJlcXVpcmUgY29yZS9wbHVjay50c1xuLy8gQHJlcXVpcmUgY29yZS92YXJpYWJsZXMudHNcbmZ1bmN0aW9uIGdldFZhbHVlKGVsZSkge1xuICAgIGlmIChlbGUubXVsdGlwbGUgJiYgZWxlLm9wdGlvbnMpXG4gICAgICAgIHJldHVybiBwbHVjayhmaWx0ZXIuY2FsbChlbGUub3B0aW9ucywgZnVuY3Rpb24gKG9wdGlvbikgeyByZXR1cm4gb3B0aW9uLnNlbGVjdGVkICYmICFvcHRpb24uZGlzYWJsZWQgJiYgIW9wdGlvbi5wYXJlbnROb2RlLmRpc2FibGVkOyB9KSwgJ3ZhbHVlJyk7XG4gICAgcmV0dXJuIGVsZS52YWx1ZSB8fCAnJztcbn1cbmZ1bmN0aW9uIHZhbCh2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgZ2V0VmFsdWUodGhpc1swXSk7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBpc1NlbGVjdCA9IGVsZS5tdWx0aXBsZSAmJiBlbGUub3B0aW9ucztcbiAgICAgICAgaWYgKGlzU2VsZWN0IHx8IGNoZWNrYWJsZVJlLnRlc3QoZWxlLnR5cGUpKSB7XG4gICAgICAgICAgICB2YXIgZWxlVmFsdWVfMSA9IGlzQXJyYXkodmFsdWUpID8gbWFwLmNhbGwodmFsdWUsIFN0cmluZykgOiAoaXNOdWxsKHZhbHVlKSA/IFtdIDogW1N0cmluZyh2YWx1ZSldKTtcbiAgICAgICAgICAgIGlmIChpc1NlbGVjdCkge1xuICAgICAgICAgICAgICAgIGVhY2goZWxlLm9wdGlvbnMsIGZ1bmN0aW9uIChpLCBvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZWxlVmFsdWVfMS5pbmRleE9mKG9wdGlvbi52YWx1ZSkgPj0gMDtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZS5jaGVja2VkID0gZWxlVmFsdWVfMS5pbmRleE9mKGVsZS52YWx1ZSkgPj0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZS52YWx1ZSA9IGlzVW5kZWZpbmVkKHZhbHVlKSB8fCBpc051bGwodmFsdWUpID8gJycgOiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZm4udmFsID0gdmFsO1xuZm4uaXMgPSBmdW5jdGlvbiAoY29tcGFyYXRvcikge1xuICAgIHZhciBjb21wYXJlID0gZ2V0Q29tcGFyZUZ1bmN0aW9uKGNvbXBhcmF0b3IpO1xuICAgIHJldHVybiBzb21lLmNhbGwodGhpcywgZnVuY3Rpb24gKGVsZSwgaSkgeyByZXR1cm4gY29tcGFyZS5jYWxsKGVsZSwgaSwgZWxlKTsgfSk7XG59O1xuY2FzaC5ndWlkID0gMTtcbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgICByZXR1cm4gYXJyLmxlbmd0aCA+IDEgPyBmaWx0ZXIuY2FsbChhcnIsIGZ1bmN0aW9uIChpdGVtLCBpbmRleCwgc2VsZikgeyByZXR1cm4gaW5kZXhPZi5jYWxsKHNlbGYsIGl0ZW0pID09PSBpbmRleDsgfSkgOiBhcnI7XG59XG5jYXNoLnVuaXF1ZSA9IHVuaXF1ZTtcbmZuLmFkZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHJldHVybiBjYXNoKHVuaXF1ZSh0aGlzLmdldCgpLmNvbmNhdChjYXNoKHNlbGVjdG9yLCBjb250ZXh0KS5nZXQoKSkpKTtcbn07XG5mbi5jaGlsZHJlbiA9IGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIGZpbHRlcmVkKGNhc2godW5pcXVlKHBsdWNrKHRoaXMsIGZ1bmN0aW9uIChlbGUpIHsgcmV0dXJuIGVsZS5jaGlsZHJlbjsgfSkpKSwgY29tcGFyYXRvcik7XG59O1xuZm4ucGFyZW50ID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gZmlsdGVyZWQoY2FzaCh1bmlxdWUocGx1Y2sodGhpcywgJ3BhcmVudE5vZGUnKSkpLCBjb21wYXJhdG9yKTtcbn07XG5mbi5pbmRleCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHZhciBjaGlsZCA9IHNlbGVjdG9yID8gY2FzaChzZWxlY3RvcilbMF0gOiB0aGlzWzBdO1xuICAgIHZhciBjb2xsZWN0aW9uID0gc2VsZWN0b3IgPyB0aGlzIDogY2FzaChjaGlsZCkucGFyZW50KCkuY2hpbGRyZW4oKTtcbiAgICByZXR1cm4gaW5kZXhPZi5jYWxsKGNvbGxlY3Rpb24sIGNoaWxkKTtcbn07XG5mbi5jbG9zZXN0ID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IpIHtcbiAgICB2YXIgZmlsdGVyZWQgPSB0aGlzLmZpbHRlcihjb21wYXJhdG9yKTtcbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoKVxuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgdmFyICRwYXJlbnQgPSB0aGlzLnBhcmVudCgpO1xuICAgIGlmICghJHBhcmVudC5sZW5ndGgpXG4gICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICByZXR1cm4gJHBhcmVudC5jbG9zZXN0KGNvbXBhcmF0b3IpO1xufTtcbmZuLnNpYmxpbmdzID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gZmlsdGVyZWQoY2FzaCh1bmlxdWUocGx1Y2sodGhpcywgZnVuY3Rpb24gKGVsZSkgeyByZXR1cm4gY2FzaChlbGUpLnBhcmVudCgpLmNoaWxkcmVuKCkubm90KGVsZSk7IH0pKSksIGNvbXBhcmF0b3IpO1xufTtcbmZuLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gY2FzaCh1bmlxdWUocGx1Y2sodGhpcywgZnVuY3Rpb24gKGVsZSkgeyByZXR1cm4gZmluZChzZWxlY3RvciwgZWxlKTsgfSkpKTtcbn07XG4vLyBAcmVxdWlyZSBjb3JlL3ZhcmlhYmxlcy50c1xuLy8gQHJlcXVpcmUgY29sbGVjdGlvbi9maWx0ZXIudHNcbi8vIEByZXF1aXJlIHRyYXZlcnNhbC9maW5kLnRzXG52YXIgSFRNTENEQVRBUmUgPSAvXlxccyo8ISg/OlxcW0NEQVRBXFxbfC0tKXwoPzpcXF1cXF18LS0pPlxccyokL2c7XG52YXIgc2NyaXB0VHlwZVJlID0gL14kfF5tb2R1bGUkfFxcLyhqYXZhfGVjbWEpc2NyaXB0L2k7XG52YXIgc2NyaXB0QXR0cmlidXRlcyA9IFsndHlwZScsICdzcmMnLCAnbm9uY2UnLCAnbm9Nb2R1bGUnXTtcbmZ1bmN0aW9uIGV2YWxTY3JpcHRzKG5vZGUsIGRvYykge1xuICAgIHZhciBjb2xsZWN0aW9uID0gY2FzaChub2RlKTtcbiAgICBjb2xsZWN0aW9uLmZpbHRlcignc2NyaXB0JykuYWRkKGNvbGxlY3Rpb24uZmluZCgnc2NyaXB0JykpLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICBpZiAoc2NyaXB0VHlwZVJlLnRlc3QoZWxlLnR5cGUpICYmIGRvY0VsZS5jb250YWlucyhlbGUpKSB7IC8vIFRoZSBzY3JpcHQgdHlwZSBpcyBzdXBwb3J0ZWQgLy8gVGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gdGhlIERPTSAvLyBVc2luZyBgZG9jdW1lbnRFbGVtZW50YCBmb3IgYnJvYWRlciBicm93c2VyIHN1cHBvcnRcbiAgICAgICAgICAgIHZhciBzY3JpcHRfMSA9IGNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgc2NyaXB0XzEudGV4dCA9IGVsZS50ZXh0Q29udGVudC5yZXBsYWNlKEhUTUxDREFUQVJlLCAnJyk7XG4gICAgICAgICAgICBlYWNoKHNjcmlwdEF0dHJpYnV0ZXMsIGZ1bmN0aW9uIChpLCBhdHRyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZVthdHRyXSlcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0XzFbYXR0cl0gPSBlbGVbYXR0cl07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRvYy5oZWFkLmluc2VydEJlZm9yZShzY3JpcHRfMSwgbnVsbCk7XG4gICAgICAgICAgICBkb2MuaGVhZC5yZW1vdmVDaGlsZChzY3JpcHRfMSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIEByZXF1aXJlIC4vZXZhbF9zY3JpcHRzLnRzXG5mdW5jdGlvbiBpbnNlcnRFbGVtZW50KGFuY2hvciwgdGFyZ2V0LCBsZWZ0LCBpbnNpZGUsIGV2YWx1YXRlKSB7XG4gICAgaWYgKGluc2lkZSkgeyAvLyBwcmVwZW5kL2FwcGVuZFxuICAgICAgICBhbmNob3IuaW5zZXJ0QmVmb3JlKHRhcmdldCwgbGVmdCA/IGFuY2hvci5maXJzdENoaWxkIDogbnVsbCk7XG4gICAgfVxuICAgIGVsc2UgeyAvLyBiZWZvcmUvYWZ0ZXJcbiAgICAgICAgaWYgKGFuY2hvci5ub2RlTmFtZSA9PT0gJ0hUTUwnKSB7XG4gICAgICAgICAgICBhbmNob3IucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGFyZ2V0LCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYW5jaG9yLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhcmdldCwgbGVmdCA/IGFuY2hvciA6IGFuY2hvci5uZXh0U2libGluZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIGV2YWxTY3JpcHRzKHRhcmdldCwgYW5jaG9yLm93bmVyRG9jdW1lbnQpO1xuICAgIH1cbn1cbi8vIEByZXF1aXJlIC4vaW5zZXJ0X2VsZW1lbnQudHNcbmZ1bmN0aW9uIGluc2VydFNlbGVjdG9ycyhzZWxlY3RvcnMsIGFuY2hvcnMsIGludmVyc2UsIGxlZnQsIGluc2lkZSwgcmV2ZXJzZUxvb3AxLCByZXZlcnNlTG9vcDIsIHJldmVyc2VMb29wMykge1xuICAgIGVhY2goc2VsZWN0b3JzLCBmdW5jdGlvbiAoc2ksIHNlbGVjdG9yKSB7XG4gICAgICAgIGVhY2goY2FzaChzZWxlY3RvciksIGZ1bmN0aW9uICh0aSwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBlYWNoKGNhc2goYW5jaG9ycyksIGZ1bmN0aW9uIChhaSwgYW5jaG9yKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFuY2hvckZpbmFsID0gaW52ZXJzZSA/IHRhcmdldCA6IGFuY2hvcjtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RmluYWwgPSBpbnZlcnNlID8gYW5jaG9yIDogdGFyZ2V0O1xuICAgICAgICAgICAgICAgIHZhciBpbmRleEZpbmFsID0gaW52ZXJzZSA/IHRpIDogYWk7XG4gICAgICAgICAgICAgICAgaW5zZXJ0RWxlbWVudChhbmNob3JGaW5hbCwgIWluZGV4RmluYWwgPyB0YXJnZXRGaW5hbCA6IHRhcmdldEZpbmFsLmNsb25lTm9kZSh0cnVlKSwgbGVmdCwgaW5zaWRlLCAhaW5kZXhGaW5hbCk7XG4gICAgICAgICAgICB9LCByZXZlcnNlTG9vcDMpO1xuICAgICAgICB9LCByZXZlcnNlTG9vcDIpO1xuICAgIH0sIHJldmVyc2VMb29wMSk7XG4gICAgcmV0dXJuIGFuY2hvcnM7XG59XG5mbi5hZnRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gaW5zZXJ0U2VsZWN0b3JzKGFyZ3VtZW50cywgdGhpcywgZmFsc2UsIGZhbHNlLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSk7XG59O1xuZm4uYXBwZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBpbnNlcnRTZWxlY3RvcnMoYXJndW1lbnRzLCB0aGlzLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcbmZ1bmN0aW9uIGh0bWwoaHRtbCkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5pbm5lckhUTUw7XG4gICAgaWYgKGlzVW5kZWZpbmVkKGh0bWwpKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB2YXIgaGFzU2NyaXB0ID0gLzxzY3JpcHRbXFxzPl0vLnRlc3QoaHRtbCk7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIGlmICghaXNFbGVtZW50KGVsZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChoYXNTY3JpcHQpIHtcbiAgICAgICAgICAgIGNhc2goZWxlKS5lbXB0eSgpLmFwcGVuZChodG1sKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5mbi5odG1sID0gaHRtbDtcbmZuLmFwcGVuZFRvID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGluc2VydFNlbGVjdG9ycyhhcmd1bWVudHMsIHRoaXMsIHRydWUsIGZhbHNlLCB0cnVlKTtcbn07XG5mbi53cmFwSW5uZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyICRlbGUgPSBjYXNoKGVsZSk7XG4gICAgICAgIHZhciBjb250ZW50cyA9ICRlbGUuY29udGVudHMoKTtcbiAgICAgICAgY29udGVudHMubGVuZ3RoID8gY29udGVudHMud3JhcEFsbChzZWxlY3RvcikgOiAkZWxlLmFwcGVuZChzZWxlY3Rvcik7XG4gICAgfSk7XG59O1xuZm4uYmVmb3JlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBpbnNlcnRTZWxlY3RvcnMoYXJndW1lbnRzLCB0aGlzLCBmYWxzZSwgdHJ1ZSk7XG59O1xuZm4ud3JhcEFsbCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHZhciBzdHJ1Y3R1cmUgPSBjYXNoKHNlbGVjdG9yKTtcbiAgICB2YXIgd3JhcHBlciA9IHN0cnVjdHVyZVswXTtcbiAgICB3aGlsZSAod3JhcHBlci5jaGlsZHJlbi5sZW5ndGgpXG4gICAgICAgIHdyYXBwZXIgPSB3cmFwcGVyLmZpcnN0RWxlbWVudENoaWxkO1xuICAgIHRoaXMuZmlyc3QoKS5iZWZvcmUoc3RydWN0dXJlKTtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRUbyh3cmFwcGVyKTtcbn07XG5mbi53cmFwID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0gY2FzaChzZWxlY3RvcilbMF07XG4gICAgICAgIGNhc2goZWxlKS53cmFwQWxsKCFpID8gd3JhcHBlciA6IHdyYXBwZXIuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9KTtcbn07XG5mbi5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHJldHVybiBpbnNlcnRTZWxlY3RvcnMoYXJndW1lbnRzLCB0aGlzLCB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuZm4uaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGluc2VydFNlbGVjdG9ycyhhcmd1bWVudHMsIHRoaXMsIHRydWUsIHRydWUpO1xufTtcbmZuLnByZXBlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGluc2VydFNlbGVjdG9ycyhhcmd1bWVudHMsIHRoaXMsIGZhbHNlLCB0cnVlLCB0cnVlLCB0cnVlLCB0cnVlKTtcbn07XG5mbi5wcmVwZW5kVG8gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gaW5zZXJ0U2VsZWN0b3JzKGFyZ3VtZW50cywgdGhpcywgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlLCB0cnVlKTtcbn07XG5mbi5jb250ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2FzaCh1bmlxdWUocGx1Y2sodGhpcywgZnVuY3Rpb24gKGVsZSkgeyByZXR1cm4gZWxlLnRhZ05hbWUgPT09ICdJRlJBTUUnID8gW2VsZS5jb250ZW50RG9jdW1lbnRdIDogKGVsZS50YWdOYW1lID09PSAnVEVNUExBVEUnID8gZWxlLmNvbnRlbnQuY2hpbGROb2RlcyA6IGVsZS5jaGlsZE5vZGVzKTsgfSkpKTtcbn07XG5mbi5uZXh0ID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IsIF9hbGwsIF91bnRpbCkge1xuICAgIHJldHVybiBmaWx0ZXJlZChjYXNoKHVuaXF1ZShwbHVjayh0aGlzLCAnbmV4dEVsZW1lbnRTaWJsaW5nJywgX2FsbCwgX3VudGlsKSkpLCBjb21wYXJhdG9yKTtcbn07XG5mbi5uZXh0QWxsID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0KGNvbXBhcmF0b3IsIHRydWUpO1xufTtcbmZuLm5leHRVbnRpbCA9IGZ1bmN0aW9uICh1bnRpbCwgY29tcGFyYXRvcikge1xuICAgIHJldHVybiB0aGlzLm5leHQoY29tcGFyYXRvciwgdHJ1ZSwgdW50aWwpO1xufTtcbmZuLnBhcmVudHMgPSBmdW5jdGlvbiAoY29tcGFyYXRvciwgX3VudGlsKSB7XG4gICAgcmV0dXJuIGZpbHRlcmVkKGNhc2godW5pcXVlKHBsdWNrKHRoaXMsICdwYXJlbnRFbGVtZW50JywgdHJ1ZSwgX3VudGlsKSkpLCBjb21wYXJhdG9yKTtcbn07XG5mbi5wYXJlbnRzVW50aWwgPSBmdW5jdGlvbiAodW50aWwsIGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRzKGNvbXBhcmF0b3IsIHVudGlsKTtcbn07XG5mbi5wcmV2ID0gZnVuY3Rpb24gKGNvbXBhcmF0b3IsIF9hbGwsIF91bnRpbCkge1xuICAgIHJldHVybiBmaWx0ZXJlZChjYXNoKHVuaXF1ZShwbHVjayh0aGlzLCAncHJldmlvdXNFbGVtZW50U2libGluZycsIF9hbGwsIF91bnRpbCkpKSwgY29tcGFyYXRvcik7XG59O1xuZm4ucHJldkFsbCA9IGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMucHJldihjb21wYXJhdG9yLCB0cnVlKTtcbn07XG5mbi5wcmV2VW50aWwgPSBmdW5jdGlvbiAodW50aWwsIGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5wcmV2KGNvbXBhcmF0b3IsIHRydWUsIHVudGlsKTtcbn07XG5mbi5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FzaChjb25jYXQuYXBwbHkoW10sIG1hcC5jYWxsKHRoaXMsIGZ1bmN0aW9uIChlbGUsIGkpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGwoZWxlLCBpLCBlbGUpOyB9KSkpO1xufTtcbmZuLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaSwgZWxlKSB7IHJldHVybiBlbGUuY2xvbmVOb2RlKHRydWUpOyB9KTtcbn07XG5mbi5vZmZzZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudCA9IGVsZS5vZmZzZXRQYXJlbnQ7XG4gICAgICAgIHdoaWxlIChvZmZzZXRQYXJlbnQgJiYgY29tcHV0ZVN0eWxlKG9mZnNldFBhcmVudCwgJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICBvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXRQYXJlbnQgfHwgZG9jRWxlO1xuICAgIH0pO1xufTtcbmZuLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gY2FzaChzbGljZS5jYWxsKHRoaXMsIHN0YXJ0LCBlbmQpKTtcbn07XG4vLyBAcmVxdWlyZSAuL2Nhc2gudHNcbnZhciBkYXNoQWxwaGFSZSA9IC8tKFthLXpdKS9nO1xuZnVuY3Rpb24gY2FtZWxDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZShkYXNoQWxwaGFSZSwgZnVuY3Rpb24gKG1hdGNoLCBsZXR0ZXIpIHsgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpOyB9KTtcbn1cbmZuLnJlYWR5ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIGNiID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgMCwgY2FzaCk7IH07XG4gICAgaWYgKGRvYy5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgY2IpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5mbi51bndyYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXJlbnQoKS5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgaWYgKGVsZS50YWdOYW1lID09PSAnQk9EWScpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciAkZWxlID0gY2FzaChlbGUpO1xuICAgICAgICAkZWxlLnJlcGxhY2VXaXRoKCRlbGUuY2hpbGRyZW4oKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZm4ub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbGUgPSB0aGlzWzBdO1xuICAgIGlmICghZWxlKVxuICAgICAgICByZXR1cm47XG4gICAgdmFyIHJlY3QgPSBlbGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHdpbi5wYWdlWU9mZnNldCxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luLnBhZ2VYT2Zmc2V0XG4gICAgfTtcbn07XG5mbi5wb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWxlID0gdGhpc1swXTtcbiAgICBpZiAoIWVsZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBpc0ZpeGVkID0gKGNvbXB1dGVTdHlsZShlbGUsICdwb3NpdGlvbicpID09PSAnZml4ZWQnKTtcbiAgICB2YXIgb2Zmc2V0ID0gaXNGaXhlZCA/IGVsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IHRoaXMub2Zmc2V0KCk7XG4gICAgaWYgKCFpc0ZpeGVkKSB7XG4gICAgICAgIHZhciBkb2NfMSA9IGVsZS5vd25lckRvY3VtZW50O1xuICAgICAgICB2YXIgb2Zmc2V0UGFyZW50ID0gZWxlLm9mZnNldFBhcmVudCB8fCBkb2NfMS5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHdoaWxlICgob2Zmc2V0UGFyZW50ID09PSBkb2NfMS5ib2R5IHx8IG9mZnNldFBhcmVudCA9PT0gZG9jXzEuZG9jdW1lbnRFbGVtZW50KSAmJiBjb21wdXRlU3R5bGUob2Zmc2V0UGFyZW50LCAncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIG9mZnNldFBhcmVudCA9IG9mZnNldFBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZzZXRQYXJlbnQgIT09IGVsZSAmJiBpc0VsZW1lbnQob2Zmc2V0UGFyZW50KSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudE9mZnNldCA9IGNhc2gob2Zmc2V0UGFyZW50KS5vZmZzZXQoKTtcbiAgICAgICAgICAgIG9mZnNldC50b3AgLT0gcGFyZW50T2Zmc2V0LnRvcCArIGNvbXB1dGVTdHlsZUludChvZmZzZXRQYXJlbnQsICdib3JkZXJUb3BXaWR0aCcpO1xuICAgICAgICAgICAgb2Zmc2V0LmxlZnQgLT0gcGFyZW50T2Zmc2V0LmxlZnQgKyBjb21wdXRlU3R5bGVJbnQob2Zmc2V0UGFyZW50LCAnYm9yZGVyTGVmdFdpZHRoJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBvZmZzZXQudG9wIC0gY29tcHV0ZVN0eWxlSW50KGVsZSwgJ21hcmdpblRvcCcpLFxuICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCAtIGNvbXB1dGVTdHlsZUludChlbGUsICdtYXJnaW5MZWZ0JylcbiAgICB9O1xufTtcbnZhciBwcm9wTWFwID0ge1xuICAgIC8qIEdFTkVSQUwgKi9cbiAgICBjbGFzczogJ2NsYXNzTmFtZScsXG4gICAgY29udGVudGVkaXRhYmxlOiAnY29udGVudEVkaXRhYmxlJyxcbiAgICAvKiBMQUJFTCAqL1xuICAgIGZvcjogJ2h0bWxGb3InLFxuICAgIC8qIElOUFVUICovXG4gICAgcmVhZG9ubHk6ICdyZWFkT25seScsXG4gICAgbWF4bGVuZ3RoOiAnbWF4TGVuZ3RoJyxcbiAgICB0YWJpbmRleDogJ3RhYkluZGV4JyxcbiAgICAvKiBUQUJMRSAqL1xuICAgIGNvbHNwYW46ICdjb2xTcGFuJyxcbiAgICByb3dzcGFuOiAncm93U3BhbicsXG4gICAgLyogSU1BR0UgKi9cbiAgICB1c2VtYXA6ICd1c2VNYXAnXG59O1xuZm4ucHJvcCA9IGZ1bmN0aW9uIChwcm9wLCB2YWx1ZSkge1xuICAgIGlmICghcHJvcClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChpc1N0cmluZyhwcm9wKSkge1xuICAgICAgICBwcm9wID0gcHJvcE1hcFtwcm9wXSB8fCBwcm9wO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICByZXR1cm4gdGhpc1swXSAmJiB0aGlzWzBdW3Byb3BdO1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHsgZWxlW3Byb3BdID0gdmFsdWU7IH0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcCkge1xuICAgICAgICB0aGlzLnByb3Aoa2V5LCBwcm9wW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5mbi5yZW1vdmVQcm9wID0gZnVuY3Rpb24gKHByb3ApIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHsgZGVsZXRlIGVsZVtwcm9wTWFwW3Byb3BdIHx8IHByb3BdOyB9KTtcbn07XG52YXIgY3NzVmFyaWFibGVSZSA9IC9eLS0vO1xuLy8gQHJlcXVpcmUgLi92YXJpYWJsZXMudHNcbmZ1bmN0aW9uIGlzQ1NTVmFyaWFibGUocHJvcCkge1xuICAgIHJldHVybiBjc3NWYXJpYWJsZVJlLnRlc3QocHJvcCk7XG59XG4vLyBAcmVxdWlyZSBjb3JlL2NhbWVsX2Nhc2UudHNcbi8vIEByZXF1aXJlIGNvcmUvY2FzaC50c1xuLy8gQHJlcXVpcmUgY29yZS9lYWNoLnRzXG4vLyBAcmVxdWlyZSBjb3JlL3ZhcmlhYmxlcy50c1xuLy8gQHJlcXVpcmUgLi9pc19jc3NfdmFyaWFibGUudHNcbnZhciBwcmVmaXhlZFByb3BzID0ge307XG52YXIgc3R5bGUgPSBkaXYuc3R5bGU7XG52YXIgdmVuZG9yc1ByZWZpeGVzID0gWyd3ZWJraXQnLCAnbW96JywgJ21zJ107XG5mdW5jdGlvbiBnZXRQcmVmaXhlZFByb3AocHJvcCwgaXNWYXJpYWJsZSkge1xuICAgIGlmIChpc1ZhcmlhYmxlID09PSB2b2lkIDApIHsgaXNWYXJpYWJsZSA9IGlzQ1NTVmFyaWFibGUocHJvcCk7IH1cbiAgICBpZiAoaXNWYXJpYWJsZSlcbiAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgaWYgKCFwcmVmaXhlZFByb3BzW3Byb3BdKSB7XG4gICAgICAgIHZhciBwcm9wQ0MgPSBjYW1lbENhc2UocHJvcCk7XG4gICAgICAgIHZhciBwcm9wVUMgPSBcIlwiLmNvbmNhdChwcm9wQ0NbMF0udG9VcHBlckNhc2UoKSkuY29uY2F0KHByb3BDQy5zbGljZSgxKSk7XG4gICAgICAgIHZhciBwcm9wcyA9IChcIlwiLmNvbmNhdChwcm9wQ0MsIFwiIFwiKS5jb25jYXQodmVuZG9yc1ByZWZpeGVzLmpvaW4oXCJcIi5jb25jYXQocHJvcFVDLCBcIiBcIikpKS5jb25jYXQocHJvcFVDKSkuc3BsaXQoJyAnKTtcbiAgICAgICAgZWFjaChwcm9wcywgZnVuY3Rpb24gKGksIHApIHtcbiAgICAgICAgICAgIGlmIChwIGluIHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4ZWRQcm9wc1twcm9wXSA9IHA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByZWZpeGVkUHJvcHNbcHJvcF07XG59XG4vLyBAcmVxdWlyZSBjb3JlL3R5cGVfY2hlY2tpbmcudHNcbi8vIEByZXF1aXJlIC4vaXNfY3NzX3ZhcmlhYmxlLnRzXG52YXIgbnVtZXJpY1Byb3BzID0ge1xuICAgIGFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50OiB0cnVlLFxuICAgIGNvbHVtbkNvdW50OiB0cnVlLFxuICAgIGZsZXhHcm93OiB0cnVlLFxuICAgIGZsZXhTaHJpbms6IHRydWUsXG4gICAgZm9udFdlaWdodDogdHJ1ZSxcbiAgICBncmlkQXJlYTogdHJ1ZSxcbiAgICBncmlkQ29sdW1uOiB0cnVlLFxuICAgIGdyaWRDb2x1bW5FbmQ6IHRydWUsXG4gICAgZ3JpZENvbHVtblN0YXJ0OiB0cnVlLFxuICAgIGdyaWRSb3c6IHRydWUsXG4gICAgZ3JpZFJvd0VuZDogdHJ1ZSxcbiAgICBncmlkUm93U3RhcnQ6IHRydWUsXG4gICAgbGluZUhlaWdodDogdHJ1ZSxcbiAgICBvcGFjaXR5OiB0cnVlLFxuICAgIG9yZGVyOiB0cnVlLFxuICAgIG9ycGhhbnM6IHRydWUsXG4gICAgd2lkb3dzOiB0cnVlLFxuICAgIHpJbmRleDogdHJ1ZVxufTtcbmZ1bmN0aW9uIGdldFN1ZmZpeGVkVmFsdWUocHJvcCwgdmFsdWUsIGlzVmFyaWFibGUpIHtcbiAgICBpZiAoaXNWYXJpYWJsZSA9PT0gdm9pZCAwKSB7IGlzVmFyaWFibGUgPSBpc0NTU1ZhcmlhYmxlKHByb3ApOyB9XG4gICAgcmV0dXJuICFpc1ZhcmlhYmxlICYmICFudW1lcmljUHJvcHNbcHJvcF0gJiYgaXNOdW1lcmljKHZhbHVlKSA/IFwiXCIuY29uY2F0KHZhbHVlLCBcInB4XCIpIDogdmFsdWU7XG59XG5mdW5jdGlvbiBjc3MocHJvcCwgdmFsdWUpIHtcbiAgICBpZiAoaXNTdHJpbmcocHJvcCkpIHtcbiAgICAgICAgdmFyIGlzVmFyaWFibGVfMSA9IGlzQ1NTVmFyaWFibGUocHJvcCk7XG4gICAgICAgIHByb3AgPSBnZXRQcmVmaXhlZFByb3AocHJvcCwgaXNWYXJpYWJsZV8xKTtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgY29tcHV0ZVN0eWxlKHRoaXNbMF0sIHByb3AsIGlzVmFyaWFibGVfMSk7XG4gICAgICAgIGlmICghcHJvcClcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB2YWx1ZSA9IGdldFN1ZmZpeGVkVmFsdWUocHJvcCwgdmFsdWUsIGlzVmFyaWFibGVfMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgICAgaWYgKCFpc0VsZW1lbnQoZWxlKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAoaXNWYXJpYWJsZV8xKSB7XG4gICAgICAgICAgICAgICAgZWxlLnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZS5zdHlsZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIHByb3ApIHtcbiAgICAgICAgdGhpcy5jc3Moa2V5LCBwcm9wW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn1cbjtcbmZuLmNzcyA9IGNzcztcbmZ1bmN0aW9uIGF0dGVtcHQoZm4sIGFyZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmbihhcmcpO1xuICAgIH1cbiAgICBjYXRjaCAoX2EpIHtcbiAgICAgICAgcmV0dXJuIGFyZztcbiAgICB9XG59XG4vLyBAcmVxdWlyZSBjb3JlL2F0dGVtcHQudHNcbi8vIEByZXF1aXJlIGNvcmUvY2FtZWxfY2FzZS50c1xudmFyIEpTT05TdHJpbmdSZSA9IC9eXFxzK3xcXHMrJC87XG5mdW5jdGlvbiBnZXREYXRhKGVsZSwga2V5KSB7XG4gICAgdmFyIHZhbHVlID0gZWxlLmRhdGFzZXRba2V5XSB8fCBlbGUuZGF0YXNldFtjYW1lbENhc2Uoa2V5KV07XG4gICAgaWYgKEpTT05TdHJpbmdSZS50ZXN0KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBhdHRlbXB0KEpTT04ucGFyc2UsIHZhbHVlKTtcbn1cbi8vIEByZXF1aXJlIGNvcmUvYXR0ZW1wdC50c1xuLy8gQHJlcXVpcmUgY29yZS9jYW1lbF9jYXNlLnRzXG5mdW5jdGlvbiBzZXREYXRhKGVsZSwga2V5LCB2YWx1ZSkge1xuICAgIHZhbHVlID0gYXR0ZW1wdChKU09OLnN0cmluZ2lmeSwgdmFsdWUpO1xuICAgIGVsZS5kYXRhc2V0W2NhbWVsQ2FzZShrZXkpXSA9IHZhbHVlO1xufVxuZnVuY3Rpb24gZGF0YShuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghbmFtZSkge1xuICAgICAgICBpZiAoIXRoaXNbMF0pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciBkYXRhcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpc1swXS5kYXRhc2V0KSB7XG4gICAgICAgICAgICBkYXRhc1trZXldID0gZ2V0RGF0YSh0aGlzWzBdLCBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhcztcbiAgICB9XG4gICAgaWYgKGlzU3RyaW5nKG5hbWUpKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMilcbiAgICAgICAgICAgIHJldHVybiB0aGlzWzBdICYmIGdldERhdGEodGhpc1swXSwgbmFtZSk7XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7IHNldERhdGEoZWxlLCBuYW1lLCB2YWx1ZSk7IH0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICB0aGlzLmRhdGEoa2V5LCBuYW1lW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn1cbmZuLmRhdGEgPSBkYXRhO1xuZnVuY3Rpb24gZ2V0RG9jdW1lbnREaW1lbnNpb24oZG9jLCBkaW1lbnNpb24pIHtcbiAgICB2YXIgZG9jRWxlID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICByZXR1cm4gTWF0aC5tYXgoZG9jLmJvZHlbXCJzY3JvbGxcIi5jb25jYXQoZGltZW5zaW9uKV0sIGRvY0VsZVtcInNjcm9sbFwiLmNvbmNhdChkaW1lbnNpb24pXSwgZG9jLmJvZHlbXCJvZmZzZXRcIi5jb25jYXQoZGltZW5zaW9uKV0sIGRvY0VsZVtcIm9mZnNldFwiLmNvbmNhdChkaW1lbnNpb24pXSwgZG9jRWxlW1wiY2xpZW50XCIuY29uY2F0KGRpbWVuc2lvbildKTtcbn1cbmVhY2goW3RydWUsIGZhbHNlXSwgZnVuY3Rpb24gKGksIG91dGVyKSB7XG4gICAgZWFjaChbJ1dpZHRoJywgJ0hlaWdodCddLCBmdW5jdGlvbiAoaSwgcHJvcCkge1xuICAgICAgICB2YXIgbmFtZSA9IFwiXCIuY29uY2F0KG91dGVyID8gJ291dGVyJyA6ICdpbm5lcicpLmNvbmNhdChwcm9wKTtcbiAgICAgICAgZm5bbmFtZV0gPSBmdW5jdGlvbiAoaW5jbHVkZU1hcmdpbnMpIHtcbiAgICAgICAgICAgIGlmICghdGhpc1swXSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAoaXNXaW5kb3codGhpc1swXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dGVyID8gdGhpc1swXVtcImlubmVyXCIuY29uY2F0KHByb3ApXSA6IHRoaXNbMF0uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50W1wiY2xpZW50XCIuY29uY2F0KHByb3ApXTtcbiAgICAgICAgICAgIGlmIChpc0RvY3VtZW50KHRoaXNbMF0pKVxuICAgICAgICAgICAgICAgIHJldHVybiBnZXREb2N1bWVudERpbWVuc2lvbih0aGlzWzBdLCBwcm9wKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWzBdW1wiXCIuY29uY2F0KG91dGVyID8gJ29mZnNldCcgOiAnY2xpZW50JykuY29uY2F0KHByb3ApXSArIChpbmNsdWRlTWFyZ2lucyAmJiBvdXRlciA/IGNvbXB1dGVTdHlsZUludCh0aGlzWzBdLCBcIm1hcmdpblwiLmNvbmNhdChpID8gJ1RvcCcgOiAnTGVmdCcpKSArIGNvbXB1dGVTdHlsZUludCh0aGlzWzBdLCBcIm1hcmdpblwiLmNvbmNhdChpID8gJ0JvdHRvbScgOiAnUmlnaHQnKSkgOiAwKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn0pO1xuZWFjaChbJ1dpZHRoJywgJ0hlaWdodCddLCBmdW5jdGlvbiAoaW5kZXgsIHByb3ApIHtcbiAgICB2YXIgcHJvcExDID0gcHJvcC50b0xvd2VyQ2FzZSgpO1xuICAgIGZuW3Byb3BMQ10gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzWzBdKVxuICAgICAgICAgICAgcmV0dXJuIGlzVW5kZWZpbmVkKHZhbHVlKSA/IHVuZGVmaW5lZCA6IHRoaXM7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGlzV2luZG93KHRoaXNbMF0pKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudFtcImNsaWVudFwiLmNvbmNhdChwcm9wKV07XG4gICAgICAgICAgICBpZiAoaXNEb2N1bWVudCh0aGlzWzBdKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RG9jdW1lbnREaW1lbnNpb24odGhpc1swXSwgcHJvcCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtwcm9wTENdIC0gZ2V0RXh0cmFTcGFjZSh0aGlzWzBdLCAhaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2YWx1ZU51bWJlciA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgICAgaWYgKCFpc0VsZW1lbnQoZWxlKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB2YXIgYm94U2l6aW5nID0gY29tcHV0ZVN0eWxlKGVsZSwgJ2JveFNpemluZycpO1xuICAgICAgICAgICAgZWxlLnN0eWxlW3Byb3BMQ10gPSBnZXRTdWZmaXhlZFZhbHVlKHByb3BMQywgdmFsdWVOdW1iZXIgKyAoYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcgPyBnZXRFeHRyYVNwYWNlKGVsZSwgIWluZGV4KSA6IDApKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xudmFyIGRpc3BsYXlQcm9wZXJ0eSA9ICdfX19jZCc7XG5mbi50b2dnbGUgPSBmdW5jdGlvbiAoZm9yY2UpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgaWYgKCFpc0VsZW1lbnQoZWxlKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdmFyIGhpZGRlbiA9IGlzSGlkZGVuKGVsZSk7XG4gICAgICAgIHZhciBzaG93ID0gaXNVbmRlZmluZWQoZm9yY2UpID8gaGlkZGVuIDogZm9yY2U7XG4gICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICBlbGUuc3R5bGUuZGlzcGxheSA9IGVsZVtkaXNwbGF5UHJvcGVydHldIHx8ICcnO1xuICAgICAgICAgICAgaWYgKGlzSGlkZGVuKGVsZSkpIHtcbiAgICAgICAgICAgICAgICBlbGUuc3R5bGUuZGlzcGxheSA9IGdldERlZmF1bHREaXNwbGF5KGVsZS50YWdOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaGlkZGVuKSB7XG4gICAgICAgICAgICBlbGVbZGlzcGxheVByb3BlcnR5XSA9IGNvbXB1dGVTdHlsZShlbGUsICdkaXNwbGF5Jyk7XG4gICAgICAgICAgICBlbGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmZuLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbn07XG5mbi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbn07XG52YXIgZXZlbnRzTmFtZXNwYWNlID0gJ19fX2NlJztcbnZhciBldmVudHNOYW1lc3BhY2VzU2VwYXJhdG9yID0gJy4nO1xudmFyIGV2ZW50c0ZvY3VzID0geyBmb2N1czogJ2ZvY3VzaW4nLCBibHVyOiAnZm9jdXNvdXQnIH07XG52YXIgZXZlbnRzSG92ZXIgPSB7IG1vdXNlZW50ZXI6ICdtb3VzZW92ZXInLCBtb3VzZWxlYXZlOiAnbW91c2VvdXQnIH07XG52YXIgZXZlbnRzTW91c2VSZSA9IC9eKG1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnV8ZHJhZ3xkcm9wfGNsaWNrfGRibGNsaWNrKS9pO1xuLy8gQHJlcXVpcmUgLi92YXJpYWJsZXMudHNcbmZ1bmN0aW9uIGdldEV2ZW50TmFtZUJ1YmJsaW5nKG5hbWUpIHtcbiAgICByZXR1cm4gZXZlbnRzSG92ZXJbbmFtZV0gfHwgZXZlbnRzRm9jdXNbbmFtZV0gfHwgbmFtZTtcbn1cbi8vIEByZXF1aXJlIC4vdmFyaWFibGVzLnRzXG5mdW5jdGlvbiBwYXJzZUV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgICB2YXIgcGFydHMgPSBldmVudE5hbWUuc3BsaXQoZXZlbnRzTmFtZXNwYWNlc1NlcGFyYXRvcik7XG4gICAgcmV0dXJuIFtwYXJ0c1swXSwgcGFydHMuc2xpY2UoMSkuc29ydCgpXTsgLy8gW25hbWUsIG5hbWVzcGFjZVtdXVxufVxuZm4udHJpZ2dlciA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgIGlmIChpc1N0cmluZyhldmVudCkpIHtcbiAgICAgICAgdmFyIF9hID0gcGFyc2VFdmVudE5hbWUoZXZlbnQpLCBuYW1lT3JpZ2luYWwgPSBfYVswXSwgbmFtZXNwYWNlcyA9IF9hWzFdO1xuICAgICAgICB2YXIgbmFtZV8xID0gZ2V0RXZlbnROYW1lQnViYmxpbmcobmFtZU9yaWdpbmFsKTtcbiAgICAgICAgaWYgKCFuYW1lXzEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIHR5cGUgPSBldmVudHNNb3VzZVJlLnRlc3QobmFtZV8xKSA/ICdNb3VzZUV2ZW50cycgOiAnSFRNTEV2ZW50cyc7XG4gICAgICAgIGV2ZW50ID0gZG9jLmNyZWF0ZUV2ZW50KHR5cGUpO1xuICAgICAgICBldmVudC5pbml0RXZlbnQobmFtZV8xLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgZXZlbnQubmFtZXNwYWNlID0gbmFtZXNwYWNlcy5qb2luKGV2ZW50c05hbWVzcGFjZXNTZXBhcmF0b3IpO1xuICAgICAgICBldmVudC5fX19vdCA9IG5hbWVPcmlnaW5hbDtcbiAgICB9XG4gICAgZXZlbnQuX19fdGQgPSBkYXRhO1xuICAgIHZhciBpc0V2ZW50Rm9jdXMgPSAoZXZlbnQuX19fb3QgaW4gZXZlbnRzRm9jdXMpO1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICBpZiAoaXNFdmVudEZvY3VzICYmIGlzRnVuY3Rpb24oZWxlW2V2ZW50Ll9fX290XSkpIHtcbiAgICAgICAgICAgIGVsZVtcIl9fX2lcIi5jb25jYXQoZXZlbnQudHlwZSldID0gdHJ1ZTsgLy8gRW5zdXJpbmcgdGhlIG5hdGl2ZSBldmVudCBpcyBpZ25vcmVkXG4gICAgICAgICAgICBlbGVbZXZlbnQuX19fb3RdKCk7XG4gICAgICAgICAgICBlbGVbXCJfX19pXCIuY29uY2F0KGV2ZW50LnR5cGUpXSA9IGZhbHNlOyAvLyBFbnN1cmluZyB0aGUgY3VzdG9tIGV2ZW50IGlzIG5vdCBpZ25vcmVkXG4gICAgICAgIH1cbiAgICAgICAgZWxlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH0pO1xufTtcbi8vIEByZXF1aXJlIC4vdmFyaWFibGVzLnRzXG5mdW5jdGlvbiBnZXRFdmVudHNDYWNoZShlbGUpIHtcbiAgICByZXR1cm4gZWxlW2V2ZW50c05hbWVzcGFjZV0gPSAoZWxlW2V2ZW50c05hbWVzcGFjZV0gfHwge30pO1xufVxuLy8gQHJlcXVpcmUgY29yZS9ndWlkLnRzXG4vLyBAcmVxdWlyZSBldmVudHMvaGVscGVycy9nZXRfZXZlbnRzX2NhY2hlLnRzXG5mdW5jdGlvbiBhZGRFdmVudChlbGUsIG5hbWUsIG5hbWVzcGFjZXMsIHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIHZhciBldmVudENhY2hlID0gZ2V0RXZlbnRzQ2FjaGUoZWxlKTtcbiAgICBldmVudENhY2hlW25hbWVdID0gKGV2ZW50Q2FjaGVbbmFtZV0gfHwgW10pO1xuICAgIGV2ZW50Q2FjaGVbbmFtZV0ucHVzaChbbmFtZXNwYWNlcywgc2VsZWN0b3IsIGNhbGxiYWNrXSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gaGFzTmFtZXNwYWNlcyhuczEsIG5zMikge1xuICAgIHJldHVybiAhbnMyIHx8ICFzb21lLmNhbGwobnMyLCBmdW5jdGlvbiAobnMpIHsgcmV0dXJuIG5zMS5pbmRleE9mKG5zKSA8IDA7IH0pO1xufVxuLy8gQHJlcXVpcmUgLi9nZXRfZXZlbnRzX2NhY2hlLnRzXG4vLyBAcmVxdWlyZSAuL2hhc19uYW1lc3BhY2VzLnRzXG4vLyBAcmVxdWlyZSAuL3BhcnNlX2V2ZW50X25hbWUudHNcbmZ1bmN0aW9uIHJlbW92ZUV2ZW50KGVsZSwgbmFtZSwgbmFtZXNwYWNlcywgc2VsZWN0b3IsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNhY2hlID0gZ2V0RXZlbnRzQ2FjaGUoZWxlKTtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgZm9yIChuYW1lIGluIGNhY2hlKSB7XG4gICAgICAgICAgICByZW1vdmVFdmVudChlbGUsIG5hbWUsIG5hbWVzcGFjZXMsIHNlbGVjdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoY2FjaGVbbmFtZV0pIHtcbiAgICAgICAgY2FjaGVbbmFtZV0gPSBjYWNoZVtuYW1lXS5maWx0ZXIoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgbnMgPSBfYVswXSwgc2VsID0gX2FbMV0sIGNiID0gX2FbMl07XG4gICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNiLmd1aWQgIT09IGNhbGxiYWNrLmd1aWQpIHx8ICFoYXNOYW1lc3BhY2VzKG5zLCBuYW1lc3BhY2VzKSB8fCAoc2VsZWN0b3IgJiYgc2VsZWN0b3IgIT09IHNlbCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZuLm9mZiA9IGZ1bmN0aW9uIChldmVudEZ1bGxOYW1lLCBzZWxlY3RvciwgY2FsbGJhY2spIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmIChpc1VuZGVmaW5lZChldmVudEZ1bGxOYW1lKSkge1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgICAgaWYgKCFpc0VsZW1lbnQoZWxlKSAmJiAhaXNEb2N1bWVudChlbGUpICYmICFpc1dpbmRvdyhlbGUpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50KGVsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmICghaXNTdHJpbmcoZXZlbnRGdWxsTmFtZSkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGV2ZW50RnVsbE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgZXZlbnRGdWxsTmFtZVtrZXldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgc2VsZWN0b3IgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBlYWNoKGdldFNwbGl0VmFsdWVzKGV2ZW50RnVsbE5hbWUpLCBmdW5jdGlvbiAoaSwgZXZlbnRGdWxsTmFtZSkge1xuICAgICAgICAgICAgdmFyIF9hID0gcGFyc2VFdmVudE5hbWUoZXZlbnRGdWxsTmFtZSksIG5hbWVPcmlnaW5hbCA9IF9hWzBdLCBuYW1lc3BhY2VzID0gX2FbMV07XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGdldEV2ZW50TmFtZUJ1YmJsaW5nKG5hbWVPcmlnaW5hbCk7XG4gICAgICAgICAgICBfdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzRWxlbWVudChlbGUpICYmICFpc0RvY3VtZW50KGVsZSkgJiYgIWlzV2luZG93KGVsZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudChlbGUsIG5hbWUsIG5hbWVzcGFjZXMsIHNlbGVjdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbmZuLnJlbW92ZSA9IGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgZmlsdGVyZWQodGhpcywgY29tcGFyYXRvcikuZGV0YWNoKCkub2ZmKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZm4ucmVwbGFjZVdpdGggPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5iZWZvcmUoc2VsZWN0b3IpLnJlbW92ZSgpO1xufTtcbmZuLnJlcGxhY2VBbGwgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICBjYXNoKHNlbGVjdG9yKS5yZXBsYWNlV2l0aCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5mdW5jdGlvbiBvbihldmVudEZ1bGxOYW1lLCBzZWxlY3RvciwgZGF0YSwgY2FsbGJhY2ssIF9vbmUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmICghaXNTdHJpbmcoZXZlbnRGdWxsTmFtZSkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGV2ZW50RnVsbE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMub24oa2V5LCBzZWxlY3RvciwgZGF0YSwgZXZlbnRGdWxsTmFtZVtrZXldLCBfb25lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKCFpc1N0cmluZyhzZWxlY3RvcikpIHtcbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKHNlbGVjdG9yKSB8fCBpc051bGwoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBzZWxlY3RvciA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzVW5kZWZpbmVkKGRhdGEpKSB7XG4gICAgICAgICAgICBkYXRhID0gc2VsZWN0b3I7XG4gICAgICAgICAgICBzZWxlY3RvciA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBkYXRhO1xuICAgICAgICAgICAgZGF0YSA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgc2VsZWN0b3IgPSAnJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKCFjYWxsYmFjaylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgZWFjaChnZXRTcGxpdFZhbHVlcyhldmVudEZ1bGxOYW1lKSwgZnVuY3Rpb24gKGksIGV2ZW50RnVsbE5hbWUpIHtcbiAgICAgICAgdmFyIF9hID0gcGFyc2VFdmVudE5hbWUoZXZlbnRGdWxsTmFtZSksIG5hbWVPcmlnaW5hbCA9IF9hWzBdLCBuYW1lc3BhY2VzID0gX2FbMV07XG4gICAgICAgIHZhciBuYW1lID0gZ2V0RXZlbnROYW1lQnViYmxpbmcobmFtZU9yaWdpbmFsKTtcbiAgICAgICAgdmFyIGlzRXZlbnRIb3ZlciA9IChuYW1lT3JpZ2luYWwgaW4gZXZlbnRzSG92ZXIpO1xuICAgICAgICB2YXIgaXNFdmVudEZvY3VzID0gKG5hbWVPcmlnaW5hbCBpbiBldmVudHNGb2N1cyk7XG4gICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgX3RoaXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgICAgICBpZiAoIWlzRWxlbWVudChlbGUpICYmICFpc0RvY3VtZW50KGVsZSkgJiYgIWlzV2luZG93KGVsZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGZpbmFsQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0W1wiX19faVwiLmNvbmNhdChldmVudC50eXBlKV0pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTsgLy8gSWdub3JpbmcgbmF0aXZlIGV2ZW50IGluIGZhdm9yIG9mIHRoZSB1cGNvbWluZyBjdXN0b20gb25lXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Lm5hbWVzcGFjZSAmJiAhaGFzTmFtZXNwYWNlcyhuYW1lc3BhY2VzLCBldmVudC5uYW1lc3BhY2Uuc3BsaXQoZXZlbnRzTmFtZXNwYWNlc1NlcGFyYXRvcikpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RvciAmJiAoKGlzRXZlbnRGb2N1cyAmJiAoZXZlbnQudGFyZ2V0ICE9PSBlbGUgfHwgZXZlbnQuX19fb3QgPT09IG5hbWUpKSB8fCAoaXNFdmVudEhvdmVyICYmIGV2ZW50LnJlbGF0ZWRUYXJnZXQgJiYgZWxlLmNvbnRhaW5zKGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0FyZyA9IGVsZTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCFtYXRjaGVzKHRhcmdldCwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBlbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpc0FyZyA9IHRhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2ZW50LCAnY3VycmVudFRhcmdldCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQXJnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2ZW50LCAnZGVsZWdhdGVUYXJnZXQnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2ZW50LCAnZGF0YScsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIHJldHVyblZhbHVlID0gY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBldmVudCwgZXZlbnQuX19fdGQpO1xuICAgICAgICAgICAgICAgIGlmIChfb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50KGVsZSwgbmFtZSwgbmFtZXNwYWNlcywgc2VsZWN0b3IsIGZpbmFsQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmV0dXJuVmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaW5hbENhbGxiYWNrLmd1aWQgPSBjYWxsYmFjay5ndWlkID0gKGNhbGxiYWNrLmd1aWQgfHwgY2FzaC5ndWlkKyspO1xuICAgICAgICAgICAgYWRkRXZlbnQoZWxlLCBuYW1lLCBuYW1lc3BhY2VzLCBzZWxlY3RvciwgZmluYWxDYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xufVxuZm4ub24gPSBvbjtcbmZ1bmN0aW9uIG9uZShldmVudEZ1bGxOYW1lLCBzZWxlY3RvciwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5vbihldmVudEZ1bGxOYW1lLCBzZWxlY3RvciwgZGF0YSwgY2FsbGJhY2ssIHRydWUpO1xufVxuO1xuZm4ub25lID0gb25lO1xudmFyIHF1ZXJ5RW5jb2RlQ1JMRlJlID0gL1xccj9cXG4vZztcbmZ1bmN0aW9uIHF1ZXJ5RW5jb2RlKHByb3AsIHZhbHVlKSB7XG4gICAgcmV0dXJuIFwiJlwiLmNvbmNhdChlbmNvZGVVUklDb21wb25lbnQocHJvcCksIFwiPVwiKS5jb25jYXQoZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlLnJlcGxhY2UocXVlcnlFbmNvZGVDUkxGUmUsICdcXHJcXG4nKSkpO1xufVxudmFyIHNraXBwYWJsZVJlID0gL2ZpbGV8cmVzZXR8c3VibWl0fGJ1dHRvbnxpbWFnZS9pO1xudmFyIGNoZWNrYWJsZVJlID0gL3JhZGlvfGNoZWNrYm94L2k7XG5mbi5zZXJpYWxpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgZWFjaChlbGUuZWxlbWVudHMgfHwgW2VsZV0sIGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICAgIGlmIChlbGUuZGlzYWJsZWQgfHwgIWVsZS5uYW1lIHx8IGVsZS50YWdOYW1lID09PSAnRklFTERTRVQnIHx8IHNraXBwYWJsZVJlLnRlc3QoZWxlLnR5cGUpIHx8IChjaGVja2FibGVSZS50ZXN0KGVsZS50eXBlKSAmJiAhZWxlLmNoZWNrZWQpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGdldFZhbHVlKGVsZSk7XG4gICAgICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBpc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcbiAgICAgICAgICAgICAgICBlYWNoKHZhbHVlcywgZnVuY3Rpb24gKGksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5ICs9IHF1ZXJ5RW5jb2RlKGVsZS5uYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBxdWVyeS5zbGljZSgxKTtcbn07XG4vLyBAcmVxdWlyZSBjb3JlL3R5cGVzLnRzXG4vLyBAcmVxdWlyZSBjb3JlL2Nhc2gudHNcbi8vIEByZXF1aXJlIGNvcmUvdHlwZV9jaGVja2luZy50c1xuLy8gQHJlcXVpcmUgY29yZS92YXJpYWJsZXMudHNcbi8vIEByZXF1aXJlIGNvcmUvZWFjaC50c1xuLy8gQHJlcXVpcmUgY29yZS9leHRlbmQudHNcbi8vIEByZXF1aXJlIGNvcmUvZmluZC50c1xuLy8gQHJlcXVpcmUgY29yZS9nZXRfY29tcGFyZV9mdW5jdGlvbi50c1xuLy8gQHJlcXVpcmUgY29yZS9nZXRfc3BsaXRfdmFsdWVzLnRzXG4vLyBAcmVxdWlyZSBjb3JlL2d1aWQudHNcbi8vIEByZXF1aXJlIGNvcmUvcGFyc2VfaHRtbC50c1xuLy8gQHJlcXVpcmUgY29yZS91bmlxdWUudHNcbi8vIEByZXF1aXJlIGF0dHJpYnV0ZXMvYWRkX2NsYXNzLnRzXG4vLyBAcmVxdWlyZSBhdHRyaWJ1dGVzL2F0dHIudHNcbi8vIEByZXF1aXJlIGF0dHJpYnV0ZXMvaGFzX2NsYXNzLnRzXG4vLyBAcmVxdWlyZSBhdHRyaWJ1dGVzL3Byb3AudHNcbi8vIEByZXF1aXJlIGF0dHJpYnV0ZXMvcmVtb3ZlX2F0dHIudHNcbi8vIEByZXF1aXJlIGF0dHJpYnV0ZXMvcmVtb3ZlX2NsYXNzLnRzXG4vLyBAcmVxdWlyZSBhdHRyaWJ1dGVzL3JlbW92ZV9wcm9wLnRzXG4vLyBAcmVxdWlyZSBhdHRyaWJ1dGVzL3RvZ2dsZV9jbGFzcy50c1xuLy8gQHJlcXVpcmUgY29sbGVjdGlvbi9hZGQudHNcbi8vIEByZXF1aXJlIGNvbGxlY3Rpb24vZWFjaC50c1xuLy8gQHJlcXVpcmUgY29sbGVjdGlvbi9lcS50c1xuLy8gQHJlcXVpcmUgY29sbGVjdGlvbi9maWx0ZXIudHNcbi8vIEByZXF1aXJlIGNvbGxlY3Rpb24vZmlyc3QudHNcbi8vIEByZXF1aXJlIGNvbGxlY3Rpb24vZ2V0LnRzXG4vLyBAcmVxdWlyZSBjb2xsZWN0aW9uL2luZGV4LnRzXG4vLyBAcmVxdWlyZSBjb2xsZWN0aW9uL2xhc3QudHNcbi8vIEByZXF1aXJlIGNvbGxlY3Rpb24vbWFwLnRzXG4vLyBAcmVxdWlyZSBjb2xsZWN0aW9uL3NsaWNlLnRzXG4vLyBAcmVxdWlyZSBjc3MvY3NzLnRzXG4vLyBAcmVxdWlyZSBkYXRhL2RhdGEudHNcbi8vIEByZXF1aXJlIGRpbWVuc2lvbnMvaW5uZXJfb3V0ZXIudHNcbi8vIEByZXF1aXJlIGRpbWVuc2lvbnMvbm9ybWFsLnRzXG4vLyBAcmVxdWlyZSBlZmZlY3RzL2hpZGUudHNcbi8vIEByZXF1aXJlIGVmZmVjdHMvc2hvdy50c1xuLy8gQHJlcXVpcmUgZWZmZWN0cy90b2dnbGUudHNcbi8vIEByZXF1aXJlIGV2ZW50cy9vZmYudHNcbi8vIEByZXF1aXJlIGV2ZW50cy9vbi50c1xuLy8gQHJlcXVpcmUgZXZlbnRzL29uZS50c1xuLy8gQHJlcXVpcmUgZXZlbnRzL3JlYWR5LnRzXG4vLyBAcmVxdWlyZSBldmVudHMvdHJpZ2dlci50c1xuLy8gQHJlcXVpcmUgZm9ybXMvc2VyaWFsaXplLnRzXG4vLyBAcmVxdWlyZSBmb3Jtcy92YWwudHNcbi8vIEByZXF1aXJlIG1hbmlwdWxhdGlvbi9hZnRlci50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL2FwcGVuZC50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL2FwcGVuZF90by50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL2JlZm9yZS50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL2Nsb25lLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vZGV0YWNoLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vZW1wdHkudHNcbi8vIEByZXF1aXJlIG1hbmlwdWxhdGlvbi9odG1sLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vaW5zZXJ0X2FmdGVyLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vaW5zZXJ0X2JlZm9yZS50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL3ByZXBlbmQudHNcbi8vIEByZXF1aXJlIG1hbmlwdWxhdGlvbi9wcmVwZW5kX3RvLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vcmVtb3ZlLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vcmVwbGFjZV9hbGwudHNcbi8vIEByZXF1aXJlIG1hbmlwdWxhdGlvbi9yZXBsYWNlX3dpdGgudHNcbi8vIEByZXF1aXJlIG1hbmlwdWxhdGlvbi90ZXh0LnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vdW53cmFwLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vd3JhcC50c1xuLy8gQHJlcXVpcmUgbWFuaXB1bGF0aW9uL3dyYXBfYWxsLnRzXG4vLyBAcmVxdWlyZSBtYW5pcHVsYXRpb24vd3JhcF9pbm5lci50c1xuLy8gQHJlcXVpcmUgb2Zmc2V0L29mZnNldC50c1xuLy8gQHJlcXVpcmUgb2Zmc2V0L29mZnNldF9wYXJlbnQudHNcbi8vIEByZXF1aXJlIG9mZnNldC9wb3NpdGlvbi50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL2NoaWxkcmVuLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvY2xvc2VzdC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL2NvbnRlbnRzLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvZmluZC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL2hhcy50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL2lzLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvbmV4dC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL25leHRfYWxsLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvbmV4dF91bnRpbC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL25vdC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL3BhcmVudC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL3BhcmVudHMudHNcbi8vIEByZXF1aXJlIHRyYXZlcnNhbC9wYXJlbnRzX3VudGlsLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvcHJldi50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL3ByZXZfYWxsLnRzXG4vLyBAcmVxdWlyZSB0cmF2ZXJzYWwvcHJldl91bnRpbC50c1xuLy8gQHJlcXVpcmUgdHJhdmVyc2FsL3NpYmxpbmdzLnRzXG4vLyBAbm8tcmVxdWlyZSBleHRyYXMvZ2V0X3NjcmlwdC50c1xuLy8gQG5vLXJlcXVpcmUgZXh0cmFzL3Nob3J0aGFuZHMudHNcbi8vIEByZXF1aXJlIG1ldGhvZHMudHNcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gTm9kZS5qc1xuICAgIG1vZHVsZS5leHBvcnRzID0gY2FzaDtcbn1cbmVsc2UgeyAvLyBCcm93c2VyXG4gICAgd2luWydjYXNoJ10gPSB3aW5bJyQnXSA9IGNhc2g7XG59XG59KSgpOyIsIi8vIGdldCBzdWNjZXNzZnVsIGNvbnRyb2wgZnJvbSBmb3JtIGFuZCBhc3NlbWJsZSBpbnRvIG9iamVjdFxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDQwMS9pbnRlcmFjdC9mb3Jtcy5odG1sI2gtMTcuMTMuMlxuXG4vLyB0eXBlcyB3aGljaCBpbmRpY2F0ZSBhIHN1Ym1pdCBhY3Rpb24gYW5kIGFyZSBub3Qgc3VjY2Vzc2Z1bCBjb250cm9sc1xuLy8gdGhlc2Ugd2lsbCBiZSBpZ25vcmVkXG52YXIga19yX3N1Ym1pdHRlciA9IC9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaTtcblxuLy8gbm9kZSBuYW1lcyB3aGljaCBjb3VsZCBiZSBzdWNjZXNzZnVsIGNvbnRyb2xzXG52YXIga19yX3N1Y2Nlc3NfY29udHJscyA9IC9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGtleWdlbikvaTtcblxuLy8gTWF0Y2hlcyBicmFja2V0IG5vdGF0aW9uLlxudmFyIGJyYWNrZXRzID0gLyhcXFtbXlxcW1xcXV0qXFxdKS9nO1xuXG4vLyBzZXJpYWxpemVzIGZvcm0gZmllbGRzXG4vLyBAcGFyYW0gZm9ybSBNVVNUIGJlIGFuIEhUTUxGb3JtIGVsZW1lbnRcbi8vIEBwYXJhbSBvcHRpb25zIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IHRvIGNvbmZpZ3VyZSB0aGUgc2VyaWFsaXphdGlvbi4gRGVmYXVsdCBvdXRwdXRcbi8vIHdpdGggbm8gb3B0aW9ucyBzcGVjaWZpZWQgaXMgYSB1cmwgZW5jb2RlZCBzdHJpbmdcbi8vICAgIC0gaGFzaDogW3RydWUgfCBmYWxzZV0gQ29uZmlndXJlIHRoZSBvdXRwdXQgdHlwZS4gSWYgdHJ1ZSwgdGhlIG91dHB1dCB3aWxsXG4vLyAgICBiZSBhIGpzIG9iamVjdC5cbi8vICAgIC0gc2VyaWFsaXplcjogW2Z1bmN0aW9uXSBPcHRpb25hbCBzZXJpYWxpemVyIGZ1bmN0aW9uIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZS5cbi8vICAgIFRoZSBmdW5jdGlvbiB0YWtlcyAzIGFyZ3VtZW50cyAocmVzdWx0LCBrZXksIHZhbHVlKSBhbmQgc2hvdWxkIHJldHVybiBuZXcgcmVzdWx0XG4vLyAgICBoYXNoIGFuZCB1cmwgZW5jb2RlZCBzdHIgc2VyaWFsaXplcnMgYXJlIHByb3ZpZGVkIHdpdGggdGhpcyBtb2R1bGVcbi8vICAgIC0gZGlzYWJsZWQ6IFt0cnVlIHwgZmFsc2VdLiBJZiB0cnVlIHNlcmlhbGl6ZSBkaXNhYmxlZCBmaWVsZHMuXG4vLyAgICAtIGVtcHR5OiBbdHJ1ZSB8IGZhbHNlXS4gSWYgdHJ1ZSBzZXJpYWxpemUgZW1wdHkgZmllbGRzXG5mdW5jdGlvbiBzZXJpYWxpemUoZm9ybSwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0geyBoYXNoOiAhIW9wdGlvbnMgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucy5oYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3B0aW9ucy5oYXNoID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gKG9wdGlvbnMuaGFzaCkgPyB7fSA6ICcnO1xuICAgIHZhciBzZXJpYWxpemVyID0gb3B0aW9ucy5zZXJpYWxpemVyIHx8ICgob3B0aW9ucy5oYXNoKSA/IGhhc2hfc2VyaWFsaXplciA6IHN0cl9zZXJpYWxpemUpO1xuXG4gICAgdmFyIGVsZW1lbnRzID0gZm9ybSAmJiBmb3JtLmVsZW1lbnRzID8gZm9ybS5lbGVtZW50cyA6IFtdO1xuXG4gICAgLy9PYmplY3Qgc3RvcmUgZWFjaCByYWRpbyBhbmQgc2V0IGlmIGl0J3MgZW1wdHkgb3Igbm90XG4gICAgdmFyIHJhZGlvX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIGZvciAodmFyIGk9MCA7IGk8ZWxlbWVudHMubGVuZ3RoIDsgKytpKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG5cbiAgICAgICAgLy8gaW5nb3JlIGRpc2FibGVkIGZpZWxkc1xuICAgICAgICBpZiAoKCFvcHRpb25zLmRpc2FibGVkICYmIGVsZW1lbnQuZGlzYWJsZWQpIHx8ICFlbGVtZW50Lm5hbWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlnbm9yZSBhbnlodGluZyB0aGF0IGlzIG5vdCBjb25zaWRlcmVkIGEgc3VjY2VzcyBmaWVsZFxuICAgICAgICBpZiAoIWtfcl9zdWNjZXNzX2NvbnRybHMudGVzdChlbGVtZW50Lm5vZGVOYW1lKSB8fFxuICAgICAgICAgICAga19yX3N1Ym1pdHRlci50ZXN0KGVsZW1lbnQudHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleSA9IGVsZW1lbnQubmFtZTtcbiAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgLy8gd2UgY2FuJ3QganVzdCB1c2UgZWxlbWVudC52YWx1ZSBmb3IgY2hlY2tib3hlcyBjYXVzZSBzb21lIGJyb3dzZXJzIGxpZSB0byB1c1xuICAgICAgICAvLyB0aGV5IHNheSBcIm9uXCIgZm9yIHZhbHVlIHdoZW4gdGhlIGJveCBpc24ndCBjaGVja2VkXG4gICAgICAgIGlmICgoZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnIHx8IGVsZW1lbnQudHlwZSA9PT0gJ3JhZGlvJykgJiYgIWVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2Ugd2FudCBlbXB0eSBlbGVtZW50c1xuICAgICAgICBpZiAob3B0aW9ucy5lbXB0eSkge1xuICAgICAgICAgICAgLy8gZm9yIGNoZWNrYm94XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZm9yIHJhZGlvXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyYWRpb19zdG9yZVtlbGVtZW50Lm5hbWVdICYmICFlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9fc3RvcmVbZWxlbWVudC5uYW1lXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBvcHRpb25zIGVtcHR5IGlzIHRydWUsIGNvbnRpbnVlIG9ubHkgaWYgaXRzIHJhZGlvXG4gICAgICAgICAgICBpZiAodmFsID09IHVuZGVmaW5lZCAmJiBlbGVtZW50LnR5cGUgPT0gJ3JhZGlvJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gdmFsdWUtbGVzcyBmaWVsZHMgYXJlIGlnbm9yZWQgdW5sZXNzIG9wdGlvbnMuZW1wdHkgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11bHRpIHNlbGVjdCBib3hlc1xuICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAnc2VsZWN0LW11bHRpcGxlJykge1xuICAgICAgICAgICAgdmFsID0gW107XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RPcHRpb25zID0gZWxlbWVudC5vcHRpb25zO1xuICAgICAgICAgICAgdmFyIGlzU2VsZWN0ZWRPcHRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBqPTAgOyBqPHNlbGVjdE9wdGlvbnMubGVuZ3RoIDsgKytqKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IHNlbGVjdE9wdGlvbnNbal07XG4gICAgICAgICAgICAgICAgdmFyIGFsbG93ZWRFbXB0eSA9IG9wdGlvbnMuZW1wdHkgJiYgIW9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzVmFsdWUgPSAob3B0aW9uLnZhbHVlIHx8IGFsbG93ZWRFbXB0eSk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCAmJiBoYXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkT3B0aW9ucyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdXNpbmcgYSBoYXNoIHNlcmlhbGl6ZXIgYmUgc3VyZSB0byBhZGQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlY3Qgbm90YXRpb24gZm9yIGFuIGFycmF5IGluIHRoZSBtdWx0aS1zZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGV4dC4gSGVyZSB0aGUgbmFtZSBhdHRyaWJ1dGUgb24gdGhlIHNlbGVjdCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIC8vIG1pZ2h0IGJlIG1pc3NpbmcgdGhlIHRyYWlsaW5nIGJyYWNrZXQgcGFpci4gQm90aCBuYW1lc1xuICAgICAgICAgICAgICAgICAgICAvLyBcImZvb1wiIGFuZCBcImZvb1tdXCIgc2hvdWxkIGJlIGFycmF5cy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGFzaCAmJiBrZXkuc2xpY2Uoa2V5Lmxlbmd0aCAtIDIpICE9PSAnW10nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5ICsgJ1tdJywgb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksIG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBpZiBubyBzZWxlY3RlZCBvcHRpb25zIGFuZCBvcHRpb25zLmVtcHR5IGlzIHRydWVcbiAgICAgICAgICAgIGlmICghaXNTZWxlY3RlZE9wdGlvbnMgJiYgb3B0aW9ucy5lbXB0eSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlcmlhbGl6ZXIocmVzdWx0LCBrZXksICcnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBzZXJpYWxpemVyKHJlc3VsdCwga2V5LCB2YWwpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbGwgZW1wdHkgcmFkaW8gYnV0dG9ucyBhbmQgc2VyaWFsaXplIHRoZW0gd2l0aCBrZXk9XCJcIlxuICAgIGlmIChvcHRpb25zLmVtcHR5KSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiByYWRpb19zdG9yZSkge1xuICAgICAgICAgICAgaWYgKCFyYWRpb19zdG9yZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VyaWFsaXplcihyZXN1bHQsIGtleSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyc2Vfa2V5cyhzdHJpbmcpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIHZhciBwcmVmaXggPSAvXihbXlxcW1xcXV0qKS87XG4gICAgdmFyIGNoaWxkcmVuID0gbmV3IFJlZ0V4cChicmFja2V0cyk7XG4gICAgdmFyIG1hdGNoID0gcHJlZml4LmV4ZWMoc3RyaW5nKTtcblxuICAgIGlmIChtYXRjaFsxXSkge1xuICAgICAgICBrZXlzLnB1c2gobWF0Y2hbMV0pO1xuICAgIH1cblxuICAgIHdoaWxlICgobWF0Y2ggPSBjaGlsZHJlbi5leGVjKHN0cmluZykpICE9PSBudWxsKSB7XG4gICAgICAgIGtleXMucHVzaChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGhhc2hfYXNzaWduKHJlc3VsdCwga2V5cywgdmFsdWUpIHtcbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IGtleXMuc2hpZnQoKTtcbiAgICB2YXIgYmV0d2VlbiA9IGtleS5tYXRjaCgvXlxcWyguKz8pXFxdJC8pO1xuXG4gICAgaWYgKGtleSA9PT0gJ1tdJykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgW107XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goaGFzaF9hc3NpZ24obnVsbCwga2V5cywgdmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbWlnaHQgYmUgdGhlIHJlc3VsdCBvZiBiYWQgbmFtZSBhdHRyaWJ1dGVzIGxpa2UgXCJbXVtmb29dXCIsXG4gICAgICAgICAgICAvLyBpbiB0aGlzIGNhc2UgdGhlIG9yaWdpbmFsIGByZXN1bHRgIG9iamVjdCB3aWxsIGFscmVhZHkgYmVcbiAgICAgICAgICAgIC8vIGFzc2lnbmVkIHRvIGFuIG9iamVjdCBsaXRlcmFsLiBSYXRoZXIgdGhhbiBjb2VyY2UgdGhlIG9iamVjdCB0b1xuICAgICAgICAgICAgLy8gYW4gYXJyYXksIG9yIGNhdXNlIGFuIGV4Y2VwdGlvbiB0aGUgYXR0cmlidXRlIFwiX3ZhbHVlc1wiIGlzXG4gICAgICAgICAgICAvLyBhc3NpZ25lZCBhcyBhbiBhcnJheS5cbiAgICAgICAgICAgIHJlc3VsdC5fdmFsdWVzID0gcmVzdWx0Ll92YWx1ZXMgfHwgW107XG4gICAgICAgICAgICByZXN1bHQuX3ZhbHVlcy5wdXNoKGhhc2hfYXNzaWduKG51bGwsIGtleXMsIHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIEtleSBpcyBhbiBhdHRyaWJ1dGUgbmFtZSBhbmQgY2FuIGJlIGFzc2lnbmVkIGRpcmVjdGx5LlxuICAgIGlmICghYmV0d2Vlbikge1xuICAgICAgICByZXN1bHRba2V5XSA9IGhhc2hfYXNzaWduKHJlc3VsdFtrZXldLCBrZXlzLCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgc3RyaW5nID0gYmV0d2VlblsxXTtcbiAgICAgICAgLy8gK3ZhciBjb252ZXJ0cyB0aGUgdmFyaWFibGUgaW50byBhIG51bWJlclxuICAgICAgICAvLyBiZXR0ZXIgdGhhbiBwYXJzZUludCBiZWNhdXNlIGl0IGRvZXNuJ3QgdHJ1bmNhdGUgYXdheSB0cmFpbGluZ1xuICAgICAgICAvLyBsZXR0ZXJzIGFuZCBhY3R1YWxseSBmYWlscyBpZiB3aG9sZSB0aGluZyBpcyBub3QgYSBudW1iZXJcbiAgICAgICAgdmFyIGluZGV4ID0gK3N0cmluZztcblxuICAgICAgICAvLyBJZiB0aGUgY2hhcmFjdGVycyBiZXR3ZWVuIHRoZSBicmFja2V0cyBpcyBub3QgYSBudW1iZXIgaXQgaXMgYW5cbiAgICAgICAgLy8gYXR0cmlidXRlIG5hbWUgYW5kIGNhbiBiZSBhc3NpZ25lZCBkaXJlY3RseS5cbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHt9O1xuICAgICAgICAgICAgcmVzdWx0W3N0cmluZ10gPSBoYXNoX2Fzc2lnbihyZXN1bHRbc3RyaW5nXSwga2V5cywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGhhc2hfYXNzaWduKHJlc3VsdFtpbmRleF0sIGtleXMsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIE9iamVjdC9oYXNoIGVuY29kaW5nIHNlcmlhbGl6ZXIuXG5mdW5jdGlvbiBoYXNoX3NlcmlhbGl6ZXIocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgdmFyIG1hdGNoZXMgPSBrZXkubWF0Y2goYnJhY2tldHMpO1xuXG4gICAgLy8gSGFzIGJyYWNrZXRzPyBVc2UgdGhlIHJlY3Vyc2l2ZSBhc3NpZ25tZW50IGZ1bmN0aW9uIHRvIHdhbGsgdGhlIGtleXMsXG4gICAgLy8gY29uc3RydWN0IGFueSBtaXNzaW5nIG9iamVjdHMgaW4gdGhlIHJlc3VsdCB0cmVlIGFuZCBtYWtlIHRoZSBhc3NpZ25tZW50XG4gICAgLy8gYXQgdGhlIGVuZCBvZiB0aGUgY2hhaW4uXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgdmFyIGtleXMgPSBwYXJzZV9rZXlzKGtleSk7XG4gICAgICAgIGhhc2hfYXNzaWduKHJlc3VsdCwga2V5cywgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gTm9uIGJyYWNrZXQgbm90YXRpb24gY2FuIG1ha2UgYXNzaWdubWVudHMgZGlyZWN0bHkuXG4gICAgICAgIHZhciBleGlzdGluZyA9IHJlc3VsdFtrZXldO1xuXG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBoYXMgYmVlbiBhc3NpZ25lZCBhbHJlYWR5IChmb3IgaW5zdGFuY2Ugd2hlbiBhIHJhZGlvIGFuZFxuICAgICAgICAvLyBhIGNoZWNrYm94IGhhdmUgdGhlIHNhbWUgbmFtZSBhdHRyaWJ1dGUpIGNvbnZlcnQgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgIC8vIGludG8gYW4gYXJyYXkgYmVmb3JlIHB1c2hpbmcgaW50byBpdC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTk9URTogSWYgdGhpcyByZXF1aXJlbWVudCB3ZXJlIHJlbW92ZWQgYWxsIGhhc2ggY3JlYXRpb24gYW5kXG4gICAgICAgIC8vIGFzc2lnbm1lbnQgY291bGQgZ28gdGhyb3VnaCBgaGFzaF9hc3NpZ25gLlxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShleGlzdGluZykpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IFsgZXhpc3RpbmcgXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gdXJsZm9ybSBlbmNvZGluZyBzZXJpYWxpemVyXG5mdW5jdGlvbiBzdHJfc2VyaWFsaXplKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIC8vIGVuY29kZSBuZXdsaW5lcyBhcyBcXHJcXG4gY2F1c2UgdGhlIGh0bWwgc3BlYyBzYXlzIHNvXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC8oXFxyKT9cXG4vZywgJ1xcclxcbicpO1xuICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgIC8vIHNwYWNlcyBzaG91bGQgYmUgJysnIHJhdGhlciB0aGFuICclMjAnLlxuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvJTIwL2csICcrJyk7XG4gICAgcmV0dXJuIHJlc3VsdCArIChyZXN1bHQgPyAnJicgOiAnJykgKyBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlcmlhbGl6ZTtcbiIsIi8qISBqcy1jb29raWUgdjMuMC41IHwgTUlUICovXG47XG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwgPSB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWxUaGlzIDogZ2xvYmFsIHx8IHNlbGYsIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cnJlbnQgPSBnbG9iYWwuQ29va2llcztcbiAgICB2YXIgZXhwb3J0cyA9IGdsb2JhbC5Db29raWVzID0gZmFjdG9yeSgpO1xuICAgIGV4cG9ydHMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHsgZ2xvYmFsLkNvb2tpZXMgPSBjdXJyZW50OyByZXR1cm4gZXhwb3J0czsgfTtcbiAgfSkoKSk7XG59KSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG4gIGZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuICB2YXIgZGVmYXVsdENvbnZlcnRlciA9IHtcbiAgICByZWFkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZVswXSA9PT0gJ1wiJykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEsIC0xKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oJVtcXGRBLUZdezJ9KSsvZ2ksIGRlY29kZVVSSUNvbXBvbmVudClcbiAgICB9LFxuICAgIHdyaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLnJlcGxhY2UoXG4gICAgICAgIC8lKDJbMzQ2QkZdfDNbQUMtRl18NDB8NVtCREVdfDYwfDdbQkNEXSkvZyxcbiAgICAgICAgZGVjb2RlVVJJQ29tcG9uZW50XG4gICAgICApXG4gICAgfVxuICB9O1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuXG4gIGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlciwgZGVmYXVsdEF0dHJpYnV0ZXMpIHtcbiAgICBmdW5jdGlvbiBzZXQgKG5hbWUsIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgYXR0cmlidXRlcyA9IGFzc2lnbih7fSwgZGVmYXVsdEF0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYXR0cmlidXRlcy5leHBpcmVzID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGU1KTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRyaWJ1dGVzLmV4cGlyZXMpIHtcbiAgICAgICAgYXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIG5hbWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSlcbiAgICAgICAgLnJlcGxhY2UoLyUoMlszNDZCXXw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgICAgICAucmVwbGFjZSgvWygpXS9nLCBlc2NhcGUpO1xuXG4gICAgICB2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG4gICAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblxuICAgICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zaWRlcnMgUkZDIDYyNjUgc2VjdGlvbiA1LjI6XG4gICAgICAgIC8vIC4uLlxuICAgICAgICAvLyAzLiAgSWYgdGhlIHJlbWFpbmluZyB1bnBhcnNlZC1hdHRyaWJ1dGVzIGNvbnRhaW5zIGEgJXgzQiAoXCI7XCIpXG4gICAgICAgIC8vICAgICBjaGFyYWN0ZXI6XG4gICAgICAgIC8vIENvbnN1bWUgdGhlIGNoYXJhY3RlcnMgb2YgdGhlIHVucGFyc2VkLWF0dHJpYnV0ZXMgdXAgdG8sXG4gICAgICAgIC8vIG5vdCBpbmNsdWRpbmcsIHRoZSBmaXJzdCAleDNCIChcIjtcIikgY2hhcmFjdGVyLlxuICAgICAgICAvLyAuLi5cbiAgICAgICAgc3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0uc3BsaXQoJzsnKVswXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChkb2N1bWVudC5jb29raWUgPVxuICAgICAgICBuYW1lICsgJz0nICsgY29udmVydGVyLndyaXRlKHZhbHVlLCBuYW1lKSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcylcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXQgKG5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IChhcmd1bWVudHMubGVuZ3RoICYmICFuYW1lKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuICAgICAgLy8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuXG4gICAgICB2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuICAgICAgdmFyIGphciA9IHt9O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGZvdW5kID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKTtcbiAgICAgICAgICBqYXJbZm91bmRdID0gY29udmVydGVyLnJlYWQodmFsdWUsIGZvdW5kKTtcblxuICAgICAgICAgIGlmIChuYW1lID09PSBmb3VuZCkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lID8gamFyW25hbWVdIDogamFyXG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoXG4gICAgICB7XG4gICAgICAgIHNldCxcbiAgICAgICAgZ2V0LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChuYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgc2V0KFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgYXNzaWduKHt9LCBhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICAgIGV4cGlyZXM6IC0xXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgIHdpdGhBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cmlidXRlcykge1xuICAgICAgICAgIHJldHVybiBpbml0KHRoaXMuY29udmVydGVyLCBhc3NpZ24oe30sIHRoaXMuYXR0cmlidXRlcywgYXR0cmlidXRlcykpXG4gICAgICAgIH0sXG4gICAgICAgIHdpdGhDb252ZXJ0ZXI6IGZ1bmN0aW9uIChjb252ZXJ0ZXIpIHtcbiAgICAgICAgICByZXR1cm4gaW5pdChhc3NpZ24oe30sIHRoaXMuY29udmVydGVyLCBjb252ZXJ0ZXIpLCB0aGlzLmF0dHJpYnV0ZXMpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHsgdmFsdWU6IE9iamVjdC5mcmVlemUoZGVmYXVsdEF0dHJpYnV0ZXMpIH0sXG4gICAgICAgIGNvbnZlcnRlcjogeyB2YWx1ZTogT2JqZWN0LmZyZWV6ZShjb252ZXJ0ZXIpIH1cbiAgICAgIH1cbiAgICApXG4gIH1cblxuICB2YXIgYXBpID0gaW5pdChkZWZhdWx0Q29udmVydGVyLCB7IHBhdGg6ICcvJyB9KTtcbiAgLyogZXNsaW50LWVuYWJsZSBuby12YXIgKi9cblxuICByZXR1cm4gYXBpO1xuXG59KSk7XG4iLCIvKiFcbiAqIG5hbWVkLXdlYi1jb2xvcnMgdjEuNC4yXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRmcS9uYW1lZC13ZWItY29sb3JzXG4gKi9cbi8qXG4gKiBBVFRFTlRJT046IFRoZSBcImV2YWxcIiBkZXZ0b29sIGhhcyBiZWVuIHVzZWQgKG1heWJlIGJ5IGRlZmF1bHQgaW4gbW9kZTogXCJkZXZlbG9wbWVudFwiKS5cbiAqIFRoaXMgZGV2dG9vbCBpcyBuZWl0aGVyIG1hZGUgZm9yIHByb2R1Y3Rpb24gbm9yIGZvciByZWFkYWJsZSBvdXRwdXQgZmlsZXMuXG4gKiBJdCB1c2VzIFwiZXZhbCgpXCIgY2FsbHMgdG8gY3JlYXRlIGEgc2VwYXJhdGUgc291cmNlIGZpbGUgaW4gdGhlIGJyb3dzZXIgZGV2dG9vbHMuXG4gKiBJZiB5b3UgYXJlIHRyeWluZyB0byByZWFkIHRoZSBvdXRwdXQgZmlsZSwgc2VsZWN0IGEgZGlmZmVyZW50IGRldnRvb2wgKGh0dHBzOi8vd2VicGFjay5qcy5vcmcvY29uZmlndXJhdGlvbi9kZXZ0b29sLylcbiAqIG9yIGRpc2FibGUgdGhlIGRlZmF1bHQgZGV2dG9vbCB3aXRoIFwiZGV2dG9vbDogZmFsc2VcIi5cbiAqIElmIHlvdSBhcmUgbG9va2luZyBmb3IgcHJvZHVjdGlvbi1yZWFkeSBvdXRwdXQgZmlsZXMsIHNlZSBtb2RlOiBcInByb2R1Y3Rpb25cIiAoaHR0cHM6Ly93ZWJwYWNrLmpzLm9yZy9jb25maWd1cmF0aW9uL21vZGUvKS5cbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJnZXRDb2xvck5hbWVcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiZ2V0Q29sb3JOYW1lXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImdldENvbG9yTmFtZVwiXSA9IGZhY3RvcnkoKTtcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzLCAoKSA9PiB7XG5yZXR1cm4gLyoqKioqKi8gKCgpID0+IHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZXNfXyA9ICh7XG5cbi8qKiovIFwiLi9zcmMvaW5kZXguanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9zcmMvaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKiovXG4vKioqLyAoKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSA9PiB7XG5cblwidXNlIHN0cmljdFwiO1xuZXZhbChcIl9fd2VicGFja19yZXF1aXJlX18ucihfX3dlYnBhY2tfZXhwb3J0c19fKTtcXG4vKiBoYXJtb255IGV4cG9ydCAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywge1xcbi8qIGhhcm1vbnkgZXhwb3J0ICovICAgXFxcImRlZmF1bHRcXFwiOiAoKSA9PiAoLyogYmluZGluZyAqLyBnZXRDb2xvck5hbWUpXFxuLyogaGFybW9ueSBleHBvcnQgKi8gfSk7XFxuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIGNvbG9yX3N0cmluZ19fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgY29sb3Itc3RyaW5nICovIFxcXCIuL25vZGVfbW9kdWxlcy9jb2xvci1zdHJpbmcvaW5kZXguanNcXFwiKTtcXG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4oY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX18pO1xcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfZGF0YV9jdXJhdGVkX2pzb25fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfXyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4uL2RhdGEvY3VyYXRlZC5qc29uICovIFxcXCIuL2RhdGEvY3VyYXRlZC5qc29uXFxcIik7XFxuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9kYXRhX3dlYl9qc29uX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuLi9kYXRhL3dlYi5qc29uICovIFxcXCIuL2RhdGEvd2ViLmpzb25cXFwiKTtcXG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX2RhdGFfd2VybmVyX2pzb25fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4uL2RhdGEvd2VybmVyLmpzb24gKi8gXFxcIi4vZGF0YS93ZXJuZXIuanNvblxcXCIpO1xcblxcblxcblxcblxcbnZhciBXSElURSA9IGNvbG9yX3N0cmluZ19fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fX2RlZmF1bHQoKS5nZXQoJyNmZmYnKTtcXG52YXIgQkxBQ0sgPSBjb2xvcl9zdHJpbmdfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX19kZWZhdWx0KCkuZ2V0KCcjMDAwJyk7XFxuLyoqXFxuICogRGVzY3JpYmVzIGEgbWF0Y2hlZCBjb2xvci5cXG4gKlxcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbG9yT3V0cHV0XFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWF0Y2hlZCBjb2xvciwgZS5nLiwgJ3JlZCdcXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaGV4IC0gSGV4IGNvbG9yIGNvZGUgZS5nLiwgJyNGRjAnXFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJnYiAtIFJHQiBkZWZpbml0aW9uIChvciBSR0JBIGZvciBjb2xvcnMgd2l0aCBhbHBoYSBjaGFubmVsKS5cXG4gKiBAcHJvcGVydHkge3N0cmluZ30gY3NzIC0gQ1NTIGN1c3RvbSBwcm9wZXJ0eSBhbGlrZSBkZWZpbml0aW9uLCBlLmcuXFxuICogIGAtLWNvbG9yLXBydXNzaWFuLWJsdWU6ICMwMDQxNjJgXFxuICogQHByb3BlcnR5IHtudW1iZXJ9IGRpc3RhbmNlIC0gQ2FsY3VsYXRlZCBkaXN0YW5jZSBiZXR3ZWVuIGlucHV0IGFuZCBtYXRjaGVkIGNvbG9yLlxcbiAqL1xcblxcbi8qKlxcbiAqIFNxdWFyZSByb290IG9mIHN1bSBvZiB0aGUgc3F1YXJlcyBvZiB0aGUgZGlmZmVyZW5jZXMgaW4gdmFsdWVzXFxuICogW3JlZCwgZ3JlZW4sIGJsdWUsIG9wYWNpdHldXFxuICpcXG4gKiBAcGFyYW0ge0FycmF5fSBjb2xvcjFcXG4gKiBAcGFyYW0ge0FycmF5fSBjb2xvcjJcXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XFxuICovXFxuXFxudmFyIGV1Y2xpZGVhbkRpc3RhbmNlID0gZnVuY3Rpb24gZXVjbGlkZWFuRGlzdGFuY2UoY29sb3IxLCBjb2xvcjIpIHtcXG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coY29sb3IxWzBdIC0gY29sb3IyWzBdLCAyKSArIE1hdGgucG93KGNvbG9yMVsxXSAtIGNvbG9yMlsxXSwgMikgKyBNYXRoLnBvdyhjb2xvcjFbMl0gLSBjb2xvcjJbMl0sIDIpKTtcXG59O1xcblxcbnZhciBNQVhfRElTVEFOQ0UgPSBldWNsaWRlYW5EaXN0YW5jZShXSElURS52YWx1ZSwgQkxBQ0sudmFsdWUpO1xcbi8qKlxcbiAqIENvbWJpbmVzIGZvcmVncm91bmQgYW5kIGJhY2tncm91bmQgY29sb3JzLlxcbiAqIHJlZjogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJhbnNwYXJlbmN5XyUyOGdyYXBoaWMlMjlcXG4gKlxcbiAqIEBwYXJhbSB7QXJyYXl9IGZvcmVncm91bmQgLSBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGFdXFxuICogQHBhcmFtIHtBcnJheX0gYmFja2dyb3VuZCAtIFtyZWQsIGdyZWVuLCBibHVlLCBhbHBoYV1cXG4gKiBAcmV0dXJuIHtBcnJheX0gLSBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGE9MV1cXG4gKi9cXG5cXG52YXIgYmxlbmQgPSBmdW5jdGlvbiBibGVuZChmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKSB7XFxuICB2YXIgb3BhY2l0eSA9IGZvcmVncm91bmRbM107XFxuICByZXR1cm4gWygxIC0gb3BhY2l0eSkgKiBiYWNrZ3JvdW5kWzBdICsgb3BhY2l0eSAqIGZvcmVncm91bmRbMF0sICgxIC0gb3BhY2l0eSkgKiBiYWNrZ3JvdW5kWzFdICsgb3BhY2l0eSAqIGZvcmVncm91bmRbMV0sICgxIC0gb3BhY2l0eSkgKiBiYWNrZ3JvdW5kWzJdICsgb3BhY2l0eSAqIGZvcmVncm91bmRbMl0sIDFdO1xcbn07XFxuLyoqXFxuICogQ2FsY3VsYXRlcyBjb2xvciBkaXN0YW5jZSBiYXNlZCBvbiB3aGV0aGVyIGZpcnN0IHBhcmFtIGNvbG9yIGlucHV0IGhhc1xcbiAqIGFscGhhIGNoYW5uZWwgb3Igbm90LlxcbiAqXFxuICogQHBhcmFtIHtBcnJheX0gY29sb3IxXFxuICogQHBhcmFtIHtBcnJheX0gY29sb3IyXFxuICogQHJldHVybiB7bnVtYmVyfVxcbiAqL1xcblxcblxcbnZhciBjb21wYXJhdGl2ZURpc3RhbmNlID0gZnVuY3Rpb24gY29tcGFyYXRpdmVEaXN0YW5jZShjb2xvcjEsIGNvbG9yMikge1xcbiAgaWYgKGNvbG9yMVszXSA9PT0gMSAmJiBjb2xvcjJbM10gPT09IDEpIHtcXG4gICAgLy8gc29saWQgY29sb3JzOiB1c2UgYmFzaWMgRXVjbGlkZWFuIGRpc3RhbmNlIGFsZ29yaXRobVxcbiAgICByZXR1cm4gZXVjbGlkZWFuRGlzdGFuY2UoY29sb3IxLCBjb2xvcjIpO1xcbiAgfSBlbHNlIHtcXG4gICAgLy8gYWxwaGEgY2hhbm5lbDogY29tYmluZSBpbnB1dCBjb2xvciB3aXRoIHdoaXRlIGFuZCBibGFjayBiYWNrZ3JvdW5kc1xcbiAgICAvLyBhbmQgY29tcGFydGUgZGlzdGFuY2VzXFxuICAgIHZhciB3aXRoV2hpdGUgPSBldWNsaWRlYW5EaXN0YW5jZShibGVuZChjb2xvcjEsIFdISVRFLnZhbHVlKSwgY29sb3IyKTtcXG4gICAgdmFyIHdpdGhCbGFjayA9IGV1Y2xpZGVhbkRpc3RhbmNlKGJsZW5kKGNvbG9yMSwgQkxBQ0sudmFsdWUpLCBjb2xvcjIpO1xcbiAgICByZXR1cm4gd2l0aFdoaXRlIDw9IHdpdGhCbGFjayA/IHdpdGhXaGl0ZSA6IHdpdGhCbGFjaztcXG4gIH1cXG59O1xcbi8qKlxcbiAqIFRyYW5zZm9ybSBjb2xvciBuYW1lIHRvIHdlYi1zYWZlIHNsdWcuXFxuICpcXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXFxuICogQHJldHVybiB7c3RyaW5nfVxcbiAqL1xcblxcblxcbnZhciBzbHVnaWZ5ID0gZnVuY3Rpb24gc2x1Z2lmeSgpIHtcXG4gIHZhciBzdHJpbmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xcbiAgdmFyIHNlcGFyYXRvciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJy0nO1xcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoJycpLnJlZHVjZShmdW5jdGlvbiAobWVtbywgY2hhcikge1xcbiAgICByZXR1cm4gbWVtbyArIGNoYXIucmVwbGFjZSgvJy8sICcnKS5yZXBsYWNlKC9cXFxccy8sIHNlcGFyYXRvcik7XFxuICB9LCAnJykudG9Mb2NhbGVMb3dlckNhc2UoKTtcXG59O1xcbi8qKlxcbiAqIFNpbXBsZSBSR0IgY29tcGFyYXRpb24gbWV0aG9kLlxcbiAqXFxuICogQHBhcmFtIHtBcnJheX0gY29sb3IxXFxuICogQHBhcmFtIHtBcnJheX0gY29sb3IyXFxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVBbHBoYUNoYW5uZWxcXG4gKi9cXG5cXG5cXG52YXIgY29tcGFyZVJHQiA9IGZ1bmN0aW9uIGNvbXBhcmVSR0IoY29sb3IxLCBjb2xvcjIpIHtcXG4gIHZhciBpZ25vcmVBbHBoYUNoYW5uZWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xcbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xcblxcbiAgaWYgKGNvbG9yMS5sZW5ndGggPT09IDQgJiYgY29sb3IyLmxlbmd0aCA9PT0gNCkge1xcbiAgICByZXN1bHQgPSBjb2xvcjFbMF0gPT09IGNvbG9yMlswXSAmJiBjb2xvcjFbMV0gPT09IGNvbG9yMlsxXSAmJiBjb2xvcjFbMl0gPT09IGNvbG9yMlsyXTtcXG4gICAgcmVzdWx0ID0gaWdub3JlQWxwaGFDaGFubmVsID8gcmVzdWx0IDogY29sb3IxWzNdID09PSBjb2xvcjJbM107XFxuICB9XFxuXFxuICByZXR1cm4gcmVzdWx0O1xcbn07XFxuLyoqXFxuICogQnVpbGQgb3V0cHV0IGNvbG9yIG9iamVjdCBzcGVjLlxcbiAqXFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSByZXNvbHZlZCBjb2xvciBuYW1lXFxuICogQHBhcmFtIHtzdHJpbmd9IGhleCAtIEhleCBjb2xvciBjb2RlXFxuICogQHBhcmFtIHtPYmplY3R9IGNvbG9ySW5wdXRcXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2VcXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZUFscGhhQ2hhbm5lbFxcbiAqIEByZXR1cm4ge0NvbG9yT3V0cHV0fVxcbiAqL1xcblxcblxcbnZhciBidWlsZENvbG9yT3V0cHV0ID0gZnVuY3Rpb24gYnVpbGRDb2xvck91dHB1dChuYW1lLCBoZXgsIGNvbG9ySW5wdXQsIGRpc3RhbmNlLCBpZ25vcmVBbHBoYUNoYW5uZWwpIHtcXG4gIHZhciBhbHBoYSA9IE51bWJlcihjb2xvcklucHV0LnZhbHVlWzNdKS50b0ZpeGVkKDIpO1xcbiAgdmFyIHNsdWcgPSBzbHVnaWZ5KG5hbWUpO1xcbiAgdmFyIHJlc3VsdCA9IHtcXG4gICAgbmFtZTogbmFtZSxcXG4gICAgZGlzdGFuY2U6IGRpc3RhbmNlXFxuICB9O1xcblxcbiAgaWYgKGlnbm9yZUFscGhhQ2hhbm5lbCkge1xcbiAgICByZXN1bHQuaGV4ID0gXFxcIiNcXFwiLmNvbmNhdChoZXgpO1xcbiAgICByZXN1bHQuY3NzID0gXFxcIi0tY29sb3ItXFxcIi5jb25jYXQoc2x1ZywgXFxcIjogXFxcIikuY29uY2F0KHJlc3VsdC5oZXgpO1xcbiAgfSBlbHNlIHtcXG4gICAgLy8gdXNlIEhFWCBjb2RlIGZyb20gaW5wdXQgZGlyZWN0bHkgYXMgbm9uZSBvZiB0aGUgY3VyYXRlZCBjb2xvcnMgaGF2ZVxcbiAgICAvLyBhbHBoYSBjaGFubmVsIGRlZmluZWQ7IHRlc3RcXG4gICAgcmVzdWx0LmhleCA9IGNvbG9yX3N0cmluZ19fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fX2RlZmF1bHQoKS50by5oZXgoY29sb3JJbnB1dC52YWx1ZSk7IC8vIG5vcm1hbGl6ZSBhbHBoYSBzdWZmaXhcXG5cXG4gICAgdmFyIGFscGhhU3VmZml4ID0gJyc7XFxuXFxuICAgIGlmIChhbHBoYSA+IDAgJiYgYWxwaGEgPCAxKSB7XFxuICAgICAgYWxwaGFTdWZmaXggPSBcXFwiLVxcXCIuY29uY2F0KE1hdGgucm91bmQoYWxwaGEgKiAxMDApKTtcXG4gICAgfVxcblxcbiAgICByZXN1bHQuY3NzID0gXFxcIi0tY29sb3ItXFxcIi5jb25jYXQoc2x1ZykuY29uY2F0KGFscGhhU3VmZml4LCBcXFwiOiBcXFwiKS5jb25jYXQocmVzdWx0LmhleCk7XFxuICB9IC8vIGRvdWJsZSBjaGVjayBmaW5hbCByZXN1bHQ7IGBjb2xvci1zdHJpbmdgIGRvbid0IHN1cHBvcnQgSFNMIGlucHV0XFxuICAvLyB0cmFuc2Zvcm1zIHRvIEhFWCAod2hlbiBpbnB1dCBjb250YWlucyBkZWNpbWFscywgQHNlZSB0ZXN0cyksXFxuICAvLyBzbyBgcmVzdWx0LmhleGAgbWF5IG5vdCBiZSB2YWxpZCBhdCB0aGlzIHBvaW50XFxuXFxuXFxuICBpZiAoY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19fZGVmYXVsdCgpLmdldChyZXN1bHQuaGV4KSAhPT0gbnVsbCkge1xcbiAgICB2YXIgcmdiID0gY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19fZGVmYXVsdCgpLmdldChyZXN1bHQuaGV4KS52YWx1ZTsgLy8gcm91bmQgYWxwaGEgdmFsdWVcXG5cXG4gICAgdmFyIHJnYkFscGhhID0gTnVtYmVyLnBhcnNlRmxvYXQoTnVtYmVyKHJnYlszXSkudG9GaXhlZCgyKSk7XFxuICAgIHJlc3VsdC5yZ2IgPSBjb2xvcl9zdHJpbmdfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX19kZWZhdWx0KCkudG8ucmdiKFtyZ2JbMF0sIHJnYlsxXSwgcmdiWzJdLCByZ2JBbHBoYV0pO1xcbiAgfSBlbHNlIHtcXG4gICAgcmVzdWx0ID0gdW5kZWZpbmVkO1xcbiAgfVxcblxcbiAgcmV0dXJuIHJlc3VsdDtcXG59O1xcbi8qKlxcbiAqIE1haW4gZnVuY3Rpb24gdG8gZmluZCB0aGUgY2xvc2VzdCBjb2xvciBhbW9uZyBcXFwiY29sb3JzXFxcIiBsaXN0LlxcbiAqXFxuICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgLSBjb2xvciBjb2RlOiBIZXgsIFJHQiBvciBIU0xcXG4gKiBAcGFyYW0ge09iamVjdH0gY29sb3JzIC0gY29sb3IgbGlzdDoga2V5cyBhcmUgSGV4IGNvZGVzIGFuZCB2YWx1ZXMgYXJlIGNvbG9yIG5hbWVzXFxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVBbHBoYUNoYW5uZWwgLSB3aGV0aGVyIHRvIGlnbm9yZSBhbHBoYSBjaGFubmVsIG9uIGlucHV0XFxuICovXFxuXFxuXFxudmFyIGdldENvbG9yID0gZnVuY3Rpb24gZ2V0Q29sb3IoY29kZSwgY29sb3JzKSB7XFxuICB2YXIgaWdub3JlQWxwaGFDaGFubmVsID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcXG4gIHZhciBjb2xvcklucHV0ID0gY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19fZGVmYXVsdCgpLmdldChjb2RlKTtcXG4gIHZhciBjb2xvcktleXMgPSBPYmplY3Qua2V5cyhjb2xvcnMpO1xcbiAgdmFyIGNvbG9yS2V5TWF0Y2g7XFxuICB2YXIgZGlzdGFuY2UgPSBNQVhfRElTVEFOQ0U7XFxuICB2YXIgcmVzdWx0O1xcblxcbiAgaWYgKGNvbG9ySW5wdXQgIT09IG51bGwpIHtcXG4gICAgLy8gY2hlY2sgaWYgdGhlcmUncyBhbiBleGFjdCBtYXRjaCAoaXQgb25seSBoYXBwZW5zIHdpdGggc29saWQgY29sb3JzKVxcbiAgICBpZiAoIWlnbm9yZUFscGhhQ2hhbm5lbCkge1xcbiAgICAgIGNvbG9yS2V5TWF0Y2ggPSBjb2xvcktleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XFxuICAgICAgICB2YXIgY29sb3IgPSBjb2xvcl9zdHJpbmdfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX19kZWZhdWx0KCkuZ2V0KFxcXCIjXFxcIi5jb25jYXQoa2V5KSk7XFxuICAgICAgICByZXR1cm4gY29tcGFyZVJHQihjb2xvci52YWx1ZSwgY29sb3JJbnB1dC52YWx1ZSwgdHJ1ZSk7XFxuICAgICAgfSk7XFxuICAgIH1cXG5cXG4gICAgaWYgKGNvbG9yS2V5TWF0Y2ggIT09IHVuZGVmaW5lZCkge1xcbiAgICAgIGRpc3RhbmNlID0gMDtcXG4gICAgfVxcblxcbiAgICBpZiAoZGlzdGFuY2UgPiAwKSB7XFxuICAgICAgLy8gbGV0J3MgZmluZCB0aGUgY2xvc2VzdCBvbmVcXG4gICAgICB2YXIgY2FsY3VsYXRlRGlzdGFuY2UgPSBpZ25vcmVBbHBoYUNoYW5uZWwgPyBjb21wYXJhdGl2ZURpc3RhbmNlIDogZXVjbGlkZWFuRGlzdGFuY2U7XFxuICAgICAgY29sb3JLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xcbiAgICAgICAgdmFyIGNvbG9yQ2FuZGlkYXRlID0gY29sb3Jfc3RyaW5nX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19fZGVmYXVsdCgpLmdldChcXFwiI1xcXCIuY29uY2F0KGtleSkpO1xcbiAgICAgICAgdmFyIHRtcERpc3RhbmNlID0gY2FsY3VsYXRlRGlzdGFuY2UoY29sb3JJbnB1dC52YWx1ZSwgY29sb3JDYW5kaWRhdGUudmFsdWUpO1xcblxcbiAgICAgICAgaWYgKHRtcERpc3RhbmNlIDwgZGlzdGFuY2UpIHtcXG4gICAgICAgICAgY29sb3JLZXlNYXRjaCA9IGtleTtcXG4gICAgICAgICAgZGlzdGFuY2UgPSB0bXBEaXN0YW5jZTtcXG4gICAgICAgIH1cXG4gICAgICB9KTtcXG4gICAgfVxcbiAgfVxcblxcbiAgaWYgKGNvbG9yS2V5TWF0Y2ggIT09IHVuZGVmaW5lZCkge1xcbiAgICByZXN1bHQgPSBidWlsZENvbG9yT3V0cHV0KGNvbG9yc1tjb2xvcktleU1hdGNoXSwgY29sb3JLZXlNYXRjaCwgY29sb3JJbnB1dCwgZGlzdGFuY2UsIGlnbm9yZUFscGhhQ2hhbm5lbCk7XFxuICB9XFxuXFxuICByZXR1cm4gcmVzdWx0O1xcbn07XFxuXFxuZnVuY3Rpb24gZ2V0Q29sb3JOYW1lKGNvZGUpIHtcXG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcXG4gIHZhciBjb2xvcnMgPSBPYmplY3QuYXNzaWduKHt9LCBfZGF0YV93ZWJfanNvbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fLCBfZGF0YV9jdXJhdGVkX2pzb25fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfXyk7XFxuXFxuICBpZiAob3B0aW9ucy5saXN0ICYmIG9wdGlvbnMubGlzdCA9PT0gJ3dlYicpIHtcXG4gICAgY29sb3JzID0gX2RhdGFfd2ViX2pzb25fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfXztcXG4gIH0gZWxzZSBpZiAob3B0aW9ucy5saXN0ICYmIG9wdGlvbnMubGlzdCA9PT0gJ3dlcm5lcicpIHtcXG4gICAgY29sb3JzID0gX2RhdGFfd2VybmVyX2pzb25fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfXztcXG4gIH1cXG5cXG4gIHJldHVybiBnZXRDb2xvcihjb2RlLCBjb2xvcnMsIG9wdGlvbnMuaWdub3JlQWxwaGFDaGFubmVsKTtcXG59XFxuXFxuLy8jIHNvdXJjZVVSTD13ZWJwYWNrOi8vZ2V0Q29sb3JOYW1lLy4vc3JjL2luZGV4LmpzP1wiKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvbG9yLW5hbWUvaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKiovICgobW9kdWxlKSA9PiB7XG5cblwidXNlIHN0cmljdFwiO1xuZXZhbChcIlxcclxcblxcclxcbm1vZHVsZS5leHBvcnRzID0ge1xcclxcblxcdFxcXCJhbGljZWJsdWVcXFwiOiBbMjQwLCAyNDgsIDI1NV0sXFxyXFxuXFx0XFxcImFudGlxdWV3aGl0ZVxcXCI6IFsyNTAsIDIzNSwgMjE1XSxcXHJcXG5cXHRcXFwiYXF1YVxcXCI6IFswLCAyNTUsIDI1NV0sXFxyXFxuXFx0XFxcImFxdWFtYXJpbmVcXFwiOiBbMTI3LCAyNTUsIDIxMl0sXFxyXFxuXFx0XFxcImF6dXJlXFxcIjogWzI0MCwgMjU1LCAyNTVdLFxcclxcblxcdFxcXCJiZWlnZVxcXCI6IFsyNDUsIDI0NSwgMjIwXSxcXHJcXG5cXHRcXFwiYmlzcXVlXFxcIjogWzI1NSwgMjI4LCAxOTZdLFxcclxcblxcdFxcXCJibGFja1xcXCI6IFswLCAwLCAwXSxcXHJcXG5cXHRcXFwiYmxhbmNoZWRhbG1vbmRcXFwiOiBbMjU1LCAyMzUsIDIwNV0sXFxyXFxuXFx0XFxcImJsdWVcXFwiOiBbMCwgMCwgMjU1XSxcXHJcXG5cXHRcXFwiYmx1ZXZpb2xldFxcXCI6IFsxMzgsIDQzLCAyMjZdLFxcclxcblxcdFxcXCJicm93blxcXCI6IFsxNjUsIDQyLCA0Ml0sXFxyXFxuXFx0XFxcImJ1cmx5d29vZFxcXCI6IFsyMjIsIDE4NCwgMTM1XSxcXHJcXG5cXHRcXFwiY2FkZXRibHVlXFxcIjogWzk1LCAxNTgsIDE2MF0sXFxyXFxuXFx0XFxcImNoYXJ0cmV1c2VcXFwiOiBbMTI3LCAyNTUsIDBdLFxcclxcblxcdFxcXCJjaG9jb2xhdGVcXFwiOiBbMjEwLCAxMDUsIDMwXSxcXHJcXG5cXHRcXFwiY29yYWxcXFwiOiBbMjU1LCAxMjcsIDgwXSxcXHJcXG5cXHRcXFwiY29ybmZsb3dlcmJsdWVcXFwiOiBbMTAwLCAxNDksIDIzN10sXFxyXFxuXFx0XFxcImNvcm5zaWxrXFxcIjogWzI1NSwgMjQ4LCAyMjBdLFxcclxcblxcdFxcXCJjcmltc29uXFxcIjogWzIyMCwgMjAsIDYwXSxcXHJcXG5cXHRcXFwiY3lhblxcXCI6IFswLCAyNTUsIDI1NV0sXFxyXFxuXFx0XFxcImRhcmtibHVlXFxcIjogWzAsIDAsIDEzOV0sXFxyXFxuXFx0XFxcImRhcmtjeWFuXFxcIjogWzAsIDEzOSwgMTM5XSxcXHJcXG5cXHRcXFwiZGFya2dvbGRlbnJvZFxcXCI6IFsxODQsIDEzNCwgMTFdLFxcclxcblxcdFxcXCJkYXJrZ3JheVxcXCI6IFsxNjksIDE2OSwgMTY5XSxcXHJcXG5cXHRcXFwiZGFya2dyZWVuXFxcIjogWzAsIDEwMCwgMF0sXFxyXFxuXFx0XFxcImRhcmtncmV5XFxcIjogWzE2OSwgMTY5LCAxNjldLFxcclxcblxcdFxcXCJkYXJra2hha2lcXFwiOiBbMTg5LCAxODMsIDEwN10sXFxyXFxuXFx0XFxcImRhcmttYWdlbnRhXFxcIjogWzEzOSwgMCwgMTM5XSxcXHJcXG5cXHRcXFwiZGFya29saXZlZ3JlZW5cXFwiOiBbODUsIDEwNywgNDddLFxcclxcblxcdFxcXCJkYXJrb3JhbmdlXFxcIjogWzI1NSwgMTQwLCAwXSxcXHJcXG5cXHRcXFwiZGFya29yY2hpZFxcXCI6IFsxNTMsIDUwLCAyMDRdLFxcclxcblxcdFxcXCJkYXJrcmVkXFxcIjogWzEzOSwgMCwgMF0sXFxyXFxuXFx0XFxcImRhcmtzYWxtb25cXFwiOiBbMjMzLCAxNTAsIDEyMl0sXFxyXFxuXFx0XFxcImRhcmtzZWFncmVlblxcXCI6IFsxNDMsIDE4OCwgMTQzXSxcXHJcXG5cXHRcXFwiZGFya3NsYXRlYmx1ZVxcXCI6IFs3MiwgNjEsIDEzOV0sXFxyXFxuXFx0XFxcImRhcmtzbGF0ZWdyYXlcXFwiOiBbNDcsIDc5LCA3OV0sXFxyXFxuXFx0XFxcImRhcmtzbGF0ZWdyZXlcXFwiOiBbNDcsIDc5LCA3OV0sXFxyXFxuXFx0XFxcImRhcmt0dXJxdW9pc2VcXFwiOiBbMCwgMjA2LCAyMDldLFxcclxcblxcdFxcXCJkYXJrdmlvbGV0XFxcIjogWzE0OCwgMCwgMjExXSxcXHJcXG5cXHRcXFwiZGVlcHBpbmtcXFwiOiBbMjU1LCAyMCwgMTQ3XSxcXHJcXG5cXHRcXFwiZGVlcHNreWJsdWVcXFwiOiBbMCwgMTkxLCAyNTVdLFxcclxcblxcdFxcXCJkaW1ncmF5XFxcIjogWzEwNSwgMTA1LCAxMDVdLFxcclxcblxcdFxcXCJkaW1ncmV5XFxcIjogWzEwNSwgMTA1LCAxMDVdLFxcclxcblxcdFxcXCJkb2RnZXJibHVlXFxcIjogWzMwLCAxNDQsIDI1NV0sXFxyXFxuXFx0XFxcImZpcmVicmlja1xcXCI6IFsxNzgsIDM0LCAzNF0sXFxyXFxuXFx0XFxcImZsb3JhbHdoaXRlXFxcIjogWzI1NSwgMjUwLCAyNDBdLFxcclxcblxcdFxcXCJmb3Jlc3RncmVlblxcXCI6IFszNCwgMTM5LCAzNF0sXFxyXFxuXFx0XFxcImZ1Y2hzaWFcXFwiOiBbMjU1LCAwLCAyNTVdLFxcclxcblxcdFxcXCJnYWluc2Jvcm9cXFwiOiBbMjIwLCAyMjAsIDIyMF0sXFxyXFxuXFx0XFxcImdob3N0d2hpdGVcXFwiOiBbMjQ4LCAyNDgsIDI1NV0sXFxyXFxuXFx0XFxcImdvbGRcXFwiOiBbMjU1LCAyMTUsIDBdLFxcclxcblxcdFxcXCJnb2xkZW5yb2RcXFwiOiBbMjE4LCAxNjUsIDMyXSxcXHJcXG5cXHRcXFwiZ3JheVxcXCI6IFsxMjgsIDEyOCwgMTI4XSxcXHJcXG5cXHRcXFwiZ3JlZW5cXFwiOiBbMCwgMTI4LCAwXSxcXHJcXG5cXHRcXFwiZ3JlZW55ZWxsb3dcXFwiOiBbMTczLCAyNTUsIDQ3XSxcXHJcXG5cXHRcXFwiZ3JleVxcXCI6IFsxMjgsIDEyOCwgMTI4XSxcXHJcXG5cXHRcXFwiaG9uZXlkZXdcXFwiOiBbMjQwLCAyNTUsIDI0MF0sXFxyXFxuXFx0XFxcImhvdHBpbmtcXFwiOiBbMjU1LCAxMDUsIDE4MF0sXFxyXFxuXFx0XFxcImluZGlhbnJlZFxcXCI6IFsyMDUsIDkyLCA5Ml0sXFxyXFxuXFx0XFxcImluZGlnb1xcXCI6IFs3NSwgMCwgMTMwXSxcXHJcXG5cXHRcXFwiaXZvcnlcXFwiOiBbMjU1LCAyNTUsIDI0MF0sXFxyXFxuXFx0XFxcImtoYWtpXFxcIjogWzI0MCwgMjMwLCAxNDBdLFxcclxcblxcdFxcXCJsYXZlbmRlclxcXCI6IFsyMzAsIDIzMCwgMjUwXSxcXHJcXG5cXHRcXFwibGF2ZW5kZXJibHVzaFxcXCI6IFsyNTUsIDI0MCwgMjQ1XSxcXHJcXG5cXHRcXFwibGF3bmdyZWVuXFxcIjogWzEyNCwgMjUyLCAwXSxcXHJcXG5cXHRcXFwibGVtb25jaGlmZm9uXFxcIjogWzI1NSwgMjUwLCAyMDVdLFxcclxcblxcdFxcXCJsaWdodGJsdWVcXFwiOiBbMTczLCAyMTYsIDIzMF0sXFxyXFxuXFx0XFxcImxpZ2h0Y29yYWxcXFwiOiBbMjQwLCAxMjgsIDEyOF0sXFxyXFxuXFx0XFxcImxpZ2h0Y3lhblxcXCI6IFsyMjQsIDI1NSwgMjU1XSxcXHJcXG5cXHRcXFwibGlnaHRnb2xkZW5yb2R5ZWxsb3dcXFwiOiBbMjUwLCAyNTAsIDIxMF0sXFxyXFxuXFx0XFxcImxpZ2h0Z3JheVxcXCI6IFsyMTEsIDIxMSwgMjExXSxcXHJcXG5cXHRcXFwibGlnaHRncmVlblxcXCI6IFsxNDQsIDIzOCwgMTQ0XSxcXHJcXG5cXHRcXFwibGlnaHRncmV5XFxcIjogWzIxMSwgMjExLCAyMTFdLFxcclxcblxcdFxcXCJsaWdodHBpbmtcXFwiOiBbMjU1LCAxODIsIDE5M10sXFxyXFxuXFx0XFxcImxpZ2h0c2FsbW9uXFxcIjogWzI1NSwgMTYwLCAxMjJdLFxcclxcblxcdFxcXCJsaWdodHNlYWdyZWVuXFxcIjogWzMyLCAxNzgsIDE3MF0sXFxyXFxuXFx0XFxcImxpZ2h0c2t5Ymx1ZVxcXCI6IFsxMzUsIDIwNiwgMjUwXSxcXHJcXG5cXHRcXFwibGlnaHRzbGF0ZWdyYXlcXFwiOiBbMTE5LCAxMzYsIDE1M10sXFxyXFxuXFx0XFxcImxpZ2h0c2xhdGVncmV5XFxcIjogWzExOSwgMTM2LCAxNTNdLFxcclxcblxcdFxcXCJsaWdodHN0ZWVsYmx1ZVxcXCI6IFsxNzYsIDE5NiwgMjIyXSxcXHJcXG5cXHRcXFwibGlnaHR5ZWxsb3dcXFwiOiBbMjU1LCAyNTUsIDIyNF0sXFxyXFxuXFx0XFxcImxpbWVcXFwiOiBbMCwgMjU1LCAwXSxcXHJcXG5cXHRcXFwibGltZWdyZWVuXFxcIjogWzUwLCAyMDUsIDUwXSxcXHJcXG5cXHRcXFwibGluZW5cXFwiOiBbMjUwLCAyNDAsIDIzMF0sXFxyXFxuXFx0XFxcIm1hZ2VudGFcXFwiOiBbMjU1LCAwLCAyNTVdLFxcclxcblxcdFxcXCJtYXJvb25cXFwiOiBbMTI4LCAwLCAwXSxcXHJcXG5cXHRcXFwibWVkaXVtYXF1YW1hcmluZVxcXCI6IFsxMDIsIDIwNSwgMTcwXSxcXHJcXG5cXHRcXFwibWVkaXVtYmx1ZVxcXCI6IFswLCAwLCAyMDVdLFxcclxcblxcdFxcXCJtZWRpdW1vcmNoaWRcXFwiOiBbMTg2LCA4NSwgMjExXSxcXHJcXG5cXHRcXFwibWVkaXVtcHVycGxlXFxcIjogWzE0NywgMTEyLCAyMTldLFxcclxcblxcdFxcXCJtZWRpdW1zZWFncmVlblxcXCI6IFs2MCwgMTc5LCAxMTNdLFxcclxcblxcdFxcXCJtZWRpdW1zbGF0ZWJsdWVcXFwiOiBbMTIzLCAxMDQsIDIzOF0sXFxyXFxuXFx0XFxcIm1lZGl1bXNwcmluZ2dyZWVuXFxcIjogWzAsIDI1MCwgMTU0XSxcXHJcXG5cXHRcXFwibWVkaXVtdHVycXVvaXNlXFxcIjogWzcyLCAyMDksIDIwNF0sXFxyXFxuXFx0XFxcIm1lZGl1bXZpb2xldHJlZFxcXCI6IFsxOTksIDIxLCAxMzNdLFxcclxcblxcdFxcXCJtaWRuaWdodGJsdWVcXFwiOiBbMjUsIDI1LCAxMTJdLFxcclxcblxcdFxcXCJtaW50Y3JlYW1cXFwiOiBbMjQ1LCAyNTUsIDI1MF0sXFxyXFxuXFx0XFxcIm1pc3R5cm9zZVxcXCI6IFsyNTUsIDIyOCwgMjI1XSxcXHJcXG5cXHRcXFwibW9jY2FzaW5cXFwiOiBbMjU1LCAyMjgsIDE4MV0sXFxyXFxuXFx0XFxcIm5hdmFqb3doaXRlXFxcIjogWzI1NSwgMjIyLCAxNzNdLFxcclxcblxcdFxcXCJuYXZ5XFxcIjogWzAsIDAsIDEyOF0sXFxyXFxuXFx0XFxcIm9sZGxhY2VcXFwiOiBbMjUzLCAyNDUsIDIzMF0sXFxyXFxuXFx0XFxcIm9saXZlXFxcIjogWzEyOCwgMTI4LCAwXSxcXHJcXG5cXHRcXFwib2xpdmVkcmFiXFxcIjogWzEwNywgMTQyLCAzNV0sXFxyXFxuXFx0XFxcIm9yYW5nZVxcXCI6IFsyNTUsIDE2NSwgMF0sXFxyXFxuXFx0XFxcIm9yYW5nZXJlZFxcXCI6IFsyNTUsIDY5LCAwXSxcXHJcXG5cXHRcXFwib3JjaGlkXFxcIjogWzIxOCwgMTEyLCAyMTRdLFxcclxcblxcdFxcXCJwYWxlZ29sZGVucm9kXFxcIjogWzIzOCwgMjMyLCAxNzBdLFxcclxcblxcdFxcXCJwYWxlZ3JlZW5cXFwiOiBbMTUyLCAyNTEsIDE1Ml0sXFxyXFxuXFx0XFxcInBhbGV0dXJxdW9pc2VcXFwiOiBbMTc1LCAyMzgsIDIzOF0sXFxyXFxuXFx0XFxcInBhbGV2aW9sZXRyZWRcXFwiOiBbMjE5LCAxMTIsIDE0N10sXFxyXFxuXFx0XFxcInBhcGF5YXdoaXBcXFwiOiBbMjU1LCAyMzksIDIxM10sXFxyXFxuXFx0XFxcInBlYWNocHVmZlxcXCI6IFsyNTUsIDIxOCwgMTg1XSxcXHJcXG5cXHRcXFwicGVydVxcXCI6IFsyMDUsIDEzMywgNjNdLFxcclxcblxcdFxcXCJwaW5rXFxcIjogWzI1NSwgMTkyLCAyMDNdLFxcclxcblxcdFxcXCJwbHVtXFxcIjogWzIyMSwgMTYwLCAyMjFdLFxcclxcblxcdFxcXCJwb3dkZXJibHVlXFxcIjogWzE3NiwgMjI0LCAyMzBdLFxcclxcblxcdFxcXCJwdXJwbGVcXFwiOiBbMTI4LCAwLCAxMjhdLFxcclxcblxcdFxcXCJyZWJlY2NhcHVycGxlXFxcIjogWzEwMiwgNTEsIDE1M10sXFxyXFxuXFx0XFxcInJlZFxcXCI6IFsyNTUsIDAsIDBdLFxcclxcblxcdFxcXCJyb3N5YnJvd25cXFwiOiBbMTg4LCAxNDMsIDE0M10sXFxyXFxuXFx0XFxcInJveWFsYmx1ZVxcXCI6IFs2NSwgMTA1LCAyMjVdLFxcclxcblxcdFxcXCJzYWRkbGVicm93blxcXCI6IFsxMzksIDY5LCAxOV0sXFxyXFxuXFx0XFxcInNhbG1vblxcXCI6IFsyNTAsIDEyOCwgMTE0XSxcXHJcXG5cXHRcXFwic2FuZHlicm93blxcXCI6IFsyNDQsIDE2NCwgOTZdLFxcclxcblxcdFxcXCJzZWFncmVlblxcXCI6IFs0NiwgMTM5LCA4N10sXFxyXFxuXFx0XFxcInNlYXNoZWxsXFxcIjogWzI1NSwgMjQ1LCAyMzhdLFxcclxcblxcdFxcXCJzaWVubmFcXFwiOiBbMTYwLCA4MiwgNDVdLFxcclxcblxcdFxcXCJzaWx2ZXJcXFwiOiBbMTkyLCAxOTIsIDE5Ml0sXFxyXFxuXFx0XFxcInNreWJsdWVcXFwiOiBbMTM1LCAyMDYsIDIzNV0sXFxyXFxuXFx0XFxcInNsYXRlYmx1ZVxcXCI6IFsxMDYsIDkwLCAyMDVdLFxcclxcblxcdFxcXCJzbGF0ZWdyYXlcXFwiOiBbMTEyLCAxMjgsIDE0NF0sXFxyXFxuXFx0XFxcInNsYXRlZ3JleVxcXCI6IFsxMTIsIDEyOCwgMTQ0XSxcXHJcXG5cXHRcXFwic25vd1xcXCI6IFsyNTUsIDI1MCwgMjUwXSxcXHJcXG5cXHRcXFwic3ByaW5nZ3JlZW5cXFwiOiBbMCwgMjU1LCAxMjddLFxcclxcblxcdFxcXCJzdGVlbGJsdWVcXFwiOiBbNzAsIDEzMCwgMTgwXSxcXHJcXG5cXHRcXFwidGFuXFxcIjogWzIxMCwgMTgwLCAxNDBdLFxcclxcblxcdFxcXCJ0ZWFsXFxcIjogWzAsIDEyOCwgMTI4XSxcXHJcXG5cXHRcXFwidGhpc3RsZVxcXCI6IFsyMTYsIDE5MSwgMjE2XSxcXHJcXG5cXHRcXFwidG9tYXRvXFxcIjogWzI1NSwgOTksIDcxXSxcXHJcXG5cXHRcXFwidHVycXVvaXNlXFxcIjogWzY0LCAyMjQsIDIwOF0sXFxyXFxuXFx0XFxcInZpb2xldFxcXCI6IFsyMzgsIDEzMCwgMjM4XSxcXHJcXG5cXHRcXFwid2hlYXRcXFwiOiBbMjQ1LCAyMjIsIDE3OV0sXFxyXFxuXFx0XFxcIndoaXRlXFxcIjogWzI1NSwgMjU1LCAyNTVdLFxcclxcblxcdFxcXCJ3aGl0ZXNtb2tlXFxcIjogWzI0NSwgMjQ1LCAyNDVdLFxcclxcblxcdFxcXCJ5ZWxsb3dcXFwiOiBbMjU1LCAyNTUsIDBdLFxcclxcblxcdFxcXCJ5ZWxsb3dncmVlblxcXCI6IFsxNTQsIDIwNSwgNTBdXFxyXFxufTtcXHJcXG5cXG5cXG4vLyMgc291cmNlVVJMPXdlYnBhY2s6Ly9nZXRDb2xvck5hbWUvLi9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qcz9cIik7XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9pbmRleC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2luZGV4LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKiovICgobW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pID0+IHtcblxuZXZhbChcIi8qIE1JVCBsaWNlbnNlICovXFxudmFyIGNvbG9yTmFtZXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBjb2xvci1uYW1lICovIFxcXCIuL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4LmpzXFxcIik7XFxudmFyIHN3aXp6bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBzaW1wbGUtc3dpenpsZSAqLyBcXFwiLi9ub2RlX21vZHVsZXMvc2ltcGxlLXN3aXp6bGUvaW5kZXguanNcXFwiKTtcXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QuaGFzT3duUHJvcGVydHk7XFxuXFxudmFyIHJldmVyc2VOYW1lcyA9IHt9O1xcblxcbi8vIGNyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xcbmZvciAodmFyIG5hbWUgaW4gY29sb3JOYW1lcykge1xcblxcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbG9yTmFtZXMsIG5hbWUpKSB7XFxuXFx0XFx0cmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcXG5cXHR9XFxufVxcblxcbnZhciBjcyA9IG1vZHVsZS5leHBvcnRzID0ge1xcblxcdHRvOiB7fSxcXG5cXHRnZXQ6IHt9XFxufTtcXG5cXG5jcy5nZXQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XFxuXFx0dmFyIHByZWZpeCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgMykudG9Mb3dlckNhc2UoKTtcXG5cXHR2YXIgdmFsO1xcblxcdHZhciBtb2RlbDtcXG5cXHRzd2l0Y2ggKHByZWZpeCkge1xcblxcdFxcdGNhc2UgJ2hzbCc6XFxuXFx0XFx0XFx0dmFsID0gY3MuZ2V0LmhzbChzdHJpbmcpO1xcblxcdFxcdFxcdG1vZGVsID0gJ2hzbCc7XFxuXFx0XFx0XFx0YnJlYWs7XFxuXFx0XFx0Y2FzZSAnaHdiJzpcXG5cXHRcXHRcXHR2YWwgPSBjcy5nZXQuaHdiKHN0cmluZyk7XFxuXFx0XFx0XFx0bW9kZWwgPSAnaHdiJztcXG5cXHRcXHRcXHRicmVhaztcXG5cXHRcXHRkZWZhdWx0OlxcblxcdFxcdFxcdHZhbCA9IGNzLmdldC5yZ2Ioc3RyaW5nKTtcXG5cXHRcXHRcXHRtb2RlbCA9ICdyZ2InO1xcblxcdFxcdFxcdGJyZWFrO1xcblxcdH1cXG5cXG5cXHRpZiAoIXZhbCkge1xcblxcdFxcdHJldHVybiBudWxsO1xcblxcdH1cXG5cXG5cXHRyZXR1cm4ge21vZGVsOiBtb2RlbCwgdmFsdWU6IHZhbH07XFxufTtcXG5cXG5jcy5nZXQucmdiID0gZnVuY3Rpb24gKHN0cmluZykge1xcblxcdGlmICghc3RyaW5nKSB7XFxuXFx0XFx0cmV0dXJuIG51bGw7XFxuXFx0fVxcblxcblxcdHZhciBhYmJyID0gL14jKFthLWYwLTldezMsNH0pJC9pO1xcblxcdHZhciBoZXggPSAvXiMoW2EtZjAtOV17Nn0pKFthLWYwLTldezJ9KT8kL2k7XFxuXFx0dmFyIHJnYmEgPSAvXnJnYmE/XFxcXChcXFxccyooWystXT9cXFxcZCspKD89W1xcXFxzLF0pXFxcXHMqKD86LFxcXFxzKik/KFsrLV0/XFxcXGQrKSg/PVtcXFxccyxdKVxcXFxzKig/OixcXFxccyopPyhbKy1dP1xcXFxkKylcXFxccyooPzpbLHxcXFxcL11cXFxccyooWystXT9bXFxcXGRcXFxcLl0rKSglPylcXFxccyopP1xcXFwpJC87XFxuXFx0dmFyIHBlciA9IC9ecmdiYT9cXFxcKFxcXFxzKihbKy1dP1tcXFxcZFxcXFwuXSspXFxcXCVcXFxccyosP1xcXFxzKihbKy1dP1tcXFxcZFxcXFwuXSspXFxcXCVcXFxccyosP1xcXFxzKihbKy1dP1tcXFxcZFxcXFwuXSspXFxcXCVcXFxccyooPzpbLHxcXFxcL11cXFxccyooWystXT9bXFxcXGRcXFxcLl0rKSglPylcXFxccyopP1xcXFwpJC87XFxuXFx0dmFyIGtleXdvcmQgPSAvXihcXFxcdyspJC87XFxuXFxuXFx0dmFyIHJnYiA9IFswLCAwLCAwLCAxXTtcXG5cXHR2YXIgbWF0Y2g7XFxuXFx0dmFyIGk7XFxuXFx0dmFyIGhleEFscGhhO1xcblxcblxcdGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChoZXgpKSB7XFxuXFx0XFx0aGV4QWxwaGEgPSBtYXRjaFsyXTtcXG5cXHRcXHRtYXRjaCA9IG1hdGNoWzFdO1xcblxcblxcdFxcdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcXG5cXHRcXHRcXHQvLyBodHRwczovL2pzcGVyZi5jb20vc2xpY2UtdnMtc3Vic3RyLXZzLXN1YnN0cmluZy1tZXRob2RzLWxvbmctc3RyaW5nLzE5XFxuXFx0XFx0XFx0dmFyIGkyID0gaSAqIDI7XFxuXFx0XFx0XFx0cmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaTIsIGkyICsgMiksIDE2KTtcXG5cXHRcXHR9XFxuXFxuXFx0XFx0aWYgKGhleEFscGhhKSB7XFxuXFx0XFx0XFx0cmdiWzNdID0gcGFyc2VJbnQoaGV4QWxwaGEsIDE2KSAvIDI1NTtcXG5cXHRcXHR9XFxuXFx0fSBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKSkge1xcblxcdFxcdG1hdGNoID0gbWF0Y2hbMV07XFxuXFx0XFx0aGV4QWxwaGEgPSBtYXRjaFszXTtcXG5cXG5cXHRcXHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XFxuXFx0XFx0XFx0cmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaV0gKyBtYXRjaFtpXSwgMTYpO1xcblxcdFxcdH1cXG5cXG5cXHRcXHRpZiAoaGV4QWxwaGEpIHtcXG5cXHRcXHRcXHRyZ2JbM10gPSBwYXJzZUludChoZXhBbHBoYSArIGhleEFscGhhLCAxNikgLyAyNTU7XFxuXFx0XFx0fVxcblxcdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcXG5cXHRcXHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XFxuXFx0XFx0XFx0cmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaSArIDFdLCAwKTtcXG5cXHRcXHR9XFxuXFxuXFx0XFx0aWYgKG1hdGNoWzRdKSB7XFxuXFx0XFx0XFx0aWYgKG1hdGNoWzVdKSB7XFxuXFx0XFx0XFx0XFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSkgKiAwLjAxO1xcblxcdFxcdFxcdH0gZWxzZSB7XFxuXFx0XFx0XFx0XFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XFxuXFx0XFx0XFx0fVxcblxcdFxcdH1cXG5cXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcXG5cXHRcXHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XFxuXFx0XFx0XFx0cmdiW2ldID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KG1hdGNoW2kgKyAxXSkgKiAyLjU1KTtcXG5cXHRcXHR9XFxuXFxuXFx0XFx0aWYgKG1hdGNoWzRdKSB7XFxuXFx0XFx0XFx0aWYgKG1hdGNoWzVdKSB7XFxuXFx0XFx0XFx0XFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSkgKiAwLjAxO1xcblxcdFxcdFxcdH0gZWxzZSB7XFxuXFx0XFx0XFx0XFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XFxuXFx0XFx0XFx0fVxcblxcdFxcdH1cXG5cXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XFxuXFx0XFx0aWYgKG1hdGNoWzFdID09PSAndHJhbnNwYXJlbnQnKSB7XFxuXFx0XFx0XFx0cmV0dXJuIFswLCAwLCAwLCAwXTtcXG5cXHRcXHR9XFxuXFxuXFx0XFx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbG9yTmFtZXMsIG1hdGNoWzFdKSkge1xcblxcdFxcdFxcdHJldHVybiBudWxsO1xcblxcdFxcdH1cXG5cXG5cXHRcXHRyZ2IgPSBjb2xvck5hbWVzW21hdGNoWzFdXTtcXG5cXHRcXHRyZ2JbM10gPSAxO1xcblxcblxcdFxcdHJldHVybiByZ2I7XFxuXFx0fSBlbHNlIHtcXG5cXHRcXHRyZXR1cm4gbnVsbDtcXG5cXHR9XFxuXFxuXFx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xcblxcdFxcdHJnYltpXSA9IGNsYW1wKHJnYltpXSwgMCwgMjU1KTtcXG5cXHR9XFxuXFx0cmdiWzNdID0gY2xhbXAocmdiWzNdLCAwLCAxKTtcXG5cXG5cXHRyZXR1cm4gcmdiO1xcbn07XFxuXFxuY3MuZ2V0LmhzbCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcXG5cXHRpZiAoIXN0cmluZykge1xcblxcdFxcdHJldHVybiBudWxsO1xcblxcdH1cXG5cXG5cXHR2YXIgaHNsID0gL15oc2xhP1xcXFwoXFxcXHMqKFsrLV0/KD86XFxcXGR7MCwzfVxcXFwuKT9cXFxcZCspKD86ZGVnKT9cXFxccyosP1xcXFxzKihbKy1dP1tcXFxcZFxcXFwuXSspJVxcXFxzKiw/XFxcXHMqKFsrLV0/W1xcXFxkXFxcXC5dKyklXFxcXHMqKD86Wyx8XFxcXC9dXFxcXHMqKFsrLV0/KD89XFxcXC5cXFxcZHxcXFxcZCkoPzowfFsxLTldXFxcXGQqKT8oPzpcXFxcLlxcXFxkKik/KD86W2VFXVsrLV0/XFxcXGQrKT8pXFxcXHMqKT9cXFxcKSQvO1xcblxcdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xcblxcblxcdGlmIChtYXRjaCkge1xcblxcdFxcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xcblxcdFxcdHZhciBoID0gKChwYXJzZUZsb2F0KG1hdGNoWzFdKSAlIDM2MCkgKyAzNjApICUgMzYwO1xcblxcdFxcdHZhciBzID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCk7XFxuXFx0XFx0dmFyIGwgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKTtcXG5cXHRcXHR2YXIgYSA9IGNsYW1wKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XFxuXFxuXFx0XFx0cmV0dXJuIFtoLCBzLCBsLCBhXTtcXG5cXHR9XFxuXFxuXFx0cmV0dXJuIG51bGw7XFxufTtcXG5cXG5jcy5nZXQuaHdiID0gZnVuY3Rpb24gKHN0cmluZykge1xcblxcdGlmICghc3RyaW5nKSB7XFxuXFx0XFx0cmV0dXJuIG51bGw7XFxuXFx0fVxcblxcblxcdHZhciBod2IgPSAvXmh3YlxcXFwoXFxcXHMqKFsrLV0/XFxcXGR7MCwzfSg/OlxcXFwuXFxcXGQrKT8pKD86ZGVnKT9cXFxccyosXFxcXHMqKFsrLV0/W1xcXFxkXFxcXC5dKyklXFxcXHMqLFxcXFxzKihbKy1dP1tcXFxcZFxcXFwuXSspJVxcXFxzKig/OixcXFxccyooWystXT8oPz1cXFxcLlxcXFxkfFxcXFxkKSg/OjB8WzEtOV1cXFxcZCopPyg/OlxcXFwuXFxcXGQqKT8oPzpbZUVdWystXT9cXFxcZCspPylcXFxccyopP1xcXFwpJC87XFxuXFx0dmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGh3Yik7XFxuXFxuXFx0aWYgKG1hdGNoKSB7XFxuXFx0XFx0dmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XFxuXFx0XFx0dmFyIGggPSAoKHBhcnNlRmxvYXQobWF0Y2hbMV0pICUgMzYwKSArIDM2MCkgJSAzNjA7XFxuXFx0XFx0dmFyIHcgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKTtcXG5cXHRcXHR2YXIgYiA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApO1xcblxcdFxcdHZhciBhID0gY2xhbXAoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcXG5cXHRcXHRyZXR1cm4gW2gsIHcsIGIsIGFdO1xcblxcdH1cXG5cXG5cXHRyZXR1cm4gbnVsbDtcXG59O1xcblxcbmNzLnRvLmhleCA9IGZ1bmN0aW9uICgpIHtcXG5cXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcXG5cXG5cXHRyZXR1cm4gKFxcblxcdFxcdCcjJyArXFxuXFx0XFx0aGV4RG91YmxlKHJnYmFbMF0pICtcXG5cXHRcXHRoZXhEb3VibGUocmdiYVsxXSkgK1xcblxcdFxcdGhleERvdWJsZShyZ2JhWzJdKSArXFxuXFx0XFx0KHJnYmFbM10gPCAxXFxuXFx0XFx0XFx0PyAoaGV4RG91YmxlKE1hdGgucm91bmQocmdiYVszXSAqIDI1NSkpKVxcblxcdFxcdFxcdDogJycpXFxuXFx0KTtcXG59O1xcblxcbmNzLnRvLnJnYiA9IGZ1bmN0aW9uICgpIHtcXG5cXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcXG5cXG5cXHRyZXR1cm4gcmdiYS5sZW5ndGggPCA0IHx8IHJnYmFbM10gPT09IDFcXG5cXHRcXHQ/ICdyZ2IoJyArIE1hdGgucm91bmQocmdiYVswXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzFdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMl0pICsgJyknXFxuXFx0XFx0OiAncmdiYSgnICsgTWF0aC5yb3VuZChyZ2JhWzBdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMV0pICsgJywgJyArIE1hdGgucm91bmQocmdiYVsyXSkgKyAnLCAnICsgcmdiYVszXSArICcpJztcXG59O1xcblxcbmNzLnRvLnJnYi5wZXJjZW50ID0gZnVuY3Rpb24gKCkge1xcblxcdHZhciByZ2JhID0gc3dpenpsZShhcmd1bWVudHMpO1xcblxcblxcdHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdIC8gMjU1ICogMTAwKTtcXG5cXHR2YXIgZyA9IE1hdGgucm91bmQocmdiYVsxXSAvIDI1NSAqIDEwMCk7XFxuXFx0dmFyIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0gLyAyNTUgKiAxMDApO1xcblxcblxcdHJldHVybiByZ2JhLmxlbmd0aCA8IDQgfHwgcmdiYVszXSA9PT0gMVxcblxcdFxcdD8gJ3JnYignICsgciArICclLCAnICsgZyArICclLCAnICsgYiArICclKSdcXG5cXHRcXHQ6ICdyZ2JhKCcgKyByICsgJyUsICcgKyBnICsgJyUsICcgKyBiICsgJyUsICcgKyByZ2JhWzNdICsgJyknO1xcbn07XFxuXFxuY3MudG8uaHNsID0gZnVuY3Rpb24gKCkge1xcblxcdHZhciBoc2xhID0gc3dpenpsZShhcmd1bWVudHMpO1xcblxcdHJldHVybiBoc2xhLmxlbmd0aCA8IDQgfHwgaHNsYVszXSA9PT0gMVxcblxcdFxcdD8gJ2hzbCgnICsgaHNsYVswXSArICcsICcgKyBoc2xhWzFdICsgJyUsICcgKyBoc2xhWzJdICsgJyUpJ1xcblxcdFxcdDogJ2hzbGEoJyArIGhzbGFbMF0gKyAnLCAnICsgaHNsYVsxXSArICclLCAnICsgaHNsYVsyXSArICclLCAnICsgaHNsYVszXSArICcpJztcXG59O1xcblxcbi8vIGh3YiBpcyBhIGJpdCBkaWZmZXJlbnQgdGhhbiByZ2IoYSkgJiBoc2woYSkgc2luY2UgdGhlcmUgaXMgbm8gYWxwaGEgc3BlY2lmaWMgc3ludGF4XFxuLy8gKGh3YiBoYXZlIGFscGhhIG9wdGlvbmFsICYgMSBpcyBkZWZhdWx0IHZhbHVlKVxcbmNzLnRvLmh3YiA9IGZ1bmN0aW9uICgpIHtcXG5cXHR2YXIgaHdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcXG5cXG5cXHR2YXIgYSA9ICcnO1xcblxcdGlmIChod2JhLmxlbmd0aCA+PSA0ICYmIGh3YmFbM10gIT09IDEpIHtcXG5cXHRcXHRhID0gJywgJyArIGh3YmFbM107XFxuXFx0fVxcblxcblxcdHJldHVybiAnaHdiKCcgKyBod2JhWzBdICsgJywgJyArIGh3YmFbMV0gKyAnJSwgJyArIGh3YmFbMl0gKyAnJScgKyBhICsgJyknO1xcbn07XFxuXFxuY3MudG8ua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcXG5cXHRyZXR1cm4gcmV2ZXJzZU5hbWVzW3JnYi5zbGljZSgwLCAzKV07XFxufTtcXG5cXG4vLyBoZWxwZXJzXFxuZnVuY3Rpb24gY2xhbXAobnVtLCBtaW4sIG1heCkge1xcblxcdHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIG51bSksIG1heCk7XFxufVxcblxcbmZ1bmN0aW9uIGhleERvdWJsZShudW0pIHtcXG5cXHR2YXIgc3RyID0gTWF0aC5yb3VuZChudW0pLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xcblxcdHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gJzAnICsgc3RyIDogc3RyO1xcbn1cXG5cXG5cXG4vLyMgc291cmNlVVJMPXdlYnBhY2s6Ly9nZXRDb2xvck5hbWUvLi9ub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2luZGV4LmpzP1wiKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvaXMtYXJyYXlpc2gvaW5kZXguanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvaXMtYXJyYXlpc2gvaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqLyAoKG1vZHVsZSkgPT4ge1xuXG5ldmFsKFwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0FycmF5aXNoKG9iaikge1xcblxcdGlmICghb2JqIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XFxuXFx0XFx0cmV0dXJuIGZhbHNlO1xcblxcdH1cXG5cXG5cXHRyZXR1cm4gb2JqIGluc3RhbmNlb2YgQXJyYXkgfHwgQXJyYXkuaXNBcnJheShvYmopIHx8XFxuXFx0XFx0KG9iai5sZW5ndGggPj0gMCAmJiAob2JqLnNwbGljZSBpbnN0YW5jZW9mIEZ1bmN0aW9uIHx8XFxuXFx0XFx0XFx0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAob2JqLmxlbmd0aCAtIDEpKSAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPT0gJ1N0cmluZycpKSk7XFxufTtcXG5cXG5cXG4vLyMgc291cmNlVVJMPXdlYnBhY2s6Ly9nZXRDb2xvck5hbWUvLi9ub2RlX21vZHVsZXMvaXMtYXJyYXlpc2gvaW5kZXguanM/XCIpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKiovICgobW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pID0+IHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5ldmFsKFwiXFxuXFxudmFyIGlzQXJyYXlpc2ggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBpcy1hcnJheWlzaCAqLyBcXFwiLi9ub2RlX21vZHVsZXMvaXMtYXJyYXlpc2gvaW5kZXguanNcXFwiKTtcXG5cXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XFxuXFxudmFyIHN3aXp6bGUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN3aXp6bGUoYXJncykge1xcblxcdHZhciByZXN1bHRzID0gW107XFxuXFxuXFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcXG5cXHRcXHR2YXIgYXJnID0gYXJnc1tpXTtcXG5cXG5cXHRcXHRpZiAoaXNBcnJheWlzaChhcmcpKSB7XFxuXFx0XFx0XFx0Ly8gaHR0cDovL2pzcGVyZi5jb20vamF2YXNjcmlwdC1hcnJheS1jb25jYXQtdnMtcHVzaC85OFxcblxcdFxcdFxcdHJlc3VsdHMgPSBjb25jYXQuY2FsbChyZXN1bHRzLCBzbGljZS5jYWxsKGFyZykpO1xcblxcdFxcdH0gZWxzZSB7XFxuXFx0XFx0XFx0cmVzdWx0cy5wdXNoKGFyZyk7XFxuXFx0XFx0fVxcblxcdH1cXG5cXG5cXHRyZXR1cm4gcmVzdWx0cztcXG59O1xcblxcbnN3aXp6bGUud3JhcCA9IGZ1bmN0aW9uIChmbikge1xcblxcdHJldHVybiBmdW5jdGlvbiAoKSB7XFxuXFx0XFx0cmV0dXJuIGZuKHN3aXp6bGUoYXJndW1lbnRzKSk7XFxuXFx0fTtcXG59O1xcblxcblxcbi8vIyBzb3VyY2VVUkw9d2VicGFjazovL2dldENvbG9yTmFtZS8uL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qcz9cIik7XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vZGF0YS9jdXJhdGVkLmpzb25cIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL2RhdGEvY3VyYXRlZC5qc29uICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqLyAoKG1vZHVsZSkgPT4ge1xuXG5cInVzZSBzdHJpY3RcIjtcbmV2YWwoXCJtb2R1bGUuZXhwb3J0cyA9IEpTT04ucGFyc2UoJ3tcXFwiMTAxNDA1XFxcIjpcXFwiR3JlZW4gV2F0ZXJsb29cXFwiLFxcXCIxMDU4NTJcXFwiOlxcXCJFZGVuXFxcIixcXFwiMTIzNDQ3XFxcIjpcXFwiRWxlcGhhbnRcXFwiLFxcXCIxMzAwMDBcXFwiOlxcXCJEaWVzZWxcXFwiLFxcXCIxNDA2MDBcXFwiOlxcXCJOZXJvXFxcIixcXFwiMTYxOTI4XFxcIjpcXFwiTWlyYWdlXFxcIixcXFwiMTYzMjIyXFxcIjpcXFwiQ2VsdGljXFxcIixcXFwiMTYzNTMxXFxcIjpcXFwiR2FibGUgR3JlZW5cXFwiLFxcXCIxNzU1NzlcXFwiOlxcXCJDaGF0aGFtcyBCbHVlXFxcIixcXFwiMTkzNzUxXFxcIjpcXFwiTmlsZSBCbHVlXFxcIixcXFwiMjA0ODUyXFxcIjpcXFwiQmx1ZSBEaWFubmVcXFwiLFxcXCIyMjA4NzhcXFwiOlxcXCJEZWVwIEJsdWVcXFwiLFxcXCIyMzM0MThcXFwiOlxcXCJNYWxsYXJkXFxcIixcXFwiMjUxNjA3XFxcIjpcXFwiR3JhcGhpdGVcXFwiLFxcXCIyNTE3MDZcXFwiOlxcXCJDYW5ub24gQmxhY2tcXFwiLFxcXCIyNjAzNjhcXFwiOlxcXCJQYXVhXFxcIixcXFwiMjYxMTA1XFxcIjpcXFwiV29vZCBCYXJrXFxcIixcXFwiMjYxNDE0XFxcIjpcXFwiR29uZG9sYVxcXCIsXFxcIjI2MjMzNVxcXCI6XFxcIlN0ZWVsIEdyYXlcXFwiLFxcXCIyOTIxMzBcXFwiOlxcXCJCYXN0aWxsZVxcXCIsXFxcIjI5MjMxOVxcXCI6XFxcIlpldXNcXFwiLFxcXCIyOTI5MzdcXFwiOlxcXCJDaGFyYWRlXFxcIixcXFwiMzAwNTI5XFxcIjpcXFwiTWVsYW56YW5lXFxcIixcXFwiMzE0NDU5XFxcIjpcXFwiUGlja2xlZCBCbHVld29vZFxcXCIsXFxcIjMyMzIzMlxcXCI6XFxcIk1pbmUgU2hhZnRcXFwiLFxcXCIzNDE1MTVcXFwiOlxcXCJUYW1hcmluZFxcXCIsXFxcIjM1MDAzNlxcXCI6XFxcIk1hcmRpIEdyYXNcXFwiLFxcXCIzNTM1NDJcXFwiOlxcXCJUdW5hXFxcIixcXFwiMzYzMDUwXFxcIjpcXFwiTWFydGluaXF1ZVxcXCIsXFxcIjM2MzUzNFxcXCI6XFxcIlR1YXRhcmFcXFwiLFxcXCIzNjg3MTZcXFwiOlxcXCJMYSBQYWxtYVxcXCIsXFxcIjM3MzAyMVxcXCI6XFxcIkJpcmNoXFxcIixcXFwiMzc3NDc1XFxcIjpcXFwiT3JhY2xlXFxcIixcXFwiMzgwNDc0XFxcIjpcXFwiQmx1ZSBEaWFtb25kXFxcIixcXFwiMzgzNTMzXFxcIjpcXFwiRHVuZVxcXCIsXFxcIjM4NDU1NVxcXCI6XFxcIk94Zm9yZCBCbHVlXFxcIixcXFwiMzg0OTEwXFxcIjpcXFwiQ2xvdmVyXFxcIixcXFwiMzk0ODUxXFxcIjpcXFwiTGltZWQgU3BydWNlXFxcIixcXFwiMzk2NDEzXFxcIjpcXFwiRGVsbFxcXCIsXFxcIjQwMTgwMVxcXCI6XFxcIkJyb3duIFBvZFxcXCIsXFxcIjQwNTE2OVxcXCI6XFxcIkZpb3JkXFxcIixcXFwiNDEwMDU2XFxcIjpcXFwiUmlwZSBQbHVtXFxcIixcXFwiNDEyMDEwXFxcIjpcXFwiRGVlcCBPYWtcXFwiLFxcXCI0MTQyNTdcXFwiOlxcXCJHdW4gUG93ZGVyXFxcIixcXFwiNDIwMzAzXFxcIjpcXFwiQnVybnQgTWFyb29uXFxcIixcXFwiNDIzOTIxXFxcIjpcXFwiTGlzYm9uIEJyb3duXFxcIixcXFwiNDI3OTc3XFxcIjpcXFwiRmFkZWQgSmFkZVxcXCIsXFxcIjQzMTU2MFxcXCI6XFxcIlNjYXJsZXQgR3VtXFxcIixcXFwiNDMzMTIwXFxcIjpcXFwiSXJva29cXFwiLFxcXCI0NDQ5NTRcXFwiOlxcXCJNYWtvXFxcIixcXFwiNDU0OTM2XFxcIjpcXFwiS2VscFxcXCIsXFxcIjQ2MjQyNVxcXCI6XFxcIkNyYXRlciBCcm93blxcXCIsXFxcIjQ2NTk0NVxcXCI6XFxcIkdyYXkgQXNwYXJhZ3VzXFxcIixcXFwiNDgwNDA0XFxcIjpcXFwiUnVzdGljIFJlZFxcXCIsXFxcIjQ4MDYwN1xcXCI6XFxcIkJ1bGdhcmlhbiBSb3NlXFxcIixcXFwiNDgwNjU2XFxcIjpcXFwiQ2xhaXJ2b3lhbnRcXFwiLFxcXCI0ODMxMzFcXFwiOlxcXCJXb29keSBCcm93blxcXCIsXFxcIjQ5MjYxNVxcXCI6XFxcIkJyb3duIERlcmJ5XFxcIixcXFwiNDk1NDAwXFxcIjpcXFwiVmVyZHVuIEdyZWVuXFxcIixcXFwiNDk2Njc5XFxcIjpcXFwiQmx1ZSBCYXlvdXhcXFwiLFxcXCI0OTcxODNcXFwiOlxcXCJCaXNtYXJrXFxcIixcXFwiNTA0MzUxXFxcIjpcXFwiTW9ydGFyXFxcIixcXFwiNTA3MDk2XFxcIjpcXFwiS2FzaG1pciBCbHVlXFxcIixcXFwiNTA3NjcyXFxcIjpcXFwiQ3V0dHkgU2Fya1xcXCIsXFxcIjUxNDY0OVxcXCI6XFxcIkVtcGVyb3JcXFwiLFxcXCI1MzM0NTVcXFwiOlxcXCJWb29kb29cXFwiLFxcXCI1MzQ0OTFcXFwiOlxcXCJWaWN0b3JpYVxcXCIsXFxcIjU0MTAxMlxcXCI6XFxcIkhlYXRoXFxcIixcXFwiNTQ0MzMzXFxcIjpcXFwiSnVkZ2UgR3JheVxcXCIsXFxcIjU0OTAxOVxcXCI6XFxcIlZpZGEgTG9jYVxcXCIsXFxcIjU3ODM2M1xcXCI6XFxcIlNwcmluZyBMZWF2ZXNcXFwiLFxcXCI1ODU1NjJcXFwiOlxcXCJTY2FycGEgRmxvd1xcXCIsXFxcIjU4NzE1NlxcXCI6XFxcIkNhY3R1c1xcXCIsXFxcIjU5MjgwNFxcXCI6XFxcIkJyb3duIEJyYW1ibGVcXFwiLFxcXCI1OTM3MzdcXFwiOlxcXCJDb25nbyBCcm93blxcXCIsXFxcIjU5NDQzM1xcXCI6XFxcIk1pbGxicm9va1xcXCIsXFxcIjYwNDkxM1xcXCI6XFxcIkhvcnNlcyBOZWNrXFxcIixcXFwiNjEyNzE4XFxcIjpcXFwiRXNwcmVzc29cXFwiLFxcXCI2MTQwNTFcXFwiOlxcXCJFZ2dwbGFudFxcXCIsXFxcIjYyNTExOVxcXCI6XFxcIldlc3QgQ29hc3RcXFwiLFxcXCI2MjY2NDlcXFwiOlxcXCJGaW5jaFxcXCIsXFxcIjY0NjA3N1xcXCI6XFxcIkRvbHBoaW5cXFwiLFxcXCI2NDY0NjNcXFwiOlxcXCJTdG9ybSBEdXN0XFxcIixcXFwiNjU3MjIwXFxcIjpcXFwiRmVybiBGcm9uZFxcXCIsXFxcIjY2MDA0NVxcXCI6XFxcIlBvbXBhZG91clxcXCIsXFxcIjY2MTAxMFxcXCI6XFxcIkRhcmsgVGFuXFxcIixcXFwiNjc2NjYyXFxcIjpcXFwiSXJvbnNpZGUgR3JheVxcXCIsXFxcIjY3ODk3NVxcXCI6XFxcIlZpcmlkaWFuIEdyZWVuXFxcIixcXFwiNjgzNjAwXFxcIjpcXFwiTnV0bWVnIFdvb2QgRmluaXNoXFxcIixcXFwiNjg1NTU4XFxcIjpcXFwiWmFtYmV6aVxcXCIsXFxcIjY5MjU0NVxcXCI6XFxcIlRhd255IFBvcnRcXFwiLFxcXCI3MDQyMTRcXFwiOlxcXCJTZXBpYVxcXCIsXFxcIjcwNjU1NVxcXCI6XFxcIkNvZmZlZVxcXCIsXFxcIjcxNDY5M1xcXCI6XFxcIkFmZmFpclxcXCIsXFxcIjcxNjMzOFxcXCI6XFxcIlllbGxvdyBNZXRhbFxcXCIsXFxcIjcxNzQ4NlxcXCI6XFxcIlN0b3JtIEdyYXlcXFwiLFxcXCI3MTgwODBcXFwiOlxcXCJTaXJvY2NvXFxcIixcXFwiNzM3ODI5XFxcIjpcXFwiQ3JldGVcXFwiLFxcXCI3Mzg2NzhcXFwiOlxcXCJYYW5hZHVcXFwiLFxcXCI3NDg4ODFcXFwiOlxcXCJCbHVlIFNtb2tlXFxcIixcXFwiNzQ5Mzc4XFxcIjpcXFwiTGF1cmVsXFxcIixcXFwiNzc4MTIwXFxcIjpcXFwiUGFjaWZpa2FcXFwiLFxcXCI3ODAxMDlcXFwiOlxcXCJKYXBhbmVzZSBNYXBsZVxcXCIsXFxcIjc5Njg3OFxcXCI6XFxcIk9sZCBMYXZlbmRlclxcXCIsXFxcIjc5Njk4OVxcXCI6XFxcIlJ1bVxcXCIsXFxcIjgwMTgxOFxcXCI6XFxcIkZhbHUgUmVkXFxcIixcXFwiODAzNzkwXFxcIjpcXFwiVml2aWQgVmlvbGV0XFxcIixcXFwiODE3Mzc3XFxcIjpcXFwiRW1wcmVzc1xcXCIsXFxcIjgxOTg4NVxcXCI6XFxcIlNwYW5pc2ggR3JlZW5cXFwiLFxcXCI4Mjg2ODVcXFwiOlxcXCJHdW5zbW9rZVxcXCIsXFxcIjgzMTkyM1xcXCI6XFxcIk1lcmxvdFxcXCIsXFxcIjgzNzA1MFxcXCI6XFxcIlNoYWRvd1xcXCIsXFxcIjg1ODQ3MFxcXCI6XFxcIkJhbmRpY29vdFxcXCIsXFxcIjg2MDExMVxcXCI6XFxcIlJlZCBEZXZpbFxcXCIsXFxcIjg2ODk3NFxcXCI6XFxcIkJpdHRlclxcXCIsXFxcIjg3MTU1MFxcXCI6XFxcIkRpc2NvXFxcIixcXFwiODg1MzQyXFxcIjpcXFwiU3BpY3kgTWl4XFxcIixcXFwiODg2MjIxXFxcIjpcXFwiS3VtZXJhXFxcIixcXFwiODg4Mzg3XFxcIjpcXFwiU3V2YSBHcmF5XFxcIixcXFwiODkzNDU2XFxcIjpcXFwiQ2FtZWxvdFxcXCIsXFxcIjg5Mzg0M1xcXCI6XFxcIlNvbGlkIFBpbmtcXFwiLFxcXCI4OTQzNjdcXFwiOlxcXCJDYW5ub24gUGlua1xcXCIsXFxcIjkwMDAyMFxcXCI6XFxcIkJ1cmd1bmR5XFxcIixcXFwiOTA3ODc0XFxcIjpcXFwiSGVtcFxcXCIsXFxcIjkyNDMyMVxcXCI6XFxcIkN1bWluXFxcIixcXFwiOTI4NTczXFxcIjpcXFwiU3RvbmV3YWxsXFxcIixcXFwiOTI4NTkwXFxcIjpcXFwiVmVudXNcXFwiLFxcXCI5NDQ3NDdcXFwiOlxcXCJDb3BwZXIgUnVzdFxcXCIsXFxcIjk0ODc3MVxcXCI6XFxcIkFycm93dG93blxcXCIsXFxcIjk1MDAxNVxcXCI6XFxcIlNjYXJsZXR0XFxcIixcXFwiOTU2Mzg3XFxcIjpcXFwiU3RyaWtlbWFzdGVyXFxcIixcXFwiOTU5Mzk2XFxcIjpcXFwiTW91bnRhaW4gTWlzdFxcXCIsXFxcIjk2MDAxOFxcXCI6XFxcIkNhcm1pbmVcXFwiLFxcXCI5NjcwNTlcXFwiOlxcXCJMZWF0aGVyXFxcIixcXFwiOTkwMDY2XFxcIjpcXFwiRnJlc2ggRWdncGxhbnRcXFwiLFxcXCI5OTExOTlcXFwiOlxcXCJWaW9sZXQgRWdncGxhbnRcXFwiLFxcXCI5OTE2MTNcXFwiOlxcXCJUYW1hcmlsbG9cXFwiLFxcXCI5OTY2NjZcXFwiOlxcXCJDb3BwZXIgUm9zZVxcXCIsXFxcIkZGRkZCNFxcXCI6XFxcIlBvcnRhZmlub1xcXCIsXFxcIkZGRkY5OVxcXCI6XFxcIlBhbGUgQ2FuYXJ5XFxcIixcXFwiRkZGRjY2XFxcIjpcXFwiTGFzZXIgTGVtb25cXFwiLFxcXCJGRkZFRkRcXFwiOlxcXCJSb21hbmNlXFxcIixcXFwiRkZGRUY2XFxcIjpcXFwiQmxhY2sgV2hpdGVcXFwiLFxcXCJGRkZFRjBcXFwiOlxcXCJSaWNlIENha2VcXFwiLFxcXCJGRkZFRUNcXFwiOlxcXCJBcHJpY290IFdoaXRlXFxcIixcXFwiRkZGRUUxXFxcIjpcXFwiSGFsZiBhbmQgSGFsZlxcXCIsXFxcIkZGRkRGNFxcXCI6XFxcIlF1YXJ0ZXIgUGVhcmwgTHVzdGFcXFwiLFxcXCJGRkZERjNcXFwiOlxcXCJPcmNoaWQgV2hpdGVcXFwiLFxcXCJGRkZERThcXFwiOlxcXCJUcmF2ZXJ0aW5lXFxcIixcXFwiRkZGREU2XFxcIjpcXFwiQ2hpbGVhbiBIZWF0aFxcXCIsXFxcIkZGRkREMFxcXCI6XFxcIkNyZWFtXFxcIixcXFwiRkZGQ0VFXFxcIjpcXFwiSXNsYW5kIFNwaWNlXFxcIixcXFwiRkZGQ0VBXFxcIjpcXFwiQnV0dGVyeSBXaGl0ZVxcXCIsXFxcIkZGRkM5OVxcXCI6XFxcIldpdGNoIEhhemVcXFwiLFxcXCJGRkZCRjlcXFwiOlxcXCJTb2Fwc3RvbmVcXFwiLFxcXCJGRkZCRENcXFwiOlxcXCJTY290Y2ggTWlzdFxcXCIsXFxcIkZGRkFGNFxcXCI6XFxcIkJyaWRhbCBIZWF0aFxcXCIsXFxcIkZGRjlFNlxcXCI6XFxcIkVhcmx5IERhd25cXFwiLFxcXCJGRkY5RTJcXFwiOlxcXCJHaW4gRml6elxcXCIsXFxcIkZGRjhEMVxcXCI6XFxcIkJhamEgV2hpdGVcXFwiLFxcXCJGRkY2RjVcXFwiOlxcXCJSb3NlIFdoaXRlXFxcIixcXFwiRkZGNkRGXFxcIjpcXFwiVmFyZGVuXFxcIixcXFwiRkZGNkQ0XFxcIjpcXFwiTWlsayBQdW5jaFxcXCIsXFxcIkZGRjVGM1xcXCI6XFxcIlNhdXZpZ25vblxcXCIsXFxcIkZGRjRGM1xcXCI6XFxcIkNoYWJsaXNcXFwiLFxcXCJGRkY0RThcXFwiOlxcXCJTZXJlbmFkZVxcXCIsXFxcIkZGRjRFMFxcXCI6XFxcIlNhemVyYWNcXFwiLFxcXCJGRkY0RERcXFwiOlxcXCJFZ2cgU291clxcXCIsXFxcIkZGRjRDRVxcXCI6XFxcIkJhcmxleSBXaGl0ZVxcXCIsXFxcIkZGRjQ2RVxcXCI6XFxcIlBhcmlzIERhaXN5XFxcIixcXFwiRkZGM0YxXFxcIjpcXFwiQ2hhcmRvblxcXCIsXFxcIkZGRjM5RFxcXCI6XFxcIlBpY2Fzc29cXFwiLFxcXCJGRkYxRjlcXFwiOlxcXCJUdXR1XFxcIixcXFwiRkZGMUVFXFxcIjpcXFwiRm9yZ2V0IE1lIE5vdFxcXCIsXFxcIkZGRjFEOFxcXCI6XFxcIlBpbmsgTGFkeVxcXCIsXFxcIkZGRjFCNVxcXCI6XFxcIkJ1dHRlcm1pbGtcXFwiLFxcXCJGRkYxNEZcXFwiOlxcXCJHb3JzZVxcXCIsXFxcIkZGRjBEQlxcXCI6XFxcIlBlYWNoIENyZWFtXFxcIixcXFwiRkZFRkVDXFxcIjpcXFwiRmFpciBQaW5rXFxcIixcXFwiRkZFRkMxXFxcIjpcXFwiRWdnIFdoaXRlXFxcIixcXFwiRkZFRkExXFxcIjpcXFwiVmlzIFZpc1xcXCIsXFxcIkZGRUVEOFxcXCI6XFxcIkRlcmJ5XFxcIixcXFwiRkZFREJDXFxcIjpcXFwiQ29sb25pYWwgV2hpdGVcXFwiLFxcXCJGRkVDMTNcXFwiOlxcXCJCcm9vbVxcXCIsXFxcIkZGRUFENFxcXCI6XFxcIkthcnJ5XFxcIixcXFwiRkZFQUM4XFxcIjpcXFwiU2FuZHkgQmVhY2hcXFwiLFxcXCJGRkU3NzJcXFwiOlxcXCJLb3Vybmlrb3ZhXFxcIixcXFwiRkZFNkM3XFxcIjpcXFwiVGVxdWlsYVxcXCIsXFxcIkZGRTVCNFxcXCI6XFxcIlBlYWNoXFxcIixcXFwiRkZFNUEwXFxcIjpcXFwiQ3JlYW0gQnJ1bGVlXFxcIixcXFwiRkZFMkM1XFxcIjpcXFwiTmVncm9uaVxcXCIsXFxcIkZGRTFGMlxcXCI6XFxcIlBhbGUgUm9zZVxcXCIsXFxcIkZGRTFERlxcXCI6XFxcIlBpcHBpblxcXCIsXFxcIkZGREVCM1xcXCI6XFxcIkZyYW5naXBhbmlcXFwiLFxcXCJGRkRERjRcXFwiOlxcXCJQaW5rIExhY2VcXFwiLFxcXCJGRkREQ0ZcXFwiOlxcXCJXYXR1c2lcXFwiLFxcXCJGRkREQ0RcXFwiOlxcXCJUdWZ0IEJ1c2hcXFwiLFxcXCJGRkREQUZcXFwiOlxcXCJDYXJhbWVsXFxcIixcXFwiRkZEQ0Q2XFxcIjpcXFwiUGVhY2ggU2NobmFwcHNcXFwiLFxcXCJGRkRCNThcXFwiOlxcXCJNdXN0YXJkXFxcIixcXFwiRkZEOEQ5XFxcIjpcXFwiQ29zbW9zXFxcIixcXFwiRkZEODAwXFxcIjpcXFwiU2Nob29sIGJ1cyBZZWxsb3dcXFwiLFxcXCJGRkQzOENcXFwiOlxcXCJHcmFuZGlzXFxcIixcXFwiRkZEMkI3XFxcIjpcXFwiUm9tYW50aWNcXFwiLFxcXCJGRkQxRENcXFwiOlxcXCJQYXN0ZWwgUGlua1xcXCIsXFxcIkZGQ0Q4Q1xcXCI6XFxcIkNoYXJkb25uYXlcXFwiLFxcXCJGRkNDOTlcXFwiOlxcXCJQZWFjaCBPcmFuZ2VcXFwiLFxcXCJGRkNDNUNcXFwiOlxcXCJHb2xkZW4gVGFpbm9pXFxcIixcXFwiRkZDQzMzXFxcIjpcXFwiU3VuZ2xvd1xcXCIsXFxcIkZGQ0JBNFxcXCI6XFxcIkZsZXNoXFxcIixcXFwiRkZDOTAxXFxcIjpcXFwiU3VwZXJub3ZhXFxcIixcXFwiRkZDM0MwXFxcIjpcXFwiWW91ciBQaW5rXFxcIixcXFwiRkZDMEE4XFxcIjpcXFwiV2F4IEZsb3dlclxcXCIsXFxcIkZGQkYwMFxcXCI6XFxcIkFtYmVyXFxcIixcXFwiRkZCRDVGXFxcIjpcXFwiS29yb21pa29cXFwiLFxcXCJGRkJBMDBcXFwiOlxcXCJTZWxlY3RpdmUgWWVsbG93XFxcIixcXFwiRkZCOTdCXFxcIjpcXFwiTWFjYXJvbmkgYW5kIENoZWVzZVxcXCIsXFxcIkZGQjdENVxcXCI6XFxcIkNvdHRvbiBDYW5keVxcXCIsXFxcIkZGQjU1NVxcXCI6XFxcIlRleGFzIFJvc2VcXFwiLFxcXCJGRkIzMUZcXFwiOlxcXCJNeSBTaW5cXFwiLFxcXCJGRkIxQjNcXFwiOlxcXCJTdW5kb3duXFxcIixcXFwiRkZCMEFDXFxcIjpcXFwiQ29ybmZsb3dlciBMaWxhY1xcXCIsXFxcIkZGQUU0MlxcXCI6XFxcIlllbGxvdyBPcmFuZ2VcXFwiLFxcXCJGRkFCODFcXFwiOlxcXCJIaXQgUGlua1xcXCIsXFxcIkZGQTZDOVxcXCI6XFxcIkNhcm5hdGlvbiBQaW5rXFxcIixcXFwiRkZBMTk0XFxcIjpcXFwiTW9uYSBMaXNhXFxcIixcXFwiRkZBMDAwXFxcIjpcXFwiT3JhbmdlIFBlZWxcXFwiLFxcXCJGRjlFMkNcXFwiOlxcXCJTdW5zaGFkZVxcXCIsXFxcIkZGOTk4MFxcXCI6XFxcIlZpdmlkIFRhbmdlcmluZVxcXCIsXFxcIkZGOTk2NlxcXCI6XFxcIkF0b21pYyBUYW5nZXJpbmVcXFwiLFxcXCJGRjk5MzNcXFwiOlxcXCJOZW9uIENhcnJvdFxcXCIsXFxcIkZGOTFBNFxcXCI6XFxcIlBpbmsgU2FsbW9uXFxcIixcXFwiRkY5MTBGXFxcIjpcXFwiV2VzdCBTaWRlXFxcIixcXFwiRkY5MDAwXFxcIjpcXFwiUGl6YXp6XFxcIixcXFwiRkY3RjAwXFxcIjpcXFwiRmx1c2ggT3JhbmdlXFxcIixcXFwiRkY3RDA3XFxcIjpcXFwiRmxhbWVuY29cXFwiLFxcXCJGRjc1MThcXFwiOlxcXCJQdW1wa2luXFxcIixcXFwiRkY3MDM0XFxcIjpcXFwiQnVybmluZyBPcmFuZ2VcXFwiLFxcXCJGRjZGRkZcXFwiOlxcXCJCbHVzaCBQaW5rXFxcIixcXFwiRkY2QjUzXFxcIjpcXFwiUGVyc2ltbW9uXFxcIixcXFwiRkY2ODFGXFxcIjpcXFwiT3JhbmdlXFxcIixcXFwiRkY2NkZGXFxcIjpcXFwiUGluayBGbGFtaW5nb1xcXCIsXFxcIkZGNjYwMFxcXCI6XFxcIkJsYXplIE9yYW5nZVxcXCIsXFxcIkZGNjAzN1xcXCI6XFxcIk91dHJhZ2VvdXMgT3JhbmdlXFxcIixcXFwiRkY0RjAwXFxcIjpcXFwiSW50ZXJuYXRpb25hbCBPcmFuZ2VcXFwiLFxcXCJGRjREMDBcXFwiOlxcXCJWZXJtaWxpb25cXFwiLFxcXCJGRjQwNDBcXFwiOlxcXCJDb3JhbCBSZWRcXFwiLFxcXCJGRjNGMzRcXFwiOlxcXCJSZWQgT3JhbmdlXFxcIixcXFwiRkYzNTVFXFxcIjpcXFwiUmFkaWNhbCBSZWRcXFwiLFxcXCJGRjMzQ0NcXFwiOlxcXCJSYXp6bGUgRGF6emxlIFJvc2VcXFwiLFxcXCJGRjMzOTlcXFwiOlxcXCJXaWxkIFN0cmF3YmVycnlcXFwiLFxcXCJGRjI0MDBcXFwiOlxcXCJTY2FybGV0XFxcIixcXFwiRkYwMENDXFxcIjpcXFwiUHVycGxlIFBpenphenpcXFwiLFxcXCJGRjAwN0ZcXFwiOlxcXCJSb3NlXFxcIixcXFwiRkVGQ0VEXFxcIjpcXFwiT3JhbmdlIFdoaXRlXFxcIixcXFwiRkVGOUUzXFxcIjpcXFwiT2ZmIFllbGxvd1xcXCIsXFxcIkZFRjhGRlxcXCI6XFxcIldoaXRlIFBvaW50ZXJcXFwiLFxcXCJGRUY4RTJcXFwiOlxcXCJTb2xpdGFpcmVcXFwiLFxcXCJGRUY3REVcXFwiOlxcXCJIYWxmIER1dGNoIFdoaXRlXFxcIixcXFwiRkVGNUYxXFxcIjpcXFwiUHJvdmluY2lhbCBQaW5rXFxcIixcXFwiRkVGNEY4XFxcIjpcXFwiV2lzcCBQaW5rXFxcIixcXFwiRkVGNERCXFxcIjpcXFwiSGFsZiBTcGFuaXNoIFdoaXRlXFxcIixcXFwiRkVGNENDXFxcIjpcXFwiUGlwaVxcXCIsXFxcIkZFRjNEOFxcXCI6XFxcIkJsZWFjaCBXaGl0ZVxcXCIsXFxcIkZFRjJDN1xcXCI6XFxcIkJlZXN3YXhcXFwiLFxcXCJGRUYwRUNcXFwiOlxcXCJCcmlkZXNtYWlkXFxcIixcXFwiRkVFRkNFXFxcIjpcXFwiT2FzaXNcXFwiLFxcXCJGRUVCRjNcXFwiOlxcXCJSZW15XFxcIixcXFwiRkVFNUFDXFxcIjpcXFwiQ2FwZSBIb25leVxcXCIsXFxcIkZFREI4RFxcXCI6XFxcIlNhbG9taWVcXFwiLFxcXCJGRUQ4NURcXFwiOlxcXCJEYW5kZWxpb25cXFwiLFxcXCJGRUQzM0NcXFwiOlxcXCJCcmlnaHQgU3VuXFxcIixcXFwiRkVCQUFEXFxcIjpcXFwiTWVsb25cXFwiLFxcXCJGRUE5MDRcXFwiOlxcXCJZZWxsb3cgU2VhXFxcIixcXFwiRkU5RDA0XFxcIjpcXFwiQ2FsaWZvcm5pYVxcXCIsXFxcIkZFNkY1RVxcXCI6XFxcIkJpdHRlcnN3ZWV0XFxcIixcXFwiRkU0QzQwXFxcIjpcXFwiU3Vuc2V0IE9yYW5nZVxcXCIsXFxcIkZFMjhBMlxcXCI6XFxcIlBlcnNpYW4gUm9zZVxcXCIsXFxcIkZERkZENVxcXCI6XFxcIkN1bXVsdXNcXFwiLFxcXCJGREZFQjhcXFwiOlxcXCJQYWxlIFByaW1cXFwiLFxcXCJGREY3QURcXFwiOlxcXCJEcm92ZXJcXFwiLFxcXCJGREY2RDNcXFwiOlxcXCJIYWxmIENvbG9uaWFsIFdoaXRlXFxcIixcXFwiRkRFOTEwXFxcIjpcXFwiTGVtb25cXFwiLFxcXCJGREUyOTVcXFwiOlxcXCJHb2xkZW4gR2xvd1xcXCIsXFxcIkZERTFEQ1xcXCI6XFxcIkNpbmRlcmVsbGFcXFwiLFxcXCJGREQ3RTRcXFwiOlxcXCJQaWcgUGlua1xcXCIsXFxcIkZERDVCMVxcXCI6XFxcIkxpZ2h0IEFwcmljb3RcXFwiLFxcXCJGRDlGQTJcXFwiOlxcXCJTd2VldCBQaW5rXFxcIixcXFwiRkQ3QzA3XFxcIjpcXFwiU29yYnVzXFxcIixcXFwiRkQ3QjMzXFxcIjpcXFwiQ3J1c3RhXFxcIixcXFwiRkQ1Qjc4XFxcIjpcXFwiV2lsZCBXYXRlcm1lbG9uXFxcIixcXFwiRkQwRTM1XFxcIjpcXFwiVG9yY2ggUmVkXFxcIixcXFwiRkNGRkY5XFxcIjpcXFwiQ2VyYW1pY1xcXCIsXFxcIkZDRkZFN1xcXCI6XFxcIkNoaW5hIEl2b3J5XFxcIixcXFwiRkNGRURBXFxcIjpcXFwiTW9vbiBHbG93XFxcIixcXFwiRkNGQkYzXFxcIjpcXFwiQmlhbmNhXFxcIixcXFwiRkNGOEY3XFxcIjpcXFwiVmlzdGEgV2hpdGVcXFwiLFxcXCJGQ0Y0RENcXFwiOlxcXCJQZWFybCBMdXN0YVxcXCIsXFxcIkZDRjREMFxcXCI6XFxcIkRvdWJsZSBQZWFybCBMdXN0YVxcXCIsXFxcIkZDREE5OFxcXCI6XFxcIkNoZXJva2VlXFxcIixcXFwiRkNEOTE3XFxcIjpcXFwiQ2FuZGxlbGlnaHRcXFwiLFxcXCJGQ0MwMUVcXFwiOlxcXCJMaWdodG5pbmcgWWVsbG93XFxcIixcXFwiRkM5QzFEXFxcIjpcXFwiVHJlZSBQb3BweVxcXCIsXFxcIkZDODBBNVxcXCI6XFxcIlRpY2tsZSBNZSBQaW5rXFxcIixcXFwiRkMwRkMwXFxcIjpcXFwiU2hvY2tpbmcgUGlua1xcXCIsXFxcIkZCRkZCQVxcXCI6XFxcIlNoYWxpbWFyXFxcIixcXFwiRkJGOUY5XFxcIjpcXFwiSGludCBvZiBSZWRcXFwiLFxcXCJGQkVDNURcXFwiOlxcXCJDYW5keSBDb3JuXFxcIixcXFwiRkJFQThDXFxcIjpcXFwiU3dlZXQgQ29yblxcXCIsXFxcIkZCRTk2Q1xcXCI6XFxcIkZlc3RpdmFsXFxcIixcXFwiRkJFODcwXFxcIjpcXFwiTWFyaWdvbGQgWWVsbG93XFxcIixcXFwiRkJFN0IyXFxcIjpcXFwiQmFuYW5hIE1hbmlhXFxcIixcXFwiRkJDRUIxXFxcIjpcXFwiQXByaWNvdCBQZWFjaFxcXCIsXFxcIkZCQ0NFN1xcXCI6XFxcIkNsYXNzaWMgUm9zZVxcXCIsXFxcIkZCQkVEQVxcXCI6XFxcIkN1cGlkXFxcIixcXFwiRkJCMkEzXFxcIjpcXFwiUm9zZSBCdWRcXFwiLFxcXCJGQkFFRDJcXFwiOlxcXCJMYXZlbmRlciBQaW5rXFxcIixcXFwiRkJBQzEzXFxcIjpcXFwiU3VuXFxcIixcXFwiRkJBMTI5XFxcIjpcXFwiU2VhIEJ1Y2t0aG9yblxcXCIsXFxcIkZCQTBFM1xcXCI6XFxcIkxhdmVuZGVyIFJvc2VcXFwiLFxcXCJGQjg5ODlcXFwiOlxcXCJHZXJhbGRpbmVcXFwiLFxcXCJGQjYwN0ZcXFwiOlxcXCJCcmluayBQaW5rXFxcIixcXFwiRkFGRkE0XFxcIjpcXFwiTWlsYW5cXFwiLFxcXCJGQUZERTRcXFwiOlxcXCJIaW50IG9mIFllbGxvd1xcXCIsXFxcIkZBRkFGQVxcXCI6XFxcIkFsYWJhc3RlclxcXCIsXFxcIkZBRjdENlxcXCI6XFxcIkNpdHJpbmUgV2hpdGVcXFwiLFxcXCJGQUYzRjBcXFwiOlxcXCJGYW50YXN5XFxcIixcXFwiRkFFQ0NDXFxcIjpcXFwiQ2hhbXBhZ25lXFxcIixcXFwiRkFFQUI5XFxcIjpcXFwiQXN0cmFcXFwiLFxcXCJGQUU2MDBcXFwiOlxcXCJUdXJib1xcXCIsXFxcIkZBREZBRFxcXCI6XFxcIlBlYWNoIFllbGxvd1xcXCIsXFxcIkZBRDNBMlxcXCI6XFxcIkNvcnZldHRlXFxcIixcXFwiRkE5RDVBXFxcIjpcXFwiVGFuIEhpZGVcXFwiLFxcXCJGQTc4MTRcXFwiOlxcXCJFY3N0YXN5XFxcIixcXFwiRjlGRkY2XFxcIjpcXFwiU3VnYXIgQ2FuZVxcXCIsXFxcIkY5RkY4QlxcXCI6XFxcIkRvbGx5XFxcIixcXFwiRjlGOEU0XFxcIjpcXFwiUnVtIFN3aXp6bGVcXFwiLFxcXCJGOUVBRjNcXFwiOlxcXCJBbW91clxcXCIsXFxcIkY5RTY2M1xcXCI6XFxcIlBvcnRpY2FcXFwiLFxcXCJGOUU0QkNcXFwiOlxcXCJEYWlyeSBDcmVhbVxcXCIsXFxcIkY5RTBFRFxcXCI6XFxcIkNhcm91c2VsIFBpbmtcXFwiLFxcXCJGOUJGNThcXFwiOlxcXCJTYWZmcm9uIE1hbmdvXFxcIixcXFwiRjk1QTYxXFxcIjpcXFwiQ2FybmF0aW9uXFxcIixcXFwiRjhGREQzXFxcIjpcXFwiTWltb3NhXFxcIixcXFwiRjhGQUNEXFxcIjpcXFwiQ29ybiBGaWVsZFxcXCIsXFxcIkY4Rjk5Q1xcXCI6XFxcIlRleGFzXFxcIixcXFwiRjhGOEY3XFxcIjpcXFwiRGVzZXJ0IFN0b3JtXFxcIixcXFwiRjhGN0ZDXFxcIjpcXFwiV2hpdGUgTGlsYWNcXFwiLFxcXCJGOEY3RENcXFwiOlxcXCJDb2NvbnV0IENyZWFtXFxcIixcXFwiRjhGNkYxXFxcIjpcXFwiU3ByaW5nIFdvb2RcXFwiLFxcXCJGOEY0RkZcXFwiOlxcXCJNYWdub2xpYVxcXCIsXFxcIkY4RjBFOFxcXCI6XFxcIldoaXRlIExpbmVuXFxcIixcXFwiRjhFNEJGXFxcIjpcXFwiR2l2cnlcXFwiLFxcXCJGOERENUNcXFwiOlxcXCJFbmVyZ3kgWWVsbG93XFxcIixcXFwiRjhEQjlEXFxcIjpcXFwiTWFyemlwYW5cXFwiLFxcXCJGOEQ5RTlcXFwiOlxcXCJDaGVydWJcXFwiLFxcXCJGOEMzREZcXFwiOlxcXCJDaGFudGlsbHlcXFwiLFxcXCJGOEI4NTNcXFwiOlxcXCJDYXNhYmxhbmNhXFxcIixcXFwiRjdGQUY3XFxcIjpcXFwiU25vdyBEcmlmdFxcXCIsXFxcIkY3RjVGQVxcXCI6XFxcIldoaXNwZXJcXFwiLFxcXCJGN0YyRTFcXFwiOlxcXCJRdWFydGVyIFNwYW5pc2ggV2hpdGVcXFwiLFxcXCJGN0RCRTZcXFwiOlxcXCJXZSBQZWVwXFxcIixcXFwiRjdDOERBXFxcIjpcXFwiQXphbGVhXFxcIixcXFwiRjdCNjY4XFxcIjpcXFwiUmFqYWhcXFwiLFxcXCJGNzdGQkVcXFwiOlxcXCJQZXJzaWFuIFBpbmtcXFwiLFxcXCJGNzc3MDNcXFwiOlxcXCJDaGlsZWFuIEZpcmVcXFwiLFxcXCJGNzQ2OEFcXFwiOlxcXCJWaW9sZXQgUmVkXFxcIixcXFwiRjZGRkRDXFxcIjpcXFwiU3ByaW5nIFN1blxcXCIsXFxcIkY2RjdGN1xcXCI6XFxcIkJsYWNrIEhhemVcXFwiLFxcXCJGNkYwRTZcXFwiOlxcXCJNZXJpbm9cXFwiLFxcXCJGNkE0QzlcXFwiOlxcXCJJbGx1c2lvblxcXCIsXFxcIkY2NTNBNlxcXCI6XFxcIkJyaWxsaWFudCBSb3NlXFxcIixcXFwiRjY0QThBXFxcIjpcXFwiRnJlbmNoIFJvc2VcXFwiLFxcXCJGNUZGQkVcXFwiOlxcXCJBdXN0cmFsaWFuIE1pbnRcXFwiLFxcXCJGNUZCM0RcXFwiOlxcXCJHb2xkZW4gRml6elxcXCIsXFxcIkY1RjNFNVxcXCI6XFxcIkVjcnUgV2hpdGVcXFwiLFxcXCJGNUVERUZcXFwiOlxcXCJTb2Z0IFBlYWNoXFxcIixcXFwiRjVFOUQzXFxcIjpcXFwiQWxiZXNjZW50IFdoaXRlXFxcIixcXFwiRjVFN0UyXFxcIjpcXFwiUG90IFBvdXJyaVxcXCIsXFxcIkY1RTdBMlxcXCI6XFxcIlNhbmR3aXNwXFxcIixcXFwiRjVENUEwXFxcIjpcXFwiTWFpemVcXFwiLFxcXCJGNUM5OTlcXFwiOlxcXCJNYW5oYXR0YW5cXFwiLFxcXCJGNUM4NUNcXFwiOlxcXCJDcmVhbSBDYW5cXFwiLFxcXCJGNTc1ODRcXFwiOlxcXCJGcm9seVxcXCIsXFxcIkY0RjhGRlxcXCI6XFxcIlppcmNvblxcXCIsXFxcIkY0RjRGNFxcXCI6XFxcIldpbGQgU2FuZFxcXCIsXFxcIkY0RjJFRVxcXCI6XFxcIlBhbXBhc1xcXCIsXFxcIkY0RUJEM1xcXCI6XFxcIkphbm5hXFxcIixcXFwiRjREODFDXFxcIjpcXFwiUmlwZSBMZW1vblxcXCIsXFxcIkY0QzQzMFxcXCI6XFxcIlNhZmZyb25cXFwiLFxcXCJGNDAwQTFcXFwiOlxcXCJIb2xseXdvb2QgQ2VyaXNlXFxcIixcXFwiRjNGRkQ4XFxcIjpcXFwiQ2FybGFcXFwiLFxcXCJGM0ZCRDRcXFwiOlxcXCJPcmlub2NvXFxcIixcXFwiRjNGQjYyXFxcIjpcXFwiQ2FuYXJ5XFxcIixcXFwiRjNFRENGXFxcIjpcXFwiV2hlYXRmaWVsZFxcXCIsXFxcIkYzRTlFNVxcXCI6XFxcIkRhd24gUGlua1xcXCIsXFxcIkYzRTdCQlxcXCI6XFxcIlNpZGVjYXJcXFwiLFxcXCJGM0Q5REZcXFwiOlxcXCJWYW5pbGxhIEljZVxcXCIsXFxcIkYzRDY5RFxcXCI6XFxcIk5ldyBPcmxlYW5zXFxcIixcXFwiRjNBRDE2XFxcIjpcXFwiQnV0dGVyY3VwXFxcIixcXFwiRjM0NzIzXFxcIjpcXFwiUG9tZWdyYW5hdGVcXFwiLFxcXCJGMkZBRkFcXFwiOlxcXCJCbGFjayBTcXVlZXplXFxcIixcXFwiRjJGMkYyXFxcIjpcXFwiQ29uY3JldGVcXFwiLFxcXCJGMkMzQjJcXFwiOlxcXCJNYW5keXMgUGlua1xcXCIsXFxcIkYyODUwMFxcXCI6XFxcIlRhbmdlcmluZVxcXCIsXFxcIkYyNTUyQVxcXCI6XFxcIkZsYW1pbmdvXFxcIixcXFwiRjFGRkM4XFxcIjpcXFwiQ2hpZmZvblxcXCIsXFxcIkYxRkZBRFxcXCI6XFxcIlRpZGFsXFxcIixcXFwiRjFGN0YyXFxcIjpcXFwiU2FsdHBhblxcXCIsXFxcIkYxRjFGMVxcXCI6XFxcIlNlYXNoZWxsXFxcIixcXFwiRjFFRUMxXFxcIjpcXFwiTWludCBKdWxlcFxcXCIsXFxcIkYxRTlGRlxcXCI6XFxcIkJsdWUgQ2hhbGtcXFwiLFxcXCJGMUU5RDJcXFwiOlxcXCJQYXJjaG1lbnRcXFwiLFxcXCJGMUU3ODhcXFwiOlxcXCJTYWhhcmEgU2FuZFxcXCIsXFxcIkYxOUJBQlxcXCI6XFxcIldld2FrXFxcIixcXFwiRjE4MjAwXFxcIjpcXFwiR29sZCBEcm9wXFxcIixcXFwiRjBGQ0VBXFxcIjpcXFwiRmV0YVxcXCIsXFxcIkYwRUVGRlxcXCI6XFxcIlRpdGFuIFdoaXRlXFxcIixcXFwiRjBFRUZEXFxcIjpcXFwiU2VsYWdvXFxcIixcXFwiRjBFMkVDXFxcIjpcXFwiUHJpbVxcXCIsXFxcIkYwREM4MlxcXCI6XFxcIkJ1ZmZcXFwiLFxcXCJGMERCN0RcXFwiOlxcXCJHb2xkZW4gU2FuZFxcXCIsXFxcIkYwRDUyRFxcXCI6XFxcIkdvbGRlbiBEcmVhbVxcXCIsXFxcIkYwOTFBOVxcXCI6XFxcIk1hdXZlbG91c1xcXCIsXFxcIkVGRjJGM1xcXCI6XFxcIlBvcmNlbGFpblxcXCIsXFxcIkVGRUZFRlxcXCI6XFxcIkdhbGxlcnlcXFwiLFxcXCJFRjg2M0ZcXFwiOlxcXCJKYWZmYVxcXCIsXFxcIkVFRkZFMlxcXCI6XFxcIlJpY2UgRmxvd2VyXFxcIixcXFwiRUVGRjlBXFxcIjpcXFwiSm9ucXVpbFxcXCIsXFxcIkVFRkRGRlxcXCI6XFxcIlR3aWxpZ2h0IEJsdWVcXFwiLFxcXCJFRUY2RjdcXFwiOlxcXCJDYXRza2lsbCBXaGl0ZVxcXCIsXFxcIkVFRjRERVxcXCI6XFxcIkxvYWZlclxcXCIsXFxcIkVFRjNDM1xcXCI6XFxcIlR1c2tcXFwiLFxcXCJFRUYwRjNcXFwiOlxcXCJBdGhlbnMgR3JheVxcXCIsXFxcIkVFRjBDOFxcXCI6XFxcIlRhaHVuYSBTYW5kc1xcXCIsXFxcIkVFRUY3OFxcXCI6XFxcIk1hbnpcXFwiLFxcXCJFRUVFRThcXFwiOlxcXCJDYXJhcnJhXFxcIixcXFwiRUVFM0FEXFxcIjpcXFwiRG91YmxlIENvbG9uaWFsIFdoaXRlXFxcIixcXFwiRUVERURBXFxcIjpcXFwiQml6YXJyZVxcXCIsXFxcIkVFREM4MlxcXCI6XFxcIkZsYXhcXFwiLFxcXCJFRUQ5QzRcXFwiOlxcXCJBbG1vbmRcXFwiLFxcXCJFRUQ3OTRcXFwiOlxcXCJDaGFsa3lcXFwiLFxcXCJFRUMxQkVcXFwiOlxcXCJCZWF1dHkgQnVzaFxcXCIsXFxcIkVERkM4NFxcXCI6XFxcIkhvbmV5c3Vja2xlXFxcIixcXFwiRURGOUYxXFxcIjpcXFwiTmFydmlrXFxcIixcXFwiRURGNkZGXFxcIjpcXFwiWnVtdGhvclxcXCIsXFxcIkVERjVGNVxcXCI6XFxcIkFxdWEgSGF6ZVxcXCIsXFxcIkVERjVERFxcXCI6XFxcIkZyb3N0XFxcIixcXFwiRURFQTk5XFxcIjpcXFwiUHJpbXJvc2VcXFwiLFxcXCJFRERDQjFcXFwiOlxcXCJDaGFtb2lzXFxcIixcXFwiRURDREFCXFxcIjpcXFwiUGFuY2hvXFxcIixcXFwiRURDOUFGXFxcIjpcXFwiRGVzZXJ0IFNhbmRcXFwiLFxcXCJFREIzODFcXFwiOlxcXCJUYWNhb1xcXCIsXFxcIkVEOTg5RVxcXCI6XFxcIlNlYSBQaW5rXFxcIixcXFwiRUQ5MTIxXFxcIjpcXFwiQ2Fycm90IE9yYW5nZVxcXCIsXFxcIkVEN0ExQ1xcXCI6XFxcIlRhbmdvXFxcIixcXFwiRUQwQTNGXFxcIjpcXFwiUmVkIFJpYmJvblxcXCIsXFxcIkVDRjI0NVxcXCI6XFxcIlN0YXJzaGlwXFxcIixcXFwiRUNFQkNFXFxcIjpcXFwiQXRocyBTcGVjaWFsXFxcIixcXFwiRUNFQkJEXFxcIjpcXFwiRmFsbCBHcmVlblxcXCIsXFxcIkVDRTA5MFxcXCI6XFxcIldpbGQgUmljZVxcXCIsXFxcIkVDQ0RCOVxcXCI6XFxcIkp1c3QgUmlnaHRcXFwiLFxcXCJFQ0M3RUVcXFwiOlxcXCJGcmVuY2ggTGlsYWNcXFwiLFxcXCJFQ0M1NEVcXFwiOlxcXCJSb25jaGlcXFwiLFxcXCJFQ0E5MjdcXFwiOlxcXCJGdWVsIFllbGxvd1xcXCIsXFxcIkVCQzJBRlxcXCI6XFxcIlppbm53YWxkaXRlXFxcIixcXFwiRUI5MzczXFxcIjpcXFwiQXByaWNvdFxcXCIsXFxcIkVBRkZGRVxcXCI6XFxcIkRld1xcXCIsXFxcIkVBRjlGNVxcXCI6XFxcIkFxdWEgU3ByaW5nXFxcIixcXFwiRUFGNkZGXFxcIjpcXFwiU29saXR1ZGVcXFwiLFxcXCJFQUY2RUVcXFwiOlxcXCJQYW5hY2hlXFxcIixcXFwiRUFFOEQ0XFxcIjpcXFwiV2hpdGUgUm9ja1xcXCIsXFxcIkVBREFCOFxcXCI6XFxcIlJhZmZpYVxcXCIsXFxcIkVBQzY3NFxcXCI6XFxcIlJvYiBSb3lcXFwiLFxcXCJFQUIzM0JcXFwiOlxcXCJUdWxpcCBUcmVlXFxcIixcXFwiRUFBRTY5XFxcIjpcXFwiUG9yc2NoZVxcXCIsXFxcIkVBODhBOFxcXCI6XFxcIkNhcmlzc21hXFxcIixcXFwiRTlGRkZEXFxcIjpcXFwiQ2xlYXIgRGF5XFxcIixcXFwiRTlGOEVEXFxcIjpcXFwiT3R0b21hblxcXCIsXFxcIkU5RTNFM1xcXCI6XFxcIkViYlxcXCIsXFxcIkU5RDc1QVxcXCI6XFxcIkNvbmZldHRpXFxcIixcXFwiRTlDRUNEXFxcIjpcXFwiT3lzdGVyIFBpbmtcXFwiLFxcXCJFOTdDMDdcXFwiOlxcXCJUYWhpdGkgR29sZFxcXCIsXFxcIkU5NzQ1MVxcXCI6XFxcIkJ1cm50IFNpZW5uYVxcXCIsXFxcIkU5NkUwMFxcXCI6XFxcIkNsZW1lbnRpbmVcXFwiLFxcXCJFOEY1RjJcXFwiOlxcXCJBcXVhIFNxdWVlemVcXFwiLFxcXCJFOEYyRUJcXFwiOlxcXCJHaW5cXFwiLFxcXCJFOEYxRDRcXFwiOlxcXCJDaHJvbWUgV2hpdGVcXFwiLFxcXCJFOEVCRTBcXFwiOlxcXCJHcmVlbiBXaGl0ZVxcXCIsXFxcIkU4RTBENVxcXCI6XFxcIlBlYXJsIEJ1c2hcXFwiLFxcXCJFOEI5QjNcXFwiOlxcXCJTaGlsb1xcXCIsXFxcIkU4OTkyOFxcXCI6XFxcIkZpcmUgQnVzaFxcXCIsXFxcIkU3RkVGRlxcXCI6XFxcIkJ1YmJsZXNcXFwiLFxcXCJFN0Y4RkZcXFwiOlxcXCJMaWx5IFdoaXRlXFxcIixcXFwiRTdFQ0U2XFxcIjpcXFwiR3JheSBOdXJzZVxcXCIsXFxcIkU3Q0Q4Q1xcXCI6XFxcIlB1dHR5XFxcIixcXFwiRTdCRjA1XFxcIjpcXFwiQ29yblxcXCIsXFxcIkU3QkNCNFxcXCI6XFxcIlJvc2UgRm9nXFxcIixcXFwiRTc5RkM0XFxcIjpcXFwiS29iaVxcXCIsXFxcIkU3OUY4Q1xcXCI6XFxcIlRvbnlzIFBpbmtcXFwiLFxcXCJFNzczMEFcXFwiOlxcXCJDaHJpc3RpbmVcXFwiLFxcXCJFNzcyMDBcXFwiOlxcXCJNYW5nbyBUYW5nb1xcXCIsXFxcIkU2RkZGRlxcXCI6XFxcIlRyYW5xdWlsXFxcIixcXFwiRTZGRkU5XFxcIjpcXFwiSGludCBvZiBHcmVlblxcXCIsXFxcIkU2RjhGM1xcXCI6XFxcIk9mZiBHcmVlblxcXCIsXFxcIkU2RjJFQVxcXCI6XFxcIkhhcnBcXFwiLFxcXCJFNkU0RDRcXFwiOlxcXCJTYXRpbiBMaW5lblxcXCIsXFxcIkU2RDdCOVxcXCI6XFxcIkRvdWJsZSBTcGFuaXNoIFdoaXRlXFxcIixcXFwiRTZCRUE1XFxcIjpcXFwiQ2FzaG1lcmVcXFwiLFxcXCJFNkJFOEFcXFwiOlxcXCJHb2xkIFNhbmRcXFwiLFxcXCJFNjRFMDNcXFwiOlxcXCJUcmluaWRhZFxcXCIsXFxcIkU1RjlGNlxcXCI6XFxcIlBvbGFyXFxcIixcXFwiRTVFNUU1XFxcIjpcXFwiTWVyY3VyeVxcXCIsXFxcIkU1RTBFMVxcXCI6XFxcIkJvbiBKb3VyXFxcIixcXFwiRTVEOEFGXFxcIjpcXFwiSGFtcHRvblxcXCIsXFxcIkU1RDdCRFxcXCI6XFxcIlN0YXJrIFdoaXRlXFxcIixcXFwiRTVDQ0M5XFxcIjpcXFwiRHVzdCBTdG9ybVxcXCIsXFxcIkU1ODQxQlxcXCI6XFxcIlplc3RcXFwiLFxcXCJFNTJCNTBcXFwiOlxcXCJBbWFyYW50aFxcXCIsXFxcIkU0RkZEMVxcXCI6XFxcIlNub3cgRmx1cnJ5XFxcIixcXFwiRTRGNkU3XFxcIjpcXFwiRnJvc3RlZVxcXCIsXFxcIkU0RDY5QlxcXCI6XFxcIlpvbWJpZVxcXCIsXFxcIkU0RDVCN1xcXCI6XFxcIkdyYWluIEJyb3duXFxcIixcXFwiRTRENDIyXFxcIjpcXFwiU3VuZmxvd2VyXFxcIixcXFwiRTREMUMwXFxcIjpcXFwiQm9uZVxcXCIsXFxcIkU0Q0ZERVxcXCI6XFxcIlR3aWxpZ2h0XFxcIixcXFwiRTRDMkQ1XFxcIjpcXFwiTWVsYW5pZVxcXCIsXFxcIkU0OUIwRlxcXCI6XFxcIkdhbWJvZ2VcXFwiLFxcXCJFNDc2OThcXFwiOlxcXCJEZWVwIEJsdXNoXFxcIixcXFwiRTNGOTg4XFxcIjpcXFwiTWluZGFyb1xcXCIsXFxcIkUzRjVFMVxcXCI6XFxcIlBlcHBlcm1pbnRcXFwiLFxcXCJFM0JFQkVcXFwiOlxcXCJDYXZlcm4gUGlua1xcXCIsXFxcIkUzNDIzNFxcXCI6XFxcIkNpbm5hYmFyXFxcIixcXFwiRTMyNjM2XFxcIjpcXFwiQWxpemFyaW4gQ3JpbXNvblxcXCIsXFxcIkUzMEI1Q1xcXCI6XFxcIlJhenptYXRhenpcXFwiLFxcXCJFMkYzRUNcXFwiOlxcXCJBcHBsZSBHcmVlblxcXCIsXFxcIkUyRUJFRFxcXCI6XFxcIk15c3RpY1xcXCIsXFxcIkUyRDhFRFxcXCI6XFxcIlNudWZmXFxcIixcXFwiRTI5Q0QyXFxcIjpcXFwiTGlnaHQgT3JjaGlkXFxcIixcXFwiRTI5NDE4XFxcIjpcXFwiRGl4aWVcXFwiLFxcXCJFMjkyQzBcXFwiOlxcXCJTaG9ja2luZ1xcXCIsXFxcIkUyODkxM1xcXCI6XFxcIkdvbGRlbiBCZWxsXFxcIixcXFwiRTI3MjVCXFxcIjpcXFwiVGVycmFjb3R0YVxcXCIsXFxcIkUyNTQ2NVxcXCI6XFxcIk1hbmR5XFxcIixcXFwiRTFGNkU4XFxcIjpcXFwiVGFyYVxcXCIsXFxcIkUxRUFENFxcXCI6XFxcIktpZG5hcHBlclxcXCIsXFxcIkUxRTZENlxcXCI6XFxcIlBlcmlnbGFjaWFsIEJsdWVcXFwiLFxcXCJFMUMwQzhcXFwiOlxcXCJQaW5rIEZsYXJlXFxcIixcXFwiRTFCQzY0XFxcIjpcXFwiRXF1YXRvclxcXCIsXFxcIkUxNjg2NVxcXCI6XFxcIlN1bmdsb1xcXCIsXFxcIkUwQzA5NVxcXCI6XFxcIkNhbGljb1xcXCIsXFxcIkUwQjk3NFxcXCI6XFxcIkhhcnZlc3QgR29sZFxcXCIsXFxcIkUwQjY0NlxcXCI6XFxcIkFuemFjXFxcIixcXFwiRTBCMEZGXFxcIjpcXFwiTWF1dmVcXFwiLFxcXCJERkZGMDBcXFwiOlxcXCJDaGFydHJldXNlIFllbGxvd1xcXCIsXFxcIkRGRUNEQVxcXCI6XFxcIldpbGxvdyBCcm9va1xcXCIsXFxcIkRGQ0ZEQlxcXCI6XFxcIkxvbGFcXFwiLFxcXCJERkNENkZcXFwiOlxcXCJDaGVuaW5cXFwiLFxcXCJERkJFNkZcXFwiOlxcXCJBcGFjaGVcXFwiLFxcXCJERjczRkZcXFwiOlxcXCJIZWxpb3Ryb3BlXFxcIixcXFwiREVGNUZGXFxcIjpcXFwiUGF0dGVucyBCbHVlXFxcIixcXFwiREVFNUMwXFxcIjpcXFwiQmVyeWwgR3JlZW5cXFwiLFxcXCJERUQ3MTdcXFwiOlxcXCJCYXJiZXJyeVxcXCIsXFxcIkRFRDRBNFxcXCI6XFxcIlNhcGxpbmdcXFwiLFxcXCJERUNCQzZcXFwiOlxcXCJXYWZlclxcXCIsXFxcIkRFQzE5NlxcXCI6XFxcIkJyYW5keVxcXCIsXFxcIkRFQkExM1xcXCI6XFxcIkdvbGQgVGlwc1xcXCIsXFxcIkRFQTY4MVxcXCI6XFxcIlR1bWJsZXdlZWRcXFwiLFxcXCJERTYzNjBcXFwiOlxcXCJSb21hblxcXCIsXFxcIkRFMzE2M1xcXCI6XFxcIkNlcmlzZSBSZWRcXFwiLFxcXCJEREY5RjFcXFwiOlxcXCJXaGl0ZSBJY2VcXFwiLFxcXCJEREQ2RDVcXFwiOlxcXCJTd2lzcyBDb2ZmZWVcXFwiLFxcXCJEQ0YwRUFcXFwiOlxcXCJTd2FucyBEb3duXFxcIixcXFwiRENFREI0XFxcIjpcXFwiQ2FwZXJcXFwiLFxcXCJEQ0REQ0NcXFwiOlxcXCJNb29uIE1pc3RcXFwiLFxcXCJEQ0Q5RDJcXFwiOlxcXCJXZXN0YXJcXFwiLFxcXCJEQ0Q3NDdcXFwiOlxcXCJXYXR0bGVcXFwiLFxcXCJEQ0I0QkNcXFwiOlxcXCJCbG9zc29tXFxcIixcXFwiRENCMjBDXFxcIjpcXFwiR2FsbGlhbm9cXFwiLFxcXCJEQzQzMzNcXFwiOlxcXCJQdW5jaFxcXCIsXFxcIkRCRkZGOFxcXCI6XFxcIkZyb3N0ZWQgTWludFxcXCIsXFxcIkRCREJEQlxcXCI6XFxcIkFsdG9cXFwiLFxcXCJEQjk5NUVcXFwiOlxcXCJEaSBTZXJyaWFcXFwiLFxcXCJEQjk2OTBcXFwiOlxcXCJQZXRpdGUgT3JjaGlkXFxcIixcXFwiREI1MDc5XFxcIjpcXFwiQ3JhbmJlcnJ5XFxcIixcXFwiREFGQUZGXFxcIjpcXFwiT3lzdGVyIEJheVxcXCIsXFxcIkRBRjRGMFxcXCI6XFxcIkljZWJlcmdcXFwiLFxcXCJEQUVDRDZcXFwiOlxcXCJaYW5haFxcXCIsXFxcIkRBOEE2N1xcXCI6XFxcIkNvcHBlcmZpZWxkXFxcIixcXFwiREE2QTQxXFxcIjpcXFwiUmVkIERhbWFza1xcXCIsXFxcIkRBNjMwNFxcXCI6XFxcIkJhbWJvb1xcXCIsXFxcIkRBNUIzOFxcXCI6XFxcIkZsYW1lIFBlYVxcXCIsXFxcIkRBMzI4N1xcXCI6XFxcIkNlcmlzZVxcXCIsXFxcIkQ5RjdGRlxcXCI6XFxcIk1hYmVsXFxcIixcXFwiRDlFNEY1XFxcIjpcXFwiTGluayBXYXRlclxcXCIsXFxcIkQ5RENDMVxcXCI6XFxcIlRhbmFcXFwiLFxcXCJEOUQ2Q0ZcXFwiOlxcXCJUaW1iZXJ3b2xmXFxcIixcXFwiRDlCOTlCXFxcIjpcXFwiQ2FtZW9cXFwiLFxcXCJEOTkzNzZcXFwiOlxcXCJCdXJuaW5nIFNhbmRcXFwiLFxcXCJEOTQ5NzJcXFwiOlxcXCJDYWJhcmV0XFxcIixcXFwiRDhGQ0ZBXFxcIjpcXFwiRm9hbVxcXCIsXFxcIkQ4QzJENVxcXCI6XFxcIk1hdmVyaWNrXFxcIixcXFwiRDg3QzYzXFxcIjpcXFwiSmFwb25pY2FcXFwiLFxcXCJEODQ0MzdcXFwiOlxcXCJWYWxlbmNpYVxcXCIsXFxcIkQ3RDBGRlxcXCI6XFxcIkZvZ1xcXCIsXFxcIkQ3QzQ5OFxcXCI6XFxcIlBhdmxvdmFcXFwiLFxcXCJENzgzN0ZcXFwiOlxcXCJOZXcgWW9yayBQaW5rXFxcIixcXFwiRDZGRkRCXFxcIjpcXFwiU25vd3kgTWludFxcXCIsXFxcIkQ2RDZEMVxcXCI6XFxcIlF1aWxsIEdyYXlcXFwiLFxcXCJENkNFRjZcXFwiOlxcXCJNb29uIFJha2VyXFxcIixcXFwiRDZDNTYyXFxcIjpcXFwiVGFjaGFcXFwiLFxcXCJENjkxODhcXFwiOlxcXCJNeSBQaW5rXFxcIixcXFwiRDVGNkUzXFxcIjpcXFwiR3Jhbm55IEFwcGxlXFxcIixcXFwiRDVEMTk1XFxcIjpcXFwiV2ludGVyIEhhemVsXFxcIixcXFwiRDU5QTZGXFxcIjpcXFwiV2hpc2tleVxcXCIsXFxcIkQ1OTFBNFxcXCI6XFxcIkNhbiBDYW5cXFwiLFxcXCJENTQ2MDBcXFwiOlxcXCJHcmVuYWRpZXJcXFwiLFxcXCJENEUyRkNcXFwiOlxcXCJIYXdrZXMgQmx1ZVxcXCIsXFxcIkQ0REZFMlxcXCI6XFxcIkdleXNlclxcXCIsXFxcIkQ0RDdEOVxcXCI6XFxcIklyb25cXFwiLFxcXCJENENEMTZcXFwiOlxcXCJCaXJkIEZsb3dlclxcXCIsXFxcIkQ0QzRBOFxcXCI6XFxcIkFrYXJvYVxcXCIsXFxcIkQ0QkY4RFxcXCI6XFxcIlN0cmF3XFxcIixcXFwiRDRCNkFGXFxcIjpcXFwiQ2xhbSBTaGVsbFxcXCIsXFxcIkQ0NzQ5NFxcXCI6XFxcIkNoYXJtXFxcIixcXFwiRDNDREM1XFxcIjpcXFwiU3dpcmxcXFwiLFxcXCJEM0NCQkFcXFwiOlxcXCJTaXNhbFxcXCIsXFxcIkQyRjhCMFxcXCI6XFxcIkdvc3NpcFxcXCIsXFxcIkQyRjZERVxcXCI6XFxcIkJsdWUgUm9tYW5jZVxcXCIsXFxcIkQyREE5N1xcXCI6XFxcIkRlY29cXFwiLFxcXCJEMjlFQUFcXFwiOlxcXCJDYXJleXMgUGlua1xcXCIsXFxcIkQyN0Q0NlxcXCI6XFxcIlJhdyBTaWVubmFcXFwiLFxcXCJEMUUyMzFcXFwiOlxcXCJQZWFyXFxcIixcXFwiRDFEMkREXFxcIjpcXFwiTWlzY2hrYVxcXCIsXFxcIkQxRDJDQVxcXCI6XFxcIkNlbGVzdGVcXFwiLFxcXCJEMUM2QjRcXFwiOlxcXCJTb2Z0IEFtYmVyXFxcIixcXFwiRDFCRUE4XFxcIjpcXFwiVmFuaWxsYVxcXCIsXFxcIkQxOEYxQlxcXCI6XFxcIkdlZWJ1bmdcXFwiLFxcXCJEMEYwQzBcXFwiOlxcXCJUZWEgR3JlZW5cXFwiLFxcXCJEMEMwRTVcXFwiOlxcXCJQcmVsdWRlXFxcIixcXFwiRDBCRUY4XFxcIjpcXFwiUGVyZnVtZVxcXCIsXFxcIkQwN0QxMlxcXCI6XFxcIk1ldGVvclxcXCIsXFxcIkQwNkRBMVxcXCI6XFxcIkhvcGJ1c2hcXFwiLFxcXCJEMDVGMDRcXFwiOlxcXCJSZWQgU3RhZ2VcXFwiLFxcXCJDRkZBRjRcXFwiOlxcXCJTY2FuZGFsXFxcIixcXFwiQ0ZGOUYzXFxcIjpcXFwiSHVtbWluZyBCaXJkXFxcIixcXFwiQ0ZFNUQyXFxcIjpcXFwiU3VyZiBDcmVzdFxcXCIsXFxcIkNGRENDRlxcXCI6XFxcIlRhc21hblxcXCIsXFxcIkNGQjUzQlxcXCI6XFxcIk9sZCBHb2xkXFxcIixcXFwiQ0ZBMzlEXFxcIjpcXFwiRXVucnlcXFwiLFxcXCJDRUM3QTdcXFwiOlxcXCJDaGlub1xcXCIsXFxcIkNFQzI5MVxcXCI6XFxcIll1bWFcXFwiLFxcXCJDRUJBQkFcXFwiOlxcXCJDb2xkIFR1cmtleVxcXCIsXFxcIkNFQjk4RlxcXCI6XFxcIlNvcnJlbGwgQnJvd25cXFwiLFxcXCJDREY0RkZcXFwiOlxcXCJPbmFoYXVcXFwiLFxcXCJDRDg0MjlcXFwiOlxcXCJCcmFuZHkgUHVuY2hcXFwiLFxcXCJDRDU3MDBcXFwiOlxcXCJUZW5uXFxcIixcXFwiQ0NGRjAwXFxcIjpcXFwiRWxlY3RyaWMgTGltZVxcXCIsXFxcIkNDQ0NGRlxcXCI6XFxcIlBlcml3aW5rbGVcXFwiLFxcXCJDQ0NBQThcXFwiOlxcXCJUaGlzdGxlIEdyZWVuXFxcIixcXFwiQ0M4ODk5XFxcIjpcXFwiUHVjZVxcXCIsXFxcIkNDNzcyMlxcXCI6XFxcIk9jaHJlXFxcIixcXFwiQ0M1NTAwXFxcIjpcXFwiQnVybnQgT3JhbmdlXFxcIixcXFwiQ0MzMzMzXFxcIjpcXFwiUGVyc2lhbiBSZWRcXFwiLFxcXCJDQkRCRDZcXFwiOlxcXCJOZWJ1bGFcXFwiLFxcXCJDQkQzQjBcXFwiOlxcXCJHcmVlbiBNaXN0XFxcIixcXFwiQ0JDQUI2XFxcIjpcXFwiRm9nZ3kgR3JheVxcXCIsXFxcIkNCOEZBOVxcXCI6XFxcIlZpb2xhXFxcIixcXFwiQ0FFNkRBXFxcIjpcXFwiU2tlcHRpY1xcXCIsXFxcIkNBRTAwRFxcXCI6XFxcIkJpdHRlciBMZW1vblxcXCIsXFxcIkNBRENENFxcXCI6XFxcIlBhcmlzIFdoaXRlXFxcIixcXFwiQ0FCQjQ4XFxcIjpcXFwiVHVybWVyaWNcXFwiLFxcXCJDQTM0MzVcXFwiOlxcXCJGbHVzaCBNYWhvZ2FueVxcXCIsXFxcIkM5RkZFNVxcXCI6XFxcIkFlcm8gQmx1ZVxcXCIsXFxcIkM5RkZBMlxcXCI6XFxcIlJlZWZcXFwiLFxcXCJDOUQ5RDJcXFwiOlxcXCJDb25jaFxcXCIsXFxcIkM5QzBCQlxcXCI6XFxcIlNpbHZlciBSdXN0XFxcIixcXFwiQzlCOTNCXFxcIjpcXFwiRWFybHMgR3JlZW5cXFwiLFxcXCJDOUIzNUJcXFwiOlxcXCJTdW5kYW5jZVxcXCIsXFxcIkM5QjI5QlxcXCI6XFxcIlJvZGVvIER1c3RcXFwiLFxcXCJDOUEwRENcXFwiOlxcXCJMaWdodCBXaXN0ZXJpYVxcXCIsXFxcIkM5OTQxNVxcXCI6XFxcIlBpenphXFxcIixcXFwiQzk2MzIzXFxcIjpcXFwiUGlwZXJcXFwiLFxcXCJDOEUzRDdcXFwiOlxcXCJFZGdld2F0ZXJcXFwiLFxcXCJDOEI1NjhcXFwiOlxcXCJMYXNlclxcXCIsXFxcIkM4QUFCRlxcXCI6XFxcIkxpbHlcXFwiLFxcXCJDOEE1MjhcXFwiOlxcXCJIb2tleSBQb2tleVxcXCIsXFxcIkM4QTJDOFxcXCI6XFxcIkxpbGFjXFxcIixcXFwiQzg4QTY1XFxcIjpcXFwiQW50aXF1ZSBCcmFzc1xcXCIsXFxcIkM3RERFNVxcXCI6XFxcIkJvdHRpY2VsbGlcXFwiLFxcXCJDN0NEOTBcXFwiOlxcXCJQaW5lIEdsYWRlXFxcIixcXFwiQzdDOUQ1XFxcIjpcXFwiR2hvc3RcXFwiLFxcXCJDN0M0QkZcXFwiOlxcXCJDbG91ZFxcXCIsXFxcIkM3QzFGRlxcXCI6XFxcIk1lbHJvc2VcXFwiLFxcXCJDN0JDQTJcXFwiOlxcXCJDb3JhbCBSZWVmXFxcIixcXFwiQzcwMzFFXFxcIjpcXFwiTW9uemFcXFwiLFxcXCJDNkU2MTBcXFwiOlxcXCJMYXMgUGFsbWFzXFxcIixcXFwiQzZDOEJEXFxcIjpcXFwiS2FuZ2Fyb29cXFwiLFxcXCJDNkMzQjVcXFwiOlxcXCJBc2hcXFwiLFxcXCJDNkE4NEJcXFwiOlxcXCJSb3RpXFxcIixcXFwiQzY5MTkxXFxcIjpcXFwiT3JpZW50YWwgUGlua1xcXCIsXFxcIkM2NzI2QlxcXCI6XFxcIkNvbnRlc3NhXFxcIixcXFwiQzYyRDQyXFxcIjpcXFwiQnJpY2sgUmVkXFxcIixcXFwiQzVFMTdBXFxcIjpcXFwiWWVsbG93IEdyZWVuXFxcIixcXFwiQzVEQkNBXFxcIjpcXFwiU2VhIE1pc3RcXFwiLFxcXCJDNTk5NEJcXFwiOlxcXCJUdXNzb2NrXFxcIixcXFwiQzU5OTIyXFxcIjpcXFwiTnVnZ2V0XFxcIixcXFwiQzU0QjhDXFxcIjpcXFwiTXVsYmVycnlcXFwiLFxcXCJDNEY0RUJcXFwiOlxcXCJNaW50IFR1bGlwXFxcIixcXFwiQzREMEIwXFxcIjpcXFwiQ29yaWFuZGVyXFxcIixcXFwiQzRDNEJDXFxcIjpcXFwiTWlzdCBHcmF5XFxcIixcXFwiQzQ1NzE5XFxcIjpcXFwiT3JhbmdlIFJvdWdoeVxcXCIsXFxcIkM0NTY1NVxcXCI6XFxcIkZ1enp5IFd1enp5IEJyb3duXFxcIixcXFwiQzQxRTNBXFxcIjpcXFwiQ2FyZGluYWxcXFwiLFxcXCJDM0RERjlcXFwiOlxcXCJUcm9waWNhbCBCbHVlXFxcIixcXFwiQzNEMUQxXFxcIjpcXFwiVGlhcmFcXFwiLFxcXCJDM0NERTZcXFwiOlxcXCJQZXJpd2lua2xlIEdyYXlcXFwiLFxcXCJDM0MzQkRcXFwiOlxcXCJHcmF5IE5pY2tlbFxcXCIsXFxcIkMzQkZDMVxcXCI6XFxcIlBhbGUgU2xhdGVcXFwiLFxcXCJDM0IwOTFcXFwiOlxcXCJJbmRpYW4gS2hha2lcXFwiLFxcXCJDMzIxNDhcXFwiOlxcXCJNYXJvb24gRmx1c2hcXFwiLFxcXCJDMkU4RTVcXFwiOlxcXCJKYWdnZWQgSWNlXFxcIixcXFwiQzJDQUM0XFxcIjpcXFwiUHVtaWNlXFxcIixcXFwiQzJCREI2XFxcIjpcXFwiQ290dG9uIFNlZWRcXFwiLFxcXCJDMjk1NURcXFwiOlxcXCJUd2luZVxcXCIsXFxcIkMyNkIwM1xcXCI6XFxcIkluZG9jaGluZVxcXCIsXFxcIkMxRjA3Q1xcXCI6XFxcIlN1bHVcXFwiLFxcXCJDMUQ3QjBcXFwiOlxcXCJTcHJvdXRcXFwiLFxcXCJDMUJFQ0RcXFwiOlxcXCJHcmF5IFN1aXRcXFwiLFxcXCJDMUJBQjBcXFwiOlxcXCJUZWFcXFwiLFxcXCJDMUI3QTRcXFwiOlxcXCJCaXNvbiBIaWRlXFxcIixcXFwiQzFBMDA0XFxcIjpcXFwiQnVkZGhhIEdvbGRcXFwiLFxcXCJDMTU0QzFcXFwiOlxcXCJGdWNoc2lhIFBpbmtcXFwiLFxcXCJDMTQ0MEVcXFwiOlxcXCJUaWEgTWFyaWFcXFwiLFxcXCJDMEQ4QjZcXFwiOlxcXCJQaXhpZSBHcmVlblxcXCIsXFxcIkMwRDNCOVxcXCI6XFxcIlBhbGUgTGVhZlxcXCIsXFxcIkMwODA4MVxcXCI6XFxcIk9sZCBSb3NlXFxcIixcXFwiQzA0NzM3XFxcIjpcXFwiTW9qb1xcXCIsXFxcIkMwMkIxOFxcXCI6XFxcIlRodW5kZXJiaXJkXFxcIixcXFwiQkZEQkUyXFxcIjpcXFwiWmlnZ3VyYXRcXFwiLFxcXCJCRkM5MjFcXFwiOlxcXCJLZXkgTGltZSBQaWVcXFwiLFxcXCJCRkMxQzJcXFwiOlxcXCJTaWx2ZXIgU2FuZFxcXCIsXFxcIkJGQkVEOFxcXCI6XFxcIkJsdWUgSGF6ZVxcXCIsXFxcIkJGQjhCMFxcXCI6XFxcIlRpZGVcXFwiLFxcXCJCRjU1MDBcXFwiOlxcXCJSb3NlIG9mIFNoYXJvblxcXCIsXFxcIkJFREUwRFxcXCI6XFxcIkZ1ZWdvXFxcIixcXFwiQkVCNUI3XFxcIjpcXFwiUGluayBTd2FuXFxcIixcXFwiQkVBNkMzXFxcIjpcXFwiTG9uZG9uIEh1ZVxcXCIsXFxcIkJERURGRFxcXCI6XFxcIkZyZW5jaCBQYXNzXFxcIixcXFwiQkRDOUNFXFxcIjpcXFwiTG9ibG9sbHlcXFwiLFxcXCJCREM4QjNcXFwiOlxcXCJDbGF5IEFzaFxcXCIsXFxcIkJEQkRDNlxcXCI6XFxcIkZyZW5jaCBHcmF5XFxcIixcXFwiQkRCQkQ3XFxcIjpcXFwiTGF2ZW5kZXIgR3JheVxcXCIsXFxcIkJEQjNDN1xcXCI6XFxcIkNoYXRlbGxlXFxcIixcXFwiQkRCMkExXFxcIjpcXFwiTWFsdGFcXFwiLFxcXCJCREIxQThcXFwiOlxcXCJTaWxrXFxcIixcXFwiQkQ5NzhFXFxcIjpcXFwiUXVpY2tzYW5kXFxcIixcXFwiQkQ1RTJFXFxcIjpcXFwiVHVzY2FueVxcXCIsXFxcIkJDQzlDMlxcXCI6XFxcIlBvd2RlciBBc2hcXFwiLFxcXCJCQkQ3QzFcXFwiOlxcXCJTdXJmXFxcIixcXFwiQkJEMDA5XFxcIjpcXFwiUmlvIEdyYW5kZVxcXCIsXFxcIkJCODk4M1xcXCI6XFxcIkJyYW5keSBSb3NlXFxcIixcXFwiQkIzMzg1XFxcIjpcXFwiTWVkaXVtIFJlZCBWaW9sZXRcXFwiLFxcXCJCQUVFRjlcXFwiOlxcXCJDaGFybG90dGVcXFwiLFxcXCJCQUM3QzlcXFwiOlxcXCJTdWJtYXJpbmVcXFwiLFxcXCJCQUIxQTJcXFwiOlxcXCJOb21hZFxcXCIsXFxcIkJBN0YwM1xcXCI6XFxcIlBpcmF0ZSBHb2xkXFxcIixcXFwiQkE2RjFFXFxcIjpcXFwiQm91cmJvblxcXCIsXFxcIkJBNDUwQ1xcXCI6XFxcIlJvY2sgU3ByYXlcXFwiLFxcXCJCQTAxMDFcXFwiOlxcXCJHdWFyZHNtYW4gUmVkXFxcIixcXFwiQjlDOEFDXFxcIjpcXFwiUmFpbmVlXFxcIixcXFwiQjlDNDZBXFxcIjpcXFwiV2lsZCBXaWxsb3dcXFwiLFxcXCJCOThEMjhcXFwiOlxcXCJNYXJpZ29sZFxcXCIsXFxcIkI5NTE0MFxcXCI6XFxcIkNyYWlsXFxcIixcXFwiQjk0RTQ4XFxcIjpcXFwiQ2hlc3RudXRcXFwiLFxcXCJCOEUwRjlcXFwiOlxcXCJTYWlsXFxcIixcXFwiQjhDMjVEXFxcIjpcXFwiQ2VsZXJ5XFxcIixcXFwiQjhDMUIxXFxcIjpcXFwiR3JlZW4gU3ByaW5nXFxcIixcXFwiQjhCNTZBXFxcIjpcXFwiR2ltYmxldFxcXCIsXFxcIkI4NzMzM1xcXCI6XFxcIkNvcHBlclxcXCIsXFxcIkI4MTEwNFxcXCI6XFxcIk1pbGFubyBSZWRcXFwiLFxcXCJCN0YwQkVcXFwiOlxcXCJNYWRhbmdcXFwiLFxcXCJCN0MzRDBcXFwiOlxcXCJIZWF0aGVyXFxcIixcXFwiQjdCMUIxXFxcIjpcXFwiTm9iZWxcXFwiLFxcXCJCN0E0NThcXFwiOlxcXCJIdXNrXFxcIixcXFwiQjdBMjE0XFxcIjpcXFwiU2FoYXJhXFxcIixcXFwiQjc4RTVDXFxcIjpcXFwiTXVkZHkgV2F0ZXJzXFxcIixcXFwiQjc0MTBFXFxcIjpcXFwiUnVzdFxcXCIsXFxcIkI2RDNCRlxcXCI6XFxcIkd1bSBMZWFmXFxcIixcXFwiQjZEMUVBXFxcIjpcXFwiU3BpbmRsZVxcXCIsXFxcIkI2QkFBNFxcXCI6XFxcIkVhZ2xlXFxcIixcXFwiQjZCMDk1XFxcIjpcXFwiSGVhdGhlcmVkIEdyYXlcXFwiLFxcXCJCNjlEOThcXFwiOlxcXCJUaGF0Y2hcXFwiLFxcXCJCNjMxNkNcXFwiOlxcXCJIaWJpc2N1c1xcXCIsXFxcIkI1RUNERlxcXCI6XFxcIkNydWlzZVxcXCIsXFxcIkI1RDJDRVxcXCI6XFxcIkpldCBTdHJlYW1cXFwiLFxcXCJCNUIzNUNcXFwiOlxcXCJPbGl2ZSBHcmVlblxcXCIsXFxcIkI1QTI3RlxcXCI6XFxcIk1vbmdvb3NlXFxcIixcXFwiQjU3MjgxXFxcIjpcXFwiVHVya2lzaCBSb3NlXFxcIixcXFwiQjRDRkQzXFxcIjpcXFwiSnVuZ2xlIE1pc3RcXFwiLFxcXCJCNDQ2NjhcXFwiOlxcXCJCbHVzaFxcXCIsXFxcIkI0MzMzMlxcXCI6XFxcIldlbGwgUmVhZFxcXCIsXFxcIkIzQzExMFxcXCI6XFxcIkxhIFJpb2phXFxcIixcXFwiQjNBRjk1XFxcIjpcXFwiVGF1cGUgR3JheVxcXCIsXFxcIkIzODAwN1xcXCI6XFxcIkhvdCBUb2RkeVxcXCIsXFxcIkIzNTIxM1xcXCI6XFxcIkZpZXJ5IE9yYW5nZVxcXCIsXFxcIkIzMkQyOVxcXCI6XFxcIlRhbGwgUG9wcHlcXFwiLFxcXCJCMkExRUFcXFwiOlxcXCJCaWxvYmEgRmxvd2VyXFxcIixcXFwiQjIwOTMxXFxcIjpcXFwiU2hpcmF6XFxcIixcXFwiQjFGNEU3XFxcIjpcXFwiSWNlIENvbGRcXFwiLFxcXCJCMUUyQzFcXFwiOlxcXCJGcmluZ3kgRmxvd2VyXFxcIixcXFwiQjE5NDYxXFxcIjpcXFwiVGVha1xcXCIsXFxcIkIxNkQ1MlxcXCI6XFxcIlNhbnRhIEZlXFxcIixcXFwiQjE2MTBCXFxcIjpcXFwiUHVtcGtpbiBTa2luXFxcIixcXFwiQjE0QTBCXFxcIjpcXFwiVmVzdXZpdXNcXFwiLFxcXCJCMTAwMDBcXFwiOlxcXCJCcmlnaHQgUmVkXFxcIixcXFwiQjBFMzEzXFxcIjpcXFwiSW5jaCBXb3JtXFxcIixcXFwiQjA5QTk1XFxcIjpcXFwiRGVsIFJpb1xcXCIsXFxcIkIwNjYwOFxcXCI6XFxcIk1haSBUYWlcXFwiLFxcXCJCMDVFODFcXFwiOlxcXCJUYXBlc3RyeVxcXCIsXFxcIkIwNUQ1NFxcXCI6XFxcIk1hdHJpeFxcXCIsXFxcIkIwNEM2QVxcXCI6XFxcIkNhZGlsbGFjXFxcIixcXFwiQUZCREQ5XFxcIjpcXFwiUGlnZW9uIFBvc3RcXFwiLFxcXCJBRkIxQjhcXFwiOlxcXCJCb21iYXlcXFwiLFxcXCJBRkEwOUVcXFwiOlxcXCJNYXJ0aW5pXFxcIixcXFwiQUY5RjFDXFxcIjpcXFwiTHVja3lcXFwiLFxcXCJBRjhGMkNcXFwiOlxcXCJBbHBpbmVcXFwiLFxcXCJBRjg3NTFcXFwiOlxcXCJEcmlmdHdvb2RcXFwiLFxcXCJBRjU5M0VcXFwiOlxcXCJCcm93biBSdXN0XFxcIixcXFwiQUY0RDQzXFxcIjpcXFwiQXBwbGUgQmxvc3NvbVxcXCIsXFxcIkFGNDAzNVxcXCI6XFxcIk1lZGl1bSBDYXJtaW5lXFxcIixcXFwiQUU4MDlFXFxcIjpcXFwiQm91cXVldFxcXCIsXFxcIkFFNjAyMFxcXCI6XFxcIkRlc2VydFxcXCIsXFxcIkFFNDU2MFxcXCI6XFxcIkhpcHBpZSBQaW5rXFxcIixcXFwiQURFNkM0XFxcIjpcXFwiUGFkdWFcXFwiLFxcXCJBRERGQURcXFwiOlxcXCJNb3NzIEdyZWVuXFxcIixcXFwiQURCRUQxXFxcIjpcXFwiQ2FzcGVyXFxcIixcXFwiQUQ3ODFCXFxcIjpcXFwiTWFuZGFsYXlcXFwiLFxcXCJBQ0UxQUZcXFwiOlxcXCJDZWxhZG9uXFxcIixcXFwiQUNERDREXFxcIjpcXFwiQ29uaWZlclxcXCIsXFxcIkFDQ0JCMVxcXCI6XFxcIlNwcmluZyBSYWluXFxcIixcXFwiQUNCNzhFXFxcIjpcXFwiU3dhbXAgR3JlZW5cXFwiLFxcXCJBQ0FDQUNcXFwiOlxcXCJTaWx2ZXIgQ2hhbGljZVxcXCIsXFxcIkFDQTU5RlxcXCI6XFxcIkNsb3VkeVxcXCIsXFxcIkFDQTU4NlxcXCI6XFxcIkhpbGxhcnlcXFwiLFxcXCJBQ0E0OTRcXFwiOlxcXCJOYXBhXFxcIixcXFwiQUM5RTIyXFxcIjpcXFwiTGVtb24gR2luZ2VyXFxcIixcXFwiQUM5MUNFXFxcIjpcXFwiRWFzdCBTaWRlXFxcIixcXFwiQUM4QTU2XFxcIjpcXFwiTGltZWQgT2FrXFxcIixcXFwiQUJBMTk2XFxcIjpcXFwiQnJvbmNvXFxcIixcXFwiQUJBMEQ5XFxcIjpcXFwiQ29sZCBQdXJwbGVcXFwiLFxcXCJBQjkxN0FcXFwiOlxcXCJTYW5kcmlmdFxcXCIsXFxcIkFCMzQ3MlxcXCI6XFxcIlJveWFsIEhlYXRoXFxcIixcXFwiQUIwNTYzXFxcIjpcXFwiTGlwc3RpY2tcXFwiLFxcXCJBQUYwRDFcXFwiOlxcXCJNYWdpYyBNaW50XFxcIixcXFwiQUFENkU2XFxcIjpcXFwiUmVnZW50IFN0IEJsdWVcXFwiLFxcXCJBQUFCQjdcXFwiOlxcXCJTcHVuIFBlYXJsXFxcIixcXFwiQUFBOUNEXFxcIjpcXFwiTG9nYW5cXFwiLFxcXCJBQUE1QTlcXFwiOlxcXCJTaGFkeSBMYWR5XFxcIixcXFwiQUE4RDZGXFxcIjpcXFwiU2FuZGFsXFxcIixcXFwiQUE4QjVCXFxcIjpcXFwiTXVlc2xpXFxcIixcXFwiQUE0MjAzXFxcIjpcXFwiRmlyZVxcXCIsXFxcIkFBMzc1QVxcXCI6XFxcIk5pZ2h0IFNoYWR6XFxcIixcXFwiQTlDNkMyXFxcIjpcXFwiT3BhbFxcXCIsXFxcIkE5QkVGMlxcXCI6XFxcIlBlcmFub1xcXCIsXFxcIkE5QkRCRlxcXCI6XFxcIlRvd2VyIEdyYXlcXFwiLFxcXCJBOUI0OTdcXFwiOlxcXCJTY2hpc3RcXFwiLFxcXCJBOUFDQjZcXFwiOlxcXCJBbHVtaW5pdW1cXFwiLFxcXCJBOUE0OTFcXFwiOlxcXCJHcmF5IE9saXZlXFxcIixcXFwiQThFM0JEXFxcIjpcXFwiQ2hpbm9va1xcXCIsXFxcIkE4QkQ5RlxcXCI6XFxcIk5vcndheVxcXCIsXFxcIkE4QUY4RVxcXCI6XFxcIkxvY3VzdFxcXCIsXFxcIkE4QUU5Q1xcXCI6XFxcIkJ1ZFxcXCIsXFxcIkE4QTU4OVxcXCI6XFxcIlRhbGxvd1xcXCIsXFxcIkE4OTlFNlxcXCI6XFxcIkR1bGwgTGF2ZW5kZXJcXFwiLFxcXCJBODk4OUJcXFwiOlxcXCJEdXN0eSBHcmF5XFxcIixcXFwiQTg2QjZCXFxcIjpcXFwiQ29yYWwgVHJlZVxcXCIsXFxcIkE4NjUxNVxcXCI6XFxcIlJlbm8gU2FuZFxcXCIsXFxcIkE4NTMwN1xcXCI6XFxcIlJpY2ggR29sZFxcXCIsXFxcIkE3ODgyQ1xcXCI6XFxcIkx1eG9yIEdvbGRcXFwiLFxcXCJBNzI1MjVcXFwiOlxcXCJNZXhpY2FuIFJlZFxcXCIsXFxcIkE2QTI5QVxcXCI6XFxcIkRhd25cXFwiLFxcXCJBNjkyNzlcXFwiOlxcXCJEb25rZXkgQnJvd25cXFwiLFxcXCJBNjhCNUJcXFwiOlxcXCJCYXJsZXkgQ29yblxcXCIsXFxcIkE2NTUyOVxcXCI6XFxcIlBhYXJsXFxcIixcXFwiQTYyRjIwXFxcIjpcXFwiUm9vZiBUZXJyYWNvdHRhXFxcIixcXFwiQTVDQjBDXFxcIjpcXFwiQmFoaWFcXFwiLFxcXCJBNTlCOTFcXFwiOlxcXCJab3JiYVxcXCIsXFxcIkE1MEI1RVxcXCI6XFxcIkphenpiZXJyeSBKYW1cXFwiLFxcXCJBNEFGNkVcXFwiOlxcXCJHcmVlbiBTbW9rZVxcXCIsXFxcIkE0QTZEM1xcXCI6XFxcIldpc3RmdWxcXFwiLFxcXCJBNEE0OURcXFwiOlxcXCJEZWx0YVxcXCIsXFxcIkEzRTNFRFxcXCI6XFxcIkJsaXp6YXJkIEJsdWVcXFwiLFxcXCJBMzk3QjRcXFwiOlxcXCJBbWV0aHlzdCBTbW9rZVxcXCIsXFxcIkEzODA3QlxcXCI6XFxcIlBoYXJsYXBcXFwiLFxcXCJBMkFFQUJcXFwiOlxcXCJFZHdhcmRcXFwiLFxcXCJBMkFBQjNcXFwiOlxcXCJHcmF5IENoYXRlYXVcXFwiLFxcXCJBMjY2NDVcXFwiOlxcXCJDYXBlIFBhbGxpc2VyXFxcIixcXFwiQTIzQjZDXFxcIjpcXFwiUm91Z2VcXFwiLFxcXCJBMjAwNkRcXFwiOlxcXCJGbGlydFxcXCIsXFxcIkExRTlERVxcXCI6XFxcIldhdGVyIExlYWZcXFwiLFxcXCJBMURBRDdcXFwiOlxcXCJBcXVhIElzbGFuZFxcXCIsXFxcIkExQzUwQVxcXCI6XFxcIkNpdHJ1c1xcXCIsXFxcIkExQURCNVxcXCI6XFxcIkhpdCBHcmF5XFxcIixcXFwiQTE3NTBEXFxcIjpcXFwiQnV0dGVyZWQgUnVtXFxcIixcXFwiQTAyNzEyXFxcIjpcXFwiVGFiYXNjb1xcXCIsXFxcIjlGREQ4Q1xcXCI6XFxcIkZlaWpvYVxcXCIsXFxcIjlGRDdEM1xcXCI6XFxcIlNpbmJhZFxcXCIsXFxcIjlGQTBCMVxcXCI6XFxcIlNhbnRhcyBHcmF5XFxcIixcXFwiOUY5RjlDXFxcIjpcXFwiU3RhciBEdXN0XFxcIixcXFwiOUY4MjFDXFxcIjpcXFwiUmVlZiBHb2xkXFxcIixcXFwiOUYzODFEXFxcIjpcXFwiQ29nbmFjXFxcIixcXFwiOUVERUUwXFxcIjpcXFwiTW9ybmluZyBHbG9yeVxcXCIsXFxcIjlFQjFDRFxcXCI6XFxcIlJvY2sgQmx1ZVxcXCIsXFxcIjlFQTkxRlxcXCI6XFxcIkNpdHJvblxcXCIsXFxcIjlFQTU4N1xcXCI6XFxcIlNhZ2VcXFwiLFxcXCI5RTVCNDBcXFwiOlxcXCJTZXBpYSBTa2luXFxcIixcXFwiOUU1MzAyXFxcIjpcXFwiQ2hlbHNlYSBHZW1cXFwiLFxcXCI5REU1RkZcXFwiOlxcXCJBbmFraXdhXFxcIixcXFwiOURFMDkzXFxcIjpcXFwiR3Jhbm55IFNtaXRoIEFwcGxlXFxcIixcXFwiOURDMjA5XFxcIjpcXFwiUGlzdGFjaGlvXFxcIixcXFwiOURBQ0I3XFxcIjpcXFwiR3VsbCBHcmF5XFxcIixcXFwiOUQ1NjE2XFxcIjpcXFwiSGF3YWlpYW4gVGFuXFxcIixcXFwiOUMzMzM2XFxcIjpcXFwiU3RpbGV0dG9cXFwiLFxcXCI5QjlFOEZcXFwiOlxcXCJMZW1vbiBHcmFzc1xcXCIsXFxcIjlCNDcwM1xcXCI6XFxcIk9yZWdvblxcXCIsXFxcIjlBQzJCOFxcXCI6XFxcIlNoYWRvdyBHcmVlblxcXCIsXFxcIjlBQjk3M1xcXCI6XFxcIk9saXZpbmVcXFwiLFxcXCI5QTk1NzdcXFwiOlxcXCJHdXJraGFcXFwiLFxcXCI5QTZFNjFcXFwiOlxcXCJUb2FzdFxcXCIsXFxcIjlBMzgyMFxcXCI6XFxcIlByYWlyaWUgU2FuZFxcXCIsXFxcIjk5OTlDQ1xcXCI6XFxcIkJsdWUgQmVsbFxcXCIsXFxcIjk5N0E4RFxcXCI6XFxcIk1vdW50YmF0dGVuIFBpbmtcXFwiLFxcXCI5OTY2Q0NcXFwiOlxcXCJBbWV0aHlzdFxcXCIsXFxcIjk5MUIwN1xcXCI6XFxcIlRvdGVtIFBvbGVcXFwiLFxcXCI5OEZGOThcXFwiOlxcXCJNaW50IEdyZWVuXFxcIixcXFwiOTg4RDc3XFxcIjpcXFwiUGFsZSBPeXN0ZXJcXFwiLFxcXCI5ODgxMUJcXFwiOlxcXCJIYWNpZW5kYVxcXCIsXFxcIjk4Nzc3QlxcXCI6XFxcIkJhemFhclxcXCIsXFxcIjk4NzREM1xcXCI6XFxcIkxpbGFjIEJ1c2hcXFwiLFxcXCI5ODNENjFcXFwiOlxcXCJWaW4gUm91Z2VcXFwiLFxcXCI5N0NEMkRcXFwiOlxcXCJBdGxhbnRpc1xcXCIsXFxcIjk3NzFCNVxcXCI6XFxcIldpc3RlcmlhXFxcIixcXFwiOTc2MDVEXFxcIjpcXFwiQXUgQ2hpY29cXFwiLFxcXCI5NkJCQUJcXFwiOlxcXCJTdW1tZXIgR3JlZW5cXFwiLFxcXCI5NkE4QTFcXFwiOlxcXCJQZXd0ZXJcXFwiLFxcXCI5NjdCQjZcXFwiOlxcXCJMYXZlbmRlciBQdXJwbGVcXFwiLFxcXCI5Njc4QjZcXFwiOlxcXCJQdXJwbGUgTW91bnRhaW5cXFxcJ3MgTWFqZXN0eSBcXFwiLFxcXCI5M0RGQjhcXFwiOlxcXCJBbGdhZSBHcmVlblxcXCIsXFxcIjkzQ0NFQVxcXCI6XFxcIkNvcm5mbG93ZXJcXFwiLFxcXCI5MjZGNUJcXFwiOlxcXCJCZWF2ZXJcXFwiLFxcXCI5MjAwMEFcXFwiOlxcXCJTYW5ncmlhXFxcIixcXFwiOTA4RDM5XFxcIjpcXFwiU3ljYW1vcmVcXFwiLFxcXCI5MDdCNzFcXFwiOlxcXCJBbG1vbmQgRnJvc3RcXFwiLFxcXCI5MDFFMUVcXFwiOlxcXCJPbGQgQnJpY2tcXFwiLFxcXCI4RkQ2QjRcXFwiOlxcXCJWaXN0YSBCbHVlXFxcIixcXFwiOEY4MTc2XFxcIjpcXFwiU3F1aXJyZWxcXFwiLFxcXCI4RjRCMEVcXFwiOlxcXCJLb3JtYVxcXCIsXFxcIjhGM0UzM1xcXCI6XFxcIkVsIFNhbHZhXFxcIixcXFwiOEYwMjFDXFxcIjpcXFwiUG9odXR1a2F3YVxcXCIsXFxcIjhFQUJDMVxcXCI6XFxcIk5lcGFsXFxcIixcXFwiOEU4MTkwXFxcIjpcXFwiTWFtYmFcXFwiLFxcXCI4RTc3NUVcXFwiOlxcXCJEb21pbm9cXFwiLFxcXCI4RTZGNzBcXFwiOlxcXCJPcGl1bVxcXCIsXFxcIjhFNEQxRVxcXCI6XFxcIlJvcGVcXFwiLFxcXCI4RTAwMDBcXFwiOlxcXCJSZWQgQmVycnlcXFwiLFxcXCI4REE4Q0NcXFwiOlxcXCJQb2xvIEJsdWVcXFwiLFxcXCI4RDkwQTFcXFwiOlxcXCJNYW5hdGVlXFxcIixcXFwiOEQ4OTc0XFxcIjpcXFwiR3Jhbml0ZSBHcmVlblxcXCIsXFxcIjhENzY2MlxcXCI6XFxcIkNlbWVudFxcXCIsXFxcIjhEM0YzRlxcXCI6XFxcIlRvc2NhXFxcIixcXFwiOEQzRDM4XFxcIjpcXFwiU2FuZ3VpbmUgQnJvd25cXFwiLFxcXCI4RDAyMjZcXFwiOlxcXCJQYXByaWthXFxcIixcXFwiOEM2NDk1XFxcIjpcXFwiVHJlbmR5IFBpbmtcXFwiLFxcXCI4QzU3MzhcXFwiOlxcXCJQb3R0ZXJzIENsYXlcXFwiLFxcXCI4QzQ3MkZcXFwiOlxcXCJNdWxlIEZhd25cXFwiLFxcXCI4QzA1NUVcXFwiOlxcXCJDYXJkaW5hbCBQaW5rXFxcIixcXFwiOEJFNkQ4XFxcIjpcXFwiUmlwdGlkZVxcXCIsXFxcIjhCQTlBNVxcXCI6XFxcIkNhc2NhZGVcXFwiLFxcXCI4QkE2OTBcXFwiOlxcXCJFbnZ5XFxcIixcXFwiOEI5RkVFXFxcIjpcXFwiUG9ydGFnZVxcXCIsXFxcIjhCOUM5MFxcXCI6XFxcIk1hbnRsZVxcXCIsXFxcIjhCODY4MFxcXCI6XFxcIk5hdHVyYWwgR3JheVxcXCIsXFxcIjhCODQ3RVxcXCI6XFxcIlNjaG9vbmVyXFxcIixcXFwiOEI4NDcwXFxcIjpcXFwiT2xpdmUgSGF6ZVxcXCIsXFxcIjhCNkIwQlxcXCI6XFxcIkNvcm4gSGFydmVzdFxcXCIsXFxcIjhCMDcyM1xcXCI6XFxcIk1vbmFyY2hcXFwiLFxcXCI4QjAwRkZcXFwiOlxcXCJFbGVjdHJpYyBWaW9sZXRcXFwiLFxcXCI4QUI5RjFcXFwiOlxcXCJKb3JkeSBCbHVlXFxcIixcXFwiOEE4RjhBXFxcIjpcXFwiU3RhY2tcXFwiLFxcXCI4QTgzODlcXFwiOlxcXCJNb25zb29uXFxcIixcXFwiOEE4MzYwXFxcIjpcXFwiQ2xheSBDcmVla1xcXCIsXFxcIjhBNzNENlxcXCI6XFxcIlRydWUgVlxcXCIsXFxcIjhBMzMyNFxcXCI6XFxcIkJ1cm50IFVtYmVyXFxcIixcXFwiODk3RDZEXFxcIjpcXFwiTWFrYXJhXFxcIixcXFwiODg4RDY1XFxcIjpcXFwiQXZvY2Fkb1xcXCIsXFxcIjg3QUIzOVxcXCI6XFxcIlN1c2hpXFxcIixcXFwiODc4RDkxXFxcIjpcXFwiT3NsbyBHcmF5XFxcIixcXFwiODc3QzdCXFxcIjpcXFwiSHVycmljYW5lXFxcIixcXFwiODc3NTZFXFxcIjpcXFwiQW1lcmljYW5vXFxcIixcXFwiODY5NDlGXFxcIjpcXFwiUmVnZW50IEdyYXlcXFwiLFxcXCI4NjU2MEFcXFwiOlxcXCJSdXN0eSBOYWlsXFxcIixcXFwiODY0RDFFXFxcIjpcXFwiQnVsbCBTaG90XFxcIixcXFwiODY0ODNDXFxcIjpcXFwiSXJvbnN0b25lXFxcIixcXFwiODYzQzNDXFxcIjpcXFwiTG90dXNcXFwiLFxcXCI4NUM0Q0NcXFwiOlxcXCJIYWxmIEJha2VkXFxcIixcXFwiODU5RkFGXFxcIjpcXFwiQmFsaSBIYWlcXFwiLFxcXCI4NTgxRDlcXFwiOlxcXCJDaGV0d29kZSBCbHVlXFxcIixcXFwiODRBMEEwXFxcIjpcXFwiR3Jhbm55IFNtaXRoXFxcIixcXFwiODNEMEM2XFxcIjpcXFwiTW9udGUgQ2FybG9cXFwiLFxcXCI4M0FBNURcXFwiOlxcXCJDaGVsc2VhIEN1Y3VtYmVyXFxcIixcXFwiODI4RjcyXFxcIjpcXFwiQmF0dGxlc2hpcCBHcmF5XFxcIixcXFwiODI2RjY1XFxcIjpcXFwiU2FuZCBEdW5lXFxcIixcXFwiODE2RTcxXFxcIjpcXFwiU3BpY3kgUGlua1xcXCIsXFxcIjgxNDIyQ1xcXCI6XFxcIk51dG1lZ1xcXCIsXFxcIjgwQ0NFQVxcXCI6XFxcIlNlYWd1bGxcXFwiLFxcXCI4MEIzQzRcXFwiOlxcXCJHbGFjaWVyXFxcIixcXFwiODBCM0FFXFxcIjpcXFwiR3VsZiBTdHJlYW1cXFwiLFxcXCI4MDdFNzlcXFwiOlxcXCJGcmlhciBHcmF5XFxcIixcXFwiODA0NjFCXFxcIjpcXFwiUnVzc2V0XFxcIixcXFwiODAzNDFGXFxcIjpcXFwiUmVkIFJvYmluXFxcIixcXFwiODAwQjQ3XFxcIjpcXFwiUm9zZSBCdWQgQ2hlcnJ5XFxcIixcXFwiN0Y3NkQzXFxcIjpcXFwiTW9vZHkgQmx1ZVxcXCIsXFxcIjdGNzU4OVxcXCI6XFxcIk1vYnN0ZXJcXFwiLFxcXCI3RjYyNkRcXFwiOlxcXCJGYWxjb25cXFwiLFxcXCI3RjNBMDJcXFwiOlxcXCJQZXJ1IFRhblxcXCIsXFxcIjdGMTczNFxcXCI6XFxcIkNsYXJldFxcXCIsXFxcIjdFM0ExNVxcXCI6XFxcIkNvcHBlciBDYW55b25cXFwiLFxcXCI3REQ4QzZcXFwiOlxcXCJCZXJtdWRhXFxcIixcXFwiN0RDOEY3XFxcIjpcXFwiTWFsaWJ1XFxcIixcXFwiN0RBOThEXFxcIjpcXFwiQmF5IExlYWZcXFwiLFxcXCI3RDJDMTRcXFwiOlxcXCJQdWVibG9cXFwiLFxcXCI3Q0I3QkJcXFwiOlxcXCJOZXB0dW5lXFxcIixcXFwiN0NCMEExXFxcIjpcXFwiQWNhcHVsY29cXFwiLFxcXCI3Q0ExQTZcXFwiOlxcXCJHdW1ib1xcXCIsXFxcIjdDODgxQVxcXCI6XFxcIlRyZW5keSBHcmVlblxcXCIsXFxcIjdDN0I4MlxcXCI6XFxcIkp1bWJvXFxcIixcXFwiN0M3QjdBXFxcIjpcXFwiQ29uY29yZFxcXCIsXFxcIjdDNzc4QVxcXCI6XFxcIlRvcGF6XFxcIixcXFwiN0M3NjMxXFxcIjpcXFwiUGVzdG9cXFwiLFxcXCI3QzFDMDVcXFwiOlxcXCJLZW55YW4gQ29wcGVyXFxcIixcXFwiN0JBMDVCXFxcIjpcXFwiQXNwYXJhZ3VzXFxcIixcXFwiN0I5RjgwXFxcIjpcXFwiQW11bGV0XFxcIixcXFwiN0I4MjY1XFxcIjpcXFwiRmxheCBTbW9rZVxcXCIsXFxcIjdCN0M5NFxcXCI6XFxcIldhdGVybG9vIFxcXCIsXFxcIjdCNzg3NFxcXCI6XFxcIlRhcGFcXFwiLFxcXCI3QjY2MDhcXFwiOlxcXCJZdWtvbiBHb2xkXFxcIixcXFwiN0IzRjAwXFxcIjpcXFwiQ2lubmFtb25cXFwiLFxcXCI3QjM4MDFcXFwiOlxcXCJSZWQgQmVlY2hcXFwiLFxcXCI3QUM0ODhcXFwiOlxcXCJEZSBZb3JrXFxcIixcXFwiN0E4OUI4XFxcIjpcXFwiV2lsZCBCbHVlIFlvbmRlclxcXCIsXFxcIjdBN0E3QVxcXCI6XFxcIkJvdWxkZXJcXFwiLFxcXCI3QTU4QzFcXFwiOlxcXCJGdWNoc2lhIEJsdWVcXFwiLFxcXCI3QTAxM0FcXFwiOlxcXCJTaXJlblxcXCIsXFxcIjc5REVFQ1xcXCI6XFxcIlNwcmF5XFxcIixcXFwiNzk2RDYyXFxcIjpcXFwiU2FuZHN0b25lXFxcIixcXFwiNzk2QTc4XFxcIjpcXFwiRmVkb3JhXFxcIixcXFwiNzk1RDRDXFxcIjpcXFwiUm9tYW4gQ29mZmVlXFxcIixcXFwiNzhBMzlDXFxcIjpcXFwiU2VhIE55bXBoXFxcIixcXFwiNzg4QkJBXFxcIjpcXFwiU2hpcCBDb3ZlXFxcIixcXFwiNzg4QTI1XFxcIjpcXFwiV2FzYWJpXFxcIixcXFwiNzg4NjZCXFxcIjpcXFwiQ2Ftb3VmbGFnZSBHcmVlblxcXCIsXFxcIjc4MkYxNlxcXCI6XFxcIlBlYW51dFxcXCIsXFxcIjc4MkQxOVxcXCI6XFxcIk1vY2hhXFxcIixcXFwiNzdERDc3XFxcIjpcXFwiUGFzdGVsIEdyZWVuXFxcIixcXFwiNzc5RTg2XFxcIjpcXFwiT3hsZXlcXFwiLFxcXCI3NzZGNjFcXFwiOlxcXCJQYWJsb1xcXCIsXFxcIjc3M0YxQVxcXCI6XFxcIldhbG51dFxcXCIsXFxcIjc3MUYxRlxcXCI6XFxcIkNyb3duIG9mIFRob3Juc1xcXCIsXFxcIjc3MEYwNVxcXCI6XFxcIkRhcmsgQnVyZ3VuZHlcXFwiLFxcXCI3NkJEMTdcXFwiOlxcXCJMaW1hXFxcIixcXFwiNzY2NkM2XFxcIjpcXFwiQmx1ZSBNYXJndWVyaXRlXFxcIixcXFwiNzYzOTVEXFxcIjpcXFwiQ29zbWljXFxcIixcXFwiNzU2M0E4XFxcIjpcXFwiRGVsdWdlXFxcIixcXFwiNzU1QTU3XFxcIjpcXFwiUnVzc2V0dFxcXCIsXFxcIjc0QzM2NVxcXCI6XFxcIk1hbnRpc1xcXCIsXFxcIjc0N0Q4M1xcXCI6XFxcIlJvbGxpbmcgU3RvbmVcXFwiLFxcXCI3NDdENjNcXFwiOlxcXCJMaW1lZCBBc2hcXFwiLFxcXCI3NDY0MERcXFwiOlxcXCJTcGljeSBNdXN0YXJkXFxcIixcXFwiNzM2RDU4XFxcIjpcXFwiQ3JvY29kaWxlXFxcIixcXFwiNzM2QzlGXFxcIjpcXFwiS2ltYmVybHlcXFwiLFxcXCI3MzRBMTJcXFwiOlxcXCJSYXcgVW1iZXJcXFwiLFxcXCI3MzFFOEZcXFwiOlxcXCJTZWFuY2VcXFwiLFxcXCI3MjdCODlcXFwiOlxcXCJSYXZlblxcXCIsXFxcIjcyNkQ0RVxcXCI6XFxcIkdvIEJlblxcXCIsXFxcIjcyNEEyRlxcXCI6XFxcIk9sZCBDb3BwZXJcXFwiLFxcXCI3MjAxMEZcXFwiOlxcXCJWZW5ldGlhbiBSZWRcXFwiLFxcXCI3MUQ5RTJcXFwiOlxcXCJBcXVhbWFyaW5lIEJsdWVcXFwiLFxcXCI3MTZFMTBcXFwiOlxcXCJPbGl2ZXRvbmVcXFwiLFxcXCI3MTZCNTZcXFwiOlxcXCJQZWF0XFxcIixcXFwiNzE1RDQ3XFxcIjpcXFwiVG9iYWNjbyBCcm93blxcXCIsXFxcIjcxNEFCMlxcXCI6XFxcIlN0dWRpb1xcXCIsXFxcIjcxMjkxRFxcXCI6XFxcIk1ldGFsbGljIENvcHBlclxcXCIsXFxcIjcxMUEwMFxcXCI6XFxcIkNlZGFyIFdvb2QgRmluaXNoXFxcIixcXFwiNzA0RjUwXFxcIjpcXFwiRmVycmFcXFwiLFxcXCI3MDRBMDdcXFwiOlxcXCJBbnRpcXVlIEJyb256ZVxcXCIsXFxcIjcwMUMxQ1xcXCI6XFxcIlBlcnNpYW4gUGx1bVxcXCIsXFxcIjZGRDBDNVxcXCI6XFxcIkRvd255XFxcIixcXFwiNkY5RDAyXFxcIjpcXFwiTGltZWFkZVxcXCIsXFxcIjZGOEU2M1xcXCI6XFxcIkhpZ2hsYW5kXFxcIixcXFwiNkY2QTYxXFxcIjpcXFwiRmxpbnRcXFwiLFxcXCI2RjQ0MENcXFwiOlxcXCJDYWZlIFJveWFsZVxcXCIsXFxcIjZFNzc4M1xcXCI6XFxcIlBhbGUgU2t5XFxcIixcXFwiNkU2RDU3XFxcIjpcXFwiS29rb2RhXFxcIixcXFwiNkU0QjI2XFxcIjpcXFwiRGFsbGFzXFxcIixcXFwiNkU0ODI2XFxcIjpcXFwiUGlja2xlZCBCZWFuXFxcIixcXFwiNkUxRDE0XFxcIjpcXFwiTW9jY2FjY2lub1xcXCIsXFxcIjZFMDkwMlxcXCI6XFxcIlJlZCBPeGlkZVxcXCIsXFxcIjZEOTJBMVxcXCI6XFxcIkdvdGhpY1xcXCIsXFxcIjZEOTI5MlxcXCI6XFxcIkp1bmlwZXJcXFwiLFxcXCI2RDZDNkNcXFwiOlxcXCJEb3ZlIEdyYXlcXFwiLFxcXCI2RDVFNTRcXFwiOlxcXCJQaW5lIENvbmVcXFwiLFxcXCI2RDAxMDFcXFwiOlxcXCJMb25lc3RhclxcXCIsXFxcIjZDREFFN1xcXCI6XFxcIlR1cnF1b2lzZSBCbHVlXFxcIixcXFwiNkMzMDgyXFxcIjpcXFwiRW1pbmVuY2VcXFwiLFxcXCI2QjhCQTJcXFwiOlxcXCJCZXJtdWRhIEdyYXlcXFwiLFxcXCI2QjU3NTVcXFwiOlxcXCJEb3JhZG9cXFwiLFxcXCI2QjRFMzFcXFwiOlxcXCJTaGluZ2xlIEZhd25cXFwiLFxcXCI2QjNGQTBcXFwiOlxcXCJSb3lhbCBQdXJwbGVcXFwiLFxcXCI2QjJBMTRcXFwiOlxcXCJIYWlyeSBIZWF0aFxcXCIsXFxcIjZBNjA1MVxcXCI6XFxcIlNveWEgQmVhblxcXCIsXFxcIjZBNUQxQlxcXCI6XFxcIkhpbWFsYXlhXFxcIixcXFwiNkE0NDJFXFxcIjpcXFwiU3BpY2VcXFwiLFxcXCI2OTdFOUFcXFwiOlxcXCJMeW5jaFxcXCIsXFxcIjY5NUY2MlxcXCI6XFxcIlNjb3JwaW9uXFxcIixcXFwiNjkyRDU0XFxcIjpcXFwiRmlublxcXCIsXFxcIjY4NUU2RVxcXCI6XFxcIlNhbHQgQm94XFxcIixcXFwiNjdBNzEyXFxcIjpcXFwiQ2hyaXN0aVxcXCIsXFxcIjY3NUZBNlxcXCI6XFxcIlNjYW1waVxcXCIsXFxcIjY3MDMyRFxcXCI6XFxcIkJsYWNrIFJvc2VcXFwiLFxcXCI2NkZGNjZcXFwiOlxcXCJTY3JlYW1pblxcXFwnIEdyZWVuXFxcIixcXFwiNjZGRjAwXFxcIjpcXFwiQnJpZ2h0IEdyZWVuXFxcIixcXFwiNjZCNThGXFxcIjpcXFwiU2lsdmVyIFRyZWVcXFwiLFxcXCI2NjAyM0NcXFwiOlxcXCJUeXJpYW4gUHVycGxlXFxcIixcXFwiNjU4NjlGXFxcIjpcXFwiSG9raVxcXCIsXFxcIjY1NzQ1RFxcXCI6XFxcIldpbGxvdyBHcm92ZVxcXCIsXFxcIjY1MkRDMVxcXCI6XFxcIlB1cnBsZSBIZWFydFxcXCIsXFxcIjY1MUExNFxcXCI6XFxcIkNoZXJyeXdvb2RcXFwiLFxcXCI2NTAwMEJcXFwiOlxcXCJSb3Nld29vZFxcXCIsXFxcIjY0Q0NEQlxcXCI6XFxcIlZpa2luZ1xcXCIsXFxcIjY0NkU3NVxcXCI6XFxcIk5ldmFkYVxcXCIsXFxcIjY0NkE1NFxcXCI6XFxcIlNpYW1cXFwiLFxcXCI2M0I3NkNcXFwiOlxcXCJGZXJuXFxcIixcXFwiNjM5QThGXFxcIjpcXFwiUGF0aW5hXFxcIixcXFwiNjI0RTlBXFxcIjpcXFwiQnV0dGVyZmx5IEJ1c2hcXFwiLFxcXCI2MjNGMkRcXFwiOlxcXCJRdWluY3lcXFwiLFxcXCI2MjJGMzBcXFwiOlxcXCJCdWNjYW5lZXJcXFwiLFxcXCI2MTg0NUZcXFwiOlxcXCJHbGFkZSBHcmVlblxcXCIsXFxcIjYxNUQzMFxcXCI6XFxcIkNvc3RhIGRlbCBTb2xcXFwiLFxcXCI2MDkzRDFcXFwiOlxcXCJEYW51YmVcXFwiLFxcXCI2MDZFNjhcXFwiOlxcXCJDb3JkdXJveVxcXCIsXFxcIjYwNUI3M1xcXCI6XFxcIlNtb2t5XFxcIixcXFwiNUZCM0FDXFxcIjpcXFwiVHJhZGV3aW5kXFxcIixcXFwiNUZBNzc3XFxcIjpcXFwiQXF1YSBGb3Jlc3RcXFwiLFxcXCI1RjY2NzJcXFwiOlxcXCJTaHV0dGxlIEdyYXlcXFwiLFxcXCI1RjVGNkVcXFwiOlxcXCJNaWQgR3JheVxcXCIsXFxcIjVGM0QyNlxcXCI6XFxcIklyaXNoIENvZmZlZVxcXCIsXFxcIjVFNUQzQlxcXCI6XFxcIkhlbWxvY2tcXFwiLFxcXCI1RTQ4M0VcXFwiOlxcXCJLYWJ1bFxcXCIsXFxcIjVEQTE5RlxcXCI6XFxcIkJyZWFrZXIgQmF5XFxcIixcXFwiNUQ3NzQ3XFxcIjpcXFwiRGluZ2xleVxcXCIsXFxcIjVENUUzN1xcXCI6XFxcIlZlcmRpZ3Jpc1xcXCIsXFxcIjVENUM1OFxcXCI6XFxcIkNoaWNhZ29cXFwiLFxcXCI1RDRDNTFcXFwiOlxcXCJEb24gSnVhblxcXCIsXFxcIjVEMUUwRlxcXCI6XFxcIlJlZHdvb2RcXFwiLFxcXCI1QzVENzVcXFwiOlxcXCJDb21ldFxcXCIsXFxcIjVDMkUwMVxcXCI6XFxcIkNhcm5hYnkgVGFuXFxcIixcXFwiNUMwNTM2XFxcIjpcXFwiTXVsYmVycnkgV29vZFxcXCIsXFxcIjVDMDEyMFxcXCI6XFxcIkJvcmRlYXV4XFxcIixcXFwiNUIzMDEzXFxcIjpcXFwiSmFtYmFsYXlhXFxcIixcXFwiNUE4N0EwXFxcIjpcXFwiSG9yaXpvblxcXCIsXFxcIjVBNkU5Q1xcXCI6XFxcIldhaWthd2EgR3JheVxcXCIsXFxcIjU5MUQzNVxcXCI6XFxcIldpbmUgQmVycnlcXFwiLFxcXCI1ODlBQUZcXFwiOlxcXCJIaXBwaWUgQmx1ZVxcXCIsXFxcIjU2QjRCRVxcXCI6XFxcIkZvdW50YWluIEJsdWVcXFwiLFxcXCI1NTkwRDlcXFwiOlxcXCJIYXZlbG9jayBCbHVlXFxcIixcXFwiNTU2RDU2XFxcIjpcXFwiRmlubGFuZGlhXFxcIixcXFwiNTU1QjEwXFxcIjpcXFwiU2FyYXRvZ2FcXFwiLFxcXCI1NTI4MENcXFwiOlxcXCJDaW9jY29sYXRvXFxcIixcXFwiNTQ1MzREXFxcIjpcXFwiRnVzY291cyBHcmF5XFxcIixcXFwiNTM4MjRCXFxcIjpcXFwiSGlwcGllIEdyZWVuXFxcIixcXFwiNTIzQzk0XFxcIjpcXFwiR2lnYXNcXFwiLFxcXCI1MjBDMTdcXFwiOlxcXCJNYXJvb24gT2FrXFxcIixcXFwiNTIwMDFGXFxcIjpcXFwiQ2FzdHJvXFxcIixcXFwiNTE4MDhGXFxcIjpcXFwiU21hbHQgQmx1ZVxcXCIsXFxcIjUxN0M2NlxcXCI6XFxcIkNvbW9cXFwiLFxcXCI1MTZFM0RcXFwiOlxcXCJDaGFsZXQgR3JlZW5cXFwiLFxcXCI1MEM4NzhcXFwiOlxcXCJFbWVyYWxkXFxcIixcXFwiNEZBODNEXFxcIjpcXFwiQXBwbGVcXFwiLFxcXCI0RjlENURcXFwiOlxcXCJGcnVpdCBTYWxhZFxcXCIsXFxcIjRGNzk0MlxcXCI6XFxcIkZlcm4gR3JlZW5cXFwiLFxcXCI0RjY5QzZcXFwiOlxcXCJJbmRpZ29cXFwiLFxcXCI0RjIzOThcXFwiOlxcXCJEYWlzeSBCdXNoXFxcIixcXFwiNEYxQzcwXFxcIjpcXFwiSG9uZXkgRmxvd2VyXFxcIixcXFwiNEVBQkQxXFxcIjpcXFwiU2hha2VzcGVhcmVcXFwiLFxcXCI0RTdGOUVcXFwiOlxcXCJXZWRnZXdvb2RcXFwiLFxcXCI0RTY2NDlcXFwiOlxcXCJBeG9sb3RsXFxcIixcXFwiNEU0NTYyXFxcIjpcXFwiTXVsbGVkIFdpbmVcXFwiLFxcXCI0RTQyMENcXFwiOlxcXCJCcm9uemUgT2xpdmVcXFwiLFxcXCI0RTNCNDFcXFwiOlxcXCJNYXR0ZXJob3JuXFxcIixcXFwiNEUyQTVBXFxcIjpcXFwiQm9zc2Fub3ZhXFxcIixcXFwiNEUwNjA2XFxcIjpcXFwiTWFob2dhbnlcXFwiLFxcXCI0RDUzMjhcXFwiOlxcXCJXb29kbGFuZFxcXCIsXFxcIjRENDAwRlxcXCI6XFxcIkJyb256ZXRvbmVcXFwiLFxcXCI0RDNEMTRcXFwiOlxcXCJQdW5nYVxcXCIsXFxcIjREMzgzM1xcXCI6XFxcIlJvY2tcXFwiLFxcXCI0RDI4MkVcXFwiOlxcXCJMaXZpZCBCcm93blxcXCIsXFxcIjREMjgyRFxcXCI6XFxcIkNvd2JveVxcXCIsXFxcIjREMUUwMVxcXCI6XFxcIkluZGlhbiBUYW5cXFwiLFxcXCI0RDBBMThcXFwiOlxcXCJDYWIgU2F2XFxcIixcXFwiNEQwMTM1XFxcIjpcXFwiQmxhY2tiZXJyeVxcXCIsXFxcIjRDNEY1NlxcXCI6XFxcIkFiYmV5XFxcIixcXFwiNEMzMDI0XFxcIjpcXFwiU2FkZGxlXFxcIixcXFwiNEI1RDUyXFxcIjpcXFwiTmFuZG9yXFxcIixcXFwiNEE0RTVBXFxcIjpcXFwiVHJvdXRcXFwiLFxcXCI0QTQ0NEJcXFwiOlxcXCJHcmF2ZWxcXFwiLFxcXCI0QTQyNDRcXFwiOlxcXCJUdW5kb3JhXFxcIixcXFwiNEEzQzMwXFxcIjpcXFwiTW9uZG9cXFwiLFxcXCI0QTMwMDRcXFwiOlxcXCJEZWVwIEJyb256ZVxcXCIsXFxcIjRBMkEwNFxcXCI6XFxcIkJyYWNrZW5cXFwiLFxcXCI0OTM3MUJcXFwiOlxcXCJNZXRhbGxpYyBCcm9uemVcXFwiLFxcXCI0OTE3MENcXFwiOlxcXCJWYW4gQ2xlZWZcXFwiLFxcXCI0ODNDMzJcXFwiOlxcXCJUYXVwZVxcXCIsXFxcIjQ4MUMxQ1xcXCI6XFxcIkNvY29hIEJlYW5cXFwiLFxcXCI0NjBCNDFcXFwiOlxcXCJMb3Vsb3VcXFwiLFxcXCI0NUIxRThcXFwiOlxcXCJQaWN0b24gQmx1ZVxcXCIsXFxcIjQ1NkNBQ1xcXCI6XFxcIlNhbiBNYXJpbm9cXFwiLFxcXCI0NDFEMDBcXFwiOlxcXCJNb3JvY2NvIEJyb3duXFxcIixcXFwiNDQwMTJEXFxcIjpcXFwiQmFyb3NzYVxcXCIsXFxcIjQzNkEwRFxcXCI6XFxcIkdyZWVuIExlYWZcXFwiLFxcXCI0MzRDNTlcXFwiOlxcXCJSaXZlciBCZWRcXFwiLFxcXCI0MzNFMzdcXFwiOlxcXCJBcm1hZGlsbG9cXFwiLFxcXCI0MUFBNzhcXFwiOlxcXCJPY2VhbiBHcmVlblxcXCIsXFxcIjQxNEM3RFxcXCI6XFxcIkVhc3QgQmF5XFxcIixcXFwiNDEzQzM3XFxcIjpcXFwiTWVybGluXFxcIixcXFwiNDExRjEwXFxcIjpcXFwiUGFjb1xcXCIsXFxcIjQwQTg2MFxcXCI6XFxcIkNoYXRlYXUgR3JlZW5cXFwiLFxcXCI0MDgyNkRcXFwiOlxcXCJWaXJpZGlhblxcXCIsXFxcIjQwM0QxOVxcXCI6XFxcIlRoYXRjaCBHcmVlblxcXCIsXFxcIjQwM0IzOFxcXCI6XFxcIk1hc2FsYVxcXCIsXFxcIjQwMjkxRFxcXCI6XFxcIkNvcmtcXFwiLFxcXCIzRkZGMDBcXFwiOlxcXCJIYXJsZXF1aW5cXFwiLFxcXCIzRkMxQUFcXFwiOlxcXCJQdWVydG8gUmljb1xcXCIsXFxcIjNGNUQ1M1xcXCI6XFxcIk1pbmVyYWwgR3JlZW5cXFwiLFxcXCIzRjU4M0JcXFwiOlxcXCJUb20gVGh1bWJcXFwiLFxcXCIzRjRDM0FcXFwiOlxcXCJDYWJiYWdlIFBvbnRcXFwiLFxcXCIzRjMwN0ZcXFwiOlxcXCJNaW5za1xcXCIsXFxcIjNGMzAwMlxcXCI6XFxcIk1hZHJhc1xcXCIsXFxcIjNGMjUwMFxcXCI6XFxcIkNvbGFcXFwiLFxcXCIzRjIxMDlcXFwiOlxcXCJCcm9uemVcXFwiLFxcXCIzRUFCQkZcXFwiOlxcXCJQZWxvcm91c1xcXCIsXFxcIjNFM0E0NFxcXCI6XFxcIlNoaXAgR3JheVxcXCIsXFxcIjNFMkMxQ1xcXCI6XFxcIkJsYWNrIE1hcmxpblxcXCIsXFxcIjNFMkIyM1xcXCI6XFxcIkVuZ2xpc2ggV2FsbnV0XFxcIixcXFwiM0UxQzE0XFxcIjpcXFwiQ2VkYXJcXFwiLFxcXCIzRTA0ODBcXFwiOlxcXCJLaW5nZmlzaGVyIERhaXN5XFxcIixcXFwiM0Q3RDUyXFxcIjpcXFwiR29ibGluXFxcIixcXFwiM0QyQjFGXFxcIjpcXFwiQmlzdHJlXFxcIixcXFwiM0QwQzAyXFxcIjpcXFwiQmVhbiAgXFxcIixcXFwiM0M0OTNBXFxcIjpcXFwiTHVuYXIgR3JlZW5cXFwiLFxcXCIzQzQ0NDNcXFwiOlxcXCJDYXBlIENvZFxcXCIsXFxcIjNDNDE1MVxcXCI6XFxcIkJyaWdodCBHcmF5XFxcIixcXFwiM0MzOTEwXFxcIjpcXFwiQ2Ftb3VmbGFnZVxcXCIsXFxcIjNDMjAwNVxcXCI6XFxcIkRhcmsgRWJvbnlcXFwiLFxcXCIzQzFGNzZcXFwiOlxcXCJNZXRlb3JpdGVcXFwiLFxcXCIzQzEyMDZcXFwiOlxcXCJSZWJlbFxcXCIsXFxcIjNDMDg3OFxcXCI6XFxcIldpbmRzb3JcXFwiLFxcXCIzQjkxQjRcXFwiOlxcXCJCb3N0b24gQmx1ZVxcXCIsXFxcIjNCN0E1N1xcXCI6XFxcIkFtYXpvblxcXCIsXFxcIjNCMjgyMFxcXCI6XFxcIlRyZWVob3VzZVxcXCIsXFxcIjNCMUYxRlxcXCI6XFxcIkpvblxcXCIsXFxcIjNCMDkxMFxcXCI6XFxcIkF1YmVyZ2luZVxcXCIsXFxcIjNCMDAwQlxcXCI6XFxcIlRlbXB0cmVzc1xcXCIsXFxcIjNBQjA5RVxcXCI6XFxcIktlcHBlbFxcXCIsXFxcIjNBNkE0N1xcXCI6XFxcIktpbGxhcm5leVxcXCIsXFxcIjNBNjg2Q1xcXCI6XFxcIldpbGxpYW1cXFwiLFxcXCIzQTJBNkFcXFwiOlxcXCJKYWNhcnRhXFxcIixcXFwiM0EyMDEwXFxcIjpcXFwiU2FtYnVjYVxcXCIsXFxcIjNBMDAyMFxcXCI6XFxcIlRvbGVkb1xcXCIsXFxcIjM4MUE1MVxcXCI6XFxcIkdyYXBlXFxcIixcXFwiMzcyOTBFXFxcIjpcXFwiQnJvd24gVHVtYmxld2VlZFxcXCIsXFxcIjM3MUQwOVxcXCI6XFxcIkNsaW5rZXJcXFwiLFxcXCIzNjc0N0RcXFwiOlxcXCJNaW5nXFxcIixcXFwiMzYzQzBEXFxcIjpcXFwiV2Fpb3VydVxcXCIsXFxcIjM1NEU4Q1xcXCI6XFxcIkNoYW1icmF5XFxcIixcXFwiMzUwRTU3XFxcIjpcXFwiSmFnZ2VyXFxcIixcXFwiMzUwRTQyXFxcIjpcXFwiVmFsZW50aW5vXFxcIixcXFwiMzNDQzk5XFxcIjpcXFwiU2hhbXJvY2tcXFwiLFxcXCIzMzI5MkZcXFwiOlxcXCJUaHVuZGVyXFxcIixcXFwiMzMwMzZCXFxcIjpcXFwiQ2hyaXN0YWxsZVxcXCIsXFxcIjMyN0RBMFxcXCI6XFxcIkFzdHJhbFxcXCIsXFxcIjMyN0MxNFxcXCI6XFxcIkJpbGJhb1xcXCIsXFxcIjMyNUQ1MlxcXCI6XFxcIlN0cm9tYm9saVxcXCIsXFxcIjMyMjkzQVxcXCI6XFxcIkJsYWNrY3VycmFudFxcXCIsXFxcIjMyMTI3QVxcXCI6XFxcIlBlcnNpYW4gSW5kaWdvXFxcIixcXFwiMzE3RDgyXFxcIjpcXFwiUGFyYWRpc29cXFwiLFxcXCIzMTcyOERcXFwiOlxcXCJDYWx5cHNvXFxcIixcXFwiMzE1QkExXFxcIjpcXFwiQXp1cmVcXFwiLFxcXCIzMTFDMTdcXFwiOlxcXCJFY2xpcHNlXFxcIixcXFwiMzBENUM4XFxcIjpcXFwiVHVycXVvaXNlXFxcIixcXFwiMzA0QjZBXFxcIjpcXFwiU2FuIEp1YW5cXFwiLFxcXCIzMDJBMEZcXFwiOlxcXCJXb29kcnVzaFxcXCIsXFxcIjMwMUYxRVxcXCI6XFxcIkNvY29hIEJyb3duXFxcIixcXFwiMkY2MTY4XFxcIjpcXFwiQ2FzYWxcXFwiLFxcXCIyRjVBNTdcXFwiOlxcXCJTcGVjdHJhXFxcIixcXFwiMkY1MTlFXFxcIjpcXFwiU2FwcGhpcmVcXFwiLFxcXCIyRjNDQjNcXFwiOlxcXCJHb3Zlcm5vciBCYXlcXFwiLFxcXCIyRjI3MEVcXFwiOlxcXCJPbmlvblxcXCIsXFxcIjJFQkZENFxcXCI6XFxcIlNjb290ZXJcXFwiLFxcXCIyRTNGNjJcXFwiOlxcXCJSaGlub1xcXCIsXFxcIjJFMzIyMlxcXCI6XFxcIlJhbmdpdG90b1xcXCIsXFxcIjJFMTkwNVxcXCI6XFxcIkphY2tvIEJlYW5cXFwiLFxcXCIyRTAzMjlcXFwiOlxcXCJKYWNhcmFuZGFcXFwiLFxcXCIyRDU2OUJcXFwiOlxcXCJTdCBUcm9wYXpcXFwiLFxcXCIyRDM4M0FcXFwiOlxcXCJPdXRlciBTcGFjZVxcXCIsXFxcIjJEMjUxMFxcXCI6XFxcIk1pa2Fkb1xcXCIsXFxcIjJDOEM4NFxcXCI6XFxcIkxvY2hpbnZhclxcXCIsXFxcIjJDMjEzM1xcXCI6XFxcIkJsZWFjaGVkIENlZGFyXFxcIixcXFwiMkMxNjMyXFxcIjpcXFwiUmV2b2x2ZXJcXFwiLFxcXCIyQzBFOENcXFwiOlxcXCJCbHVlIEdlbVxcXCIsXFxcIjJCMzIyOFxcXCI6XFxcIkhlYXZ5IE1ldGFsXFxcIixcXFwiMkIxOTRGXFxcIjpcXFwiVmFsaGFsbGFcXFwiLFxcXCIyQjAyMDJcXFwiOlxcXCJTZXBpYSBCbGFja1xcXCIsXFxcIjJBNTJCRVxcXCI6XFxcIkNlcnVsZWFuIEJsdWVcXFwiLFxcXCIyQTM4MEJcXFwiOlxcXCJUdXJ0bGUgR3JlZW5cXFwiLFxcXCIyQTI2MzBcXFwiOlxcXCJCYWx0aWMgU2VhXFxcIixcXFwiMkExNDBFXFxcIjpcXFwiQ29mZmVlIEJlYW5cXFwiLFxcXCIyQTAzNTlcXFwiOlxcXCJDaGVycnkgUGllXFxcIixcXFwiMjlBQjg3XFxcIjpcXFwiSnVuZ2xlIEdyZWVuXFxcIixcXFwiMjk3QjlBXFxcIjpcXFwiSmVsbHkgQmVhblxcXCIsXFxcIjI5MEM1RVxcXCI6XFxcIlZpb2xlbnQgVmlvbGV0XFxcIixcXFwiMjg2QUNEXFxcIjpcXFwiTWFyaW5lclxcXCIsXFxcIjI4M0E3N1xcXCI6XFxcIkFzdHJvbmF1dFxcXCIsXFxcIjI4MUUxNVxcXCI6XFxcIk9pbFxcXCIsXFxcIjI3OEE1QlxcXCI6XFxcIkV1Y2FseXB0dXNcXFwiLFxcXCIyNzUwNEJcXFwiOlxcXCJQbGFudGF0aW9uXFxcIixcXFwiMjczQTgxXFxcIjpcXFwiQmF5IG9mIE1hbnlcXFwiLFxcXCIyNjI4M0JcXFwiOlxcXCJFYm9ueSBDbGF5XFxcIixcXFwiMjYwNTZBXFxcIjpcXFwiUGFyaXMgTVxcXCIsXFxcIjI1OTZEMVxcXCI6XFxcIkN1cmlvdXMgQmx1ZVxcXCIsXFxcIjI1MzExQ1xcXCI6XFxcIkdyZWVuIEtlbHBcXFwiLFxcXCIyNTI3MkNcXFwiOlxcXCJTaGFya1xcXCIsXFxcIjI1MUY0RlxcXCI6XFxcIlBvcnQgR29yZVxcXCIsXFxcIjI0NTAwRlxcXCI6XFxcIkdyZWVuIEhvdXNlXFxcIixcXFwiMjQyRTE2XFxcIjpcXFwiQmxhY2sgT2xpdmVcXFwiLFxcXCIyNDJBMURcXFwiOlxcXCJMb2cgQ2FiaW5cXFwiLFxcXCIyNDBDMDJcXFwiOlxcXCJLaWxhbWFuamFyb1xcXCIsXFxcIjI0MEE0MFxcXCI6XFxcIlZpb2xldFxcXCIsXFxcIjIxMUEwRVxcXCI6XFxcIkV0ZXJuaXR5XFxcIixcXFwiMjAyRTU0XFxcIjpcXFwiQ2xvdWQgQnVyc3RcXFwiLFxcXCIyMDIwOERcXFwiOlxcXCJKYWNrc29ucyBQdXJwbGVcXFwiLFxcXCIxRkMyQzJcXFwiOlxcXCJKYXZhXFxcIixcXFwiMUYxMjBGXFxcIjpcXFwiTmlnaHQgUmlkZXJcXFwiLFxcXCIxRTlBQjBcXFwiOlxcXCJFYXN0ZXJuIEJsdWVcXFwiLFxcXCIxRTQzM0NcXFwiOlxcXCJUZSBQYXBhIEdyZWVuXFxcIixcXFwiMUUzODVCXFxcIjpcXFwiQ2VsbG9cXFwiLFxcXCIxRTE3MDhcXFwiOlxcXCJFbCBQYXNvXFxcIixcXFwiMUUxNjA5XFxcIjpcXFwiS2FyYWthXFxcIixcXFwiMUUwRjA0XFxcIjpcXFwiQ3Jlb2xlXFxcIixcXFwiMUQ2MTQyXFxcIjpcXFwiR3JlZW4gUGVhXFxcIixcXFwiMUM3QzdEXFxcIjpcXFwiRWxtXFxcIixcXFwiMUM0MDJFXFxcIjpcXFwiRXZlcmdsYWRlXFxcIixcXFwiMUMzOUJCXFxcIjpcXFwiUGVyc2lhbiBCbHVlXFxcIixcXFwiMUMxRTEzXFxcIjpcXFwiUmFuZ29vbiBHcmVlblxcXCIsXFxcIjFDMTIwOFxcXCI6XFxcIkNyb3dzaGVhZFxcXCIsXFxcIjFCNjU5RFxcXCI6XFxcIk1hdGlzc2VcXFwiLFxcXCIxQjMxNjJcXFwiOlxcXCJCaXNjYXlcXFwiLFxcXCIxQjJGMTFcXFwiOlxcXCJTZWF3ZWVkXFxcIixcXFwiMUIxNDA0XFxcIjpcXFwiQWNhZGlhXFxcIixcXFwiMUIxMjdCXFxcIjpcXFwiRGVlcCBLb2FtYXJ1XFxcIixcXFwiMUIxMDM1XFxcIjpcXFwiSGFpdGlcXFwiLFxcXCIxQjAyNDVcXFwiOlxcXCJUb2xvcGVhXFxcIixcXFwiMUFCMzg1XFxcIjpcXFwiTW91bnRhaW4gTWVhZG93XFxcIixcXFwiMUExQTY4XFxcIjpcXFwiTHVja3kgUG9pbnRcXFwiLFxcXCIxOTU5QThcXFwiOlxcXCJGdW4gQmx1ZVxcXCIsXFxcIjE5MzMwRVxcXCI6XFxcIlBhbG0gTGVhZlxcXCIsXFxcIjE4NTg3QVxcXCI6XFxcIkJsdW1pbmVcXFwiLFxcXCIxODJEMDlcXFwiOlxcXCJEZWVwIEZvcmVzdCBHcmVlblxcXCIsXFxcIjE3MUYwNFxcXCI6XFxcIlBpbmUgVHJlZVxcXCIsXFxcIjE2MzIyQ1xcXCI6XFxcIlRpbWJlciBHcmVlblxcXCIsXFxcIjE2MkE0MFxcXCI6XFxcIkJpZyBTdG9uZVxcXCIsXFxcIjE2MUQxMFxcXCI6XFxcIkh1bnRlciBHcmVlblxcXCIsXFxcIjE1NzM2QlxcXCI6XFxcIkdlbm9hXFxcIixcXFwiMTU2MEJEXFxcIjpcXFwiRGVuaW1cXFwiLFxcXCIxNTFGNENcXFwiOlxcXCJCdW50aW5nXFxcIixcXFwiMTQ1MEFBXFxcIjpcXFwiVG9yeSBCbHVlXFxcIixcXFwiMTM0RjE5XFxcIjpcXFwiUGFyc2xleVxcXCIsXFxcIjEzMjY0RFxcXCI6XFxcIkJsdWUgWm9kaWFjXFxcIixcXFwiMTMwQTA2XFxcIjpcXFwiQXNwaGFsdFxcXCIsXFxcIjEyNkI0MFxcXCI6XFxcIkpld2VsXFxcIixcXFwiMTIwQThGXFxcIjpcXFwiVWx0cmFtYXJpbmVcXFwiLFxcXCIxMTBDNkNcXFwiOlxcXCJBcmFwYXdhXFxcIixcXFwiMTAxMjFEXFxcIjpcXFwiVnVsY2FuXFxcIixcXFwiMEYyRDlFXFxcIjpcXFwiVG9yZWEgQmF5XFxcIixcXFwiMEUyQTMwXFxcIjpcXFwiRmlyZWZseVxcXCIsXFxcIjBFMEUxOFxcXCI6XFxcIkNpbmRlclxcXCIsXFxcIjBEMkUxQ1xcXCI6XFxcIkJ1c2hcXFwiLFxcXCIwRDFDMTlcXFwiOlxcXCJBenRlY1xcXCIsXFxcIjBEMTExN1xcXCI6XFxcIkJ1bmtlclxcXCIsXFxcIjBEMDMzMlxcXCI6XFxcIkJsYWNrIFJvY2tcXFwiLFxcXCIwQzg5OTBcXFwiOlxcXCJCbHVlIENoaWxsXFxcIixcXFwiMEM3QTc5XFxcIjpcXFwiU3VyZmllIEdyZWVuXFxcIixcXFwiMEMxOTExXFxcIjpcXFwiUmFjaW5nIEdyZWVuXFxcIixcXFwiMEMwRDBGXFxcIjpcXFwiV29vZHNtb2tlXFxcIixcXFwiMEMwQjFEXFxcIjpcXFwiRWJvbnlcXFwiLFxcXCIwQkRBNTFcXFwiOlxcXCJNYWxhY2hpdGVcXFwiLFxcXCIwQjYyMDdcXFwiOlxcXCJTYW4gRmVsaXhcXFwiLFxcXCIwQjEzMDRcXFwiOlxcXCJCbGFjayBGb3Jlc3RcXFwiLFxcXCIwQjExMDdcXFwiOlxcXCJHb3Jkb25zIEdyZWVuXFxcIixcXFwiMEIwRjA4XFxcIjpcXFwiTWFyc2hsYW5kXFxcIixcXFwiMEIwQjBCXFxcIjpcXFwiQ29kIEdyYXlcXFwiLFxcXCIwQTZGNzVcXFwiOlxcXCJBdG9sbFxcXCIsXFxcIjBBNjkwNlxcXCI6XFxcIkphcGFuZXNlIExhdXJlbFxcXCIsXFxcIjBBNDgwRFxcXCI6XFxcIkRhcmsgRmVyblxcXCIsXFxcIjBBMDAxQ1xcXCI6XFxcIkJsYWNrIFJ1c3NpYW5cXFwiLFxcXCIwOTdGNEJcXFwiOlxcXCJTYWxlbVxcXCIsXFxcIjA5NTg1OVxcXCI6XFxcIkRlZXAgU2VhIEdyZWVuXFxcIixcXFwiMDkzNjI0XFxcIjpcXFwiQm90dGxlIEdyZWVuXFxcIixcXFwiMDkyNTVEXFxcIjpcXFwiTWFkaXNvblxcXCIsXFxcIjA5MjMwRlxcXCI6XFxcIlBhbG0gR3JlZW5cXFwiLFxcXCIwOTIyNTZcXFwiOlxcXCJEb3ducml2ZXJcXFwiLFxcXCIwOEU4REVcXFwiOlxcXCJCcmlnaHQgVHVycXVvaXNlXFxcIixcXFwiMDg4MzcwXFxcIjpcXFwiRWxmIEdyZWVuXFxcIixcXFwiMDgyNTY3XFxcIjpcXFwiRGVlcCBTYXBwaGlyZVxcXCIsXFxcIjA4MTkxMFxcXCI6XFxcIkJsYWNrIEJlYW5cXFwiLFxcXCIwODAxMTBcXFwiOlxcXCJKYWd1YXJcXFwiLFxcXCIwNzNBNTBcXFwiOlxcXCJUYXJhd2VyYVxcXCIsXFxcIjA2QTE4OVxcXCI6XFxcIk5pYWdhcmFcXFwiLFxcXCIwNjlCODFcXFwiOlxcXCJHb3NzYW1lclxcXCIsXFxcIjA2MzUzN1xcXCI6XFxcIlRpYmVyXFxcIixcXFwiMDYyQTc4XFxcIjpcXFwiQ2F0YWxpbmEgQmx1ZVxcXCIsXFxcIjA1NkY1N1xcXCI6XFxcIldhdGVyY291cnNlXFxcIixcXFwiMDU1OTg5XFxcIjpcXFwiVmVuaWNlIEJsdWVcXFwiLFxcXCIwNTE2NTdcXFwiOlxcXCJHdWxmIEJsdWVcXFwiLFxcXCIwNTEwNDBcXFwiOlxcXCJEZWVwIENvdmVcXFwiLFxcXCIwNDQyNTlcXFwiOlxcXCJUZWFsIEJsdWVcXFwiLFxcXCIwNDQwMjJcXFwiOlxcXCJadWNjaW5pXFxcIixcXFwiMDQyRTRDXFxcIjpcXFwiQmx1ZSBXaGFsZVxcXCIsXFxcIjA0MTMyMlxcXCI6XFxcIkJsYWNrIFBlYXJsXFxcIixcXFwiMDQxMDA0XFxcIjpcXFwiTWlkbmlnaHQgTW9zc1xcXCIsXFxcIjAzNkE2RVxcXCI6XFxcIk1vc3F1ZVxcXCIsXFxcIjAzMkI1MlxcXCI6XFxcIkdyZWVuIFZvZ3VlXFxcIixcXFwiMDMxNjNDXFxcIjpcXFwiVGFuZ2Fyb2FcXFwiLFxcXCIwMkE0RDNcXFwiOlxcXCJDZXJ1bGVhblxcXCIsXFxcIjAyODY2RlxcXCI6XFxcIk9ic2VydmF0b3J5XFxcIixcXFwiMDI2Mzk1XFxcIjpcXFwiQmFoYW1hIEJsdWVcXFwiLFxcXCIwMjRFNDZcXFwiOlxcXCJFdmVuaW5nIFNlYVxcXCIsXFxcIjAyNDc4RVxcXCI6XFxcIkNvbmdyZXNzIEJsdWVcXFwiLFxcXCIwMjQwMkNcXFwiOlxcXCJTaGVyd29vZCBHcmVlblxcXCIsXFxcIjAyMkQxNVxcXCI6XFxcIkVuZ2xpc2ggSG9sbHlcXFwiLFxcXCIwMUEzNjhcXFwiOlxcXCJHcmVlbiBIYXplXFxcIixcXFwiMDE4MjZCXFxcIjpcXFwiRGVlcCBTZWFcXFwiLFxcXCIwMTc5ODdcXFwiOlxcXCJCbHVlIExhZ29vblxcXCIsXFxcIjAxNzk2RlxcXCI6XFxcIlBpbmUgR3JlZW5cXFwiLFxcXCIwMTZEMzlcXFwiOlxcXCJGdW4gR3JlZW5cXFwiLFxcXCIwMTYxNjJcXFwiOlxcXCJCbHVlIFN0b25lXFxcIixcXFwiMDE1RTg1XFxcIjpcXFwiT3JpZW50XFxcIixcXFwiMDE0QjQzXFxcIjpcXFwiQXF1YSBEZWVwXFxcIixcXFwiMDEzRjZBXFxcIjpcXFwiUmVnYWwgQmx1ZVxcXCIsXFxcIjAxM0U2MlxcXCI6XFxcIkFzdHJvbmF1dCBCbHVlXFxcIixcXFwiMDEzNzFBXFxcIjpcXFwiQ291bnR5IEdyZWVuXFxcIixcXFwiMDEzNjFDXFxcIjpcXFwiQ2FyZGluIEdyZWVuXFxcIixcXFwiMDEyNzMxXFxcIjpcXFwiRGFpbnRyZWVcXFwiLFxcXCIwMTFEMTNcXFwiOlxcXCJIb2xseVxcXCIsXFxcIjAxMTYzNVxcXCI6XFxcIk1pZG5pZ2h0XFxcIixcXFwiMDEwRDFBXFxcIjpcXFwiQmx1ZSBDaGFyY29hbFxcXCIsXFxcIjAwQ0NDQ1xcXCI6XFxcIlJvYmluXFxcXCdzIEVnZyBCbHVlIFxcXCIsXFxcIjAwQ0M5OVxcXCI6XFxcIkNhcmliYmVhbiBHcmVlblxcXCIsXFxcIjAwQTg2QlxcXCI6XFxcIkphZGVcXFwiLFxcXCIwMEE2OTNcXFwiOlxcXCJQZXJzaWFuIEdyZWVuXFxcIixcXFwiMDA5REM0XFxcIjpcXFwiUGFjaWZpYyBCbHVlXFxcIixcXFwiMDA5NUI2XFxcIjpcXFwiQm9uZGkgQmx1ZVxcXCIsXFxcIjAwN0ZGRlxcXCI6XFxcIkF6dXJlIFJhZGlhbmNlXFxcIixcXFwiMDA3RUM3XFxcIjpcXFwiTG9jaG1hcmFcXFwiLFxcXCIwMDdCQTdcXFwiOlxcXCJEZWVwIENlcnVsZWFuXFxcIixcXFwiMDA3NkEzXFxcIjpcXFwiQWxscG9ydHNcXFwiLFxcXCIwMDc1NUVcXFwiOlxcXCJUcm9waWNhbCBSYWluIEZvcmVzdFxcXCIsXFxcIjAwNjZGRlxcXCI6XFxcIkJsdWUgUmliYm9uXFxcIixcXFwiMDA2NkNDXFxcIjpcXFwiU2NpZW5jZSBCbHVlXFxcIixcXFwiMDA1ODFBXFxcIjpcXFwiQ2FtYXJvbmVcXFwiLFxcXCIwMDU2QTdcXFwiOlxcXCJFbmRlYXZvdXJcXFwiLFxcXCIwMDQ5NTBcXFwiOlxcXCJTaGVycGEgQmx1ZVxcXCIsXFxcIjAwNDgxNlxcXCI6XFxcIkNydXNvZVxcXCIsXFxcIjAwNDdBQlxcXCI6XFxcIkNvYmFsdFxcXCIsXFxcIjAwNDYyMFxcXCI6XFxcIkthaXRva2UgR3JlZW5cXFwiLFxcXCIwMDNFNDBcXFwiOlxcXCJDeXBydXNcXFwiLFxcXCIwMDM1MzJcXFwiOlxcXCJEZWVwIFRlYWxcXFwiLFxcXCIwMDMzOTlcXFwiOlxcXCJTbWFsdFxcXCIsXFxcIjAwMzE1M1xcXCI6XFxcIlBydXNzaWFuIEJsdWVcXFwiLFxcXCIwMDJGQTdcXFwiOlxcXCJJbnRlcm5hdGlvbmFsIEtsZWluIEJsdWVcXFwiLFxcXCIwMDJFMjBcXFwiOlxcXCJCdXJuaGFtXFxcIixcXFwiMDAyOTAwXFxcIjpcXFwiRGVlcCBGaXJcXFwiLFxcXCIwMDIzODdcXFwiOlxcXCJSZXNvbHV0aW9uIEJsdWVcXFwiLFxcXCIwMDFCMUNcXFwiOlxcXCJTd2FtcFxcXCIsXFxcIjAwMDc0MVxcXCI6XFxcIlN0cmF0b3NcXFwifScpO1xcblxcbi8vIyBzb3VyY2VVUkw9d2VicGFjazovL2dldENvbG9yTmFtZS8uL2RhdGEvY3VyYXRlZC5qc29uP1wiKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9kYXRhL3dlYi5qc29uXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL2RhdGEvd2ViLmpzb24gKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKi8gKChtb2R1bGUpID0+IHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5ldmFsKFwibW9kdWxlLmV4cG9ydHMgPSBKU09OLnBhcnNlKCd7XFxcIjE5MTk3MFxcXCI6XFxcIk1pZG5pZ2h0IEJsdWVcXFwiLFxcXCI2NjMzOTlcXFwiOlxcXCJSZWJlY2NhIFB1cnBsZVxcXCIsXFxcIjY5Njk2OVxcXCI6XFxcIkRpbSBHcmF5XFxcIixcXFwiNzA4MDkwXFxcIjpcXFwiU2xhdGUgR3JheVxcXCIsXFxcIjc3ODg5OVxcXCI6XFxcIkxpZ2h0IFNsYXRlIEdyYXlcXFwiLFxcXCI4MDAwMDBcXFwiOlxcXCJNYXJvb25cXFwiLFxcXCI4MDAwODBcXFwiOlxcXCJQdXJwbGVcXFwiLFxcXCI4MDgwMDBcXFwiOlxcXCJPbGl2ZVxcXCIsXFxcIjgwODA4MFxcXCI6XFxcIkdyYXlcXFwiLFxcXCJGRkZGRkZcXFwiOlxcXCJXaGl0ZVxcXCIsXFxcIkZGRkZGMFxcXCI6XFxcIkl2b3J5XFxcIixcXFwiRkZGRkUwXFxcIjpcXFwiTGlnaHQgWWVsbG93XFxcIixcXFwiRkZGRjAwXFxcIjpcXFwiWWVsbG93XFxcIixcXFwiRkZGQUZBXFxcIjpcXFwiU25vd1xcXCIsXFxcIkZGRkFGMFxcXCI6XFxcIkZsb3JhbCBXaGl0ZVxcXCIsXFxcIkZGRkFDRFxcXCI6XFxcIkxlbW9uIENoaWZmb25cXFwiLFxcXCJGRkY4RENcXFwiOlxcXCJDb3JuIFNpbGtcXFwiLFxcXCJGRkY1RUVcXFwiOlxcXCJTZWFzaGVsbFxcXCIsXFxcIkZGRjBGNVxcXCI6XFxcIkxhdmVuZGVyIGJsdXNoXFxcIixcXFwiRkZFRkQ1XFxcIjpcXFwiUGFwYXlhIFdoaXBcXFwiLFxcXCJGRkVCQ0RcXFwiOlxcXCJCbGFuY2hlZCBBbG1vbmRcXFwiLFxcXCJGRkU0RTFcXFwiOlxcXCJNaXN0eSBSb3NlXFxcIixcXFwiRkZFNEM0XFxcIjpcXFwiQmlzcXVlXFxcIixcXFwiRkZFNEI1XFxcIjpcXFwiTW9jY2FzaW5cXFwiLFxcXCJGRkRFQURcXFwiOlxcXCJOYXZham8gV2hpdGVcXFwiLFxcXCJGRkRBQjlcXFwiOlxcXCJQZWFjaCBQdWZmXFxcIixcXFwiRkZENzAwXFxcIjpcXFwiR29sZFxcXCIsXFxcIkZGQzBDQlxcXCI6XFxcIlBpbmtcXFwiLFxcXCJGRkI2QzFcXFwiOlxcXCJMaWdodCBQaW5rXFxcIixcXFwiRkZBNTAwXFxcIjpcXFwiT3JhbmdlXFxcIixcXFwiRkZBMDdBXFxcIjpcXFwiTGlnaHQgU2FsbW9uXFxcIixcXFwiRkY4QzAwXFxcIjpcXFwiRGFyayBPcmFuZ2VcXFwiLFxcXCJGRjdGNTBcXFwiOlxcXCJDb3JhbFxcXCIsXFxcIkZGNjlCNFxcXCI6XFxcIkhvdCBQaW5rXFxcIixcXFwiRkY2MzQ3XFxcIjpcXFwiVG9tYXRvXFxcIixcXFwiRkY0NTAwXFxcIjpcXFwiT3JhbmdlIFJlZFxcXCIsXFxcIkZGMTQ5M1xcXCI6XFxcIkRlZXAgUGlua1xcXCIsXFxcIkZGMDBGRlxcXCI6XFxcIkZ1Y2hzaWEgLyBNYWdlbnRhXFxcIixcXFwiRkYwMDAwXFxcIjpcXFwiUmVkXFxcIixcXFwiRkRGNUU2XFxcIjpcXFwiT2xkIExhY2VcXFwiLFxcXCJGQUZBRDJcXFwiOlxcXCJMaWdodCBHb2xkZW5yb2QgWWVsbG93XFxcIixcXFwiRkFGMEU2XFxcIjpcXFwiTGluZW5cXFwiLFxcXCJGQUVCRDdcXFwiOlxcXCJBbnRpcXVlIFdoaXRlXFxcIixcXFwiRkE4MDcyXFxcIjpcXFwiU2FsbW9uXFxcIixcXFwiRjhGOEZGXFxcIjpcXFwiR2hvc3QgV2hpdGVcXFwiLFxcXCJGNUZGRkFcXFwiOlxcXCJNaW50IENyZWFtXFxcIixcXFwiRjVGNUY1XFxcIjpcXFwiV2hpdGUgU21va2VcXFwiLFxcXCJGNUY1RENcXFwiOlxcXCJCZWlnZVxcXCIsXFxcIkY1REVCM1xcXCI6XFxcIldoZWF0XFxcIixcXFwiRjRBNDYwXFxcIjpcXFwiU2FuZHkgYnJvd25cXFwiLFxcXCJGMEZGRkZcXFwiOlxcXCJBenVyZVxcXCIsXFxcIkYwRkZGMFxcXCI6XFxcIkhvbmV5ZGV3XFxcIixcXFwiRjBGOEZGXFxcIjpcXFwiQWxpY2UgQmx1ZVxcXCIsXFxcIkYwRTY4Q1xcXCI6XFxcIktoYWtpXFxcIixcXFwiRjA4MDgwXFxcIjpcXFwiTGlnaHQgQ29yYWxcXFwiLFxcXCJFRUU4QUFcXFwiOlxcXCJQYWxlIEdvbGRlbnJvZFxcXCIsXFxcIkVFODJFRVxcXCI6XFxcIlZpb2xldFxcXCIsXFxcIkU5OTY3QVxcXCI6XFxcIkRhcmsgU2FsbW9uXFxcIixcXFwiRTZFNkZBXFxcIjpcXFwiTGF2ZW5kZXJcXFwiLFxcXCJFMEZGRkZcXFwiOlxcXCJMaWdodCBDeWFuXFxcIixcXFwiREVCODg3XFxcIjpcXFwiQnVybHkgV29vZFxcXCIsXFxcIkREQTBERFxcXCI6XFxcIlBsdW1cXFwiLFxcXCJEQ0RDRENcXFwiOlxcXCJHYWluc2Jvcm9cXFwiLFxcXCJEQzE0M0NcXFwiOlxcXCJDcmltc29uXFxcIixcXFwiREI3MDkzXFxcIjpcXFwiUGFsZSBWaW9sZXQgUmVkXFxcIixcXFwiREFBNTIwXFxcIjpcXFwiR29sZGVucm9kXFxcIixcXFwiREE3MEQ2XFxcIjpcXFwiT3JjaGlkXFxcIixcXFwiRDhCRkQ4XFxcIjpcXFwiVGhpc3RsZVxcXCIsXFxcIkQzRDNEM1xcXCI6XFxcIkxpZ2h0IEdyYXlcXFwiLFxcXCJEMkI0OENcXFwiOlxcXCJUYW5cXFwiLFxcXCJEMjY5MUVcXFwiOlxcXCJDaG9jb2xhdGVcXFwiLFxcXCJDRDg1M0ZcXFwiOlxcXCJQZXJ1XFxcIixcXFwiQ0Q1QzVDXFxcIjpcXFwiSW5kaWFuIFJlZFxcXCIsXFxcIkM3MTU4NVxcXCI6XFxcIk1lZGl1bSBWaW9sZXQgUmVkXFxcIixcXFwiQzBDMEMwXFxcIjpcXFwiU2lsdmVyXFxcIixcXFwiQkRCNzZCXFxcIjpcXFwiRGFyayBLaGFraVxcXCIsXFxcIkJDOEY4RlxcXCI6XFxcIlJvc3kgQnJvd25cXFwiLFxcXCJCQTU1RDNcXFwiOlxcXCJNZWRpdW0gT3JjaGlkXFxcIixcXFwiQjg4NjBCXFxcIjpcXFwiRGFyayBHb2xkZW5yb2RcXFwiLFxcXCJCMjIyMjJcXFwiOlxcXCJGaXJlIEJyaWNrXFxcIixcXFwiQjBFMEU2XFxcIjpcXFwiUG93ZGVyIEJsdWVcXFwiLFxcXCJCMEM0REVcXFwiOlxcXCJMaWdodCBTdGVlbCBCbHVlXFxcIixcXFwiQUZFRUVFXFxcIjpcXFwiUGFsZSBUdXJxdW9pc2VcXFwiLFxcXCJBREZGMkZcXFwiOlxcXCJHcmVlbiBZZWxsb3dcXFwiLFxcXCJBREQ4RTZcXFwiOlxcXCJMaWdodCBCbHVlXFxcIixcXFwiQTlBOUE5XFxcIjpcXFwiRGFyayBHcmF5XFxcIixcXFwiQTA1MjJEXFxcIjpcXFwiU2llbm5hXFxcIixcXFwiOUFDRDMyXFxcIjpcXFwiWWVsbG93IEdyZWVuXFxcIixcXFwiOTkzMkNDXFxcIjpcXFwiRGFyayBPcmNoaWRcXFwiLFxcXCI5OEZCOThcXFwiOlxcXCJQYWxlIEdyZWVuXFxcIixcXFwiOTQwMEQzXFxcIjpcXFwiRGFyayBWaW9sZXRcXFwiLFxcXCI5MzcwREJcXFwiOlxcXCJNZWRpdW0gUHVycGxlXFxcIixcXFwiOTBFRTkwXFxcIjpcXFwiTGlnaHQgR3JlZW5cXFwiLFxcXCI4RkJDOEZcXFwiOlxcXCJEYXJrIFNlYSBHcmVlblxcXCIsXFxcIjhCNDUxM1xcXCI6XFxcIlNhZGRsZSBCcm93blxcXCIsXFxcIjhCMDA4QlxcXCI6XFxcIkRhcmsgTWFnZW50YVxcXCIsXFxcIjhCMDAwMFxcXCI6XFxcIkRhcmsgUmVkXFxcIixcXFwiOEEyQkUyXFxcIjpcXFwiQmx1ZSBWaW9sZXRcXFwiLFxcXCI4N0NFRkFcXFwiOlxcXCJMaWdodCBTa3kgQmx1ZVxcXCIsXFxcIjg3Q0VFQlxcXCI6XFxcIlNreSBCbHVlXFxcIixcXFwiN0ZGRkQ0XFxcIjpcXFwiQXF1YW1hcmluZVxcXCIsXFxcIjdGRkYwMFxcXCI6XFxcIkNoYXJ0cmV1c2VcXFwiLFxcXCI3Q0ZDMDBcXFwiOlxcXCJMYXduIEdyZWVuXFxcIixcXFwiN0I2OEVFXFxcIjpcXFwiTWVkaXVtIFNsYXRlIEJsdWVcXFwiLFxcXCI2QjhFMjNcXFwiOlxcXCJPbGl2ZSBEcmFiXFxcIixcXFwiNkE1QUNEXFxcIjpcXFwiU2xhdGUgQmx1ZVxcXCIsXFxcIjY2Q0RBQVxcXCI6XFxcIk1lZGl1bSBBcXVhbWFyaW5lXFxcIixcXFwiNjQ5NUVEXFxcIjpcXFwiQ29ybmZsb3dlciBCbHVlXFxcIixcXFwiNUY5RUEwXFxcIjpcXFwiQ2FkZXQgQmx1ZVxcXCIsXFxcIjU1NkIyRlxcXCI6XFxcIkRhcmsgT2xpdmUgR3JlZW5cXFwiLFxcXCI0QjAwODJcXFwiOlxcXCJJbmRpZ29cXFwiLFxcXCI0OEQxQ0NcXFwiOlxcXCJNZWRpdW0gVHVycXVvaXNlXFxcIixcXFwiNDgzRDhCXFxcIjpcXFwiRGFyayBTbGF0ZSBCbHVlXFxcIixcXFwiNDY4MkI0XFxcIjpcXFwiU3RlZWwgQmx1ZVxcXCIsXFxcIjQxNjlFMVxcXCI6XFxcIlJveWFsIEJsdWVcXFwiLFxcXCI0MEUwRDBcXFwiOlxcXCJUdXJxdW9pc2VcXFwiLFxcXCIzQ0IzNzFcXFwiOlxcXCJNZWRpdW0gU2VhIEdyZWVuXFxcIixcXFwiMzJDRDMyXFxcIjpcXFwiTGltZSBHcmVlblxcXCIsXFxcIjJGNEY0RlxcXCI6XFxcIkRhcmsgU2xhdGUgR3JheVxcXCIsXFxcIjJFOEI1N1xcXCI6XFxcIlNlYSBHcmVlblxcXCIsXFxcIjIyOEIyMlxcXCI6XFxcIkZvcmVzdCBHcmVlblxcXCIsXFxcIjIwQjJBQVxcXCI6XFxcIkxpZ2h0IFNlYSBHcmVlblxcXCIsXFxcIjFFOTBGRlxcXCI6XFxcIkRvZGdlciBCbHVlXFxcIixcXFwiMDBGRkZGXFxcIjpcXFwiQXF1YSAvIEN5YW5cXFwiLFxcXCIwMEZGN0ZcXFwiOlxcXCJTcHJpbmcgR3JlZW5cXFwiLFxcXCIwMEZGMDBcXFwiOlxcXCJMaW1lXFxcIixcXFwiMDBGQTlBXFxcIjpcXFwiTWVkaXVtIFNwcmluZyBHcmVlblxcXCIsXFxcIjAwQ0VEMVxcXCI6XFxcIkRhcmsgVHVycXVvaXNlXFxcIixcXFwiMDBCRkZGXFxcIjpcXFwiRGVlcCBTa3kgQmx1ZVxcXCIsXFxcIjAwOEI4QlxcXCI6XFxcIkRhcmsgQ3lhblxcXCIsXFxcIjAwODA4MFxcXCI6XFxcIlRlYWxcXFwiLFxcXCIwMDgwMDBcXFwiOlxcXCJHcmVlblxcXCIsXFxcIjAwNjQwMFxcXCI6XFxcIkRhcmsgR3JlZW5cXFwiLFxcXCIwMDAwRkZcXFwiOlxcXCJCbHVlXFxcIixcXFwiMDAwMENEXFxcIjpcXFwiTWVkaXVtIEJsdWVcXFwiLFxcXCIwMDAwOEJcXFwiOlxcXCJEYXJrIEJsdWVcXFwiLFxcXCIwMDAwODBcXFwiOlxcXCJOYXZ5XFxcIixcXFwiMDAwMDAwXFxcIjpcXFwiQmxhY2tcXFwifScpO1xcblxcbi8vIyBzb3VyY2VVUkw9d2VicGFjazovL2dldENvbG9yTmFtZS8uL2RhdGEvd2ViLmpzb24/XCIpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL2RhdGEvd2VybmVyLmpzb25cIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vZGF0YS93ZXJuZXIuanNvbiAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqLyAoKG1vZHVsZSkgPT4ge1xuXG5cInVzZSBzdHJpY3RcIjtcbmV2YWwoXCJtb2R1bGUuZXhwb3J0cyA9IEpTT04ucGFyc2UoJ3tcXFwiMjUyMDI0XFxcIjpcXFwiSW5rIEJsYWNrXFxcIixcXFwiMzgzODY3XFxcIjpcXFwiQ2hpbmEgQmx1ZVxcXCIsXFxcIjQyMzkzN1xcXCI6XFxcIlBpdGNoIG9yIEJyb3duaXNoIEJsYWNrXFxcIixcXFwiNDMzNjM1XFxcIjpcXFwiUmVkZGlzaCBCbGFja1xcXCIsXFxcIjQ1NDQ0NVxcXCI6XFxcIkdyZWVuaXNoIEJsYWNrXFxcIixcXFwiNDYzNzU5XFxcIjpcXFwiUGx1bSBQdXJwbGVcXFwiLFxcXCI1MzM1NTJcXFwiOlxcXCJBdXJpY3VsYSBQdXJwbGVcXFwiLFxcXCI1NTUxNTJcXFwiOlxcXCJHcmV5aXNoIEJsYWNrXFxcIixcXFwiNjEyNzQxXFxcIjpcXFwiUHVycGxpc2ggUmVkXFxcIixcXFwiNjEzOTM2XFxcIjpcXFwiVW1iZXIgQnJvd25cXFwiLFxcXCI3MTE1MThcXFwiOlxcXCJBcnRlcmlhbCBCbG9vZCBSZWRcXFwiLFxcXCI3NjYwNTFcXFwiOlxcXCJDbG92ZSBCcm93blxcXCIsXFxcIjg2NDczNVxcXCI6XFxcIkRlZXAgT3JhbmdlLWNvbG91cmVkIEJyb3duXFxcIixcXFwiOTQ2OTQzXFxcIjpcXFwiWWVsbG93aXNoIEJyb3duXFxcIixcXFwiRjFFOUNEXFxcIjpcXFwiU25vdyBXaGl0ZVxcXCIsXFxcIkYyRTdDRlxcXCI6XFxcIlJlZGRpc2ggV2hpdGVcXFwiLFxcXCJFQ0U2RDBcXFwiOlxcXCJQdXJwbGlzaCBXaGl0ZVxcXCIsXFxcIkYyRUFDQ1xcXCI6XFxcIlllbGxvd2lzaCBXaGl0ZVxcXCIsXFxcIkYzRTlDQVxcXCI6XFxcIk9yYW5nZSBjb2xvdXJlZCBXaGl0ZVxcXCIsXFxcIkYyRUJDRFxcXCI6XFxcIkdyZWVuaXNoIFdoaXRlXFxcIixcXFwiRTZFMUM5XFxcIjpcXFwiU2tpbW1lZCBtaWxrIFdoaXRlXFxcIixcXFwiRTJEREM2XFxcIjpcXFwiR3JleWlzaCBXaGl0ZVxcXCIsXFxcIkNCQzhCN1xcXCI6XFxcIkFzaCBHcmV5XFxcIixcXFwiQkZCQkIwXFxcIjpcXFwiU21va2UgR3JleVxcXCIsXFxcIkJFQkVCM1xcXCI6XFxcIkZyZW5jaCBHcmV5XFxcIixcXFwiQjdCNUFDXFxcIjpcXFwiUGVhcmwgR3JleVxcXCIsXFxcIkJBQjE5MVxcXCI6XFxcIlllbGxvd2lzaCBHcmV5XFxcIixcXFwiOUM5RDlBXFxcIjpcXFwiQmx1aXNoIEdyZXlcXFwiLFxcXCI4QThEODRcXFwiOlxcXCJHcmVlbmlzaCBHcmV5XFxcIixcXFwiNUI1QzYxXFxcIjpcXFwiQmxhY2tpc2ggR3JleVxcXCIsXFxcIjQxM0Y0NFxcXCI6XFxcIkJsdWlzaCBCbGFja1xcXCIsXFxcIjI0MUYyMFxcXCI6XFxcIlZlbHZldCBCbGFja1xcXCIsXFxcIjI4MUYzRlxcXCI6XFxcIlNjb3RjaCBCbHVlXFxcIixcXFwiMUMxOTQ5XFxcIjpcXFwiUHJ1c3NpYW4gQmx1ZVxcXCIsXFxcIjRGNjM4RFxcXCI6XFxcIkluZGlnbyBCbHVlXFxcIixcXFwiNUM2QjhGXFxcIjpcXFwiQXp1cmUgQmx1ZVxcXCIsXFxcIjY1N0FCQlxcXCI6XFxcIlVsdHJhbWFyaW5lIEJsdWVcXFwiLFxcXCI2Rjg4QUZcXFwiOlxcXCJGbGF4LUZsb3dlciBCbHVlXFxcIixcXFwiNzk5NEI1XFxcIjpcXFwiQmVybGluIEJsdWVcXFwiLFxcXCI2RkI1QThcXFwiOlxcXCJWZXJkaXR0ZXIgQmx1ZVxcXCIsXFxcIjcxOUJBMlxcXCI6XFxcIkdyZWVuaXNoIEJsdWVcXFwiLFxcXCI4QUExQTZcXFwiOlxcXCJHcmV5aXNoIEJsdWVcXFwiLFxcXCJEMEQ1RDNcXFwiOlxcXCJCbHVpc2ggTGlsYWMgUHVycGxlXFxcIixcXFwiODU5MEFFXFxcIjpcXFwiQmx1aXNoIFB1cnBsZVxcXCIsXFxcIjNBMkY1MlxcXCI6XFxcIlZpb2xldCBQdXJwbGVcXFwiLFxcXCIzOTMzNEFcXFwiOlxcXCJQYW5zeSBQdXJwbGVcXFwiLFxcXCI2QzZEOTRcXFwiOlxcXCJDYW1wYW51bGEgUHVycGxlXFxcIixcXFwiNTg0Qzc3XFxcIjpcXFwiSW1wZXJpYWwgUHVycGxlXFxcIixcXFwiQkZCQUMwXFxcIjpcXFwiUmVkIExpbGFjIFB1cnBsZVxcXCIsXFxcIjc3NzQ3RlxcXCI6XFxcIkxhdmVuZGVyIFB1cnBsZVxcXCIsXFxcIjRBNDc1Q1xcXCI6XFxcIlBhbGUgQmxhY2tpc2ggUHVycGxlXFxcIixcXFwiQjhCRkFGXFxcIjpcXFwiQ2VsYWRpbmUgR3JlZW5cXFwiLFxcXCJCMkI1OTlcXFwiOlxcXCJNb3VudGFpbiBHcmVlblxcXCIsXFxcIjk3OUM4NFxcXCI6XFxcIkxlZWsgR3JlZW5cXFwiLFxcXCI1RDYxNjFcXFwiOlxcXCJCbGFja2lzaCBHcmVlblxcXCIsXFxcIjYxQUM4NlxcXCI6XFxcIlZlcmRpZ3JpcyBHcmVlblxcXCIsXFxcIkE0QjZBN1xcXCI6XFxcIkJsdWlzaCBHcmVlblxcXCIsXFxcIkFEQkE5OFxcXCI6XFxcIkFwcGxlIEdyZWVuXFxcIixcXFwiOTNCNzc4XFxcIjpcXFwiRW1lcmFsZCBHcmVlblxcXCIsXFxcIjdEOEM1NVxcXCI6XFxcIkdyYXNzIEdyZWVuXFxcIixcXFwiMzM0MzFFXFxcIjpcXFwiRHVjayBHcmVlblxcXCIsXFxcIjdDODYzNVxcXCI6XFxcIlNhcCBHcmVlblxcXCIsXFxcIjhFOTg0OVxcXCI6XFxcIlBpc3RhY2hpbyBHcmVlblxcXCIsXFxcIkMyQzE5MFxcXCI6XFxcIkFzcGFyYWd1cyBHcmVlblxcXCIsXFxcIjY3NzY1QlxcXCI6XFxcIk9saXZlIEdyZWVuXFxcIixcXFwiQUI5MjRCXFxcIjpcXFwiT2lsIEdyZWVuXFxcIixcXFwiQzhDNzZGXFxcIjpcXFwiU2lza2luIEdyZWVuXFxcIixcXFwiQ0NDMDUwXFxcIjpcXFwiU3VscGh1ciBZZWxsb3dcXFwiLFxcXCJFQkREOTlcXFwiOlxcXCJQcmltcm9zZSBZZWxsb3dcXFwiLFxcXCJBQjk2NDlcXFwiOlxcXCJXYXggWWVsbG93XFxcIixcXFwiREJDMzY0XFxcIjpcXFwiTGVtb24gWWVsbG93XFxcIixcXFwiRTZEMDU4XFxcIjpcXFwiR2FtYm9nZSBZZWxsb3dcXFwiLFxcXCJFQUQ2NjVcXFwiOlxcXCJLaW5ncyBZZWxsb3dcXFwiLFxcXCJEMDlCMkNcXFwiOlxcXCJTYWZmcm9uIFllbGxvd1xcXCIsXFxcIkEzNjYyOVxcXCI6XFxcIkdhbGxzdG9uZSBZZWxsb3dcXFwiLFxcXCJBNzdEMzVcXFwiOlxcXCJIb25leSBZZWxsb3dcXFwiLFxcXCJGMEQ2OTZcXFwiOlxcXCJTdHJhdyBZZWxsb3dcXFwiLFxcXCJEN0M0ODVcXFwiOlxcXCJXaW5lIFllbGxvd1xcXCIsXFxcIkYxRDI4Q1xcXCI6XFxcIlNpZW5uYSBZZWxsb3dcXFwiLFxcXCJFRkNDODNcXFwiOlxcXCJPY2hyZSBZZWxsb3dcXFwiLFxcXCJGM0RBQTdcXFwiOlxcXCJDcmVhbSBZZWxsb3dcXFwiLFxcXCJERkE4MzdcXFwiOlxcXCJEdXRjaCBPcmFuZ2VcXFwiLFxcXCJFQkJDNzFcXFwiOlxcXCJCdWZmIE9yYW5nZVxcXCIsXFxcIkQxN0MzRlxcXCI6XFxcIk9ycGltZW50IE9yYW5nZVxcXCIsXFxcIjkyNDYyRlxcXCI6XFxcIkJyb3duaXNoIE9yYW5nZVxcXCIsXFxcIkJFNzI0OVxcXCI6XFxcIlJlZGRpc2ggT3JhbmdlXFxcIixcXFwiQkI2MDNDXFxcIjpcXFwiRGVlcCBSZWRkaXNoIE9yYW5nZVxcXCIsXFxcIkM3NkI0QVxcXCI6XFxcIlRpbGUgUmVkXFxcIixcXFwiQTc1NTM2XFxcIjpcXFwiSHlhY2ludGggUmVkXFxcIixcXFwiQjYzRTM2XFxcIjpcXFwiU2NhcmxldCBSZWRcXFwiLFxcXCJCNTQ5M0FcXFwiOlxcXCJWZXJtaWxpb24gUmVkXFxcIixcXFwiQ0Q2RDU3XFxcIjpcXFwiQXVyb3JhIFJlZFxcXCIsXFxcIkU5QzQ5RFxcXCI6XFxcIkZsZXNoIFJlZFxcXCIsXFxcIkVFREFDM1xcXCI6XFxcIlJvc2UgUmVkXFxcIixcXFwiRUVDRkJGXFxcIjpcXFwiUGVhY2ggQmxvc3NvbSBSZWRcXFwiLFxcXCJDRTUzNkJcXFwiOlxcXCJDYXJtaW5lIFJlZFxcXCIsXFxcIkI3NEE3MFxcXCI6XFxcIkxha2UgUmVkXFxcIixcXFwiQjc3NTdDXFxcIjpcXFwiQ3JpbXNvbiBSZWRcXFwiLFxcXCI3QTQ4NDhcXFwiOlxcXCJDb2NoaW5lYWwgUmVkXFxcIixcXFwiM0YzMDMzXFxcIjpcXFwiVmVpbm91cyBCbG9vZCBSZWRcXFwiLFxcXCI4RDc0NkZcXFwiOlxcXCJCcm93bmlzaCBQdXJwbGUgUmVkXFxcIixcXFwiNEQzNjM1XFxcIjpcXFwiQ2hvY29sYXRlIFJlZFxcXCIsXFxcIjZFM0IzMVxcXCI6XFxcIkJyb3duaXNoIFJlZFxcXCIsXFxcIjU1M0QzQVxcXCI6XFxcIkRlZXAgUmVkZGlzaCBCcm93blxcXCIsXFxcIjdBNEIzQVxcXCI6XFxcIkNoZXN0bnV0IEJyb3duXFxcIixcXFwiQzM5RTZEXFxcIjpcXFwiV29vZCBCcm93blxcXCIsXFxcIjUxM0UzMlxcXCI6XFxcIkxpdmVyIEJyb3duXFxcIixcXFwiOEI3ODU5XFxcIjpcXFwiSGFpciBCcm93blxcXCIsXFxcIjlCODU2QlxcXCI6XFxcIkJyb2Njb2xpIEJyb3duXFxcIixcXFwiNDUzQjMyXFxcIjpcXFwiQmxhY2tpc2ggQnJvd25cXFwifScpO1xcblxcbi8vIyBzb3VyY2VVUkw9d2VicGFjazovL2dldENvbG9yTmFtZS8uL2RhdGEvd2VybmVyLmpzb24/XCIpO1xuXG4vKioqLyB9KVxuXG4vKioqKioqLyBcdH0pO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG4vKioqKioqLyBcdFx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCAqL1xuLyoqKioqKi8gXHQoKCkgPT4ge1xuLyoqKioqKi8gXHRcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuLyoqKioqKi8gXHRcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuLyoqKioqKi8gXHRcdFx0XHQoKSA9PiAobW9kdWxlKTtcbi8qKioqKiovIFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzICovXG4vKioqKioqLyBcdCgoKSA9PiB7XG4vKioqKioqLyBcdFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG4vKioqKioqLyBcdFx0XHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG4vKioqKioqLyBcdFx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuLyoqKioqKi8gXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG4vKioqKioqLyBcdFx0XHRcdH1cbi8qKioqKiovIFx0XHRcdH1cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCAqL1xuLyoqKioqKi8gXHQoKCkgPT4ge1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSlcbi8qKioqKiovIFx0fSkoKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QgKi9cbi8qKioqKiovIFx0KCgpID0+IHtcbi8qKioqKiovIFx0XHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcbi8qKioqKiovIFx0XHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuLyoqKioqKi8gXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbi8qKioqKiovIFx0XHRcdH1cbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSkoKTtcbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Ly8gc3RhcnR1cFxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0Ly8gVGhpcyBlbnRyeSBtb2R1bGUgY2FuJ3QgYmUgaW5saW5lZCBiZWNhdXNlIHRoZSBldmFsIGRldnRvb2wgaXMgdXNlZC5cbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXguanNcIik7XG4vKioqKioqLyBcdF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfZXhwb3J0c19fW1wiZGVmYXVsdFwiXTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfZXhwb3J0c19fO1xuLyoqKioqKi8gfSkoKVxuO1xufSk7Il19

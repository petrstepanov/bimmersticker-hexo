// Filtering cards on the main page
var PostsFilter = function ($, helpers) {

  var DOM = {};
  var options = {
    buttonSelector: '.js--posts-filter-buttons',
    containerSelector: '.js--posts-filter-container',
    itemSelector: '.js--posts-filter-item'
  };
  // var shuffleInstance;

  function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$buttonsContainer = DOM.$el.find(options.buttonSelector);
    DOM.$buttons = DOM.$buttonsContainer.find('button');
    DOM.$grid = DOM.$el.find(options.containerSelector);
    DOM.$items = DOM.$grid.find(options.itemSelector);
  }

  function _bindEvents(element) {
    DOM.$buttonsContainer.on('click', 'button', _handleButtonClick);
  }

  function _handleButtonClick() {
    DOM.$buttons.filter('.active').removeClass('btn-primary').addClass('btn-link').removeClass('active');
    $(this).removeClass('btn-link').addClass('btn-primary').addClass('active');
    var query = $(this).data().query;
    helpers.animateCSS(DOM.$grid[0], "fadeOut", function(){
      _filterPosts(query);
    }, '150ms');
  }

  function _filterPosts(query) {
    DOM.$items.each(function () {
      var groups = $(this).data().groups;
      if (query === "all" || groups.includes(query)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
    helpers.animateCSS(DOM.$grid[0], "fadeIn", null, '150ms');
  }

  function init(element) {
    if (element) {
      options = $.extend(options, $(element).data());
      _cacheDom(element);
      _bindEvents();
      // _render();
    }
  }

  return {
    init: init
  };
}


$(document).ready(function() {
  var postsFilter = new PostsFilter($, window.helpers);
  postsFilter.init(document.querySelector('.js--component-posts-filter'));
});
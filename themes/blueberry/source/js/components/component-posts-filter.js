var PostsFilter=function(n,i){var s={},e={buttonSelector:".js--posts-filter-buttons",containerSelector:".js--posts-filter-container",itemSelector:".js--posts-filter-item"};function o(){s.$buttons.filter(".active").removeClass("btn-primary").addClass("btn-link").removeClass("active"),n(this).removeClass("btn-link").addClass("btn-primary").addClass("active");var t=n(this).data().query;i.animateCSS(s.$grid[0],"fadeOut",function(){var e;e=t,s.$items.each(function(){var t=n(this).data().groups;"all"===e||t.includes(e)?n(this).show():n(this).hide()}),i.animateCSS(s.$grid[0],"fadeIn",null,"150ms")},"150ms")}return{init:function(t){t&&(e=n.extend(e,n(t).data()),s.$el=n(t),s.$buttonsContainer=s.$el.find(e.buttonSelector),s.$buttons=s.$buttonsContainer.find("button"),s.$grid=s.$el.find(e.containerSelector),s.$items=s.$grid.find(e.itemSelector),s.$buttonsContainer.on("click","button",o))}}};$(document).ready(function(){new PostsFilter($,window.helpers).init(document.querySelector(".js--component-posts-filter"))});
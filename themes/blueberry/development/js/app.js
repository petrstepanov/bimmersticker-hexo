$(document).ready(function(){

  NavbarFixer.init(document.querySelector('.js--init-navbar-fixer'));
  SmoothScroll.init();

  $('.js--init-sticky-container').each(function(){
    var sc = StickyContainer();
    sc.init(this);
  });

  $('.js--init-navbar-buy-button').each(function(){
    var nbb = NavbarBuyButton();
    nbb.init(this);
  });

  $('.js--init-content-buy-button').each(function(){
    var cbb = ContentBuyButton();
    cbb.init(this);
  });

  $('.js--init-swatches').each(function(){
    var s = Swatches();
    s.init(this);
  });

  $('.js--init-posts-filter').each(function(){
    var pf = PostsFilter();
    pf.init(this);
  });
});

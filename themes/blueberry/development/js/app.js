$(document).ready(function(){
  $('.js--init-navbar-fixer').each(function(){
    var nf = NavbarFixer();
    nf.init(this);
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
});

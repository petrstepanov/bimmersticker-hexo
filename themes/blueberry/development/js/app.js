$(document).ready(function(){
  // Sequential attempts to load images
  $('.js--init-navbar-fixer').each(function(){
    var nf = NavbarFixer();
    nf.init(this);
  });
});

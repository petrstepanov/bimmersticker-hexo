var NotificationCenter = (function(){
  function makeHtml(type, text){
    return '<p class="type">' + type.toUpperCase() + '</p><p>' + text + '</p>';
  }

  function notify(type, text) {
    new Noty({
      type: type,
      text: makeHtml(type, text),
      layout: 'responsive',
      theme: 'custom',
      timeout: 5000,
      animation: {
        open: 'animated fadeInUp', // Animate.css class names
        close: 'animated fadeOutUp' // Animate.css class names
      }
    }).show();
  }

  return {
    notify: notify
  };
})();

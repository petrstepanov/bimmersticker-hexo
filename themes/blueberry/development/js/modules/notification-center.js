var NotificationCenter = (function(){
  function doNotify(type, text) {
    new Noty({
      type: type,
      text: text,
      theme: 'nest',
      timeout: 3000
    }).show();
  }

  return {
    doNotify: doNotify
  };
})();

var MailchimpDialog = function(){
    var DOM = {};
  
    function _cacheDom(element) {
      DOM.$dialog = $(element);
    }
  
    function _bindEvents(){
      Events.on('mailchimpSuccessEvent', function(data){
        DOM.$dialog.modal('hide');
      });
    }
   
    function init(element){
      if (element){
        _cacheDom(element);
        _bindEvents();
      }
    }
  
    return {
      init: init
    };
  };
  
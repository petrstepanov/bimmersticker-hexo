// Test component

var $ = window.$;

var ComponentWee = function(){
    function init() {
        alert($);
    }
};


$(function() {
    var cW = new ComponentWee();
    cW.init()
});
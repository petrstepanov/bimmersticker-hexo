var ComponentWidgetArea=function(e,t){var a={};function n(){var e=a.$lengthInput.val(),t=e/(a.$previewContainer.width()/a.$previewContainer.height()),n=t%1,i=Math.floor(t)+" ",n=(i+=n<.375?"¼":n<.625?"½":"¾",a.$lengthRuler.html(e),a.$heightRuler.html(i),a.$heightInput.val(i),e*t/12/12.22),i=Math.round(10*n)/10;a.$areaInput.val(i),n<2?a.$sizeSelect.val("S"):n<4?a.$sizeSelect.val("M"):n<8?a.$sizeSelect.val("L"):a.$sizeSelect.val("XL"),a.$sizeSelect.trigger("change")}return{init:function(){0<e(".js--widget-area-length").length&&(a.$lengthInput=e(".js--widget-area-length"),a.$heightInput=e(".js--widget-area-height"),a.$areaInput=e(".js--widget-area-area"),a.$lengthRuler=e(".js--length-ruler"),a.$heightRuler=e(".js--height-ruler"),a.$sizeSelect=e(".js--widget-area-select"),a.$previewContainer=e(".js--widget-area-preview"),a.$lengthInput.on("change",function(){n()}),t.on("truckVanPreviewContainerSizeChanged",function(e){n()}))}}};$(document).ready(function(){new ComponentWidgetArea($,window.events).init()});
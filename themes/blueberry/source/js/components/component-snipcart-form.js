var SnipcartForm=function(i,e){var n={};return{init:function(t){t&&(n.$form=i(t),n.$inputsAndSelects=n.$form.find("select, input"),n.$selects=n.$form.find("select"),n.$selectColor=n.$form.find("select#color"),n.$snipcartButton=n.$form.find(".js--snipcart-add-item"),n.$submitButtons=i(document).find(".js--product-submit"),n.$selects.on("change",function(){var e=0;n.$selects.each(function(){var t=i(this).find("option:selected");void 0!==t.data().extra&&(e+=parseFloat(t.data().extra))}),n.$submitButtons.each(function(){var t=parseFloat(i(this).data().basePrice),n=(t+=e,i(this).data().baseCaption);i(this).html(n+"&dollar;"+t.toFixed(2).toString())})}),n.$selectColor.on("change",function(){var t=i(this).find("option"),n=i(this).find("option:selected").get(0),t=t.index(n);0<=t&&e.emit("colorIndexSelectedEvent",{index:t})}),n.$form.on("submit",function(t){t.preventDefault(),n.$inputsAndSelects.each(function(){var t=n.$inputsAndSelects.index(this)+1;n.$snipcartButton.attr("data-"+("item-custom"+t+"-value"),i(this).val())}),n.$snipcartButton.click()}))}}};$(function(){var t=document.querySelector(".js--component-snipcart-form");(snipcartForm=new SnipcartForm(window.$,window.events)).init(t)});
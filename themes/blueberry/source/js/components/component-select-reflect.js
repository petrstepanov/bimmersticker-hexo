var SelectReflect=function(t){var l={},s={};return{init:function(e){e&&(s=t.extend(s,e.dataset),l.$select=t(e),l.$options=l.$select.find("option"),l.$selectReflect=t("<div>").addClass("component-select-reflect"),l.$options.each(function(){$optionReflect=t("<div>").addClass("select-reflect-item").data("value",t(this).attr("value")),l.$selectReflect.append($optionReflect.get(0));var e=(e=t(this).html()).replace("•",'<span class="d-none d-sm-inline">•</span><br class="d-inline d-sm-none" />');e=(e+="<span>&dollar;"+t(this).data("price")+"</span>").replace(".99","⁹⁹"),$optionReflect.html(e),t(this).attr("value")===l.$select.val()&&$optionReflect.addClass("selected")}),l.$selectReflect.insertAfter(l.$select),l.$optionsReflect=l.$selectReflect.find(".select-reflect-item"),($invisible=t("<div>").addClass("zero-size-invisible")).insertBefore(l.$select),$invisible.append(l.$select),l.$select.on("change",function(){l.$optionsReflect.removeClass("selected");var e=t(this).val();l.$optionsReflect.each(function(){t(this).data("value")===e&&t(this).addClass("selected")})}))}}};$(document).ready(function(){$(".js--component-select-reflect").each(function(){new SelectReflect($).init(this)})});
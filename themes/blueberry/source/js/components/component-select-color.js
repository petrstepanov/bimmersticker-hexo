var SelectColor=function(o,e){var s={};const i=100,t={Open:0,Closed:1,Transition:2};var n=t.Closed;function l(e){s.$select=o(e),s.$options=s.$select.find("option"),s.$selectColor=o("<div>",{class:"component-select-color is-Closed"}),s.$options.each(function(){var e=o(this).attr("value");$pill=function(e){var l=e.split("&"),s=o("<div>",{class:"select-color-pill","data-value":e});for(color of l)color=color.trim().toLowerCase().replace(" ","-"),o("<div>",{class:"select-color-pill-color "+color}).appendTo(s);return o("<span class='select-color-pill-text'>"+e+"</span>").appendTo(s),s}(e),o(this).is(":selected")?$pill.addClass("selected"):$pill.addClass("pill-hidden"),o(this).data("extraText")&&o('<span class="select-color-pill-extra">'+o(this).data("extraText")+" </span>").appendTo($pill),o('<span class="checkbox">✓</span>').appendTo($pill),s.$selectColor.append($pill)}),s.$selectColor.insertBefore(s.$select),s.$pills=s.$selectColor.find(".select-color-pill"),($invisible=o("<div>",{class:"zero-size-invisible"})).insertBefore(s.$select),$invisible.append(s.$select)}function c(e){(n=e)===t.Open?(s.$selectColor.removeClass("is-Closed"),s.$selectColor.addClass("is-Open")):e===t.Closed&&(s.$selectColor.removeClass("is-Open"),s.$selectColor.addClass("is-Closed"))}function a(){var l;n==t.Open&&(c(t.Transition),l=0,s.$pills.each(function(){if(!o(this).hasClass("selected")){const e=o(this);setTimeout(function(){e.addClass("pill-hidden")},l),l+=i}}),setTimeout(function(){c(t.Closed)},l))}function d(){s.$select.on("change",function(){s.$pills.removeClass("selected").addClass("pill-hidden"),s.$pills.filter("[data-value='"+o(this).val()+"']").addClass("selected").removeClass("pill-hidden"),s.$pills.filter(":not([data-value='"+o(this).val()+"'])").addClass("pill-hidden"),a()}),s.$pills.each(function(){o(this).on("click",function(e){n===t.Open&&(e.stopPropagation(),e=o(this).data("value"),s.$select.val(e).trigger("change"))})}),s.$selectColor.on("click",function(e){var l;e.preventDefault(),n===t.Closed?n==t.Closed&&(c(t.Transition),l=0,s.$pills.each(function(){if(!o(this).hasClass("selected")){const e=o(this);setTimeout(function(){e.removeClass("pill-hidden")},l),l+=i}}),setTimeout(function(){c(t.Open)},l)):n===t.Open&&a()}),e.on("documentClick",function(){n===t.Open&&a()})}return{init:function(e){e&&(l(e),d())}}};$(function(){$(".js--component-select-color").each(function(){new SelectColor(window.$,window.events).init(this)})});
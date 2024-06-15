var $=require("jquery"),events=require("./events"),SelectColor=function(){var s={};const o=100,t={Open:0,Closed:1,Transition:2};var i=t.Closed;function l(e){s.$select=$(e),s.$options=s.$select.find("option"),s.$selectColor=$("<div>",{class:"component-select-color is-Closed"}),s.$options.each(function(){var e=$(this).attr("value");$pill=function(e){var l=e.split("&"),s=$("<div>",{class:"select-color-pill","data-value":e});for(color of l)color=color.trim().toLowerCase().replace(" ","-"),$("<div>",{class:"select-color-pill-color "+color}).appendTo(s);return $("<span class='select-color-pill-text'>"+e+"</span>").appendTo(s),s}(e),$(this).is(":selected")?$pill.addClass("selected"):$pill.addClass("pill-hidden"),$(this).data("extraText")&&$('<span class="select-color-pill-extra">'+$(this).data("extraText")+" </span>").appendTo($pill),$('<span class="checkbox">✓</span>').appendTo($pill),s.$selectColor.append($pill)}),s.$selectColor.insertBefore(s.$select),s.$pills=s.$selectColor.find(".select-color-pill"),($invisible=$("<div>",{class:"zero-size-invisible"})).insertBefore(s.$select),$invisible.append(s.$select)}function n(e){(i=e)===t.Open?(s.$selectColor.removeClass("is-Closed"),s.$selectColor.addClass("is-Open")):e===t.Closed&&(s.$selectColor.removeClass("is-Open"),s.$selectColor.addClass("is-Closed"))}function a(){var l;i==t.Open&&(n(t.Transition),l=0,s.$pills.each(function(){if(!$(this).hasClass("selected")){const e=$(this);setTimeout(function(){e.addClass("pill-hidden")},l),l+=o}}),setTimeout(function(){n(t.Closed)},l))}function c(){s.$select.on("change",function(){s.$pills.removeClass("selected").addClass("pill-hidden"),s.$pills.filter("[data-value='"+$(this).val()+"']").addClass("selected").removeClass("pill-hidden"),s.$pills.filter(":not([data-value='"+$(this).val()+"'])").addClass("pill-hidden"),a()}),s.$pills.each(function(){$(this).on("click",function(e){i===t.Open&&(e.stopPropagation(),e=$(this).data("value"),s.$select.val(e).trigger("change"))})}),s.$selectColor.on("click",function(e){var l;e.preventDefault(),i===t.Closed?i==t.Closed&&(n(t.Transition),l=0,s.$pills.each(function(){if(!$(this).hasClass("selected")){const e=$(this);setTimeout(function(){e.removeClass("pill-hidden")},l),l+=o}}),setTimeout(function(){n(t.Open)},l)):i===t.Open&&a()}),events.on("documentClick",function(){i===t.Open&&a()})}return{init:function(e){e&&(l(e),c())}}};module.exports=SelectColor;
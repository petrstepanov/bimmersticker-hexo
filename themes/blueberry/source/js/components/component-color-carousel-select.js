var ColorCarouselSelect=function(o,n,t){var i,c=[];return{init:function(e){e&&(c.$el=o(e),e="#"+c.$el.attr("id"),i=new t.Carousel(e),n.on("colorIndexSelectedEvent",function(e){e=e.index;i.pause(),i.to(e)}))}}};$(function(){$(".js--component-color-carousel-select").each(function(){new ColorCarouselSelect(window.$,window.events,window.bootstrap).init(this)})});
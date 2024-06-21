var ComponentBannerForm=function(i,n){var a,o={};Math.floor(Date.now()/1e3);function r(){var t=n.getFormData(o.$form);localStorage.setItem("dataKey",JSON.stringify(t))}function s(){var t;1==parseInt(o.$inputQuantity.val())?o.$submitButton.text("Add Item to Cart"):(o.$submitButton.text("Add Items to Cart"),t=i('<span class="ms-2 spinner-border spinner-border-sm" aria-hidden="true" style="width: 1.2rem;height: 1.2rem;"></span>'),o.$submitButton.append(t))}function e(){o.$radioProduct.on("change",function(t){switch(this.value){case"ST_CAR_W_BANNER":o.$fontContainer.show(),o.$textColorContainer.show(),o.$baseColorContainer.hide();break;case"ST_CAR_W_SS":o.$fontContainer.hide(),o.$textColorContainer.hide(),o.$baseColorContainer.show();break;case"ST_CAR_W_SS_CUT":o.$fontContainer.show(),o.$textColorContainer.hide(),o.$baseColorContainer.show();break;case"ST_CAR_W_SS_TEXT":o.$fontContainer.show(),o.$textColorContainer.show(),o.$baseColorContainer.show()}switch(this.value){case"ST_CAR_W_BANNER":o.$banner.show(),o.$sunstrip.hide(),o.$sunstripText.hide(),o.$textWidthNotice.show();break;case"ST_CAR_W_SS":o.$banner.hide(),o.$sunstrip.show(),o.$sunstripText.hide(),o.$textWidthNotice.hide();break;case"ST_CAR_W_SS_CUT":o.$banner.hide(),o.$sunstrip.show(),o.$sunstripText.show(),o.$sunstripText.css("background-image",""),o.$sunstripText.css("background-color","#6C6C6C"),o.$textWidthNotice.show();break;case"ST_CAR_W_SS_TEXT":o.$banner.hide(),o.$sunstrip.show(),o.$sunstripText.show();var e=c("color_text").css("background-color");o.$sunstripText.css("background-color",e),o.$textWidthNotice.show()}switch(this.value){case"ST_CAR_W_BANNER":o.$input.prop("disabled",!1),o.$radioTextColor.prop("disabled",!1),o.$radioBaseColor.prop("disabled",!0);break;case"ST_CAR_W_SS":o.$input.prop("disabled",!0),o.$radioTextColor.prop("disabled",!0),o.$radioBaseColor.prop("disabled",!1);break;case"ST_CAR_W_SS_CUT":o.$input.prop("disabled",!1),o.$radioTextColor.prop("disabled",!0),o.$radioBaseColor.prop("disabled",!1);break;case"ST_CAR_W_SS_TEXT":o.$input.prop("disabled",!1),o.$radioTextColor.prop("disabled",!1),o.$radioBaseColor.prop("disabled",!1)}var n=this.value;o.$truckExtraContainer.children().hide(),n="."+n,o.$truckExtraContainer.find(n).show(),t.isTrusted&&r()}),o.$input.on("input",function(t){var e=u();/[^\u0000-\u00ff]/.test(e)?o.$fontContainerList.hide():o.$fontContainerList.show(),o.$fontAvifs.remove(),o.$fontImages.each(function(){i(this).parent().addClass("loading")}),a&&clearTimeout(a),a=setTimeout(function(){var e,t=u(),t=/[^\u0000-\u00ff]/.test(t);t||(e=u(),o.$fontImages.each(function(){var t=d(i(this),e);i(this).attr("src",t),i(this).parent().removeClass("loading"),i(this).removeAttr("width"),i(this).removeAttr("height")})),l(t)},1500),e=this.value,o.$btnBuyBanner.attr("data-item-custom1-value",e.replace(/\s/g," ")),o.$btnBuyCutSunStrip.attr("data-item-custom1-value",e.replace(/\s/g," ")),o.$btnBuyTextSunStrip.attr("data-item-custom1-value",e.replace(/\s/g," ")),t.isTrusted&&r()});const e=["Abused Daily","All Gas No Brakes","ALL STOCK","Always Broke","Antisocial","Another Shitbox","Almost Running","Backyard Mechanics","Baby Driver","Bad Decisions","Because Racecar","Beyond Broke","Blacklisted","Broken Inside","Budget Driven","Built not Bought","But Did You Die?","Cant Stop Wont Stop","Caught You Lookin","Certified Shitbox","Checkmate","Clapped Out","City Limits","Classified","Clean Culture","Cursed","Daily Driven","DECENT","Different","Dominate Humbly","Done Different","Don't Quit","Dumb Slow","Dunkin Donuts","East Coastin'","Endless Dreams","Enough Rice","Essentially Low","Euro Crew","Eurotrash","Fameless Society","Family Disappointment","Fatal Mistakes","Fucking Mint","Fear God","Financial Mistake","Fix Me Please","For the Fans","Free Your Mind","Fuck It Edition","Fuck Your Feelings","Fucking Decent","Full Send","Ghetto Builds","God is Great","Good Vibes","Happy Endings","Hers not His","HOOLIGAN","Imperfect","It Is What It Is","It's Okay to Stare","Just For Fun","Just Fuckin Send It","Just Keep Moving","Knight Legends","Leave Me Alone","Legends Never Die","Legacy Never Dies","Limitless","Locally Hated","Lonely Driver","Love Now Cry Later","Low & Slow","Low And Slow","Low Budget","Low Standards","Low Tolerance","Lowered Standards","Lowered Lifestyle","Loyalty Royalty","Latenight Patrol","Made You Look","Man Made Problem","Metal Up Your Ass","Midnight Boys","Midnight Runners","Midnight Streets","Mo Powa Babeh!","Money Pit","Money Well Wasted","Moonlite Runners","Murder Hornet","Never Satisfied","Not Fast","Naturally Aspired","Never Satisfied","Never Stock","Next Level","Night Ride","Night Runner","No Fat Bitches","No Hard Feelings","No Limits","Not A Hybrid","Not For Sale","Not Fast Just Loud","Nothing Is True","Nothing To See Here","Notorious","Notta Racecar","On Some Shit","One Last Ride","One More Day","Open Your Mind","Out of Style","ProblemChild","Panty Dropper","Patience is Key","Pay Attention!","Peace Maker","Permanently Grounded","Power Wagon","Primitive","Public Disturbance","Public Enemy","Relentless","Respect Your Elders","Ridin Dirty","Screamin Machine","Self Made","Send Nudes","Seriously Filthy","Shit We Do","Shitbox Aesthetic","Show No Love","Sittin Pretty","Slightly Modified","Slow Motion","Slow Skidz","Social Disturbance","Some Kind of Freak","Speed is Theraphy","Stance Nation","Static Rider","Stay Classy","Stay Humble","Stay In Your Lane","Still Slow","Stock-ish","Street Dreamer","Street Dreams","Street Dreamz","Street Legal","Strictly Business","Strictly Sketchy","Super Slow","Take It Easy","The Devil Himself","The Wild Thing","The World Is Yours","Trash Can","Unbothered","Vague Intentions","West Coastin'","Wake Up To Reality","Wasted Wages","Welcome to Hell","Wicked Tunung","Why So Serious?","Young Dumb & Broke","Young Money"];o.$generate.on("click",function(t){t.preventDefault();t=e[Math.floor(Math.random()*e.length)];o.$input.val(t),o.$input.trigger("input"),r()}),o.$radioFont.on("change",function(t){var e=u();l(/[^\u0000-\u00ff]/.test(e)),e=this.value,o.$btnBuyBanner.attr("data-item-custom2-value",e),o.$btnBuyCutSunStrip.attr("data-item-custom2-value",e),o.$btnBuyTextSunStrip.attr("data-item-custom2-value",e),t.isTrusted&&r()}),o.$radioTextColor.on("change",function(t){var e;e=c("color_text"),o.$banner.css("background-color",e.css("background-color")),o.$banner.css("background-image",e.css("background-image")),o.$sunstripText.css("background-color",e.css("background-color")),o.$sunstripText.css("background-image",e.css("background-image")),e=this.value,o.$btnBuyBanner.attr("data-item-custom3-value",e),o.$btnBuyTextSunStrip.attr("data-item-custom3-value",e),t.isTrusted&&r()}),o.$radioBaseColor.on("change",function(t){var e;e=c("color_base"),o.$sunstrip.css("background-color",e.css("background-color")),o.$sunstrip.css("background-image",e.css("background-image")),e=this.value,o.$btnBuySunStrip.attr("data-item-custom1-value",e),o.$btnBuyCutSunStrip.attr("data-item-custom3-value",e),o.$btnBuyTextSunStrip.attr("data-item-custom4-value",e),t.isTrusted&&r()}),o.$radioVehicleType.on("change",function(t){var e;e=this.value,o.$radioVehicleType.parent().removeClass("active"),o.$radioVehicleType.filter("[value="+e+"]").parent().addClass("active"),"Regular"==e?(o.$car.show(),o.$noticeCar.show(),o.$truck.hide(),o.$noticeTruck.hide()):(o.$car.hide(),o.$noticeCar.hide(),o.$truck.show(),o.$noticeTruck.show()),e=this.value,o.$btnBuyBanner.attr("data-item-custom4-value",e),o.$btnBuySunStrip.attr("data-item-custom2-value",e),o.$btnBuyCutSunStrip.attr("data-item-custom4-value",e),o.$btnBuyTextSunStrip.attr("data-item-custom5-value",e),t.isTrusted&&r()}),o.$inputQuantity.on("change",function(t){o.$btnBuyBanner.attr("data-item-quantity",this.value),o.$btnBuySunStrip.attr("data-item-quantity",this.value),o.$btnBuyCutSunStrip.attr("data-item-quantity",this.value),o.$btnBuyTextSunStrip.attr("data-item-quantity",this.value),s(),r()}),o.$form.on("submit",function(t){if(t.preventDefault(),!n.isInViewport(o.$submitButton))return document.activeElement.blur(),!1;switch(o.$radioProduct.val()){case"ST_CAR_W_BANNER":o.$btnBuyBanner.get(0).click();break;case"ST_CAR_W_SS":o.$btnBuySunStrip.get(0).click();break;case"ST_CAR_W_SS_CUT":o.$btnBuyCutSunStrip.get(0).click();break;case"ST_CAR_W_SS_TEXT":o.$btnBuyTextSunStrip.get(0).click()}})}function u(){return o.$input.val().length?o.$input.val():"Your Banner"}function c(t){return i("input[name="+t+"]:checked").parent().find(".color-swatch")}function d(t,e){t=t.data().src,e='{"size":72,"text":"#","retina":false}'.replace("#",e);return document.location.href.includes("localhost")?"https://d3ui957tjb5bqd.cloudfront.net/op/font-preview/"+t+"?s="+e:"/font/"+t+"?s="+encodeURIComponent(e)}function l(t=!1){var e,n=u(),a="";a=(a=t?(e=n,document.location.href.includes("localhost")?"https://render.myfonts.net/fonts/font_rend.php?id=de892884133a0eff8a4920ea421a18c2&rs=25&w=0&rbe=&sc=2&nie=true&fg=FFFFFF&bg=000000&ft=&nf=1&rt="+encodeURIComponent(e):"/font-unicode/"+encodeURIComponent(e)):d(i("input[name=font]:checked").parent().find("img"),n)).replace(/[() '"]/g,"\\$&"),o.$banner.css("mask-image","url("+a+")"),o.$banner.css("-webkit-mask-image","url("+a+")"),o.$sunstripText.css("mask-image","url("+a+")"),o.$sunstripText.css("-webkit-mask-image","url("+a+")"),t?(o.$banner.addClass("unicode-on"),o.$sunstripText.addClass("unicode-on")):(o.$banner.removeClass("unicode-on"),o.$sunstripText.removeClass("unicode-on"))}return{init:function(t){t&&(o.$el=i(t),o.$form=o.$el,o.$mailchimpForm=o.$el.find(".js--mailchimp-form"),o.$radioProduct=o.$el.find("input[name=product]"),o.$radioTextColor=o.$el.find("input[name=color_text]"),o.$radioBaseColor=o.$el.find("input[name=color_base]"),o.$radioFont=o.$el.find("input[name=font]"),o.$fontContainer=o.$el.find(".js--font-container"),o.$fontContainerList=o.$el.find(".js--font-container-list"),o.$textColorContainer=o.$el.find(".js--text-color-container"),o.$baseColorContainer=o.$el.find(".js--base-color-container"),o.$input=o.$el.find(".js--text-input"),o.$generate=o.$el.find(".js--generate"),o.$fontImages=o.$el.find(".js--font-image"),o.$fontAvifs=o.$el.find(".js--font-avif"),o.$textWidthNotice=o.$el.find(".js--text-width"),o.$banner=o.$el.find(".banner-text"),o.$sunstrip=o.$el.find(".sunstrip"),o.$sunstripText=o.$el.find(".sunstrip-text"),o.$car=o.$el.find(".car-preview-container .car-container"),o.$truck=o.$el.find(".car-preview-container .truck-container"),o.$radioVehicleType=o.$el.find("input[name=pattern]"),o.$noticeCar=o.$el.find(".js--notice-car"),o.$noticeTruck=o.$el.find(".js--notice-truck"),o.$truckExtraContainer=o.$el.find(".js--pattern-price-extra"),o.$inputQuantity=o.$el.find("input[name=quantity]"),o.$btnBuyBanner=o.$el.find(".snipcart-add-item[data-item-id=ST_CAR_W_BANNER]"),o.$btnBuySunStrip=o.$el.find(".snipcart-add-item[data-item-id=ST_CAR_W_SS]"),o.$btnBuyCutSunStrip=o.$el.find(".snipcart-add-item[data-item-id=ST_CAR_W_SS_CUT]"),o.$btnBuyTextSunStrip=o.$el.find(".snipcart-add-item[data-item-id=ST_CAR_W_SS_TEXT]"),o.$noJs=o.$el.find(".js--nojs-only"),o.$submitButton=o.$el.find("#submitButton"),e(),o.$noJs.remove(),s(),localStorage.getItem("dataKey"))&&((t=JSON.parse(localStorage.getItem("dataKey"))).product&&o.$radioProduct.filter('[value="'+t.product+'"]').attr("checked",!0).trigger("change"),t.text&&o.$input.val(t.text).trigger("input"),t.font&&o.$radioFont.filter('[value="'+t.font+'"]').attr("checked",!0).trigger("change"),t.color_text&&o.$radioTextColor.filter('[value="'+t.color_text+'"]').attr("checked",!0).trigger("change"),t.color_base&&o.$radioBaseColor.filter('[value="'+t.color_base+'"]').attr("checked",!0).trigger("change"),t.pattern&&o.$radioVehicleType.filter('[value="'+t.pattern+'"]').attr("checked",!0).trigger("change"),t.quantity)&&o.$inputQuantity.val(t.quantity).trigger("change")}}};$(document).ready(function(){new ComponentBannerForm($,window.helpers).init(document.querySelector(".js--component-banner-form"))});
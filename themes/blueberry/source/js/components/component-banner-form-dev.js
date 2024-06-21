// Custom banner and sun strip form interactions

// Netlify CORS!!
// https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739

var ComponentBannerForm = function($, helpers){
    var DOM = {};
    // var options = {};
    var timeoutUpdateImages;
    var timestamp = Math.floor(Date.now() / 1000);

    function _cacheDom(element) {
        DOM.$el = $(element);
        DOM.$form = DOM.$el;
        DOM.$mailchimpForm = DOM.$el.find('.js--mailchimp-form');
        DOM.$radioProduct = DOM.$el.find('input[name=product]');
        DOM.$radioTextColor = DOM.$el.find('input[name=color_text]');
        DOM.$radioBaseColor = DOM.$el.find('input[name=color_base]');
        DOM.$radioFont = DOM.$el.find('input[name=font]');
        DOM.$fontContainer = DOM.$el.find('.js--font-container');
        DOM.$fontContainerList = DOM.$el.find('.js--font-container-list');
        DOM.$textColorContainer = DOM.$el.find('.js--text-color-container');
        DOM.$baseColorContainer = DOM.$el.find('.js--base-color-container');

        DOM.$input = DOM.$el.find('.js--text-input');
        DOM.$generate = DOM.$el.find('.js--generate');
        DOM.$fontImages = DOM.$el.find('.js--font-image');
        DOM.$fontAvifs = DOM.$el.find('.js--font-avif');

        DOM.$textWidthNotice = DOM.$el.find('.js--text-width');

        DOM.$banner = DOM.$el.find('.banner-text');
        DOM.$sunstrip = DOM.$el.find('.sunstrip');
        DOM.$sunstripText = DOM.$el.find('.sunstrip-text');

        // Car/Truck selection
        DOM.$car = DOM.$el.find('.car-preview-container .car-container');
        DOM.$truck = DOM.$el.find('.car-preview-container .truck-container');
        DOM.$radioVehicleType = DOM.$el.find('input[name=pattern]');
        DOM.$noticeCar = DOM.$el.find('.js--notice-car');
        DOM.$noticeTruck = DOM.$el.find('.js--notice-truck');
        DOM.$truckExtraContainer = DOM.$el.find('.js--pattern-price-extra');

        // Quantity control
        DOM.$inputQuantity = DOM.$el.find('input[name=quantity]');

        // Snipcart buttons
        DOM.$btnBuyBanner = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_BANNER]');
        DOM.$btnBuySunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS]');
        DOM.$btnBuyCutSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS_CUT]');
        DOM.$btnBuyTextSunStrip = DOM.$el.find('.snipcart-add-item[data-item-id=ST_CAR_W_SS_TEXT]');

        // Find elements displayed for users with JavaScript not loaded
        DOM.$noJs = DOM.$el.find('.js--nojs-only');
        DOM.$submitButton = DOM.$el.find('#submitButton');
    }

    function _saveData(){
        // Helper parses form data to JSON
        var data = helpers.getFormData(DOM.$form);
        // console.log(data);
        // Save JSON to local storage
        localStorage.setItem("dataKey", JSON.stringify(data));
    }

    function _updateSubmitButtonText(){
        if (parseInt(DOM.$inputQuantity.val()) == 1){
            DOM.$submitButton.text("Add Item to Cart");
            return;
        }
        DOM.$submitButton.text("Add Items to Cart");
        // Add Snipcart loading spinner
        var $spinner = $('<span class="ms-2 spinner-border spinner-border-sm" aria-hidden="true" style="width: 1.2rem;height: 1.2rem;"></span>');
        DOM.$submitButton.append($spinner);
    }

    function _loadData(){
        if (localStorage.getItem("dataKey")) {
            var data = JSON.parse(localStorage.getItem("dataKey"));
            // console.log(data);
            // Update view
            if (data.product){
                DOM.$radioProduct.filter('[value="' + data.product + '"]').attr('checked', true).trigger('change');
            }
            if (data.text){
                DOM.$input.val(data.text).trigger("input");
            }
            if (data.font){
                DOM.$radioFont.filter('[value="' + data.font + '"]').attr('checked', true).trigger('change');
            }
            if (data.color_text){
                DOM.$radioTextColor.filter('[value="' + data.color_text + '"]').attr('checked', true).trigger('change');
            }
            if (data.color_base){
                DOM.$radioBaseColor.filter('[value="' + data.color_base + '"]').attr('checked', true).trigger('change');
            }
            if (data.pattern){
                DOM.$radioVehicleType.filter('[value="' + data.pattern + '"]').attr('checked', true).trigger('change');
            }
            if (data.quantity){
                DOM.$inputQuantity.val(data.quantity).trigger('change');
            }
        }
    }

    function _onLoad() {
        DOM.$noJs.remove();
        // If JS is enabled - snipcart will load - update button text
        _updateSubmitButtonText();
        // Trick with submit button - I want the user to only submit the form on mobile phone once he scrolled all the way to the bottom
        // and saw all the fields. Otherwise the iPhone displays "Go" button and item automatically added to cart.
        // DOM.$submitButton.prop("disabled", true);

        // It seems that iOS only shows the "Go" button when there i9s an action attribute set on the form.
        // We wipe the action attribute if JS is loaded:
        // https://github.com/angular/angular.js/issues/13070#issuecomment-151558050
        // DOM.$form.removeAttr("action");

        // TODO: test!
        // Turned out "Go" button disappears and "return" button shows instead.
        // "return" still submits the form...
        // Therefore doing everything programmatically via javascript.
        // If submit and submit button out of viewport - cancel event and unfocus elements to hide keyboard

    }

    function _bindEvents(element) {
        DOM.$radioProduct.on('change', function (event) {
            _showHideFormContainers(this.value);
            _showHidePreviewElements(this.value);
            _enableDisableFormInputs(this.value);
            _reflectExtraTruckPrice(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        DOM.$input.on('input', function (event) {

            var text = _getBannerText();

            // Check string has non-latin characters and show/hide font selection panel
            // This should happen instantly unlike the delayed request for updating font previews
            // https://stackoverflow.com/questions/147824/how-to-find-whether-a-particular-string-has-unicode-characters-esp-double-byte
            var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
            if (containsNonLatinCharacters){
                DOM.$fontContainerList.hide();
            }
            else {
                DOM.$fontContainerList.show();
            }

            // Hack - ensure avifs are removed - they cover up actual images
            DOM.$fontAvifs.remove();

            // Loading animation - add to picture tag because image cant deal with pseudo class animation
            DOM.$fontImages.each(function () {
                $(this).parent().addClass('loading');
            });

            // Timeout for updating the font previews
            if (timeoutUpdateImages) clearTimeout(timeoutUpdateImages);
            timeoutUpdateImages = setTimeout(function () {
                // Update radio font images to reflect custom text
                var text = _getBannerText();
                var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);

                if (!containsNonLatinCharacters){
                    _updateFontPreviews();
                }

                _updateBannerImage(containsNonLatinCharacters);
            }, 1500);

            _updateSnipcartButtonsText(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        const dummyTexts = ['Abused Daily', 'All Gas No Brakes', 'ALL STOCK', 'Always Broke', 'Antisocial', 'Another Shitbox', 'Almost Running',
                        'Backyard Mechanics', 'Baby Driver', 'Bad Decisions', 'Because Racecar', 'Beyond Broke', 'Blacklisted', 'Broken Inside', 'Budget Driven', 'Built not Bought', 'But Did You Die?',
                        "Cant Stop Wont Stop", 'Caught You Lookin', 'Certified Shitbox', 'Checkmate', 'Clapped Out', 'City Limits', 'Classified', 'Clean Culture', 'Cursed',
                        'Daily Driven', 'DECENT', 'Different', 'Dominate Humbly', 'Done Different', "Don't Quit", 'Dumb Slow', 'Dunkin Donuts',
                        "East Coastin'", 'Endless Dreams', 'Enough Rice' , 'Essentially Low', 'Euro Crew', 'Eurotrash',
                        'Fameless Society', 'Family Disappointment', 'Fatal Mistakes', 'Fucking Mint', 'Fear God', 'Financial Mistake', 'Fix Me Please', 'For the Fans', 'Free Your Mind', 'Fuck It Edition', 'Fuck Your Feelings', 'Fucking Decent', 'Full Send',
                        'Ghetto Builds', 'God is Great', 'Good Vibes',
                        'Happy Endings', 'Hers not His', 'HOOLIGAN',
                        'Imperfect', 'It Is What It Is', "It's Okay to Stare",
                        'Just For Fun', 'Just Fuckin Send It', 'Just Keep Moving',
                        'Knight Legends',
                        'Leave Me Alone', 'Legends Never Die', 'Legacy Never Dies', 'Limitless', 'Locally Hated', 'Lonely Driver', 'Love Now Cry Later', 'Low & Slow', 'Low And Slow', 'Low Budget', 'Low Standards', 'Low Tolerance', 'Lowered Standards', 'Lowered Lifestyle', 'Loyalty Royalty', 'Latenight Patrol',
                        'Made You Look', 'Man Made Problem', 'Metal Up Your Ass', 'Midnight Boys', 'Midnight Runners', 'Midnight Streets', 'Mo Powa Babeh!', 'Money Pit', 'Money Well Wasted', 'Moonlite Runners', 'Murder Hornet',
                        'Never Satisfied', 'Not Fast', 'Naturally Aspired', 'Never Satisfied', 'Never Stock', 'Next Level', 'Night Ride', 'Night Runner', 'No Fat Bitches', 'No Hard Feelings', 'No Limits', 'Not A Hybrid', 'Not For Sale', 'Not Fast Just Loud', 'Nothing Is True', 'Nothing To See Here', 'Notorious', 'Notta Racecar',
                        'On Some Shit', 'One Last Ride', 'One More Day', 'Open Your Mind', 'Out of Style',
                        'ProblemChild', 'Panty Dropper', 'Patience is Key', 'Pay Attention!', 'Peace Maker', 'Permanently Grounded', 'Power Wagon', 'Primitive', 'Public Disturbance', 'Public Enemy',
                        'Relentless', 'Respect Your Elders', 'Ridin Dirty',
                        'Screamin Machine', 'Self Made', 'Send Nudes', 'Seriously Filthy', 'Shit We Do', 'Shitbox Aesthetic', 'Show No Love', 'Sittin Pretty', 'Slightly Modified', 'Slow Motion', 'Slow Skidz', 'Social Disturbance', 'Some Kind of Freak', 'Speed is Theraphy', 'Stance Nation', 'Static Rider', 'Stay Classy', 'Stay Humble', 'Stay In Your Lane', 'Still Slow', 'Stock-ish', 'Street Dreamer', 'Street Dreams', 'Street Dreamz', 'Street Legal', 'Strictly Business', 'Strictly Sketchy', 'Super Slow',
                        'Take It Easy', 'The Devil Himself', 'The Wild Thing', 'The World Is Yours', 'Trash Can',
                        'Unbothered',
                        'Vague Intentions',
                        "West Coastin'", 'Wake Up To Reality', 'Wasted Wages', 'Welcome to Hell', 'Wicked Tunung', 'Why So Serious?',
                        'Young Dumb & Broke', 'Young Money'];

        DOM.$generate.on('click', function (event){
            event.preventDefault();
            const randomText = dummyTexts[Math.floor(Math.random() * dummyTexts.length)];
            DOM.$input.val(randomText);
            DOM.$input.trigger( "input" );
            // Event was not triggered by human - save manually
            _saveData();
        });

        DOM.$radioFont.on('change', function (event) {
            var text = _getBannerText();
            var containsNonLatinCharacters = /[^\u0000-\u00ff]/.test(text);
            _updateBannerImage(containsNonLatinCharacters);
            _updateSnipcartButtonsFont(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        DOM.$radioTextColor.on('change', function (event) {
            _updateBannerSunstripTextColors();
            _updateSnipcartButtonsTextColor(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        DOM.$radioBaseColor.on('change', function (event) {
            _updateSunstripBaseColor();
            _updateSnipcartButtonsBaseColor(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        DOM.$radioVehicleType.on('change', function (event) {
            _updateVehicleType(this.value);
            _updateSnipcartButtonsVehicleType(this.value);
            if (event.isTrusted){
                // Save data only of the event was triggered with human
                _saveData();
            }
        });

        DOM.$inputQuantity.on('change', function (event) {
            DOM.$btnBuyBanner.attr('data-item-quantity', this.value);
            DOM.$btnBuySunStrip.attr('data-item-quantity', this.value);
            DOM.$btnBuyCutSunStrip.attr('data-item-quantity', this.value);
            DOM.$btnBuyTextSunStrip.attr('data-item-quantity', this.value);
            _updateSubmitButtonText();
            _saveData();
        });

        DOM.$form.on('submit', function(event) {
            event.preventDefault();

            // Hack - prevent submission if "Add to cart" is not in viewport.
            // Otherwise Snipcart side cart opens up when "Go" on the input field
            if (!helpers.isInViewport(DOM.$submitButton)){
                // Iphone hide keyboard
                document.activeElement.blur();
                // Prevent submit
                return false;
            }

            switch (DOM.$radioProduct.val()) {
                case 'ST_CAR_W_BANNER':
                    DOM.$btnBuyBanner.get(0).click();
                    break;
                case 'ST_CAR_W_SS':
                    DOM.$btnBuySunStrip.get(0).click();
                    break;
                case 'ST_CAR_W_SS_CUT':
                    DOM.$btnBuyCutSunStrip.get(0).click();
                    break;
                case 'ST_CAR_W_SS_TEXT':
                    DOM.$btnBuyTextSunStrip.get(0).click();
                    break;
            }
        });
    }

    function _getBannerText() {
        return DOM.$input.val().length ? DOM.$input.val() : "Your Banner";
    }

    function _showHideFormContainers(product) {
        switch (product) {
            case 'ST_CAR_W_BANNER':
                DOM.$fontContainer.show();
                DOM.$textColorContainer.show();
                DOM.$baseColorContainer.hide();
                break;
            case 'ST_CAR_W_SS':
                DOM.$fontContainer.hide();
                DOM.$textColorContainer.hide();
                DOM.$baseColorContainer.show();
                break;
            case 'ST_CAR_W_SS_CUT':
                DOM.$fontContainer.show();
                DOM.$textColorContainer.hide();
                DOM.$baseColorContainer.show();
                break;
            case 'ST_CAR_W_SS_TEXT':
                DOM.$fontContainer.show();
                DOM.$textColorContainer.show();
                DOM.$baseColorContainer.show();
                break;
        }
    }

    function _getSelectedSwatch(radioName) {
        return $('input[name=' + radioName + ']:checked').parent().find('.color-swatch');
    }

    function _showHidePreviewElements(product) {
        switch (product) {
            case 'ST_CAR_W_BANNER':
                DOM.$banner.show();
                DOM.$sunstrip.hide();
                DOM.$sunstripText.hide();
                DOM.$textWidthNotice.show();
                break;
            case 'ST_CAR_W_SS':
                DOM.$banner.hide();
                DOM.$sunstrip.show();
                DOM.$sunstripText.hide();
                DOM.$textWidthNotice.hide();
                break;
            case 'ST_CAR_W_SS_CUT':
                DOM.$banner.hide();
                DOM.$sunstrip.show();
                DOM.$sunstripText.show();
                DOM.$sunstripText.css('background-image', '');
                DOM.$sunstripText.css('background-color', '#6C6C6C');
                DOM.$textWidthNotice.show();
                break;
            case 'ST_CAR_W_SS_TEXT':
                DOM.$banner.hide();
                DOM.$sunstrip.show();
                DOM.$sunstripText.show();
                var color = _getSelectedSwatch('color_text').css('background-color');
                DOM.$sunstripText.css('background-color', color);
                DOM.$textWidthNotice.show();
                break;
        }
    }

    function _enableDisableFormInputs(product) {
        switch (product) {
            case 'ST_CAR_W_BANNER':
                DOM.$input.prop("disabled", false);
                DOM.$radioTextColor.prop("disabled", false);
                DOM.$radioBaseColor.prop("disabled", true);
                break;
            case 'ST_CAR_W_SS':
                DOM.$input.prop("disabled", true);
                DOM.$radioTextColor.prop("disabled", true);
                DOM.$radioBaseColor.prop("disabled", false);
                break;
            case 'ST_CAR_W_SS_CUT':
                DOM.$input.prop("disabled", false);
                DOM.$radioTextColor.prop("disabled", true);
                DOM.$radioBaseColor.prop("disabled", false);
                break;
            case 'ST_CAR_W_SS_TEXT':
                DOM.$input.prop("disabled", false);
                DOM.$radioTextColor.prop("disabled", false);
                DOM.$radioBaseColor.prop("disabled", false);
                break;
        }
    }

    function _reflectExtraTruckPrice(product){
        DOM.$truckExtraContainer.children().hide();
        const productClass= "." + product;
        DOM.$truckExtraContainer.find(productClass).show();
    }

    function _buildFontUrl($fontImage, text) {
        var fontId = $fontImage.data().src;
        var query = '{"size":72,"text":"#","retina":false}'.replace("#", text);

        // If localhost
        if (document.location.href.includes("localhost")){
            return "https://d3ui957tjb5bqd.cloudfront.net/op/font-preview/" + fontId + "?s=" + query;
        }
        // If production
        return "/font/" + fontId + '?s=' + encodeURIComponent(query);
    }

    function _buildFontUnicodeUrl(text) {
        // If localhost
        if (document.location.href.includes("localhost")){
            return "https://render.myfonts.net/fonts/font_rend.php?id=de892884133a0eff8a4920ea421a18c2&rs=25&w=0&rbe=&sc=2&nie=true&fg=FFFFFF&bg=000000&ft=&nf=1&rt=" + encodeURIComponent(text);
        }
        // If production
        return "/font-unicode/" + encodeURIComponent(text);
    }

    function _updateFontPreviews() {
        // SOLUTION for testing: Install CORS firefox extension
        // On testing environment do nothing (no font url rewrite implemented)
        // if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

        // Update radio font images to reflect custom text
        var text = _getBannerText();

        DOM.$fontImages.each(function () {
            var url = _buildFontUrl($(this), text);
            $(this).attr('src', url);
            $(this).parent().removeClass('loading');
            // Remove width and height set on the first page load for Google CLS improvements
            $(this).removeAttr("width");
            $(this).removeAttr("height");
        });
    }

    function _updateBannerImage(hasUnicode = false) {
        // Update car banner and sun strip images
        var text = _getBannerText();
        var url = '';
        var maskMode = '';
        if (!hasUnicode){
            var $fontImage = $('input[name=font]:checked').parent().find('img');
            url = _buildFontUrl($fontImage, text);
        } else {
            url = _buildFontUnicodeUrl(text);
            maskMode = 'luminance';
        }
        // Parentheses, white space characters, single quotes (') and double quotes ("), must be escaped with a backslash in url()
        // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
        url = url.replace(/[() '"]/g, '\\$&');

        DOM.$banner.css('mask-image', 'url(' + url + ')');
        DOM.$banner.css('-webkit-mask-image', 'url(' + url + ')');

        DOM.$sunstripText.css('mask-image', 'url(' + url + ')');
        DOM.$sunstripText.css('-webkit-mask-image', 'url(' + url + ')');

        // CSS tweaks that account on discrepancy between creativemarket.com and myfonts.net
        if (hasUnicode){
            DOM.$banner.addClass('unicode-on');
            DOM.$sunstripText.addClass('unicode-on');
        } else {
            DOM.$banner.removeClass('unicode-on');
            DOM.$sunstripText.removeClass('unicode-on');
        }
    }

    function _updateBannerSunstripTextColors() {
        var $swatch = _getSelectedSwatch('color_text');
        // Change banner text
        DOM.$banner.css('background-color', $swatch.css('background-color'));
        DOM.$banner.css('background-image', $swatch.css('background-image'));
        // Change sun strip text color
        DOM.$sunstripText.css('background-color', $swatch.css('background-color'));
        DOM.$sunstripText.css('background-image', $swatch.css('background-image'));
    }

    function _updateSunstripBaseColor() {
        var $swatch = _getSelectedSwatch('color_base');
        // Change sun strip base color
        DOM.$sunstrip.css('background-color', $swatch.css('background-color'));
        DOM.$sunstrip.css('background-image', $swatch.css('background-image'));
    }

    // Visual updates for selecting vehicle type (car/truck)
    function _updateVehicleType(value) {
        // Reflect Bootstrap button appearance
        DOM.$radioVehicleType.parent().removeClass('active');
        DOM.$radioVehicleType.filter('[value='+value+']').parent().addClass('active');

        if (value == 'Regular'){
            DOM.$car.show();
            DOM.$noticeCar.show();
            DOM.$truck.hide();
            DOM.$noticeTruck.hide();
        }
        else {
            DOM.$car.hide();
            DOM.$noticeCar.hide();
            DOM.$truck.show();
            DOM.$noticeTruck.show();
        }
    }

    // Updating Snipcart buttons' attributes

    function _updateSnipcartButtonsText(value){
        // set atribute with multiple spaces in between
        DOM.$btnBuyBanner.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
        DOM.$btnBuyCutSunStrip.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
        DOM.$btnBuyTextSunStrip.attr('data-item-custom1-value', value.replace(/\s/g, '\u00A0'));
    }

    function _updateSnipcartButtonsFont(value){
        DOM.$btnBuyBanner.attr('data-item-custom2-value', value);
        DOM.$btnBuyCutSunStrip.attr('data-item-custom2-value', value);
        DOM.$btnBuyTextSunStrip.attr('data-item-custom2-value', value);
    }

    function _updateSnipcartButtonsTextColor(value){
        DOM.$btnBuyBanner.attr('data-item-custom3-value', value);
        DOM.$btnBuyTextSunStrip.attr('data-item-custom3-value', value);
    }

    function _updateSnipcartButtonsBaseColor(value){
        DOM.$btnBuySunStrip.attr('data-item-custom1-value', value);
        DOM.$btnBuyCutSunStrip.attr('data-item-custom3-value', value);
        DOM.$btnBuyTextSunStrip.attr('data-item-custom4-value', value);
    }

    function _updateSnipcartButtonsVehicleType(value){
        DOM.$btnBuyBanner.attr('data-item-custom4-value', value);
        DOM.$btnBuySunStrip.attr('data-item-custom2-value', value);
        DOM.$btnBuyCutSunStrip.attr('data-item-custom4-value', value);
        DOM.$btnBuyTextSunStrip.attr('data-item-custom5-value', value);
    }

    function init(element) {
        if (element) {
            // options = $.extend(options, $(element).data());
            _cacheDom(element);
            _bindEvents();
            _onLoad();
            // _showHideFormContainers(DOM.$radioProduct.val());
            _loadData();
        }
    }

    return {
        init: init
    };
};

$(document).ready(function() {
    var componentBannerForm = new ComponentBannerForm($, window.helpers);
    componentBannerForm.init(document.querySelector('.js--component-banner-form'));
});
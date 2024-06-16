var $ = require('jquery');
var nunjucks = require('nunjucks');

var GCR = function(){
    var DOM = {};

    function renderGoogleCustomerReviews(invoiceNumber, email, country) {
        // alert(invoiceNumber + " " + email + " " + country);

        // TODO: calculate estimated delivery date here
        // Not in json{}
        var deliveryDays = country.localeCompare("US")?21:7;
        var today = new Date();
        var deliveryDate = new Date();
        deliveryDate.setDate(today.getDate() + deliveryDays);
        var year = 1900+deliveryDate.getYear();
        var month = deliveryDate.getMonth() + 1;
        var day = deliveryDate.getDate();
        var deliveryDateString = "" + year + "-" + month + "-" + day;
        // Populate success template with JSON
        var json = {
            'merchantID': 143612887,
            'invoiceNumber': invoiceNumber,
            'email': email,
            'country': country,
            'deliveryDate': deliveryDateString
        };
        nunjucks.configure({ autoescape: true });
        var template = DOM.$template.html();
        var rendered = nunjucks.renderString(template, json);

        // Display GCR
        $('#gcr-container').empty();
        $('#gcr-container').html(rendered);
    }

    function init() {
        DOM.$template = $('#gcr-template');
        DOM.$container = $('#gcr-container');
    }

    return {
        init: init,
        renderGoogleCustomerReviews: renderGoogleCustomerReviews
    };
};

module.exports = GCR;
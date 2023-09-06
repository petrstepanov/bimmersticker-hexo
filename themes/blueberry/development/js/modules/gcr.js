var $ = require('jquery');
var nunjucks = require('nunjucks');

var DOM = {};

function renderGoogleCustomerReviews(invoiceNumber, email, country) {
    // alert(invoiceNumber + " " + email + " " + country);

    // TODO: calculate estimated delivery date here
    // Not in json{}

    // Populate success template with JSON
    var json = {
        'invoiceNumber': invoiceNumber,
        'email': email,
        'country': country,
        'deliveryDate': new Date(parseInt(((new Date()).setDate((new Date()).getDate() + (country.localeCompare("US")?21:7)).toString()))).toLocaleDateString('en-US').replaceAll('/','-')
    };
    nunjucks.configure({ autoescape: true });
    var template = DOM.$template.html();
    var rendered = nunjucks.renderString(template, json);

    // Display GCR
    $('#gcr-container').empty();
    $('#gcr-container').html(rendered);
}

function _cacheDom(element) {
    DOM.$template = $('#gcr-template');
    DOM.$container = $('#gcr-container');
}

function init() {
    _cacheDom();
}

exports.init = init;
exports.renderGoogleCustomerReviews = renderGoogleCustomerReviews;
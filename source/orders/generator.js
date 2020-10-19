'use strict';

const fs = require('fs');

// Read data from JSON
// Previous orders manually entered with RegExp from Excel

let rawdata = fs.readFileSync('./orders.json');
let orders = JSON.parse(rawdata);

// Fill orders starting from certain number
// In order to keep previous records
let firstOrderIndex = 2558;

for (var i = firstOrderIndex; i < 5000; i++){
    orders[i] = Math.random() < 0.7 ? 'Sarah' : 'Anton';
}

let data = JSON.stringify(orders);
fs.writeFileSync('./orders.json', data);
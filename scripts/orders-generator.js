var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');

// Checks if products array has object with value containing "|"

hexo.extend.generator.register('orders-generator', function (locals) {

    // Get input file name from _config.yml
    // var feedFileSrc = hexo.config.netlify_redirects_path.src;

    // Read data from JSON
    // let rawdata = fs.readFileSync('./orders.json');
    // let orders = JSON.parse(rawdata);

    let orders = [];

    // Fill orders starting from certain number
    // In order to keep previous records
    let firstOrderIndex = 1583;
    let lastOrderIndex = 5000;

    let myOrders = [3071, 3072, 3070,3069,3068,3067,3056,3046,3039,3028,3017,3016,3015,3014,2997,2983,2982,2981,2980,2979,2978,2974,2961,2938,2937,2936,2935,2934,2927,2923,2920,2897,2892,2890,2882,2888,2869,2868,2864,2862,2861,2851,2829,2820,2767,2766,2765,2762,2759,2757,2755,2753];
    let antonOrders = [2432,2434,2435,2436,2437,2439,2440,2426,2441,2442,2443,2444,2446,2447,2448,2449,2460,2459,2458,2465,2466,2470,2469,2472,2473,2475,2480,2478,2479,2489,2487,2488,2491,2492,2493,2495,2490,2500,2507,2513,2509,2510,2515,2516,2518,2522,2511,2514,2512,2530,2531,2360,2362,2365,2371,2364,2374,2376,2375,2378,2379,2380,2383,2381,2385,2386,2395,2396,2397,2398,2399,2400,2401,2402,2404,2405,2406,2407,2408,2409,2410,2411,2412,2413,2414,2415,2416,2418,2419,2420,2421,2426,2427,2429,2431];

    let redoReshipOrders = [3038, 2878, 2879, 3035, 2892, 2829, 2744, 2741, 2771, 2673, 2507, 2509];
    let reshipOrders = [2997, 2820, 2755, 2444, 2439];

    for (var i = firstOrderIndex; i < lastOrderIndex; i++){
        var order = {
            number: i,
            assignee: "None",
            redo: false,
            reship: false
        };

        // Assignee
        if (i <= 2444) order.assignee = 'Petr';                        // I made up to 2444
        if (i > 2444) order.assignee = 'Sarah';                         // Sara started working on 2445
        if (antonOrders.indexOf(i) >= 0) order.assignee = 'Anton';     // Anton helped with some orders
        if (myOrders.indexOf(i) >= 0) order.assignee = 'Petr';         // Some I make

        // Redo & Reship
        if (redoReshipOrders.indexOf(i) >= 0){
            order.redo = true;
            order.reship = true;
        } 
        if (reshipOrders.indexOf(i) >= 0) order.reship = true;

        // Save order data
        orders.push(order);
    }

    let ordersData = JSON.stringify(orders);

    return {
        path: "orders/orders.json",
        data: ordersData
    };
});
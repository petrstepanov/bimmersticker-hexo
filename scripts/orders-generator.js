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

    let heatherOrders = [3237, 3236, 3235, 3234, 3229,
                    3227, 3226, 3225, 3224, 3223, 3222, 3221, 3219,
                    3218, 3214, 3213,
                    3187, 3186, 3185, 3184, 3183, 3182, 3181, 3180, 3179, 3178,
                    3170, 3169, 3168, 3167, 3166, 3165, 
                    3164, 3163, 3162, 3161, 3160, 3159, 3158, 3157, 3156, 3155, 3154, 3153, 3152, 3151, 3150, 3149, 3148, 3147, 3145, 3137, 3104, 3103, 3102, 3101, 3100, 3099, 3092, 3091, 3090, 3089, 3088, 3087, 3086, 3085, 3084, 3083, 3082,
                    3081, 3080, 3079, 3078, 3077, 3076, 3075, 3074,
                    3073, 3072, 3071, 3070, 3069, 3068, 3067, 3056,
                    3046, 3039, 3028, 3017, 3016, 3015, 3014, 2997,
                    2983, 2982, 2981, 2980, 2979, 2978, 2974, 2961,
                    2938, 2937, 2936, 2935, 2934, 2927, 2923, 2920,
                    2897, 2892, 2890, 2888, 2882, 2869, 2868, 2864,
                    2862, 2861, 2851, 2829, 2820, 2767, 2766, 2765,
                    2762, 2759, 2757, 2755, 2753];

    let antonOrders = [2531, 2530, 2522, 2518, 2516, 2515, 2514, 2513, 2512,
                    2511, 2510, 2509, 2507, 2500, 2495, 2493, 2492, 2491,
                    2490, 2489, 2488, 2487, 2480, 2479, 2478, 2475, 2473,
                    2472, 2470, 2469, 2466, 2465, 2460, 2459, 2458, 2449,
                    2448, 2447, 2446, 2444, 2443, 2442, 2441, 2440, 2439,
                    2437, 2436, 2435, 2434, 2432, 2431, 2429, 2427, 2426,
                    2426, 2421, 2420, 2419, 2418, 2416, 2415, 2414, 2413,
                    2412, 2411, 2410, 2409, 2408, 2407, 2406, 2405, 2404,
                    2402, 2401, 2400, 2399, 2398, 2397, 2396, 2395, 2386,
                    2385, 2383, 2381, 2380, 2379, 2378, 2376, 2375, 2374,
                    2371, 2365, 2364, 2362, 2360];

    let redoReshipOrders = [3131, 3082, 3066, 3042, 3038, 3010, 2878, 2879, 3035, 2892, 2829, 2744, 2741, 2771, 2673, 2507, 2509];
    let reshipOrders = [3049, 2997, 2820, 2755, 2444, 2439];

    for (var i = firstOrderIndex; i < lastOrderIndex; i++){
        var order = {
            number: i,
            assignee: "None",
            redo: false,
            reship: false
        };

        // Assignee
        if (i <= 2444) order.assignee = 'Petr';                        // I made up to 2444
        else if (i > 2444 && i < 3239) order.assignee = 'Sarah';       // Sara started working on 2445
        else if (i => 3239) order.assignee = 'Petr';                   // Sara left March 29

        if (antonOrders.indexOf(i) >= 0) order.assignee = 'Anton';     // Anton helped with some orders
        if (heatherOrders.indexOf(i) >= 0) order.assignee = 'Petr';    // Some I make

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
var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');

hexo.extend.generator.register('google-feed-generator', function (locals) {
    const breakArrayVariationsRecursive = hexo.extend.helper.get('breakArrayVariationsRecursive').bind(hexo);
    const addPriceFromColorOption = hexo.extend.helper.get('addPriceFromColorOption').bind(hexo);
    const setUniqueIdFromVariations = hexo.extend.helper.get('setUniqueIdFromVariations').bind(hexo);
    const setExtraProductAttributes = hexo.extend.helper.get('setExtraProductAttributes').bind(hexo);

    // Get input file name from _config.yml
    var feedFileSrc = hexo.config.google_feed_path.src;

    // Read and parse data file into JS object
    var feedFileData = fs.readFileSync(hexo.base_dir + feedFileSrc);
    var feedArray = [];
    if (path.extname(feedFileSrc) === '.yml') {
        feedArray = jsYaml.load(feedFileData);
    } // else if add JSON too ?

    // Remove all customization fields
    feedArray.forEach(element => {
        _.forOwn(element, function(value, key) {
            if (key.includes('customization')){
                delete element[key];
            }
        });
    });

    // Iterate through array
    breakArrayVariationsRecursive(feedArray);

    feedArray.forEach(element => {
        addPriceFromColorOption(element);
        setUniqueIdFromVariations(element);
        setExtraProductAttributes(element);
    });


    // Write feed header from 1st item keys
    var feedTxt = _.keys(feedArray[0]).join('\t');

    // Export into text file
    feedArray.forEach(object => {
        feedTxt += '\n';
        // Lodash's _values not guarantees the alphabetic order of keys
        // So we sort object keys like the first one https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
        const objectOrdered = {};
        Object.keys(feedArray[0]).forEach(function(key) {
            objectOrdered[key] = object[key] ? object[key] : "";
        });        
        feedTxt += _.values(objectOrdered).join('\t');
    });

    return {
        path: hexo.config.google_feed_path.dest,
        data: feedTxt
    };
});
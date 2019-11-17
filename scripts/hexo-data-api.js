var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');

// Checks if products array has object with value containing "|"

var globalIdMap = {};

function findObjectWithVariations(array){
    var index = -1;
    array.forEach((element, i) => {
        _.values(element).forEach(value =>{
            if (value.includes('|')){
                index = i;
                return false;
            }
        });
    });
    return index;
}

function breakArrayVariationsRecursive(array){
    var index = findObjectWithVariations(array);
    if (index==-1){
        return array;
    }
    else {
        var object = array[index];
        // Since object has variations we set its 'item_group_id'
        if (object.item_group_id == ""){
            object.item_group_id = object.id;  
        }

        // Split one variation object
        // var idNoNumber = object.item_group_id;
        var processedFirstVariationValue = false;
        var variationObject = _.mapValues(object, (value, key) => {
            // if (key == 'id'){
            //     // Last character of a string
            //     var i = parseInt(value[value.length -1]);
            //     if (isNaN(i)){
            //         object[key] += '_0';
            //         globalIdMap[idNoNumber] = 0;
            //     }
            //     globalIdMap[idNoNumber]++;
            //     newId = idNoNumber + '_' + globalIdMap[idNoNumber];
            //     return newId;
            // } else {
                if (value.includes('|') && !processedFirstVariationValue){
                    var variations = value.split('|');
                    var firstVariation = variations.pop();
                    object[key] = variations.join('|');
                    processedFirstVariationValue = true;
                    return firstVariation;
                }
                return value;    
            // }
        });
        // Insert variation object after original object
        array.splice(index, 0, variationObject);
        // Continue until no more vriations found
        // return setTimeout(()=>{breakArrayVariationsRecursive(array);}, 5000);
        return breakArrayVariationsRecursive(array);
    }
}

hexo.extend.generator.register('google-feed-generator', function (locals) {

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
            if (!key.includes('customization')){
                delete element.key;
            }
        });
    });

    // Add empty 'pattern' field if missing
    feedArray.forEach(element => {
        if (typeof element.pattern == 'undefined') element.pattern = "";
    });

    // If has variations - set item_group_id
    feedArray.forEach(element => {
        element.item_group_id = '';
        _.forOwn(element, function(value, key) {
            if (key.includes('|')){
                element.item_group_id = element.id;
            }
        });
    });

    // Iterate through array
    breakArrayVariationsRecursive(feedArray);

    // Prefix id's with two color
    feedArray.forEach(element => {
        if (element.color){
            element.id = element.id + '_' + element.color.toUpperCase();
        }        
        if (element.pattern){
            element.id = element.id + '_' + element.color.toUpperCase();
        }
    });

    // Populate mpn's
    feedArray.forEach(element => {
        element.mpn = element.id.split('_').join();
        element.brand = 'Bimmer Sticker Store';
        element.condition = 'new';
        element.availability = 'in stock';
        element.google_product_category = 'Care & Decor > Vehicle Decor > Bumper Stickers';
        element.shipping = 'US::Standard:0 USD';
    });

    // Write feed header from 1st item keys
    var feedTxt = _.keys(feedArray[0]).join('\t');

    // Export into text file
    feedArray.forEach(object => {
        feedTxt += '\n';
        feedTxt += _.values(object).join('\t');
    });

    return {
        path: hexo.config.google_feed_path.dest,
        data: feedTxt
    };
});
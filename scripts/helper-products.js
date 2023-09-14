var _ = require('lodash');

// Checks if products array has object with value containing "|"

function findObjectWithVariations(array){
    var index = -1;
    array.forEach((element, i) => {
        _.values(element).forEach(value => {
            if (value.includes('|')){
                index = i;
                return false;
            }
        });
    });
    return index;
}

function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

hexo.extend.helper.register('breakArrayVariationsRecursive', function(array){
    // const findObjectWithVariations = hexo.extend.helper.get('findObjectWithVariations').bind(hexo);
    const breakArrayVariationsRecursive = hexo.extend.helper.get('breakArrayVariationsRecursive').bind(hexo);

    // Execute until all the products with variations are split
    var index = findObjectWithVariations(array);
    if (index==-1){
        return array;
    }
    else {
        var object = array[index];
        // Since object has variations we set its 'item_group_id'
        object.item_group_id = object.id;

        // Split one variation object
        // var processedFirstVariationValue = false;
        // _.mapValues creates a new object with the same keys of the given object. Values however are generated using the given iteratee function
        // var variationObject = _.mapValues(object, (value, key) => {
        //     if (value.includes('|') && !processedFirstVariationValue){
        //         var variations = value.split('|');
        //         // Removes the last element from an array and returns that value to the caller
        //         var firstVariation = variations.pop();
        //         object[key] = variations.join('|');
        //         processedFirstVariationValue = true;
        //         return firstVariation;
        //     }
            
        //     // For rest of key values keep them same as for the original object
        //     return value;
        // });
        // Insert variation object after original object
        // array.splice(index, 0, objectClone);



        // Iterate keys (properties) in original object (product)
        for (const key in object) {
            var value = object[key];
            if (value.includes('|')){
                // Array for object clones. Each element in array will have separate corresponding variation
                var objectClones = [];
                // Split variations into array and iterate it
                var variations = value.split('|');
                variations.forEach(variation => {
                    // Create clone of the object for each variation
                    var objectClone = JSON.parse(JSON.stringify(object));
                    // Set property value to variation without price
                    var variationNoPrice = variation.replace(/\[.*\]/, '');
                    objectClone[key] = variationNoPrice;
                    // Update the title of the cloned object as demonstrated here - https://support.google.com/merchants/answer/6324487
                    // Hack - TODO: for banners switch from pattern to size and rename this fields
                    var titleSuffix = ' - ' + capitalizeFirstLetter(variationNoPrice.replace('regular', 'for car').replace('large', 'for truck'));
                    objectClone['title'] = objectClone['title'] + titleSuffix;                    

                    // Check if variation contains extra [+#.##] and update price
                    var regex = /(.*)\[\+([\d.]*)\]/
                    var array = variation.match(regex);
                    if (array && array.length == 3){
                        // Update the price of the cloned object
                        var newPrice = parseFloat(object['price']);
                        newPrice += parseFloat(array[2]);
                        objectClone['price'] = newPrice.toFixed(2) + " USD";
                    }
                    // Push cloned object to the array to be added later
                    objectClones.push(objectClone);
                });
                // Insert object clones after original object (iterating reverse order here)
                for (var i = objectClones.length - 1; i >= 0; i--) {
                    array.splice(index+1, 0, objectClones[i]);
                }
                // Do not process more variation keys once first is found, pass it to the next recursion call instead
                break;
            }
        }

        // Remove original object from array
        array.splice(index, 1);

        // Continue until no more variations found
        return breakArrayVariationsRecursive(array);
    }
});

// Function adds front image color variations for windshield banners and sun strips
hexo.extend.helper.register('addBannerSunStripColorVariationsImageLinks', function(product){
    // Find "banner" and "sun strip" product (contains "ST_CAR_W_" in id field)
    if (product.id.includes("ST_CAR_W_")){
        var suffix = "-" + product.color;
        suffix = suffix.replace(/ /g, '-');
        var suffix = suffix + '.jpg';
        product.image_link = product.image_link.replace('.jpg', suffix);
    }
});

hexo.extend.helper.register('setUniqueIdFromVariations', function(product){
    // Function to convert variatioon to ID suffix
    var variationToId = function (variationString) {
        // To uppercase
        variationString = variationString.toUpperCase();
        // Remove special characters e.g. "Small • 2x3 in"
        variationString = variationString.replace(' • ', '_');
        // Remove spaces
        variationString = variationString.replace(' ', '_');
        // Remove possible price increases e.g. "[+4.00]"
        const reg = /\[.*\]/
        variationString = variationString.replace(reg, '');
        return variationString;
    }

    if ("item_group_id" in product){
        if ("color" in product){
            product.id = product.id + '_' + variationToId(product.color);
        }        
        if ("pattern" in product){
            product.id = product.id + '_' + variationToId(product.pattern);
        }
        if ("size" in product){
            var sizeVariation = product.size.toUpperCase().replace(' ','_');
            product.id = product.id + '_' + variationToId(product.size);
        }
    }
});

hexo.extend.helper.register('setExtraProductAttributes', function(product){
    product.mpn = product.id.split('_').join('');

    // Note: Google does not need the "sku". It matches feed's "id" with schema's "sku"
    // product.sku = product.id;
    product.brand = 'Sticker Store LLC';
    product.condition = 'new';
    product.availability = 'in stock';
    // Full list of categories here:
    // https://www.google.com/basepages/producttype/taxonomy.en-US.txt
    if (product.id.includes("ST_CAR_W_") || product.id.includes("ST_WSHIELD_")){
        product.google_product_category = 'Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Decor > Vehicle Decals';
    }
    else {
        product.google_product_category = 'Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Decor > Bumper Stickers';
    }
});

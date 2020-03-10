var _ = require('lodash');

// hexo.extend.helper.register('findObjectWithVariations', function(array){
//     var index = -1;
//     array.forEach((product, i) => {
//         _.values(product).forEach(value =>{
//             if (value.includes('|')){
//                 index = i;
//                 return false;
//             }
//         });
//     });
//     return index;
// });

// hexo.extend.helper.register('breakArrayVariationsRecursive', function(array){
//     const findObjectWithVariations = hexo.extend.helper.get('findObjectWithVariations').bind(hexo);
//     const breakArrayVariationsRecursive = hexo.extend.helper.get('breakArrayVariationsRecursive').bind(hexo);

//     var index = findObjectWithVariations(array);
//     if (index==-1){
//         return array;
//     }
//     else {
//         var object = array[index];
//         // Since object has variations we set its 'item_group_id'
//         object.item_group_id = object.id;  

//         // Split one variation object
//         var processedFirstVariationValue = false;
//         var variationObject = _.mapValues(object, (value, key) => {
//             if (value.includes('|') && !processedFirstVariationValue){
//                 var variations = value.split('|');
//                 var firstVariation = variations.pop();
//                 object[key] = variations.join('|');
//                 processedFirstVariationValue = true;
//                 return firstVariation;
//             }
//             return value;    
//         });
//         // Insert variation object after original object
//         array.splice(index, 0, variationObject);
//         // Continue until no more variations found
//         return breakArrayVariationsRecursive(array);
//     }
// });

hexo.extend.helper.register('addPriceFromColorOption', function(product){
    var regex = /(.*)\[\+([\d.]*)\]/
    var array = product.color.match(regex);
    if (array && array.length == 3){
        product.color = array[1];
        var newPrice = parseFloat(product.price) + parseFloat(array[2]);
        product.price = newPrice.toFixed(2) + " USD";
    }
});

hexo.extend.helper.register('setUniqueIdFromVariations', function(product){
    if ("item_group_id" in product){
        if ("color" in product){
            product.id = product.id + '_' + product.color.toUpperCase().replace(' ','_');
        }        
        if ("pattern" in product){
            product.id = product.id + '_' + product.pattern.toUpperCase().replace(' ','_');
        }    
    }
});

hexo.extend.helper.register('setExtraProductAttributes', function(product){
    product.mpn = product.id.split('_').join('');
    product.sku = product.id.split('_').join('');
    product.brand = 'Bimmer Sticker Store';
    product.condition = 'new';
    product.availability = 'in stock';
    product.google_product_category = 'Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Decor > Bumper Stickers';
    // product.shipping = 'US::Standard:0 USD';
});

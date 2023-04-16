var _ = require('lodash');
const parsePath = require('parse-path');

hexo.extend.helper.register('format_price', function(price){
  // var number = Number(price.replace(/[^0-9\.]+/g,""));
  var integer = Math.floor(price);
  var decimal = (price % 1).toFixed(2)*100;
  return integer + '<sup>' + decimal + '</sup>';
});

hexo.extend.helper.register('lbs_to_g', function(string){
  var lbs = parseFloat(string);
  var oz = lbs*16;
  var g = oz*28.3495;
  return g;
});

hexo.extend.helper.register('first_image', function(page){
  var image = {};
  var regexp = /<img .*?>/gm;
  var match = regexp.exec(page.content);
  if (!match) return null;

  var imgElement = match[0];

  // match src regexp: https://regexr.com/38vdq
  regexp = /src="(.*?)"/gm;
  match = regexp.exec(imgElement);
  if (match && match[1]) image.src = match[1];

  // match title regexp: ? for first occurance of end bracket
  regexp = /title="(.*?)"/gm;
  match = regexp.exec(imgElement);
  if (match && match[1]) image.title = match[1];

  // match title regexp: ? for first occurance of end bracket
  regexp = /alt="(.*?)"/gm;
  match = regexp.exec(imgElement);
  if (match && match[1]) image.alt = match[1];

	return image;
});

hexo.extend.helper.register('has_variations', function(product){
  var hasVariations = false;
  _.values(product).forEach(value => {
    if (value.includes('|')){
      hasVariations = true;
      return false;
    }
  });
  return hasVariations;
});

hexo.extend.helper.register('get_variations', function(product){
  var variations = {};
  _.forOwn(product, function(value, key) {
    if (value.includes('|')){
      variations[key] = value.split('|');
    }
  });
  return variations;
});

hexo.extend.helper.register('get_pathname', function(url){
  var urlParsed = parsePath(url);
  return urlParsed.pathname;
});

hexo.extend.helper.register('is_custom', function(product){
  return _.keys(product).includes('customization_name');
});

hexo.extend.helper.register('my_full_url_for', function(url){
  const url_for = hexo.extend.helper.get('url_for').bind(hexo);
  if (process && process.env && process.env.SITE_URL){
    return process.env.SITE_URL + url_for(url);
  }
  return hexo.config.url + url_for(url);
});

hexo.extend.helper.register('prefix_filename', function(prefix, url){
  var regex = /(.*)\/(.*)/
  var array = url.match(regex);
  if (array && array.length != 3){
    return url
  }
  var newUrl = array[1] + "/" + prefix + array[2];
  return newUrl;
});

hexo.extend.helper.register('print_colors', function(colors){
  // remove [+2.00] extra price values
  colors = colors.replace(/\[\+\d*.\d*\]/g, '');
  colors = colors.split('|').join(', ');
  return colors;
});

hexo.extend.helper.register('print_size', function(size){
  var pattern = /(\d*)x(\d*)/g;
  var array = pattern.exec(size);
  var width = parseFloat(array[1]);
  var height = parseFloat(array[2]);
  width *= 2.54;
  height *= 2.54;
  width = Math.floor(width);
  height = Math.floor(height);

  var temp = size.replace('x', ' × ');
  temp += (' (' + width + ' × ' + height + ' cm)');
  return temp;
});

// hexo.extend.helper.register('title_case', function(str){
//   var splitStr = str.toLowerCase().split(' ');
//   for (var i = 0; i < splitStr.length; i++) {
//       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
//   }
//   return splitStr.join(' '); 
// });

hexo.extend.helper.register('parse_variation_value', function(str){
  const capitalize = hexo.extend.helper.get('capitalize').bind(hexo);
  str = str.replace(/\//g, " & ");
  str = capitalize(str);  

  var obj = {
    value: str,
    text: str,
    extra: 0
  };

  var pattern = /(.*)\[(.*)\]/;
  if (pattern.test(str)){
    var array = pattern.exec(str);
    obj.value = capitalize(array[1]); //capitalize(array[0]);
    obj.extra = parseFloat(array[2]).toFixed(2);
    obj.text = capitalize(array[1]) + " • $" + parseFloat(array[2]) + " extra";
  }
  return obj;
});

hexo.extend.helper.register('capitalize', function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
});
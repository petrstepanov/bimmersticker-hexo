hexo.extend.helper.register('format_price', function(price){
  // var number = Number(price.replace(/[^0-9\.]+/g,""));
  var integer = Math.floor(price);
  var decimal = (price % 1).toFixed(2)*100;
  return integer + '<sup>' + decimal + '</sup>';
});

hexo.extend.helper.register('first_photo_url', function(page){
  var myRegexp = /img src="(.*)"/gm;
  var match = myRegexp.exec(page.content);
  return match.length > 1 ? match[1] : null;
});

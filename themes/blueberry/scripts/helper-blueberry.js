hexo.extend.helper.register('format_price', function(price){
  // var number = Number(price.replace(/[^0-9\.]+/g,""));
  var integer = Math.floor(price);
  var decimal = (price % 1).toFixed(2)*100;
  return integer + '<sup>' + decimal + '</sup>';
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

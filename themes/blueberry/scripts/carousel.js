var fs = require('hexo-fs');
var pathFn = require('path');
// var Promise = require('bluebird');
var nunjucks = require('nunjucks');
const parsePath = require('parse-path');
const uuid = require('uuid');

hexo.extend.helper.register('carousel', function (source) {
  // get the text name we want to use
  var target = {
    images: [],
    alt: "",
    id: uuid.v4()
  };

  source.images.forEach((url, index) => {
    var urlParsed = parsePath(url);
    source.images[index] = urlParsed.pathname;
  });

  var data = Object.assign(target, source);
  var templatePath = pathFn.join(hexo.theme_dir, 'templates/carousel.njk');

  var html = nunjucks.render(templatePath, data);
  return html;
});
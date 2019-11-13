var fs = require('hexo-fs');
var pathFn = require('path');
var Promise = require('bluebird');
var nunjucks = require('nunjucks');

hexo.extend.tag.register('attribution_img', function (args) {
  // get the text name we want to use
  var data = {
    myImgUrl: args[0],
    myImgTitle: args[1],
    imgTitle: args[2],
    imgUrl: args[3],
    authorName: args[4],
    authorUrl: args[5],
    licenseName: args[6],
    licenseUrl: args[7]
  };

  var templatePath = pathFn.join(hexo.theme_dir, 'templates/attributionImg.njk');

  return new Promise(function (resolve, reject) {
    var template = 
    nunjucks.render(templatePath, data, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}, {
  async: true
});

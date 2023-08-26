var Promise = require('bluebird')
var streamToArray = require('stream-to-array')
var sharp = require('sharp')
const fs = require('hexo-fs')

function getAvifPath(filePath) {
  const regex = /\.jp[e]*g$/ig;
  return filePath.replace(regex, ".avif");
}

function myAvif(data) {
  // This filter is called once per generation
  // based off the: https://www.npmjs.com/package/hexo-filter-responsive-images
  var hexo = this;
  var route = hexo.route;
  var routes = route.list();

  return Promise.mapSeries(routes, function (filePath) {
    // Skip non jpegs
    const regex = /custom-text-windshield-banners-order-online/g;
    // const regex = /\.jp[e]*g$/ig;
    const found = filePath.match(regex);
    if (!found) return;

    var stream = route.get(filePath);

    // Promisify function
    // https://stackoverflow.com/questions/48570783/javascript-return-new-promise-short-syntax

    var streamToArrayPromise = Promise.promisify(streamToArray);
    return streamToArrayPromise(stream).then(function (arr) {
      if (typeof arr[0] === 'string') {
        return arr[0];
      } else {
        return Buffer.concat(arr);
      }
    }).then(function (buffer) {
      // Build AVIF path from JPEG file (simply replace the extension)
      var avifPath = getAvifPath(filePath);

      if (fs.existsSync(avifPath)) {
        return new Promise(function (resolve, reject) {
          console.log("AVIF Processing: " + avifPath + " - file exists");
          resolve();
        });
      }

      return new Promise(function (resolve, reject) {
        console.log("AVIF Processing: " + avifPath);
        var img = sharp(buffer).rotate();
        img.toFormat('avif', { quality: 50 }).toBuffer().then(function (buffer) {
          route.set(avifPath, buffer);
          resolve();
        });
      });
    });
  });
}

hexo.extend.filter.register('after_generate', myAvif, 9);
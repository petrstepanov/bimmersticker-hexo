// var isArray = require('util').isArray
var Promise = require('bluebird')
// var micromatch = require('micromatch')
// var streamToArray = require('stream-to-array')
// var streamToArrayAsync = Promise.promisify(streamToArray)
// var getNewPath = require('./new_path')
// var applySharpApiOptions = require('./sharp_options').applyOptions
// var getResizeOptions = require('./sharp_options').getResizeOptions
var streamToArray = require('stream-to-array')
var streamToArrayAsync = Promise.promisify(streamToArray)

var fs = require('hexo-fs');
var sharp = require('sharp')

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
  var filePathsToProcess = [];

  // // Exclude files with extensions different from jpg and jpeg
  // routes.forEach(function (route) {
  //   // Ensure route contains .jpeg or .jpg
  //   const regex = /\.jp[e]*g$/ig;
  //   const found = route.match(regex);
  //   if (!found) return;
  //   // filePathsToProcess.push("./" + hexo.config.public_dir + "/" + route);
  //   filePathsToProcess.push(route);
  // });

  // console.log(filePathsToProcess.length + " to process");

  // Remove duplicates
  // filePathsToProcess = [...new Set(filePathsToProcess)];

  // return Promise.mapSeries(filePathsToProcess, function (filePath) {
  //   const avifPath = getAvifPath(filePath);
  //   return new Promise(function (resolve) {
  //     fs.access(avifPath, fs.F_OK, function (err) {
  //       if (!err) {
  //         // console.log(avifPath + " exists");
  //         // Remove filePath from array
  //         filePathsToProcess = filePathsToProcess.filter(e => e !== filePath);
  //       }
  //       resolve();
  //     });
  //   });
  // }).then(function () {
    // console.log(filePathsToProcess.length + " to process.");

    return Promise.mapSeries(routes, function (filePath) {
      // Skip non jpegs
      // const regex = /\.jp[e]*g$/ig;

      const regex = /custom-text-windshield-banners-order-online/g;

      const found = filePath.match(regex);
      if (!found) return;

      var stream = route.get(filePath);

      return streamToArrayAsync(stream).then(function (arr) {
        if (typeof arr[0] === 'string') {
          return arr[0];
        } else {
          return Buffer.concat(arr);
        }
      }).then(function (buffer) {
        var avifPath = getAvifPath(filePath);
        return Promise.promisify(route.set(avifPath, convertImageFn(buffer, avifPath)));
      });
    });
}

// Image needs to be written to buffer and then assigned to new route with its name
// That's how Hexo processes content
function convertImageFn(buffer, avifPath) {
  return function () {
    console.log("AVIF Processing: " + avifPath);

    // console.trace("Here I am!")

    var img = sharp(buffer).rotate();
    return img.toFormat('avif', { quality: 50 }).toBuffer();
  }
}

hexo.extend.filter.register('after_generate', myAvif, 9);
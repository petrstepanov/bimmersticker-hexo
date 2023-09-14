var streamToArray = require('stream-to-array')
var sharp = require('sharp')

function getAvifRoute(route) {
  const regex = /\.(jpeg|jpg|png)$/ig;
  return route.replace(regex, ".avif");
}

function convertToAvifPromise(hexo, originalImageRoute) {
  return new Promise(function (resolve) {
    // Ensure to process route for original image (otherwise no file exist)
    var stream = hexo.route.get(originalImageRoute);

    // Not sure why we use this?
    streamToArray(stream).then(function (arr) {
      if (typeof arr[0] === 'string') {
        return arr[0];
      } else {
        return Buffer.concat(arr);
      }
    }).then(function (buffer) {
      console.log("Processing AVIF for:");
      console.log(originalImageRoute);
      var img = sharp(buffer).rotate();
      var avifImageBuffer = img.toFormat('avif', { quality: 50 }).toBuffer();
      console.log("Done.");

      resolve(avifImageBuffer);
    });
  });
}

function myAvif() {
  this.log.info('Start creating AVIF routes');
  // This filter is called any time some file changes in hexo folder

  var hexo = this;
  // Hexo router API: https://hexo.io/api/router.html
  var routes = hexo.route.list();

  // Add all jpeg,jpg and png images to avif processing
  // Also add only from selective folders for now - 'custom-windshield-banner-sun-strip', 'img'
  var routesToProcess = [];
  for (const route of routes) {
    const regex1 = /(jpeg|jpg|png)/g;
    var specificFolders = ['custom-windshield-banner-sun-strip', 'img'];
    if (route.match(regex1)) {
      for (folder of specificFolders) {
        if (route.includes(folder + '/')) {
          routesToProcess.push(route); ``
          break;
        }
      }
    }
  }
  // console.log(routesToProcess);

  // Instead of checking on the actual file system - check if route is set
  // Hexo generates actual files later. Here we only define routes and Promises to generate AVIFs for each route
  routesToProcess.forEach(route => {
    var avifRoute = getAvifRoute(route);
    if (!hexo.route.list().includes(avifRoute)) {
      hexo.route.set(avifRoute, function () { return convertToAvifPromise(hexo, route); });
    }
  });
}

hexo.extend.filter.register('after_generate', myAvif, 9);
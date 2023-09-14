var streamToArray = require('stream-to-array')
var sharp = require('sharp')

const extensionRegex = /\.(jpeg|jpg|png)$/ig;

function getAvifRoute(route) {
  return route.replace(extensionRegex, ".avif");
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
    // Array of regexps for images to be processed as avifs. Add entries manually as needed. If need xs_ sm_ prefixes put .* before filename
    var pathRegex = ['img\/banner-previews',
                  // these are too much for AVIF because they are super responsive and it takes crazy ti,e to generate AVIFs for all the sizes...
                  // 'custom-windshield-banner-sun-strip\/.*any-wording-on-your-car-truck-windshield',
                  // 'custom-windshield-banner-sun-strip\/.*custom-text-windshield-banners-order-online',
                     'custom-windshield-banner-sun-strip\/index\/product-type'];
    if (route.match(extensionRegex)) {
      // Join regexps from array: https://stackoverflow.com/questions/8207066/creating-array-of-regular-expressions-javascript
      var re = new RegExp(pathRegex.join("|"), "i");
      if (re.test(route)){
        routesToProcess.push(route);
      }
    }
  }
  console.log(routesToProcess);

  // Instead of checking on the actual file system - check if route is set
  // Hexo generates actual files later. Here we only define routes and Promises to generate AVIFs for each route
  routesToProcess.forEach(route => {
    var avifRoute = getAvifRoute(route);
    if (!hexo.route.list().includes(avifRoute)) {
      hexo.route.set(avifRoute, function () { return convertToAvifPromise(hexo, route); });
    }
  });
}

// Petr Stepanov: ended up adding avif conversion locally as npm task: npm run avif
//                because too much resourceful operation in Netlify - 15 minutes

// Update: I have to convert AVIFs in Hexo filter because i need xs_ lg_ etc...
hexo.extend.filter.register('after_generate', myAvif, 9);
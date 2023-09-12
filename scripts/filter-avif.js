// const Promise = require('bluebird')
var streamToArray = require('stream-to-array')
var sharp = require('sharp')
const fs = require('hexo-fs')

function getAvifRoute(route) {
  const regex = /\.jp[e]*g$/ig;
  return route.replace(regex, ".avif");
}

function convertToAvifPromise(hexo, originalImageRoute){
  return new Promise(function(resolve){
    // Ensure to process route for original image (otherwise no file exist)
    var stream = hexo.route.get(originalImageRoute);

    // Not sure why we use this?
    streamToArray(stream).then(function (arr) {
      if(typeof arr[0] === 'string'){
        return arr[0];
      } else{
        return Buffer.concat(arr);
      }
    }).then(function (buffer) {
      //console.log("Processing AVIF for:");
      //console.log(originalImageRoute);
      var img = sharp(buffer).rotate();
      var avifImageBuffer = img.toFormat('avif', { quality: 50 }).toBuffer();
      //console.log("Done.");

      resolve(avifImageBuffer);
    });
});

  //var dest = fs.createWriteStream('temp');
  //stream.pipe(dest);
}

function myAvif() {
  //console.log("myAvif started");
  // This filter is called any time some file changes in hexo folder

  var hexo = this;
  // Hexo router API: https://hexo.io/api/router.html
  var routes = hexo.route.list();

  // Filter only certain images for AVIF processing
  var routesToProcess = [];
  routes.forEach(route => {
    const regex = /custom-text-windshield-banners-order-online.*(jpeg|jpg|png)/g;
    if (route.match(regex)){
      routesToProcess.push(route);
    }
  });

  // Instead of checking on the actual file system - check if route is set
  // Hexo generates actual files later. Here we only define routes and Promises to generate AVIFs for each route
  routesToProcess.forEach(route => {
    var avifRoute = getAvifRoute(route);
    if (!hexo.route.list().includes(avifRoute)){
      hexo.route.set(avifRoute, function(){return convertToAvifPromise(hexo, route);});
    }
  });
}

hexo.extend.filter.register('after_generate', myAvif, 9);
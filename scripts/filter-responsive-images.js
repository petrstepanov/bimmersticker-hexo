// Coped from hexo-responsive-images and modified
// Fixed Promise to work in series
// Tweaked the file naming pattern

var generateResponsiveImages = require('./filter-responsive-images/responsive_images')
var getNewPath = require('./filter-responsive-images/new_path')

var config = hexo.config.responsive_images || {}

hexo.extend.helper.register('image_version', function (original, options) {
  return getNewPath(original, options)
});

hexo.extend.filter.register('after_generate', generateResponsiveImages, 8)

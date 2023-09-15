hexo.extend.helper.register('avif100', function (path, name, width, height, alt) {
  return '<picture>' +
    '<source srcset="' + path + 'xl_' + name + '.avif, ' + path + 'xl-2x_' + name + '.avif 2x" media="(min-width: 1350px)" type="image/avif" />' +
    '<source srcset="' + path + 'xl_' + name + '.jpg,  ' + path + 'xl-2x_' + name + '.jpg  2x" media="(min-width: 1350px)" />' +
    '<source srcset="' + path + 'lg_' + name + '.avif, ' + path + 'lg-2x_' + name + '.avif 2x" media="(min-width: 992px)" type="image/avif" />' +
    '<source srcset="' + path + 'lg_' + name + '.jpg,  ' + path + 'lg-2x_' + name + '.jpg  2x" media="(min-width: 992px)" />' +
    '<source srcset="' + path + 'md_' + name + '.avif, ' + path + 'md-2x_' + name + '.avif 2x" media="(min-width: 768px)" type="image/avif" />' +
    '<source srcset="' + path + 'md_' + name + '.jpg,  ' + path + 'md-2x_' + name + '.jpg  2x" media="(min-width: 768px)" />' +
    '<source srcset="' + path + 'sm_' + name + '.avif, ' + path + 'sm_2x_' + name + '.avif 2x" type="image/avif" />' +
    '<source srcset="' + path + 'sm_' + name + '.jpg,  ' + path + 'sm-2x_' + name + '.jpg  2x" />' +
    '<img width="' + width + '" height="' + height + '" loading="lazy"  src="' + path + name + '.jpg" class="d-block h-auto w-100" alt="' + alt + '"/>' +
    '</picture>';
});

hexo.extend.helper.register('resp100', function (path, name, width, height, alt) {
  return '<picture>' +
    '<source srcset="' + path + 'xl_' + name + '.jpg,  ' + path + 'xl-2x_' + name + '.jpg  2x" media="(min-width: 1350px)" />' +
    '<source srcset="' + path + 'lg_' + name + '.jpg,  ' + path + 'lg-2x_' + name + '.jpg  2x" media="(min-width: 992px)" />' +
    '<source srcset="' + path + 'md_' + name + '.jpg,  ' + path + 'md-2x_' + name + '.jpg  2x" media="(min-width: 768px)" />' +
    '<source srcset="' + path + 'sm_' + name + '.jpg,  ' + path + 'sm-2x_' + name + '.jpg  2x" />' +
    '<img width="' + width + '" height="' + height + '" loading="lazy"  src="' + path + name + '.jpg" class="d-block h-auto w-100" alt="' + alt + '"/>' +
    '</picture>';
});
hexo.extend.generator.register('robots-txt', function(locals){
    var robotsFile = `User-agent: *
Allow: /
Disallow: /orders/  `;
    if (process && process.env && process.env.BUILD_TYPE == 'development'){
        robotsFile = `User-agent: *
Disallow: /`;
    }
    // Object
    return {
      path: 'robots.txt',
      data: robotsFile
    };
});
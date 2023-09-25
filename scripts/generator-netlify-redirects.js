var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var path = require('path');

// Checks if products array has object with value containing "|"

hexo.extend.generator.register('netlify-redirects-generator', function (locals) {

    // Get input file name from _config.yml
    var fileSrc = hexo.config.netlify_redirects_path.src;

    // Read and parse data file into JS object
    var fileData = fs.readFileSync(hexo.base_dir + fileSrc);

    return {
        path: hexo.config.netlify_redirects_path.dest,
        data: fileData
    };
});
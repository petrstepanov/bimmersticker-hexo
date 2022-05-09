var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');

// Checks if products array has object with value containing "|"

hexo.extend.generator.register('netlify-headers-generator', function (locals) {

    // Get input file name from _config.yml
    var fileSrc = hexo.config.netlify_headers_path.src;

    // Read and parse data file into JS object
    var fileData = fs.readFileSync(hexo.base_dir + fileSrc);

    return {
        path: hexo.config.netlify_headers_path.dest,
        data: fileData
    };
});
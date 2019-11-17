var fs = require('hexo-fs');
var jsYaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');

// Checks if products array has object with value containing "|"

hexo.extend.generator.register('netlify-redirects-generator', function (locals) {

    // Get input file name from _config.yml
    var feedFileSrc = hexo.config.netlify_redirects_path.src;

    // Read and parse data file into JS object
    var feedFileData = fs.readFileSync(hexo.base_dir + feedFileSrc);

    return {
        path: hexo.config.netlify_redirects_path.dest,
        data: feedFileData
    };
});
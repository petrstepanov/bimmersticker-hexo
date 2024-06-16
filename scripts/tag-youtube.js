
// Embed 100% width youtube video
// https://stackoverflow.com/questions/52393814/css-100-width-of-youtube-embed-video

const youtubeFn = function(args, content) {
  var url = args[0];
  content =  '<div class="component-youtube">';
  content += '<iframe width="320" height="180" src="https://www.youtube.com/embed/' + url + '" frameborder="0" allowfullscreen></iframe>';
  content += '</div>'
  return content;
};

hexo.extend.tag.register('youtube', youtubeFn);
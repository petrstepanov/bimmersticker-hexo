const fs = require('hexo-fs');

hexo.extend.filter.register('after_render:html', (html) => {
  // const html='</div><div class="dfghj component-wave-header"><svg class="component-2" width="960" height="75" viewBox="0 0 960 75"  xmlns="http://www.w3.org/2000/svg"><path id="wave-header" fill-rule="evenodd" clip-rule="evenodd" d="M0 75C0 75 0 15.7742 0 4.22053C480 -20.8472 430.5 75 960 49.9323C960 52.4685 960 75 960 75H0Z" /></svg>'

  // Extract component classes from the page HTML code
  var re=/class="[- a-z0-9]*(js--component[-a-z0-9]+)[- a-z0-9]*"/g;
  var matches = html.matchAll(re);
  var componentClasses = [];
  for (const match of matches) {
    var m = match[1];
    m = m.replace('js--','');
    if (!componentClasses.includes(m)) componentClasses.push(m);
  }

  // Find corresponding css file on filesystem
  var js="";
  var jsDev = "";
  for(componentClass of componentClasses){
    var path = "./themes/blueberry/source/js/components/" + componentClass + ".js";
    if (fs.existsSync(path)) js += fs.readFileSync(path);

    var pathDev = "./themes/blueberry/source/js/components/" + componentClass + "-dev.js";
    if (fs.existsSync(pathDev)) jsDev += fs.readFileSync(pathDev);
  }

  console.log(pathDev);

  // Inject CSS into the HTML
  html = html.replace('//-hexo-will-embed-scripts-here', js);
  html = html.replace('//-hexo-will-embed-dev-scripts-here', jsDev);

  return html;
});